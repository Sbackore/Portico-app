'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, PageLoader } from '@/components/ui';
import { Bell, BellOff, Settings } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Notificacion {
  id: string; alertaId: string; comercio?: string; monto?: number;
  nivelUrgencia: 'INMEDIATA' | 'ALTA' | 'INFORMATIVA'; mensaje: string;
  fechaHora: string; leida: boolean; enviado: boolean;
}

const urgencyConfig = {
  INMEDIATA: { color: 'red' as const, dot: 'bg-red-500', label: 'Urgente' },
  ALTA: { color: 'orange' as const, dot: 'bg-orange-500', label: 'Alta' },
  INFORMATIVA: { color: 'gray' as const, dot: 'bg-gray-500', label: 'Info' },
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
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="bg-[#0F1022] px-5 pt-12 pb-4 sticky top-0 z-30 border-b border-[#1E2040]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-white">Alertas</h1>
          <Link href="/notificaciones/config">
            <Settings size={20} className="text-gray-400" />
          </Link>
        </div>
        {noLeidas > 0 && (
          <p className="text-xs text-[#A78BFA]">{noLeidas} nuevas notificaciones</p>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        {notis.length === 0 ? (
          <div className="text-center py-16">
            <BellOff size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold">Todo tranquilo por aquí</p>
            <p className="text-gray-400 text-sm mt-1">No tienes notificaciones pendientes.</p>
          </div>
        ) : (
          notis.map(n => {
            const cfg = urgencyConfig[n.nivelUrgencia];
            return (
              <Card key={n.id} className={`${!n.leida ? 'border-[#2D3060]' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={cfg.color}>{cfg.label}</Badge>
                      {!n.leida && <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />}
                    </div>
                    <p className="text-sm text-white font-medium">{n.mensaje}</p>
                    {n.comercio && n.monto && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {n.comercio} · ${n.monto.toLocaleString('es-CO')}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(n.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav alertaBadge={noLeidas} />
    </div>
  );
}
