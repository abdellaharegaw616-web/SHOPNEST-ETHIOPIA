/**
 * Ethiopian E-Commerce Localization Constants
 * ShopNest Ethiopia
 */

export const ETHIOPIA_CONSTANTS = {
  currency: {
    code: 'ETB',
    symbol: 'Br',
    name: 'Ethiopian Birr',
    nameAmharic: 'የኢትዮጵያ ብር',
  },
  timezone: 'Africa/Addis_Ababa',
  phoneRegex: /^(?:\+251|0)(?:9\d{8}|7\d{8})$/,
  regions: [
    'Addis Ababa',
    'Oromia',
    'Amhara',
    'Sidama',
    'Dire Dawa',
    'Tigray',
    'Somali',
    'Harari',
    'Afar',
    'Benishangul-Gumuz',
    'South Ethiopia',
    'Central Ethiopia',
    'South West Ethiopia',
    'Gambela',
  ] as const,
  delivery: {
    addisAbabaStandardFee: 150,
    regionalStandardFee: 250,
    freeDeliveryThreshold: 2500,
  },
  majorCities: [
    'Addis Ababa',
    'Hawassa',
    'Bahir Dar',
    'Dire Dawa',
    'Mekelle',
    'Adama',
    'Gondar',
    'Bishoftu',
    'Jimma',
    'Dessie',
  ] as const,
  addisAbabaSubCities: [
    'Bole',
    'Kirkos',
    'Yeka',
    'Arada',
    'Lideta',
    'Addis Ketema',
    'Nifas Silk-Lafto',
    'Kolfe Keranio',
    'Gullele',
    'Akaki Kality',
    'Lemi Kura',
  ] as const,
  paymentProviders: [
    { id: 'telebirr', name: 'Telebirr', nameAmharic: 'ቴሌብር' },
    { id: 'cbe_birr', name: 'CBE Birr', nameAmharic: 'ሲቢኢ ብር' },
    { id: 'chapa', name: 'Chapa (Card/Banks)', nameAmharic: 'ቻፓ' },
    { id: 'cash_on_delivery', name: 'Cash on Delivery', nameAmharic: 'በደረሰ ጊዜ ክፍያ' },
  ] as const,
} as const;

export type EthiopianPaymentProvider = (typeof ETHIOPIA_CONSTANTS.paymentProviders)[number]['id'];
export type EthiopianRegion = (typeof ETHIOPIA_CONSTANTS.regions)[number] | string;
export type EthiopianCity = (typeof ETHIOPIA_CONSTANTS.majorCities)[number] | string;
export type AddisAbabaSubCity = (typeof ETHIOPIA_CONSTANTS.addisAbabaSubCities)[number];

