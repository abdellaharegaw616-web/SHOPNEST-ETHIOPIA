import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Tag, PackageSearch, LayoutGrid, Sparkles, ChevronRight, Laptop, Smartphone, Shirt, Coffee, Home, Sparkle, BookOpen } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api/productsApi';
import { ProductCard } from '../components/common/ProductCard';

interface DefaultCategoryMeta {
  slug: string;
  name: string;
  nameAmharic: string;
  description: string;
  descriptionAmharic: string;
  icon: React.ReactNode;
  image: string;
}

const DEFAULT_CATEGORIES: DefaultCategoryMeta[] = [
  {
    slug: 'electronics',
    name: 'Electronics & Audio',
    nameAmharic: 'ኤሌክትሮኒክስ እና የድምጽ እቃዎች',
    description: 'High-fidelity headphones, Bluetooth speakers, wireless earbuds, and accessories.',
    descriptionAmharic: 'ጥራት ያላቸው የጆሮ ማዳመጫዎች፣ ብሉቱዝ ስፒከሮች እና ተዛማጅ እቃዎች።',
    icon: <Sparkles className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'phones-accessories',
    name: 'Phones & Accessories',
    nameAmharic: 'ስልኮች እና መለዋወጫዎች',
    description: 'Smartphones, fast chargers, power banks, and durable phone cases.',
    descriptionAmharic: 'ስማርት ስልኮች፣ ቻርጀሮች፣ ፓወር ባንክ እና ጠንካራ ከቨሮች።',
    icon: <Smartphone className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'computers',
    name: 'Computers & Laptops',
    nameAmharic: 'ኮምፒውተሮች እና ላፕቶፖች',
    description: 'Workstations, business laptops, mechanical keyboards, and precision mice.',
    descriptionAmharic: 'ላፕቶፖች፣ ኪቦርዶች፣ ማውሶች እና ለቢሮ የሚሆኑ የኮምፒውተር እቃዎች።',
    icon: <Laptop className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'fashion',
    name: 'Fashion & Traditional Wear',
    nameAmharic: 'አልባሳት እና ባህላዊ ልብሶች',
    description: 'Casual wear, premium sneakers, authentic Ethiopian Habesha Kemis, and jackets.',
    descriptionAmharic: 'ዘመናዊ አልባሳት፣ ጫማዎች፣ ባህላዊ የሀበሻ ቀሚሶች እና ጃኬቶች።',
    icon: <Shirt className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    nameAmharic: 'የቤት እና የወጥ ቤት እቃዎች',
    description: 'Electric kettles, blenders, cookware sets, bedsheets, and Jebena pottery.',
    descriptionAmharic: 'የውሃ ማፍያ፣ ብሌንደር፣ ድስቶች፣ አንሶላዎች እና የባህል ጀበናዎች።',
    icon: <Home className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    nameAmharic: 'የውበት እና የንፅህና መጠበቂያ',
    description: 'Skin care, natural hair oils, organic shampoos, and authentic fragrances.',
    descriptionAmharic: 'የቆዳ እና የፀጉር ቅባቶች፣ ሻምፖዎች እና ልዩ ሽቶዎች።',
    icon: <Sparkle className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'groceries-essentials',
    name: 'Ethiopian Specialty Coffee & Groceries',
    nameAmharic: 'ልዩ የኢትዮጵያ ቡና እና የምግብ ሸቀጦች',
    description: 'Authentic Yirgacheffe, Sidamo roasted coffee beans, honey, and tea.',
    descriptionAmharic: 'እውነተኛ የይርጋጨፌ እና የሲዳማ ቆሎ ቡና፣ ማር እና ሻይ።',
    icon: <Coffee className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    slug: 'books-stationery',
    name: 'Books & Stationery',
    nameAmharic: 'መጽሐፍት እና የጽህፈት መሳሪያዎች',
    description: 'Fiction, business literature, Amharic books, journals, and pens.',
    descriptionAmharic: 'የአማርኛ እና የእንግሊዝኛ መጽሐፍት፣ ኖትቡኮች እና የቢሮ እቃዎች።',
    icon: <BookOpen className="w-5 h-5 text-[#F97316]" />,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
  },
];

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const { data: categoriesData } = useGetCategoriesQuery();
  const backendCategories = categoriesData?.data || [];
  const currentCategory = backendCategories.find((c) => c.slug === slug);

  const { data: productsData, isLoading } = useGetProductsQuery(
    { category: slug, limit: 24 },
    { skip: !slug }
  );

  const products = productsData?.data?.products || [];

  // ==========================================
  // CASE 1: ALL CATEGORIES DIRECTORY (/categories)
  // ==========================================
  if (!slug) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb & Header Banner */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-gray-400">
            <Link to="/" className="hover:text-[#F97316] transition-colors">
              {t('nav.home')}
            </Link>
            <span>/</span>
            <span className="text-[#1F2937] dark:text-white font-semibold">
              {isAmharic ? 'የምርት ምድቦች' : 'Categories Directory'}
            </span>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የሾፕኔስት ምድቦች' : 'Marketplace Categories'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
              {isAmharic ? 'ሁሉንም የምርት ምድቦች ያስሱ' : 'Explore All Categories'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-2xl leading-relaxed">
              {isAmharic
                ? 'በኢትዮጵያ ውስጥ የሚገኙ ጥራት ያላቸው ኤሌክትሮኒክስ፣ አልባሳት፣ ልዩ የይርጋጨፌ ቡና እና የቤት እቃዎችን በአንድ ቦታ ያግኙ።'
                : 'Browse our curated collection of verified Ethiopian goods, specialty coffee, consumer electronics, and fashion with fast delivery across Addis Ababa.'}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_CATEGORIES.map((cat) => {
            const displayName = isAmharic ? cat.nameAmharic : cat.name;
            const displayDesc = isAmharic ? cat.descriptionAmharic : cat.description;

            return (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className="group bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#F97316] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={cat.image}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                      {cat.icon}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h2 className="font-bold text-sm text-[#1F2937] dark:text-white group-hover:text-[#F97316] transition-colors">
                      {displayName}
                    </h2>
                    <p className="text-[11px] text-[#6B7280] dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-[#F3F4F6] dark:border-gray-800/80 flex items-center justify-between text-xs font-bold text-[#F97316]">
                  <span>{isAmharic ? 'ምርቶችን ይመልከቱ' : 'Browse Catalog'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: SPECIFIC CATEGORY PRODUCTS (/categories/:slug)
  // ==========================================
  const fallbackCat = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  const displayName =
    isAmharic && (currentCategory?.nameAmharic || fallbackCat?.nameAmharic)
      ? currentCategory?.nameAmharic || fallbackCat?.nameAmharic
      : currentCategory?.name || fallbackCat?.name || (slug ? slug.replace(/-/g, ' ') : 'Category');

  const displayDesc =
    isAmharic && fallbackCat?.descriptionAmharic
      ? fallbackCat.descriptionAmharic
      : currentCategory?.description ||
        fallbackCat?.description ||
        `Explore verified ${displayName} in Ethiopian Birr with Addis Ababa delivery.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Category Header */}
      <div className="space-y-4">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-gray-400 hover:text-[#F97316] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAmharic ? 'ወደ ሁሉም ምድቦች ተመለስ' : 'Back to All Categories'}</span>
        </Link>

        <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs relative overflow-hidden">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] border border-[#F97316]/20">
              <Tag className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{isAmharic ? 'የምድብ ማውጫ' : 'Category Catalog'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] dark:text-white capitalize tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed">
              {displayDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-gray-400">
          <span>
            {isAmharic ? 'በዚህ ምድብ ውስጥ ' : 'Found '}
            <strong className="text-[#1F2937] dark:text-white">{products.length}</strong>
            {isAmharic ? ' እቃዎች ተገኝተዋል' : ' items in this category'}
          </span>
          <Link to="/shop" className="text-[#F97316] font-semibold hover:underline">
            {isAmharic ? 'ሙሉ ሱቁን ይመልከቱ →' : 'View Full Shop Catalog →'}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-80 rounded-2xl bg-[#E5E7EB] dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1F2937] dark:text-white">
              {isAmharic ? 'በዚህ ምድብ ውስጥ ምንም ምርት የለም' : 'No Products in this Category Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mx-auto">
              {isAmharic
                ? 'በቅርቡ አዳዲስ ምርቶች ይገባሉ። እስከዚያ ድረስ ሌሎች የምርት ክፍሎችን ይመልከቱ!'
                : 'Our inventory in this section is currently being restocked. Check out the rest of our catalog!'}
            </p>
            <Link
              to="/shop"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
            >
              {isAmharic ? 'ሁሉንም ምርቶች ያስሱ' : 'Browse Full Catalog'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
