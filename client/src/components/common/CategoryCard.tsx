import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Tag } from 'lucide-react';
import { CategoryItem } from '../../store/api/productsApi';

interface CategoryCardProps {
  category: CategoryItem;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
  phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  computers: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const isAmharic = i18n.language?.startsWith('am');

  const displayName = isAmharic && category.nameAmharic ? category.nameAmharic : category.name;
  const secondaryName = isAmharic ? category.name : category.nameAmharic;

  // Resolve image based on category slug keywords or server image
  let resolvedImage = category.image;
  if (!resolvedImage || imgError) {
    const slugKey = Object.keys(CATEGORY_FALLBACK_IMAGES).find((k) => category.slug.includes(k));
    resolvedImage = slugKey
      ? CATEGORY_FALLBACK_IMAGES[slugKey]
      : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
  }

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#F97316]/50 dark:hover:border-[#F97316]/60 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F4F6] dark:bg-gray-850">
        <img
          src={resolvedImage}
          alt={displayName}
          onError={() => setImgError(true)}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FFF7ED] mb-0.5">
            <Tag className="w-3 h-3 text-[#F97316]" />
            <span>Category</span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-white group-hover:text-[#F97316] transition-colors leading-snug">
            {displayName}
          </h3>
          {secondaryName && (
            <p className="text-xs text-white/80 font-normal line-clamp-1">
              {secondaryName}
            </p>
          )}
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-[#111827] flex items-center justify-between text-xs font-semibold text-[#1F2937] dark:text-gray-200 group-hover:text-[#F97316] dark:group-hover:text-[#F97316] transition-colors border-t border-[#F3F4F6] dark:border-gray-800">
        <span>Explore Products</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
