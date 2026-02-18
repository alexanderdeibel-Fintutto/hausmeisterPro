
# Fintutto Apps Ökosystem & Cross-Selling

## Übersicht

Dieses Feature verbindet die HausmeisterPro-App mit dem Fintutto-Ökosystem und zeigt alle verfügbaren Apps, Produkte sowie intelligente Cross-Selling-Empfehlungen basierend auf KI-Triggern an.

## Was wird gebaut

1. **Neue Datenbanktabellen** für das App-Registry, Produkte und KI-gesteuerte Cross-Selling-Trigger
2. **Neue Seite "Fintutto Apps"** im Profilbereich mit allen Apps des Imperiums
3. **Cross-Selling-Komponenten** die kontextbezogene Empfehlungen anzeigen

## Datenbank-Schema

### Tabelle: apps_registry
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| app_id | TEXT | Eindeutige App-ID (z.B. "hausmeisterpro") |
| name | TEXT | Anzeigename |
| description | TEXT | Kurzbeschreibung |
| icon_url | TEXT | App-Icon URL |
| color | TEXT | Brand-Farbe (Hex) |
| url | TEXT | Link zur App |
| category | TEXT | Kategorie (immobilien, finanzen, etc.) |
| is_active | BOOLEAN | Ob App aktiv ist |
| sort_order | INTEGER | Sortierreihenfolge |

### Tabelle: products
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| app_id | TEXT | Zugehörige App |
| name | TEXT | Produktname |
| description | TEXT | Beschreibung |
| price_monthly | DECIMAL | Monatspreis |
| features | JSONB | Feature-Liste |
| stripe_price_id | TEXT | Stripe Integration |

### Tabelle: ai_cross_sell_triggers
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| source_app_id | TEXT | Aktuelle App |
| target_app_id | TEXT | Empfohlene App |
| trigger_type | TEXT | Auslöser-Typ |
| trigger_condition | JSONB | Bedingungen |
| message_template | TEXT | Empfehlungstext |
| priority | INTEGER | Priorität |

## Neue Komponenten

```text
src/
├── pages/
│   └── AppsPage.tsx           # Hauptseite für Fintutto Apps
├── components/
│   └── apps/
│       ├── AppCard.tsx        # Einzelne App-Karte
│       ├── AppGrid.tsx        # Grid-Layout für Apps
│       ├── CrossSellBanner.tsx # Cross-Selling Banner
│       └── ProductCard.tsx    # Produkt-Anzeige
└── hooks/
    ├── useAppsRegistry.ts     # Hook für App-Daten
    └── useCrossSellTriggers.ts # Hook für Empfehlungen
```

## Navigation

Die neue "Apps"-Seite wird über das Profil zugänglich sein mit einem "Fintutto Apps entdecken"-Button.

## RLS-Policies

- **apps_registry**: Öffentlich lesbar (alle können Apps sehen)
- **products**: Öffentlich lesbar
- **ai_cross_sell_triggers**: Nur für authentifizierte Benutzer

## Beispiel-Daten

Die Migration fügt initiale Fintutto-Apps hinzu:
- HausmeisterPro (aktuell)
- FinanzAssistent
- DokumentenManager
- MieterPortal

## Technische Details

### Datenbank-Migration (SQL)

```sql
-- Apps Registry
CREATE TABLE public.apps_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT REFERENCES apps_registry(app_id),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Cross-Sell Triggers
CREATE TABLE public.ai_cross_sell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_app_id TEXT REFERENCES apps_registry(app_id),
  target_app_id TEXT REFERENCES apps_registry(app_id),
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB DEFAULT '{}',
  message_template TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies

```sql
-- Apps sind öffentlich sichtbar
ALTER TABLE apps_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps are publicly readable" ON apps_registry
  FOR SELECT USING (true);

-- Produkte sind öffentlich sichtbar
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Cross-Sell nur für authentifizierte Nutzer
ALTER TABLE ai_cross_sell_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Triggers readable by authenticated users" ON ai_cross_sell_triggers
  FOR SELECT TO authenticated USING (true);
```

## Implementierungsschritte

1. Datenbank-Migration erstellen und ausführen
2. TypeScript-Typen definieren
3. Custom Hooks für Datenabruf implementieren
4. UI-Komponenten erstellen
5. Neue Seite in Router einbinden
6. Cross-Selling-Logic integrieren
