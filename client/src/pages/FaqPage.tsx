import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FaqItem {
  category: 'delivery' | 'payment' | 'orders' | 'warranty';
  qEn: string;
  qAm: string;
  aEn: string;
  aAm: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'delivery',
    qEn: 'How fast is delivery within Addis Ababa?',
    qAm: 'በአዲስ አበባ ውስጥ ትራንስፖርት ምን ያህል ፈጣን ነው?',
    aEn: 'Orders placed before 2:00 PM are typically delivered same-day or next morning across all 11 sub-cities (Bole, Yeka, Kirkos, Arada, Gulele, Lideta, Nifas Silk, Kolfe, Akaki, Addis Ketema, Lemi Kura).',
    aAm: 'ከቀኑ 8:00 ሰዓት በፊት የተሰጡ ትዕዛዞች በተመሳሳይ ቀን ወይም በሚቀጥለው ቀን ጥዋት በሁሉም 11 ክፍለ ከተሞች (ቦሌ፣ የካ፣ ቂርቆስ፣ አራዳ፣ ጉለሌ፣ ልደታ፣ ንፋስ ስልክ፣ ኮልፌ፣ አቃቂ፣ አዲስ ከተማ፣ ለሚ ኩራ) ይደርሳሉ።',
  },
  {
    category: 'delivery',
    qEn: 'What are the delivery fees in Addis Ababa?',
    qAm: 'በአዲስ አበባ ውስጥ የማድረሻ ክፍያው ስንት ነው?',
    aEn: 'We offer FREE delivery on all orders over 1,500 ETB. For orders below 1,500 ETB, standard delivery is 150 ETB anywhere within the Addis Ababa city limits.',
    aAm: 'ከ1,500 ብር በላይ ለሆኑ ትዕዛዞች በሙሉ ነፃ ማድረሻ እናቀርባለን። ከ1,500 ብር በታች ላሉ ትዕዛዞች መደበኛ የማድረሻ ክፍያ 150 ብር ብቻ ነው።',
  },
  {
    category: 'delivery',
    qEn: 'Do you deliver to regional Ethiopian cities?',
    qAm: 'ወደ ክልል ከተሞች ማድረስ ትችላላችሁ?',
    aEn: 'Yes! We ship to regional cities including Hawassa, Adama, Bahir Dar, Dire Dawa, and Mekelle through verified domestic parcel logistics partners.',
    aAm: 'አዎ! ወደ ሐዋሳ፣ አዳማ፣ ባሕር ዳር፣ ድሬዳዋ፣ መቐለ እና ሌሎች የክልል ከተሞች በአስተማማኝ የፖስታ እና የፓርሴል አጋሮቻችን በኩል እናደርሳለን።',
  },
  {
    category: 'payment',
    qEn: 'How do I pay using Telebirr?',
    qAm: 'በቴሌብር እንዴት መክፈል እችላለሁ?',
    aEn: 'During checkout, select Telebirr. You can complete payment seamlessly via the Telebirr SuperApp USSD prompt or by scanning our verified merchant QR code.',
    aAm: 'በክፍያ ወቅት ቴሌብርን ይምረጡ። በቴሌብር ሱፐርአፕ ወይም በተረጋገጠ የነጋዴ QR ኮድ አማካኝነት ክፍያዎን በቀላሉ ማጠናቀቅ ይችላሉ።',
  },
  {
    category: 'payment',
    qEn: 'Is CBE Birr supported?',
    qAm: 'የኢትዮጵያ ንግድ ባንክ (ሲቢኢ ብር) ይሰራል?',
    aEn: 'Yes, Commercial Bank of Ethiopia (CBE) Birr is natively supported. You can pay directly from your CBE Birr account with zero merchant markup.',
    aAm: 'አዎ፣ የኢትዮጵያ ንግድ ባንክ (ሲቢኢ ብር) ያለምንም ተጨማሪ የአገልግሎት ክፍያ በቀጥታ ይሰራል።',
  },
  {
    category: 'payment',
    qEn: 'Can I pay Cash on Delivery (COD)?',
    qAm: 'እቃው ሲደርሰኝ በእጅ መክፈል (Cash on Delivery) ይቻላል?',
    aEn: 'Yes, Cash on Delivery is available for all deliveries inside Addis Ababa. You can inspect your item packaging and pay our courier directly upon arrival.',
    aAm: 'አዎ፣ በአዲስ አበባ ውስጥ ለሚደረጉ ማናቸውም ትዕዛዞች እቃው በደህና መድረሱን አይተው ለትራንስፖርት አድራሹ በእጅ በእጅ መክፈል ይችላሉ።',
  },
  {
    category: 'warranty',
    qEn: 'Are all products authentic and covered by warranty?',
    qAm: 'ምርቶቹ አስተማማኝ እና ዋስትና አላቸው?',
    aEn: 'Absolutely. ShopNest Ethiopia guarantees 100% genuine products sourced directly from authorized brand importers and verified local producers. Electronics include a minimum 6-month to 1-year warranty.',
    aAm: 'በእርግጥ። ሾፕኔስት ኢትዮጵያ 100% ትክክለኛ እና ጥራት ያላቸውን ምርቶች ከዋና አስመጪዎች እና አምራቾች በቀጥታ ያቀርባል። ኤሌክትሮኒክስ ከ6 ወር እስከ 1 ዓመት ዋስትና አላቸው።',
  },
  {
    category: 'orders',
    qEn: 'What is your return policy?',
    qAm: 'የእቃ መመለስ ወይም የመቀየር ፖሊሲያችሁ ምንድነው?',
    aEn: 'We offer a 7-day hassle-free return and replacement policy for any item that arrives damaged, defective, or inconsistent with its catalog description.',
    aAm: 'የተበላሸ፣ ጉድለት ያለበት ወይም ከቀረበው ማብራሪያ ጋር የማይስማማ ማንኛውንም እቃ በ7 ቀናት ውስጥ ያለምንም ውጣ ውረድ እንቀይራለን ወይም እንመልሳለን።',
  },
];

