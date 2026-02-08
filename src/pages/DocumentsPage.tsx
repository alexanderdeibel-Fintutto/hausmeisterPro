import { FileText, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmailSetupCard } from "@/components/documents/EmailSetupCard";
import { DocumentList } from "@/components/documents/DocumentList";
import { QuestionsList } from "@/components/documents/QuestionsList";
import { useDocuments, useDocumentQuestions } from "@/hooks/useDocuments";

export default function DocumentsPage() {
  const { data: documents = [], isLoading: docsLoading } = useDocuments();
  const { data: questions = [], isLoading: questionsLoading } = useDocumentQuestions();

  const openQuestionsCount = questions.length;

  return (
    <div className="min-h-screen">
      <PageHeader title="Belege" />

      <div className="px-4 py-4 space-y-4">
        {/* Email Setup */}
        <EmailSetupCard />

        {/* Tabs: Belege / Offene Fragen */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="documents" className="flex-1 gap-1.5">
              <FileText className="h-4 w-4" />
              Belege
              {documents.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {documents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex-1 gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Offene Fragen
              {openQuestionsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] h-5 px-1.5"
                >
                  {openQuestionsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <DocumentList documents={documents} isLoading={docsLoading} />
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <QuestionsList questions={questions} isLoading={questionsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
