'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui';
import { Menu, UserCircle, ShieldCheck } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Alerta {
  id: string; idTransaccion: string; comercio: string; monto: number;
  score: number; fechaHora: string; estado: 'pendiente' | 'confirmada' | 'reportada';
  ubicacion?: string;
}

function AlertaCard({ alerta, onAccion }: { alerta: Alerta; onAccion: (id: string, accion: string) => void }) {
  const [loading, setLoading] = useState('');
  
  const riskHigh = alerta.score > 80;
  const riskMed = alerta.score > 60;
  
  const glowClass = riskHigh ? 'bg-error/10' : riskMed ? 'bg-orange-500/10' : 'bg-primary/10';
  const badgeClass = riskHigh ? 'bg-error/20 text-error border-error/30' : riskMed ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-primary/20 text-primary-fixed border-primary/30';
  const badgeText = riskHigh ? 'RIESGO ALTO' : riskMed ? 'PENDIENTE' : 'VERIFICADA';
  const amountColor = riskHigh ? 'text-error' : 'text-white';

  const handleAccion = async (accion: string) => {
    setLoading(accion);
    await onAccion(alerta.id, accion);
    setLoading('');
  };

  return (
    <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
      <div className={`absolute top-0 right-0 w-32 h-32 ${glowClass} blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="font-headline font-semibold text-lg text-white">{alerta.comercio}</h2>
          <p className="text-sm text-surface-dim font-medium">
            {new Date(alerta.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(alerta.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {alerta.ubicacion && <p className="text-xs text-surface-dim/70 mt-1">📍 {alerta.ubicacion}</p>}
        </div>
        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${badgeClass}`}>
          <span className="text-xs font-label font-semibold tracking-wide uppercase">{alerta.estado === 'pendiente' ? badgeText : alerta.estado}</span>
        </div>
      </div>
      <div className="mb-5 relative z-10">
        <p className={`text-[1.75rem] font-display font-bold ${amountColor} tracking-tight`}>
          -${alerta.monto.toLocaleString('es-CO')}
        </p>
      </div>
      <div className="bg-[#1A1A24] rounded-[12px] p-3.5 flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] text-surface-dim relative z-10 border border-slate-700/50 mb-6">
        <div className="flex flex-col">
          <span className="font-label font-semibold text-slate-500 mb-0.5">ID Alerta</span>
          <span className="font-mono font-medium text-slate-300">{alerta.id.substring(0,8).toUpperCase()}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label font-semibold text-slate-500 mb-0.5">ID Transacción</span>
          <span className="font-mono font-medium text-slate-300">{alerta.idTransaccion.substring(0,10).toUpperCase()}</span>
        </div>
      </div>
      
      {alerta.estado === 'pendiente' && alerta.score > 60 && (
        <div className="flex gap-4 relative z-10">
          <button 
            disabled={loading !== ''}
            onClick={() => handleAccion('confirmar')}
            className="flex-1 py-3 px-6 rounded-full bg-primary text-white font-bold text-sm tracking-wide active:scale-95 transition-transform shadow-[0px_8px_16px_rgba(108,71,255,0.2)] disabled:opacity-50"
          >
            {loading === 'confirmar' ? '...' : 'Verificar'}
          </button>
          <button 
            disabled={loading !== ''}
            onClick={() => handleAccion('reportar')}
            className="flex-1 py-3 px-6 rounded-full border border-slate-700 text-white font-bold text-sm tracking-wide active:scale-95 transition-transform hover:bg-slate-800/50 disabled:opacity-50"
          >
            {loading === 'reportar' ? '...' : 'Bloquear / Reportar'}
          </button>
        </div>
      )}
    </article>
  );
}

export default function BankingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'resueltas'>('todas');
  const [loadingData, setLoadingData] = useState(true);

  const cargarAlertas = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/banking/alertas/${user.uid}`);
      setAlertas(res.data || []);
    } catch {
      // fallback: mostrar vacío
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) cargarAlertas();
  }, [user, loading, router, cargarAlertas]);

  const handleAccion = async (alertaId: string, accion: string) => {
    try {
      setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, estado: accion === 'confirmar' ? 'confirmada' : 'reportada' } : a));
      toast.success(accion === 'confirmar' ? 'Transacción confirmada' : 'Reporte enviado. Te contactaremos.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'pendientes') return a.estado === 'pendiente';
    if (filtro === 'resueltas') return a.estado !== 'pendiente';
    return true;
  });

  if (loading || loadingData) return <PageLoader />;

  return (
    <div className="font-body antialiased min-h-screen pb-32 bg-[#0A0A0F] text-white animate-fade-in">
      {/* TopAppBar */}
      <header className="fixed top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-lg flex justify-between items-center w-full px-6 py-4 shadow-none">
        <button className="text-primary-container hover:bg-slate-800/50 active:scale-95 duration-200 p-2 rounded-full flex items-center justify-center">
          <Menu size={24} />
        </button>
        <h1 className="font-headline tracking-tight font-semibold text-lg text-white">
          Transacciones
        </h1>
        <button className="hover:bg-slate-800/50 active:scale-95 duration-200 rounded-full overflow-hidden w-9 h-9 border-2 border-slate-800 flex items-center justify-center bg-slate-800">
          <UserCircle size={24} className="text-surface-dim" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="flex gap-2 mb-6 px-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['todas', 'pendientes', 'resueltas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`text-xs px-4 py-2 font-label font-semibold rounded-full capitalize transition-colors whitespace-nowrap ${filtro === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[#1A1A24] text-surface-dim border border-white/5 hover:bg-white/5'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {alertasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-[#0F1022] rounded-[20px] border border-white/5">
              <ShieldCheck size={48} className="text-[#00FF85] mx-auto mb-4" />
              <p className="text-white font-semibold">Sin alertas {filtro === 'pendientes' ? 'pendientes' : ''}</p>
              <p className="text-surface-dim text-sm mt-1">Estás al día. No hay movimientos que revisar.</p>
            </div>
          ) : (
            alertasFiltradas.map(a => <AlertaCard key={a.id} alerta={a} onAccion={handleAccion} />)
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
