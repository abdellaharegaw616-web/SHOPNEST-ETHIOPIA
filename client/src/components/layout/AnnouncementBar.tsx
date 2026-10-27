import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, PhoneCall, Sparkles, Download } from 'lucide-react';
import { usePwaInstall } from '../../pwa/usePwaInstall';

export const AnnouncementBar: React.FC = () => {
  const { t } = useTranslation();
  const { canInstall, promptInstall } = usePwaInstall();

  return (
    <div className="bg-[#F97316] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 font-medium shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
        {/* Main Delivery Highlight */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{t('announcement.freeDelivery')}</span>
        </div>

        {/* Right Highlights: Payment Support, App Install & Hotline */}
        <div className="flex items-center gap-3 text-white/95 text-[11px]">
          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
              title="Install ShopNest App"
            >
              <Download className="w-2.5 h-2.5" />
              <span>Install App</span>
            </button>
          )}

          <span className="hidden md:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{t('announcement.paymentsAccepted')}</span>
          </span>

          <span className="hidden sm:inline-block text-white/40">•</span>

          <a
            href="tel:+251979567153"
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