export const FaqPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs = activeCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter((item) => item.category === activeCategory);

  const categories = [
    { key: 'all', labelEn: 'All Topics', labelAm: 'ሁሉም ርዕሶች' },
    { key: 'delivery', labelEn: 'Delivery & Shipping', labelAm: 'ትራንስፖርት እና ማድረሻ' },
    { key: 'payment', labelEn: 'Telebirr & Payments', labelAm: 'ቴሌብር እና ክፍያዎች' },
    { key: 'warranty', labelEn: 'Warranty & Quality', labelAm: 'ዋስትና እና ጥራት' },
    { key: 'orders', labelEn: 'Orders & Returns', labelAm: 'ትዕዛዞች እና መመለሻ' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] border border-[#F97316]/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isAmharic ? 'የእርዳታ እና የእውቀት ማዕከል' : 'Support & Knowledge Base'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1F2937] dark:text-white tracking-tight">
          {isAmharic ? 'ተደጋጋሚ ጥያቄዎች' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-xl mx-auto">
          {isAmharic
            ? 'ስለ ግብይት፣ ስለ ቴሌብር እና ሲቢኢ ክፍያዎች፣ እንዲሁም ስለ አዲስ አበባ ትራንስፖርት ማወቅ የሚፈልጉት ነገር ሁሉ'
            : 'Everything you need to know about shopping, Telebirr & CBE payments, and Ethiopian deliveries.'}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeCategory === cat.key
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 text-[#4B5563] dark:text-gray-300 hover:text-[#1F2937] dark:hover:text-white'
            }`}
          >
            {isAmharic ? cat.labelAm : cat.labelEn}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const question = isAmharic ? faq.qAm : faq.qEn;
          const answer = isAmharic ? faq.aAm : faq.aEn;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1F2937] dark:text-white hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors"
              >
                <span>{question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#9CA3AF] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#F97316]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4B5563] dark:text-gray-300 border-t border-[#F3F4F6] dark:border-gray-800 leading-relaxed">
                  {answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
