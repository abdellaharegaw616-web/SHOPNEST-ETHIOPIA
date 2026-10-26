import React from 'react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'circle';
  isLoading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  shape = 'rounded',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.96] shrink-0';

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const shapeStyles = {
    rounded: 'rounded-lg',
    circle: 'rounded-full',
  };

  const variantStyles = {
    primary: 'bg-[#F97316] text-white hover:bg-[#EA580C] shadow-subtle',
    secondary: 'bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F9FAFB] shadow-subtle',
    outline: 'border border-[#F97316] text-[#F97316] bg-transparent hover:bg-[#FFF7ED]',
    ghost: 'bg-transparent text-[#1F2937] hover:bg-[#F9FAFB] hover:text-[#F97316]',
  };

  return (
    <button
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles[size]} ${shapeStyles[shape]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
    </button>
  );
};
