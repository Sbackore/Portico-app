'use client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-label font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0px_12px_32px_rgba(108,71,255,0.15)] hover:brightness-110',
    secondary: 'bg-[#1A1A24] hover:bg-[#222230] text-surface-container-lowest',
    danger: 'bg-error hover:bg-error/90 text-on-error shadow-[0px_12px_32px_rgba(186,26,26,0.15)]',
    ghost: 'bg-transparent hover:bg-white/5 text-surface-container-lowest',
    outline: 'bg-transparent border border-outline text-surface-container-lowest hover:bg-white/5',
  };
  
  const sizes = { sm: 'px-6 py-3 text-sm', md: 'px-8 py-4 text-base', lg: 'px-10 py-5 text-lg' };
  
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-label font-medium text-surface-dim ml-1">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">{icon}</span>}
        <input
          className={cn(
            'w-full bg-[#1A1A24] border-none text-surface-container-lowest placeholder:text-outline rounded-[14px] py-4 transition-colors font-body text-base outline-none',
            'focus:ring-1 focus:ring-primary-container focus:bg-[#222230]',
            error && 'ring-1 ring-error bg-[#221010]',
            icon ? 'pl-12 pr-4' : 'px-4',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-label text-error ml-1 mt-0.5">{error}</p>}
    </div>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode; 
  onClick?: () => void; 
}

export function Card({ children, className, onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card-bg rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden',
        onClick && 'cursor-pointer transition-transform duration-200 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BadgeProps { 
  children: React.ReactNode; 
  color?: 'green' | 'orange' | 'red' | 'purple' | 'gray'; 
  icon?: React.ReactNode;
}

export function Badge({ children, color = 'purple', icon }: BadgeProps) {
  const colors = {
    green: 'bg-[#00FF85]/20 text-[#00FF85] border-[#00FF85]/30', // Using generic green as requested or mapping
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-primary/20 text-primary-fixed border-primary/30',
    gray: 'bg-slate-800/50 text-slate-300 border-slate-700/50',
  };
  return (
    <span className={cn('px-3 py-1.5 rounded-full flex items-center gap-1.5 border font-label font-semibold tracking-wide uppercase text-xs w-fit', colors[color])}>
      {icon && <span className="flex items-center justify-center [&>svg]:w-[14px] [&>svg]:h-[14px]">{icon}</span>}
      {children}
    </span>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <Loader2 size={size} className="animate-spin text-primary-container" />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-surface-dim text-sm font-label">Cargando...</p>
      </div>
    </div>
  );
}
