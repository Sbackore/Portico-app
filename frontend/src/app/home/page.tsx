'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader, Card } from '@/components/ui';
import { Menu, UserCircle, ShoppingCart, Coffee, CreditCard, Shield, Bell, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Dashboard {
  nombre: string; email: string; kycEstado: string;
  scoreSeguridadCuenta: number; alertasBadge: number;
  ultimasTransacciones: Array<{ idTransaccion: string; comercio: string; monto: number; score?: number; fechaHora: string }>;
}

function getRiskConfig(score?: number) {
  if (!score) return { type: 'VERIFICADA', color: 'primary', glow: 'bg-primary/10', icon: 'verified_user', badge: 'bg-primary/20 text-primary-fixed border-primary/30' };
  if (score > 80) return { type: 'SOSPECHOSA', color: 'red', glow: 'bg-red-500/10', icon: 'warning', badge: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (score > 60) return { type: 'PENDIENTE', color: 'orange', glow: 'bg-orange-500/10', icon: 'schedule', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  return { type: 'VERIFICADA', color: 'primary', glow: 'bg-primary/10', icon: 'verified_user', badge: 'bg-primary/20 text-primary-fixed border-primary/30' };
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadingDash, setLoadingDash] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/users/${user.uid}/dashboard`);
      setDashboard(res.data);
    } catch {
      setDashboard({
        nombre: user.nombre, email: user.email,
        kycEstado: user.kycEstado || 'PENDIENTE',
        scoreSeguridadCuenta: user.scoreSeguridadCuenta || 100,
        alertasBadge: 0, ultimasTransacciones: [],
      });
    } finally {
      setLoadingDash(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) loadDashboard();
  }, [user, loading, router, loadDashboard]);

  if (loading || loadingDash) return <PageLoader />;
  if (!dashboard) return null;

  const nombre = dashboard.nombre.split(' ')[0];

  return (
    <div className="font-body antialiased min-h-screen pb-32 bg-[#0A0A0F] text-white animate-fade-in">
      {/* TopAppBar */}
      <header className="fixed top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-lg flex justify-between items-center w-full px-6 py-4 shadow-none">
        <button className="text-primary-container hover:bg-slate-800/50 active:scale-95 duration-200 p-2 rounded-full flex items-center justify-center">
          <Menu size={24} />
        </button>
        <h1 className="font-headline tracking-tight font-semibold text-lg text-white">
          Principal
        </h1>
        <button className="hover:bg-slate-800/50 active:scale-95 duration-200 rounded-full overflow-hidden w-9 h-9 border-2 border-slate-800 flex items-center justify-center bg-slate-800">
          <UserCircle size={24} className="text-slate-400" />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-28 px-4 md:px-8 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Editorial Greeting Header */}
        <section className="mb-4 pl-2">
          <h2 className="text-[2.25rem] leading-tight font-display font-bold tracking-[-0.02em] text-white mb-2">
            Hola, {nombre} 👋
          </h2>
          <p className="text-surface-dim text-base font-body">
            Revisa la actividad reciente de tus cuentas.
          </p>
        </section>

        {/* Quick Actions (Adapted to match design language) */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <Link href="/banking/vincular">
            <Card className="flex flex-col gap-2 hover:border-[#2D3060] p-4 bg-[#0F1022]">
              <CreditCard size={20} className="text-blue-400" />
              <span className="text-sm text-white font-semibold font-label">Vincular banco</span>
            </Card>
          </Link>
          <Link href="/kyc">
            <Card className="flex flex-col gap-2 hover:border-[#2D3060] p-4 bg-[#0F1022]">
              <UserCheck size={20} className="text-primary-fixed-dim" />
              <span className="text-sm text-white font-semibold font-label">KYC</span>
            </Card>
          </Link>
        </div>

        {/* Alert Cards List (Transactions) */}
        <div className="flex flex-col gap-6">
          {dashboard.ultimasTransacciones.length === 0 ? (
             <article className="card-bg rounded-[20px] p-6 shadow-md text-center py-10 border border-slate-800/50">
               <ShoppingCart size={32} className="text-slate-600 mx-auto mb-3" />
               <p className="text-slate-400 text-sm font-medium">Sin transacciones recientes</p>
             </article>
          ) : (
            dashboard.ultimasTransacciones.map((txn, index) => {
              const config = getRiskConfig(txn.score);
              const icon = index % 2 === 0 ? <ShoppingCart size={24} /> : <Coffee size={24} />;
              
              return (
                <article key={txn.idTransaccion} className="card-bg rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
                  {/* Ambient Glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${config.glow} rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-slate-300">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-headline font-semibold text-lg text-white">{txn.comercio}</h3>
                        <p className="text-sm text-surface-dim font-medium">Transacción</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${config.badge}`}>
                      <span className="text-xs font-label font-semibold tracking-wide uppercase">{config.type}</span>
                    </div>
                  </div>
                  
                  <div className="mb-5 relative z-10">
                    <p className="text-[1.75rem] font-display font-bold text-white tracking-tight">
                      ${txn.monto.toLocaleString('es-CO')} <span className="text-lg text-surface-dim font-medium ml-1">COP</span>
                    </p>
                  </div>
                  
                  <div className="bg-[#1A1A24] rounded-[12px] p-3.5 flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] text-surface-dim relative z-10 border border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="font-label font-semibold text-slate-500 mb-0.5">Fecha/Hora</span>
                      <span className="font-medium text-slate-300">{new Date(txn.fechaHora).toLocaleString('es-CO', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    {txn.score !== undefined && (
                      <div className="flex flex-col">
                        <span className="font-label font-semibold text-slate-500 mb-0.5">Score</span>
                        <span className="font-mono font-medium text-slate-300">{txn.score}/100</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-label font-semibold text-slate-500 mb-0.5">ID TRX</span>
                      <span className="font-mono font-medium text-slate-300">{txn.idTransaccion.substring(0,8).toUpperCase()}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      <BottomNav alertaBadge={dashboard.alertasBadge} />
    </div>
  );
}
