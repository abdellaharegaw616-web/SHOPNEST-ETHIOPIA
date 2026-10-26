import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, PhoneCall, Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F97316] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 font-medium shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
        {/* Main Delivery Highlight */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{t('announcement.freeDelivery')}</span>
        </div>

        {/* Right Highlights: Payment Support & Hotline */}
        <div className="flex items-center gap-4 text-white/95 text-[11px]">
          <span className="hidden md:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{t('announcement.paymentsAccepted')}</span>
          </span>

          <span className="hidden sm:inline-block text-white/40">•</span>

          <a
            href="tel:+251911000000"
            className="inline-flex items-center gap-1 hover:underline font-semibold"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{t('announcement.helpline')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
