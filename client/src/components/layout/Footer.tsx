import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Truck,
  Clock,
} from 'lucide-react';
import { BRAND } from '@shopnest/shared';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-gray-800 mt-auto text-[#1F2937] dark:text-gray-200 transition-colors duration-200">
      {/* Trust & Value Banners */}
      <div className="border-b border-[#F3F4F6] dark:border-gray-800/80 bg-[#F9FAFB] dark:bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30 flex items-center justify-center text-[#F97316] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? 'የአዲስ አበባ ትራንስፖርት' : 'Addis Ababa Delivery'}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  {isAmharic ? 'ከ1,500 ብር በላይ ነፃ ትራንስፖርት' : 'Free shipping on orders above 1,500 ETB'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30 flex items-center justify-center text-[#F97316] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? 'ቴሌብር እና ሲቢኢ ብር' : 'Telebirr & CBE Birr'}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  {isAmharic ? 'ፈጣን እና አስተማማኝ ክፍያዎች' : 'Fast, secure Ethiopian mobile payments'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30 flex items-center justify-center text-[#F97316] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? '100% ጥራት ያላቸው ምርቶች' : '100% Genuine Products'}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  {isAmharic ? 'ከተረጋገጡ አቅራቢዎች ከዋስትና ጋር' : 'Authentic warranty with verified suppliers'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 border border-[#F97316]/20 dark:border-orange-500/30 flex items-center justify-center text-[#F97316] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? '24/7 የደንበኞች ድጋፍ' : '24/7 Dedicated Support'}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  {isAmharic ? 'በአማርኛ እና በእንግሊዝኛ አገልግሎት' : 'English and Amharic customer care'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand Info (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-xs">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#1F2937] dark:text-white leading-none group-hover:text-[#F97316] transition-colors">
                  {BRAND.name}
                </span>
                <span className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-medium">
                  {BRAND.amharicTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed max-w-sm">
              {t('footer.aboutText')}
            </p>

            <div className="space-y-2 text-xs text-[#4B5563] dark:text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                <span>Africa Avenue, Bole Sub-City, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>0979567153 / 0945801156</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>abdellaj636@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'ሁሉም ምርቶች' : 'All Catalog'}
                </Link>
              </li>
              <li>
                <Link to="/categories/electronics" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'ኤሌክትሮኒክስ' : 'Electronics'}
                </Link>
              </li>
              <li>
                <Link to="/categories/fashion" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'የሀበሻ ባህላዊ አልባሳት' : 'Habesha Fashion'}
                </Link>
              </li>
              <li>
                <Link to="/categories/groceries-essentials" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'የኢትዮጵያ ቡና እና የቤት እቃዎች' : 'Ethiopian Coffee & Home'}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'የምኞት ዝርዝር' : 'Saved Wishlist'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white uppercase tracking-wider">
              {t('footer.customerCare')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/track-order" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'ትዕዛዜን ተከታተል' : 'Track My Order'}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'የማድረሻ ፖሊሲ' : 'Shipping Policy'}
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'የእቃ መመለሻ ፖሊሲ' : 'Returns & Refunds'}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'ተደጋጋሚ ጥያቄዎች' : 'Delivery & FAQs'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'አግኙን' : 'Contact Support'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#4B5563] dark:text-gray-300 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
                  {isAmharic ? 'ስለ ሾፕኔስት' : 'About ShopNest'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Supported Payment Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white uppercase tracking-wider">
              {t('footer.paymentPartners')}
            </h4>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">
              {isAmharic
                ? 'ሾፕኔስት በኢትዮጵያ ተወዳጅ የሆኑ የዲጂታል ክፍያ አማራጮችን ያቀርባል:'
                : "ShopNest seamlessly integrates Ethiopia's favorite digital payment methods:"}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-gray-800 text-center text-[11px] font-bold text-[#1F2937] dark:text-gray-200">
                telebirr
              </div>
              <div className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-gray-800 text-center text-[11px] font-bold text-[#1F2937] dark:text-gray-200">
                CBE Birr
              </div>
              <div className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-gray-800 text-center text-[11px] font-bold text-[#1F2937] dark:text-gray-200">
                Chapa Pay
              </div>
              <div className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-gray-800 text-center text-[11px] font-bold text-[#1F2937] dark:text-gray-200">
                Cash on Deliv.
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#6B7280] dark:text-gray-400">
              <span>{isAmharic ? 'ዋጋዎች በኢትዮጵያ ብር (ETB)' : 'Prices in Ethiopian Birr (ETB)'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="border-t border-[#F3F4F6] dark:border-gray-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280] dark:text-gray-400">
          <div>
            © {currentYear} {BRAND.name}. {t('footer.rights')}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/privacy-policy" className="hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors">
              {t('footer.privacy')}
            </Link>
            <span>{t('footer.developedFor')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
