'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Bell, Shield, User } from 'lucide-react';
import { cn } from './ui';

const tabs = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/banking', label: 'Banco', icon: CreditCard },
  { href: '/notificaciones', label: 'Alertas', icon: Bell },
  { href: '/rasp', label: 'Seguridad', icon: Shield },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav({ alertaBadge = 0 }: { alertaBadge?: number }) {
  const pathname = usePathname();
  
  // Ocultar BottomNav en pantallas de Auth
  if (['/login', '/registro', '/recuperar'].includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-6 pt-3 bg-[#0A0A0F]/90 backdrop-blur-2xl rounded-t-[20px] shadow-[0px_-8px_24px_rgba(108,71,255,0.06)] md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 scale-98 active:scale-95 transition-all relative',
              active 
                ? 'text-primary-fixed-dim bg-primary/10 rounded-2xl' 
                : 'text-surface-dim hover:text-white'
            )}
          >
            <span className="relative mb-1">
              <Icon size={24} strokeWidth={active ? 2.5 : 2} fill={active ? 'currentColor' : 'none'} className={active ? 'text-primary-fixed-dim' : ''} />
              {href === '/notificaciones' && alertaBadge > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#0A0A0F]">
                  {alertaBadge > 9 ? '9+' : alertaBadge}
                </span>
              )}
            </span>
            <span className="font-label text-[10px] font-medium tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
