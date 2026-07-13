import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-98',
          {
            // Variants
            'bg-primary text-primary-foreground hover:opacity-90 shadow-xs': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-background hover:bg-secondary/50': variant === 'outline',
            'hover:bg-secondary/80 hover:text-secondary-foreground': variant === 'ghost',
            'bg-accent text-accent-foreground hover:opacity-90 glow-pulse': variant === 'accent',
            
            // Sizes
            'h-9 px-3 text-xs': size === 'sm',
            'h-11 px-5 text-sm': size === 'md',
            'h-13 px-7 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
