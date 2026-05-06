'use client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/* ================================================================
   BUTTON
   ================================================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] cursor-pointer select-none';

  const variants = {
    primary: 'bg-gradient-to-br from-[#5323e6] to-[#6c47ff] text-white shadow-[0px_12px_32px_rgba(108,71,255,0.25)] hover:brightness-110',
    secondary: 'bg-[#1A1A24] hover:bg-[#222230] text-white border border-white/5',
    danger: 'bg-[#ba1a1a] hover:bg-[#d62020] text-white shadow-[0px_8px_24px_rgba(186,26,26,0.2)]',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    outline: 'bg-transparent border border-[#6c47ff]/40 text-[#c9beff] hover:bg-[#6c47ff]/10',
  };

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-[1.125rem] text-lg',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}

/* ================================================================
   INPUT
   ================================================================ */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, style, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[11px] font-semibold text-[#797588] uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#797588] pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          style={style}
          className={cn(
            'w-full h-14 bg-[#1A1A24] text-white placeholder:text-[#797588]',
            'rounded-[14px] transition-all duration-200 font-medium text-[15px]',
            'outline-none border-0 ring-0',
            'focus:bg-[#222230] focus:shadow-[0_0_0_1.5px_#6c47ff]',
            error && 'shadow-[0_0_0_1.5px_#ba1a1a] bg-[#1f1212]',
            icon ? 'pl-12 pr-4' : 'px-4',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[12px] text-[#ff6b6b] ml-1 font-medium">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   CARD
   ================================================================ */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className, onClick, glow, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#0F1022] rounded-[20px] p-6 relative overflow-hidden',
        'border border-white/[0.04]',
        'shadow-[0px_8px_32px_rgba(0,0,0,0.3)]',
        onClick && 'cursor-pointer transition-transform duration-200 active:scale-[0.98]',
        glow && 'shadow-[0px_12px_32px_rgba(108,71,255,0.12)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ================================================================
   BADGE
   ================================================================ */
interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'blue';
  icon?: React.ReactNode;
}

export function Badge({ children, color = 'purple', icon }: BadgeProps) {
  const colors = {
    green: 'bg-[#00FF85]/15 text-[#00FF85] border-[#00FF85]/25',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    purple: 'bg-[#6c47ff]/15 text-[#c9beff] border-[#6c47ff]/25',
    gray: 'bg-white/5 text-[#8a8a9a] border-white/10',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  };

  return (
    <span className={cn(
      'px-3 py-1 rounded-full inline-flex items-center gap-1.5 border font-semibold tracking-wide uppercase text-[11px] w-fit',
      colors[color]
    )}>
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
}

/* ================================================================
   SPINNER & PAGE LOADER
   ================================================================ */
export function Spinner({ size = 24 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-[#6c47ff]" />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-5">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5323e6] to-[#6c47ff] flex items-center justify-center shadow-[0_0_32px_rgba(108,71,255,0.4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-[#6c47ff]/30 animate-ping" />
        </div>
        <p className="text-[#797588] text-sm font-medium tracking-wide">Cargando...</p>
      </div>
    </div>
  );
}

/* ================================================================
   SKELETON
   ================================================================ */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-white/[0.04] rounded-[16px]', className)} />
  );
}

/* ================================================================
   SECTION TITLE
   ================================================================ */
export function SectionTitle({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <h2 className={cn(
      'text-2xl font-bold tracking-tight text-white mb-6',
      accent && 'pl-4 border-l-4 border-[#6c47ff]'
    )}>
      {children}
    </h2>
  );
}

/* ================================================================
   LIST ITEM ROW (for settings/config menus)
   ================================================================ */
interface ListRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

export function ListRow({ icon, title, subtitle, rightElement, onClick, danger }: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-5 bg-[#1A1A2E] rounded-[20px]',
        'shadow-[0px_4px_16px_rgba(0,0,0,0.2)] transition-colors',
        'border border-white/[0.03]',
        onClick && 'cursor-pointer hover:bg-[#1E1E38] active:scale-[0.99]',
        danger && 'border-[#ba1a1a]/20 hover:border-[#ba1a1a]/40 hover:bg-[#ba1a1a]/5'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-12 h-12 rounded-full bg-[#0F1022] flex items-center justify-center',
          danger ? 'text-[#ba1a1a]' : 'text-[#6c47ff]'
        )}>
          {icon}
        </div>
        <div>
          <h3 className={cn('text-base font-semibold', danger ? 'text-[#ba1a1a]' : 'text-white')}>
            {title}
          </h3>
          {subtitle && <p className="text-sm text-[#797588] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightElement ?? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#484556] shrink-0">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      )}
    </div>
  );
}
