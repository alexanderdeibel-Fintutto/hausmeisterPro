export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Für den Einstieg',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceId: '',
    features: [
      'Bis zu 3 Gebäude',
      'Basis-Aufgabenverwaltung',
      'E-Mail-Support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Für kleine Teams',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    priceId: 'price_1St3Eg52lqSgjCze5l6pqANG',
    features: [
      'Bis zu 10 Gebäude',
      'Erweiterte Aufgabenverwaltung',
      'Kalender-Integration',
      'Nachrichten-System',
      'E-Mail-Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Für wachsende Unternehmen',
    monthlyPrice: 24.99,
    yearlyPrice: 239.90,
    priceId: 'price_1St3FA52lqSgjCzeE8lXHzKH',
    features: [
      'Unbegrenzte Gebäude',
      'Alle Starter-Features',
      'Dokumenten-Management',
      'Berichterstellung',
      'API-Zugang',
      'Prioritäts-Support',
    ],
    highlighted: true,
  },
];

// Price ID to plan mapping for check-subscription function
export const PRICE_TO_PLAN: Record<string, string> = {
  'price_1St3Eg52lqSgjCze5l6pqANG': 'starter',
  'price_1St3FA52lqSgjCzeE8lXHzKH': 'pro',
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Kostenlos';
  return `${price.toFixed(2).replace('.', ',')} €/Monat`;
};
