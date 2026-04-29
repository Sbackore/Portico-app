'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Bell, Shield, User } from 'lucide-react';
import { clsx } from 'clsx';

const tabs = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/banking', label: 'Banco', icon: CreditCard },
  { href: '/notificaciones', label: 'Alertas', icon: Bell },
  { href: '/rasp', label: 'Seguridad', icon: Shield },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav({ alertaBadge = 0 }: { alertaBadge?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0F1022] border-t border-[#1E2040] z-40">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative',
                active ? 'text-[#A78BFA]' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {href === '/notificaciones' && alertaBadge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {alertaBadge > 9 ? '9+' : alertaBadge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7B5EA7]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
