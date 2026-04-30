'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/home', label: 'Inicio',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? '0' : '2'}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22" fill={filled ? 'white' : 'none'} stroke={filled ? 'currentColor' : 'currentColor'}/>
      </svg>
    ),
  },
  {
    href: '/banking', label: 'Transacciones',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={filled ? 'currentColor' : 'none'}/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: '/notificaciones', label: 'Alertas',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: '/rasp', label: 'Seguridad',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    href: '/perfil', label: 'Perfil',
    icon: (filled: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4" fill={filled ? 'currentColor' : 'none'}/>
      </svg>
    ),
  },
];

export function BottomNav({ alertaBadge = 0 }: { alertaBadge?: number }) {
  const pathname = usePathname();

  if (['/login', '/registro', '/recuperar'].includes(pathname)) return null;

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '12px 8px 24px',
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0px -8px 32px rgba(108,71,255,0.06)',
      }}
    >
      {tabs.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '8px 16px', borderRadius: '16px', textDecoration: 'none',
              color: active ? '#c9beff' : '#4a4a6a',
              background: active ? 'rgba(108,71,255,0.12)' : 'transparent',
              transition: 'all 0.2s ease',
              position: 'relative',
              minWidth: '52px',
            }}
          >
            <span style={{ marginBottom: '4px', position: 'relative' }}>
              {icon(active)}
              {href === '/notificaciones' && alertaBadge > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  background: '#ba1a1a', color: 'white', fontSize: '9px', fontWeight: 700,
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #0A0A0F',
                }}>
                  {alertaBadge > 9 ? '9+' : alertaBadge}
                </span>
              )}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em',
              fontFamily: 'Inter, sans-serif',
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
