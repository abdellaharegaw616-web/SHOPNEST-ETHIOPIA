import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm ${
        hoverEffect
          ? 'transition-all duration-200 hover:shadow-md hover:border-[#F97316]/30'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
