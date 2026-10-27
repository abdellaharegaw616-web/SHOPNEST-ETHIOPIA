import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff } from 'lucide-react';
import { usePwaInstall } from '../../pwa/usePwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isOnline, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('shopnest_pwa_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('shopnest_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await promptInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      {/* Offline Connectivity Warning Bar */}
      {!isOnline && (
        <div className="bg-amber-600 dark:bg-amber-700 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 font-medium z-50 sticky top-0 shadow-sm animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            You are currently offline (ከመስመር ውጭ ነዎት). Showing cached pages. Sensitive checkout & payment require reconnection.
          </span>
        </div>
      )}

      {/* PWA Install Invitation Banner */}
      {canInstall && !isInstalled && !dismissed && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-white dark:bg-[#111827] border border-[#F97316]/30 dark:border-orange-500/20 rounded-2xl shadow-xl p-4 transition-all duration-300">
          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FB923C] to-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/icons/icon-192x192.svg"
                alt="ShopNest ET"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Banner Text */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-[#1F2937] dark:text-white">
                  ShopNest Ethiopia App
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-gray-400 line-clamp-2">
                Install for instant access, offline catalog browsing, and real-time delivery notifications.
              </p>
              <p className="text-[10px] text-[#F97316] font-semibold">
                የShopNest መተግበሪያን በስልክዎ ወይም በኮምፒውተርዎ ላይ ይጫኑ
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="px-3 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Installing...' : 'Install App / ጫን'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* Dismiss Cross */}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
