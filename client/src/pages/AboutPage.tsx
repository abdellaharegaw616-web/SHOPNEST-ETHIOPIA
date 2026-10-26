import React from 'react';
import { Award, HeartHandshake, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@shopnest/shared';

export const AboutPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] p-8 sm:p-12 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-4 text-center sm:text-left transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] border border-[#F97316]/20">
          <span>{isAmharic ? 'የእርስዎ የገበያ መድረክ' : BRAND.amharicTagline}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1F2937] dark:text-white tracking-tight">
          {isAmharic ? `ስለ ${BRAND.name}` : `About ${BRAND.name}`}
        </h1>
        <p className="text-sm sm:text-base text-[#4B5563] dark:text-gray-300 max-w-3xl leading-relaxed">
          {isAmharic
            ? 'ሾፕኔስት ኢትዮጵያ በሀገራችን አስተማማኝ እና ፈጣን ዲጂታል የገበያ መድረክ በመገንባት፣ ጥራት ያላቸውን ኤሌክትሮኒክስ፣ ባህላዊ አልባሳት፣ ቡና እና የቤት እቃዎችን በቀጥታ ለደንበኞች ያቀርባል።'
            : `${BRAND.tagline} We are building Ethiopia’s most reliable, customer-centric digital commerce platform, bridging local shoppers with certified electronics, traditional heritage goods, and daily essentials.`}
        </p>
      </div>

      {/* Mission & Vision Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
            {isAmharic ? 'ተልዕኳችን' : 'Our Mission'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed">
            {isAmharic
              ? 'ለኢትዮጵያውያን ቤተሰቦች እና ንግዶች በቴሌብር እና በሲቢኢ ብር የተደገፈ ምቹ፣ ዘመናዊ እና አስተማማኝ የኦንላይን ግብይት ተሞክሮ ማቅረብ።'
              : 'To provide Ethiopian households and businesses with an accessible, seamless e-commerce experience powered by local payments like Telebirr and CBE Birr.'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
            {isAmharic ? 'የጥራት እና የዋስትና ማረጋገጫ' : 'Authenticity Guarantee'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed">
            {isAmharic
              ? 'በመደብራችን የሚቀርቡ ሁሉም ምርቶች ጥራታቸው የተረጋገጠና ከታወቁ አምራቾች እና አስመጪዎች በቀጥታ የተገኙ ናቸው።'
              : 'Every product in our catalog undergoes rigorous authenticity inspection. We only partner with verified Ethiopian distributors and manufacturers.'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
            {isAmharic ? 'የሀገር ውስጥ ምርቶችን ማበረታታት' : 'Empowering Local Culture'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed">
            {isAmharic
              ? 'ከተቆላ የይርጋጨፌ ቡና እስከ ውብ ባህላዊ የሀበሻ ልብሶች እና የሸክላ ጀበናዎች ድረስ የኢትዮጵያን ጥበባት በኩራት እናስተዋውቃለን።'
              : 'From hand-roasted Yirgacheffe specialty coffee beans to authentic Habesha Kemis and handcrafted clay Jebenas, we proudly promote Ethiopian craftsmanship.'}
          </p>
        </div>
      </div>

      {/* Headquarters Overview */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-8 shadow-2xs space-y-5 transition-colors">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#F97316]" />
          <span>{isAmharic ? 'ዋና መሥሪያ ቤት እና የስርጭት ማዕከላት' : 'Headquarters & Hubs'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#4B5563] dark:text-gray-300">
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <p className="font-bold text-[#1F2937] dark:text-white">
              {isAmharic ? 'የአዲስ አበባ ማዕከላዊ ቢሮ:' : 'Addis Ababa Central Operations:'}
            </p>
            <p>
              {isAmharic
                ? 'አፍሪካ ጎዳና (ቦሌ መንገድ)፣ ሚሌኒየም አዳራሽ አጠገብ፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ።'
                : 'Africa Avenue (Bole Road), Near Millennium Hall, Bole Sub-City, Addis Ababa, Ethiopia.'}
            </p>
            <p className="text-[#F97316] font-semibold">
              {isAmharic ? 'የደንበኞች ድጋፍ ስልክ: 0979567153 / 0945801156' : 'Customer Support Helpline: 0979567153 / 0945801156'}
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <p className="font-bold text-[#1F2937] dark:text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#F97316]" />
              <span>{isAmharic ? 'የትራንስፖርት እና ስርጭት አገልግሎት:' : 'Logistics & Distribution:'}</span>
            </p>
            <p>
              {isAmharic
                ? 'በሁሉም 11 የአዲስ አበባ ክፍለ ከተሞች ፈጣን የበር ለበር ማድረስ እና ወደ ክልል ከተሞች አስተማማኝ የፖስታ እና የእቃ መላኪያ አገልግሎት።'
                : 'Full door-to-door courier dispatching covering all 11 sub-cities across the capital and partnering with regional parcel networks for nationwide delivery.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
