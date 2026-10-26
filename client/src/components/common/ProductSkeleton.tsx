import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between animate-pulse shadow-xs"
        >
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-xl bg-[#E5E7EB]" />
            <div className="h-3 w-1/3 bg-[#E5E7EB] rounded-sm" />
            <div className="h-4 w-4/5 bg-[#E5E7EB] rounded-sm" />
            <div className="h-3 w-1/4 bg-[#E5E7EB] rounded-sm" />
          </div>
          <div className="pt-4 space-y-2">
            <div className="h-5 w-1/2 bg-[#E5E7EB] rounded-sm" />
            <div className="h-9 w-full bg-[#E5E7EB] rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};
