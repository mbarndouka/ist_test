import { Loader2 } from 'lucide-react';
import {cn} from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
    size?:'sm' | 'md' | 'lg';
    isLoading?:boolean;
}

export const Button:React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading = false,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-[#111111] text-white hover:bg-[#222] hover:shadow-lg border border-transparent shadow-md',
        accent: 'bg-[#ccff00] text-black hover:bg-[#b3e600] hover:shadow-md border border-transparent font-bold', 
        secondary: 'bg-white text-[#111111] hover:bg-gray-50 border border-gray-200 shadow-sm',
        danger: 'bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200',
        ghost: 'hover:bg-gray-100 text-gray-600',
    };

    const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return(
    <button
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}