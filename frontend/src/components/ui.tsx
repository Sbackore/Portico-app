'use client';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  const variants = {
    primary: 'bg-[#7B5EA7] hover:bg-[#9B7EC7] text-white shadow-lg shadow-purple-900/30',
    secondary: 'bg-[#1A1C35] hover:bg-[#1E2040] text-white border border-[#2D3060]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    outline: 'bg-transparent border border-[#7B5EA7] text-[#A78BFA] hover:bg-[#7B5EA7]/10',
  };
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-5 py-3 text-base', lg: 'px-6 py-4 text-lg' };
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
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
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
        <input
          className={clsx(
            'w-full rounded-xl bg-[#13152B] border text-white placeholder-gray-500 transition-colors',
            'focus:outline-none focus:border-[#7B5EA7]',
            error ? 'border-red-500' : 'border-[#1E2040]',
            icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
            'text-sm',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-[#13152B] border border-[#1E2040] rounded-2xl p-4',
        onClick && 'cursor-pointer hover:border-[#7B5EA7] transition-colors active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BadgeProps { children: React.ReactNode; color?: 'green' | 'orange' | 'red' | 'purple' | 'gray'; }

export function Badge({ children, color = 'purple' }: BadgeProps) {
  const colors = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colors[color])}>
      {children}
    </span>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin text-[#7B5EA7]">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0B1E] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </div>
  );
}
