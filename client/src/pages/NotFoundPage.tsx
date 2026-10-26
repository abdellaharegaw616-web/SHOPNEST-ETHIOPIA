import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center mx-auto shadow-xs border border-[#F97316]/20">
          <AlertCircle className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
            {isAmharic ? 'የስህተት ኮድ 404' : 'Error 404'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
            {isAmharic ? '404 - ገጹ አልተገኘም' : '404 - Page Not Found'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {isAmharic
              ? 'የጠየቁት ገጽ በሾፕኔስት ኢትዮጵያ ውስጥ ሊገኝ አልቻለም ወይም ተዛውሯል። እባክዎ ወደ ዋናው ገጽ ወይም ወደ ምድቦች ማውጫ ይመለሱ።'
              : 'The resource you requested could not be located in ShopNest Ethiopia. It might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full sm:w-auto shadow-md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {isAmharic ? 'ወደ ዋና ገጽ ተመለስ' : 'Return to Home'}
            </Button>
          </Link>
          <Link to="/categories" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              leftIcon={<LayoutGrid className="w-4 h-4" />}
            >
              {isAmharic ? 'የምርት ምድቦች' : 'Browse Categories'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
