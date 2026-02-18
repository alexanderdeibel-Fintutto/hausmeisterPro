import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse inbound email webhook payload
    // Supports both JSON and form-data from common inbound email services
    let emailData: any;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      emailData = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      emailData = {
        from: formData.get("from") || formData.get("sender"),
        to: formData.get("to") || formData.get("recipient"),
        subject: formData.get("subject"),
        body: formData.get("text") || formData.get("body-plain"),
        attachments: [],
      };

      // Handle file attachments
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.type === "application/pdf") {
          emailData.attachments.push({
            filename: value.name,
            content: await value.arrayBuffer(),
            size: value.size,
          });
        }
      }
    } else {
      emailData = await req.json();
    }

    const senderEmail = extractEmail(emailData.from || "");
    const recipientEmail = extractEmail(emailData.to || "");
    const subject = emailData.subject || "Kein Betreff";

    console.log(`Processing email from ${senderEmail} to ${recipientEmail}`);

    // 1. Find the inbox
    const { data: inbox, error: inboxError } = await supabase
      .from("email_inboxes")
      .select("*")
      .eq("email_address", recipientEmail)
      .eq("is_active", true)
      .maybeSingle();

    if (inboxError || !inbox) {
      console.error("Inbox not found:", recipientEmail);
      return new Response(JSON.stringify({ error: "Inbox not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check if sender is verified
    const { data: sender } = await supabase
      .from("verified_senders")
      .select("*")
      .eq("company_id", inbox.company_id)
      .eq("email", senderEmail)
      .eq("is_verified", true)
      .maybeSingle();

    if (!sender) {
      console.log(`Sender ${senderEmail} not verified for company ${inbox.company_id}`);
      return new Response(
        JSON.stringify({ error: "Sender not verified" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Process each PDF attachment
    const attachments = emailData.attachments || [];
    const results = [];

    for (const attachment of attachments) {
      // Upload PDF to storage
      const fileName = `${inbox.company_id}/${Date.now()}-${attachment.filename}`;
      const fileContent =
        attachment.content instanceof ArrayBuffer
          ? new Uint8Array(attachment.content)
          : typeof attachment.content === "string"
          ? Uint8Array.from(atob(attachment.content), (c) => c.charCodeAt(0))
          : attachment.content;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, fileContent, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName);

      // Create document record
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          company_id: inbox.company_id,
          sender_email: senderEmail,
          subject,
          file_url: publicUrl,
          file_name: attachment.filename,
          file_size_bytes: attachment.size || 0,
          status: "pending",
        })
        .select()
        .single();

      if (docError) {
        console.error("Document creation error:", docError);
        continue;
      }

      // 4. Use AI to extract invoice data
      if (lovableApiKey) {
        try {
          const aiResult = await extractWithAI(
            lovableApiKey,
            subject,
            senderEmail,
            attachment.filename
          );

          if (aiResult) {
            const updateData: any = {
              status: aiResult.needs_review ? "needs_review" : "processed",
              processed_at: new Date().toISOString(),
            };

            if (aiResult.vendor_name) updateData.vendor_name = aiResult.vendor_name;
            if (aiResult.amount) updateData.amount = aiResult.amount;
            if (aiResult.invoice_date) updateData.invoice_date = aiResult.invoice_date;
            if (aiResult.invoice_number) updateData.invoice_number = aiResult.invoice_number;
            if (aiResult.document_type) updateData.document_type = aiResult.document_type;
            if (aiResult.extracted_data) updateData.extracted_data = aiResult.extracted_data;

            await supabase
              .from("documents")
              .update(updateData)
              .eq("id", doc.id);

            // Create questions for unclear items
            if (aiResult.questions && aiResult.questions.length > 0) {
              const questionInserts = aiResult.questions.map((q: any) => ({
                document_id: doc.id,
                company_id: inbox.company_id,
                question: q.question,
                question_type: q.type || "assignment",
                suggested_answer: q.suggestion || null,
              }));

              await supabase.from("document_questions").insert(questionInserts);
            }
          }
        } catch (aiError) {
          console.error("AI extraction error:", aiError);
          // Mark as needs_review if AI fails
          await supabase
            .from("documents")
            .update({ status: "needs_review" })
            .eq("id", doc.id);

          await supabase.from("document_questions").insert({
            document_id: doc.id,
            company_id: inbox.company_id,
            question:
              "Die automatische Erkennung ist fehlgeschlagen. Bitte ordne diesen Beleg manuell zu.",
            question_type: "assignment",
          });
        }
      } else {
        // No AI available - mark for manual review
        await supabase
          .from("documents")
          .update({ status: "needs_review" })
          .eq("id", doc.id);

        await supabase.from("document_questions").insert({
          document_id: doc.id,
          company_id: inbox.company_id,
          question:
            "Bitte ordne diesen Beleg einem Objekt zu und gib den Betrag an.",
          question_type: "assignment",
        });
      }

      results.push({ id: doc.id, filename: attachment.filename });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        documents: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing inbound email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase();
  return str.trim().toLowerCase();
}

async function extractWithAI(
  apiKey: string,
  subject: string,
  sender: string,
  filename: string
): Promise<any> {
  const prompt = `Du bist ein Buchhalter-Assistent für Hausverwaltungen. Analysiere die folgenden E-Mail-Informationen und extrahiere Rechnungsdaten.

E-Mail-Betreff: ${subject}
Absender: ${sender}
Dateiname: ${filename}

Bestimme folgende Informationen anhand des Betreffs und Dateinamens:
- vendor_name: Name des Lieferanten/Dienstleisters
- amount: Rechnungsbetrag (nur Zahl)
- invoice_date: Rechnungsdatum (YYYY-MM-DD Format)
- invoice_number: Rechnungsnummer
- document_type: "invoice" | "receipt" | "contract" | "other"
- needs_review: true wenn Informationen unklar sind
- questions: Array von offenen Fragen [{question, type, suggestion}] falls Zuordnung unklar`;

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: `Analysiere diese Rechnung: Betreff="${subject}", Absender="${sender}", Datei="${filename}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_invoice_data",
              description: "Extrahiert Rechnungsdaten aus E-Mail-Informationen",
              parameters: {
                type: "object",
                properties: {
                  vendor_name: { type: "string" },
                  amount: { type: "number" },
                  invoice_date: { type: "string" },
                  invoice_number: { type: "string" },
                  document_type: {
                    type: "string",
                    enum: ["invoice", "receipt", "contract", "other"],
                  },
                  needs_review: { type: "boolean" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        type: { type: "string" },
                        suggestion: { type: "string" },
                      },
                      required: ["question"],
                    },
                  },
                  extracted_data: {
                    type: "object",
                    description: "Additional extracted metadata",
                  },
                },
                required: ["document_type", "needs_review"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_invoice_data" },
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI error:", response.status, errText);
    return null;
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  return null;
}
