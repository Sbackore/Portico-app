'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui';
import { Menu, UserCircle, BellOff } from 'lucide-react';
import api from '@/lib/api';

interface Notificacion {
  id: string; alertaId: string; comercio?: string; monto?: number;
  nivelUrgencia: 'INMEDIATA' | 'ALTA' | 'INFORMATIVA'; mensaje: string;
  fechaHora: string; leida: boolean; enviado: boolean;
}

const urgencyConfig = {
  INMEDIATA: { color: 'error', glow: 'bg-error/10', border: 'border-error/30', badge: 'bg-error/20 text-error border-error/30' },
  ALTA: { color: 'orange', glow: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  INFORMATIVA: { color: 'primary', glow: 'bg-primary/10', border: 'border-primary/30', badge: 'bg-primary/20 text-primary-fixed border-primary/30' },
};

export default function NotificacionesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notis, setNotis] = useState<Notificacion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const cargar = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/notificaciones/historial/${user.uid}`);
      setNotis(res.data || []);
    } catch { setNotis([]); }
    finally { setLoadingData(false); }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) cargar();
  }, [user, loading, router, cargar]);

  if (loading || loadingData) return <PageLoader />;

  const noLeidas = notis.filter(n => !n.leida).length;

  return (
    <div className="font-body antialiased min-h-screen flex flex-col relative pb-[90px] bg-transparent text-white animate-fade-in">
      {/* TopAppBar */}
      <header className="bg-[#0A0A0F]/80 backdrop-blur-xl fixed top-0 z-50 shadow-sm shadow-[0px_12px_32px_rgba(108,71,255,0.08)] flex justify-between items-center w-full px-6 py-4 border-b border-white/5">
        <div className="w-9 h-9" />
        <h1 className="font-headline font-bold text-xl tracking-tight text-white">Notificaciones</h1>
        <div className="w-9 h-9" />
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col px-6 pt-24 pb-12 max-w-2xl mx-auto w-full">
        {noLeidas > 0 && (
          <p className="text-xs font-label text-primary-fixed-dim mb-4 px-2">{noLeidas} nuevas notificaciones</p>
        )}

        {notis.length === 0 ? (
          /* Empty State Container */
          <div className="flex-grow flex flex-col items-center justify-center pt-20 pb-32">
            <div className="w-24 h-24 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)]">
              <BellOff className="text-primary-container opacity-80 w-12 h-12" strokeWidth={1.5} />
            </div>
            <h2 className="font-headline font-bold text-2xl tracking-tight text-white mb-3">Sin alertas</h2>
            <p className="font-body text-[15px] text-white/60 text-center max-w-[280px] leading-relaxed">
              No tienes notificaciones pendientes ni alertas recientes en este momento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notis.map(n => {
              const cfg = urgencyConfig[n.nivelUrgencia];
              return (
                <article key={n.id} className={`bg-[#0F1022] rounded-[20px] p-5 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden transition-all duration-200 ${!n.leida ? 'border border-white/10' : 'opacity-70'}`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 ${cfg.glow} blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none`}></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 border ${cfg.badge}`}>
                          <span className="text-[10px] font-label font-bold tracking-wide uppercase">{n.nivelUrgencia}</span>
                        </div>
                        {!n.leida && <span className="w-2 h-2 rounded-full bg-primary-fixed-dim shadow-[0_0_8px_rgba(201,190,255,0.8)]" />}
                      </div>
                      <p className="text-[15px] text-white font-medium leading-snug">{n.mensaje}</p>
                      {n.comercio && n.monto && (
                        <p className="text-sm text-surface-dim font-semibold mt-1">
                          {n.comercio} <span className="text-surface-dim/70 font-normal">·</span> ${n.monto.toLocaleString('es-CO')}
                        </p>
                      )}
                      <p className="text-xs text-surface-dim/60 mt-2 font-medium">
                        {new Date(n.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav alertaBadge={noLeidas} />
    </div>
  );
}
