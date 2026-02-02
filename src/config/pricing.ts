export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
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
    monthlyPriceId: '',
    yearlyPriceId: '',
    features: [
      'Bis zu 3 Gebäude',
      'Basis-Aufgabenverwaltung',
      'E-Mail-Support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Für kleine Teams',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90, // ~20% Rabatt
    monthlyPriceId: 'price_basic_monthly', // Replace with actual Stripe Price ID
    yearlyPriceId: 'price_basic_yearly', // Replace with actual Stripe Price ID
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
    yearlyPrice: 239.90, // ~20% Rabatt
    monthlyPriceId: 'price_pro_monthly', // Replace with actual Stripe Price ID
    yearlyPriceId: 'price_pro_yearly', // Replace with actual Stripe Price ID
    features: [
      'Unbegrenzte Gebäude',
      'Alle Basic-Features',
      'Dokumenten-Management',
      'Berichterstellung',
      'API-Zugang',
      'Prioritäts-Support',
    ],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Für große Unternehmen',
    monthlyPrice: 49.99,
    yearlyPrice: 479.90, // ~20% Rabatt
    monthlyPriceId: 'price_business_monthly', // Replace with actual Stripe Price ID
    yearlyPriceId: 'price_business_yearly', // Replace with actual Stripe Price ID
    features: [
      'Alle Pro-Features',
      'Multi-Mandanten-Verwaltung',
      'Erweiterte Analysen',
      'SSO-Integration',
      'Dedizierter Account Manager',
      '24/7 Premium-Support',
    ],
  },
];

export const formatPrice = (price: number, interval: 'monthly' | 'yearly'): string => {
  if (price === 0) return 'Kostenlos';
  return `${price.toFixed(2).replace('.', ',')} €${interval === 'monthly' ? '/Monat' : '/Jahr'}`;
};

export const getMonthlyEquivalent = (yearlyPrice: number): number => {
  return yearlyPrice / 12;
};
