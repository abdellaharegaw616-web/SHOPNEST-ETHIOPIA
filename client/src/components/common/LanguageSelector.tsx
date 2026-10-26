import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('am') ? 'am' : 'en';

  const setLanguage = (lang: 'en' | 'am') => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="inline-flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-0.5 text-xs font-medium">
      <div className="flex items-center pl-2 pr-1 text-[#4B5563]" title="Select Language">
        <Globe className="w-3.5 h-3.5 mr-1" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          currentLang === 'en'
            ? 'bg-[#F97316] text-white shadow-xs font-semibold'
            : 'text-[#4B5563] hover:text-[#1F2937]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('am')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          currentLang === 'am'
            ? 'bg-[#F97316] text-white shadow-xs font-semibold'
            : 'text-[#4B5563] hover:text-[#1F2937]'
        }`}
      >
        አማ
      </button>
    </div>
  );
};
