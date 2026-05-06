'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui';
import { Menu, UserCircle, ShieldCheck, Plus, X, Building2, DollarSign, MapPin, ChevronDown } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isYesterday } from 'date-fns';

interface Alerta {
  id: string;
  idTransaccion: string;
  comercio: string;
  monto: number;
  score: number;
  fechaHora: string;
  estado: 'pendiente' | 'confirmada' | 'reportada' | string;
  ubicacion?: string;
}

function getBadgeConfig(score: number, estado: string) {
  if (estado === 'confirmada') return { text: 'VERIFICADA', cls: 'bg-primary/20 text-primary-fixed border-primary/30', glow: 'bg-primary/10' };
  if (estado === 'reportada') return { text: 'REPORTADA', cls: 'bg-slate-700/50 text-slate-400 border-slate-600/30', glow: 'bg-slate-700/10' };
  if (score > 80) return { text: 'RIESGO ALTO', cls: 'bg-error/20 text-error border-error/30', glow: 'bg-error/10' };
  return { text: 'PENDIENTE', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30', glow: 'bg-orange-500/10' };
}

function AlertaCard({ alerta, onAccion }: { alerta: Alerta; onAccion: (id: string, accion: string, motivo?: string) => Promise<void> }) {
  const [loading, setLoading] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [expanded, setExpanded] = useState(alerta.estado === 'pendiente');

  const reportReasons = [
    'No reconozco esta transacción',
    'El monto es incorrecto',
    'Me robaron el dispositivo o tarjeta',
    'Sospecha de fraude o estafa',
    'Otro'
  ];

  const cfg = getBadgeConfig(alerta.score, alerta.estado);
  const amountColor = alerta.score > 80 && alerta.estado === 'pendiente' ? 'text-error' : 'text-white';

  const handleAccion = async (accion: string, motivo?: string) => {
    if (!alerta.id) return;
    setLoading(accion);
    await onAccion(alerta.id, accion, motivo);
    setLoading('');
    if (accion === 'reportar') setShowReportModal(false);
  };

  return (
    <article 
      onClick={() => !showReportModal && setExpanded(!expanded)}
      className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden transition-colors duration-200 cursor-pointer hover:bg-[#13152B]"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${cfg.glow} blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none`}></div>
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h2 className="font-headline font-semibold text-lg text-white">{alerta.comercio}</h2>
          <p className="text-sm text-slate-400 font-medium">
            {new Date(alerta.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(alerta.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {alerta.ubicacion && <p className="text-xs text-slate-500 mt-1">📍 {alerta.ubicacion}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${cfg.cls}`}>
            <span className="text-xs font-label font-semibold tracking-wide uppercase">{cfg.text}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="text-slate-500">
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      <div className="mb-2 relative z-10">
        <p className={`text-[1.75rem] font-display font-bold ${amountColor} tracking-tight`}>
          -${alerta.monto.toLocaleString('es-CO')}
        </p>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-4">
              <div className="bg-[#1A1A24] rounded-[12px] p-3.5 flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] text-slate-300 relative z-10 border border-slate-700/50 mb-6">
                <div className="flex flex-col">
                  <span className="font-label font-semibold text-slate-500 mb-0.5">ID Alerta</span>
                  <span className="font-mono font-medium">{alerta.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label font-semibold text-slate-500 mb-0.5">ID Transacción</span>
                  <span className="font-mono font-medium">{alerta.idTransaccion.substring(0, 12).toUpperCase()}</span>
                </div>
                {alerta.score > 0 && (
                  <div className="flex flex-col">
                    <span className="font-label font-semibold text-slate-500 mb-0.5">Score Riesgo</span>
                    <span className={`font-mono font-medium ${alerta.score > 80 ? 'text-error' : alerta.score > 60 ? 'text-orange-400' : 'text-[#00FF85]'}`}>{alerta.score}/100</span>
                  </div>
                )}
              </div>

              {alerta.estado === 'pendiente' && (
                <div className="flex gap-4 relative z-10">
                  <button
                    disabled={loading !== ''}
                    onClick={() => handleAccion('confirmar')}
                    className="flex-1 py-3 px-6 rounded-full bg-primary text-white font-bold text-sm tracking-wide active:scale-95 transition-transform shadow-[0px_8px_16px_rgba(108,71,255,0.2)] disabled:opacity-50"
                  >
                    {loading === 'confirmar' ? 'Procesando...' : 'Fui yo'}
                  </button>
                  <button
                    disabled={loading !== ''}
                    onClick={() => setShowReportModal(true)}
                    className="flex-1 py-3 px-6 rounded-full bg-slate-800 text-white font-bold text-sm tracking-wide active:scale-95 transition-transform hover:bg-slate-700 disabled:opacity-50"
                  >
                    No reconozco
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {alerta.estado !== 'pendiente' && (
        <p className="text-xs text-slate-500 relative z-10 flex items-center gap-1">
          <ShieldCheck size={12} />
          {alerta.estado === 'confirmada' ? 'Transacción confirmada por ti' : 'Reportada · En revisión por el equipo'}
        </p>
      )}

      {/* Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-[#0F1022] rounded-[28px] w-full max-w-sm border border-white/10 shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <h3 className="font-headline font-bold text-xl text-white mb-2">Reportar Transacción</h3>
            <p className="text-surface-dim text-sm mb-4 leading-relaxed">Por favor, indícanos el motivo de tu reporte para proceder con el bloqueo.</p>
            
            <div className="flex flex-col gap-2 mb-4">
              {reportReasons.map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-[12px] border cursor-pointer transition-colors ${reportReason === r ? 'bg-error/10 border-error/30' : 'bg-[#1A1A24] border-white/5 hover:bg-white/5'}`}>
                  <input type="radio" name={`reason-${alerta.id}`} value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-error w-4 h-4" />
                  <span className={`text-sm font-medium ${reportReason === r ? 'text-error' : 'text-slate-300'}`}>{r}</span>
                </label>
              ))}
            </div>
            
            {reportReason === 'Otro' && (
              <input type="text" placeholder="Escribe el motivo brevemente..." value={otherReason} onChange={e => setOtherReason(e.target.value)}
                className="w-full bg-[#1A1A24] border border-white/10 text-white rounded-[14px] py-3 px-4 font-body text-sm outline-none focus:ring-1 focus:ring-error focus:border-error mb-4" autoFocus />
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-full border border-slate-700 text-white font-bold text-sm tracking-wide active:scale-95 transition-transform hover:bg-slate-800/50">Cancelar</button>
              <button disabled={loading === 'reportar' || !reportReason || (reportReason === 'Otro' && !otherReason)}
                onClick={() => {
                  const finalReason = reportReason === 'Otro' ? otherReason : reportReason;
                  handleAccion('reportar', finalReason);
                }}
                className="flex-1 py-3 rounded-full bg-error text-white font-bold text-sm tracking-wide active:scale-95 transition-transform shadow-[0px_8px_16px_rgba(239,68,68,0.2)] disabled:opacity-50">
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function CrearAlertaModal({ userId, onClose, onCreated }: { userId: string; onClose: () => void; onCreated: () => void }) {
  const COMERCIOS = ['Amazon', 'Netflix', 'Rappi', 'Mercado Libre', 'Éxito', 'Bancolombia', 'Nequi', 'Davivienda', 'PayU'];
  const [form, setForm] = useState({ comercio: '', monto: '', ubicacion: '', factorDispositivo: '0' });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comercio || !form.monto) { toast.error('Comercio y monto son requeridos'); return; }
    const monto = parseFloat(form.monto.replace(/\./g, '').replace(',', '.'));
    if (isNaN(monto) || monto <= 0) { toast.error('Monto inválido'); return; }

    setLoading(true);
    try {
      const res = await api.post('/banking/simular', {
        userId,
        monto,
        comercio: form.comercio,
        ubicacion: form.ubicacion || undefined,
        factorDispositivo: parseInt(form.factorDispositivo),
      });
      const score = res.data.score;
      const nivel = score > 80 ? '🔴 RIESGO ALTO' : score > 60 ? '🟠 PENDIENTE' : '🟢 OK';
      toast.success(`Transacción simulada · Score: ${score}/100 ${nivel}`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#0F1022] rounded-t-[28px] sm:rounded-[28px] w-full max-w-lg border border-white/10 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header Sticky */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="font-headline font-bold text-xl text-white">Simular transacción</h3>
            <p className="text-surface-dim text-xs mt-1">Crea una transacción de prueba de fraude.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="simular-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-semibold text-slate-400 uppercase tracking-wide">Comercio</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <select value={form.comercio} onChange={set('comercio')}
                  className="w-full bg-[#1A1A24] border-none text-white rounded-[14px] py-4 pl-10 pr-4 font-body text-base outline-none focus:ring-1 focus:ring-primary-container appearance-none">
                  <option value="" disabled>Selecciona un comercio</option>
                  {COMERCIOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-semibold text-slate-400 uppercase tracking-wide">Monto (COP)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="number" placeholder="ej. 250000" value={form.monto} onChange={set('monto')}
                  className="w-full bg-[#1A1A24] border-none text-white rounded-[14px] py-4 pl-10 pr-4 font-body text-base outline-none focus:ring-1 focus:ring-primary-container" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-semibold text-slate-400 uppercase tracking-wide">Ubicación (opcional)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="ej. Bogotá, CO" value={form.ubicacion} onChange={set('ubicacion')}
                  className="w-full bg-[#1A1A24] border-none text-white rounded-[14px] py-4 pl-10 pr-4 font-body text-base outline-none focus:ring-1 focus:ring-primary-container" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-semibold text-slate-400 uppercase tracking-wide">Factor de dispositivo</label>
              <div className="flex gap-3">
                {[{ v: '0', l: '🟢 Confiable' }, { v: '50', l: '🟠 Nuevo' }, { v: '100', l: '🔴 Desconocido' }].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setForm(p => ({ ...p, factorDispositivo: opt.v }))}
                    className={`flex-1 py-3 rounded-[12px] text-xs font-semibold transition-colors border ${form.factorDispositivo === opt.v ? 'bg-primary/20 border-primary/30 text-primary-fixed' : 'bg-[#1A1A24] border-white/5 text-slate-400 hover:bg-white/5'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Sticky con el botón */}
        <div className="p-6 pt-4 border-t border-white/5 shrink-0 bg-[#0F1022] rounded-b-[28px]">
          <button form="simular-form" type="submit" disabled={loading}
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base tracking-wide active:scale-95 transition-transform shadow-[0px_8px_16px_rgba(108,71,255,0.3)] disabled:opacity-50">
            {loading ? 'Procesando...' : 'Simular transacción'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function BankingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'resueltas'>('todas');
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const cargarAlertas = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/banking/alertas/${user.uid}`);
      setAlertas(res.data || []);
    } catch {
      setAlertas([]);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) cargarAlertas();
  }, [user, loading, router, cargarAlertas]);

  const handleAccion = async (alertaId: string, accion: string, motivo?: string) => {
    if (!user) return;
    try {
      const nuevoEstado = accion === 'confirmar' ? 'confirmada' : 'reportada';
      await api.post(`/banking/alerta/${alertaId}/accion`, {
        userId: user.uid,
        estado: nuevoEstado,
        motivo,
      });

      setAlertas(prev =>
        prev.map(a =>
          a.id === alertaId
            ? { ...a, estado: nuevoEstado, score: accion === 'reportar' ? 100 : a.score }
            : a,
        ),
      );
      toast.success(accion === 'confirmar' ? '✅ Transacción confirmada' : '🚨 Reporte enviado. Nuestro equipo lo revisará.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'pendientes') return a.estado === 'pendiente';
    if (filtro === 'resueltas') return a.estado !== 'pendiente';
    return true;
  });

  const agrupadas = alertasFiltradas.reduce((acc, a) => {
    const d = new Date(a.fechaHora);
    const cat = isToday(d) ? 'Hoy' : isYesterday(d) ? 'Ayer' : 'Anteriores';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, Alerta[]>);

  if (loading || loadingData) {
    return (
      <div className="font-body min-h-screen pb-32 bg-transparent p-6">
        <div className="max-w-2xl mx-auto pt-24 space-y-4">
          <Skeleton className="w-full h-12 rounded-full mb-6" />
          <Skeleton className="w-full h-32 rounded-[20px]" />
          <Skeleton className="w-full h-32 rounded-[20px]" />
          <Skeleton className="w-full h-32 rounded-[20px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-body antialiased min-h-screen pb-32 bg-transparent text-white animate-fade-in">
      {/* TopAppBar */}
      <header className="fixed top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-lg flex justify-between items-center w-full px-6 py-4 shadow-none border-b border-white/5">
        <div className="w-10 h-10" />
        <h1 className="font-headline tracking-tight font-semibold text-lg text-white">Transacciones</h1>
        <button className="hover:bg-slate-800/50 active:scale-95 duration-200 rounded-full overflow-hidden w-9 h-9 border-2 border-slate-800 flex items-center justify-center bg-slate-800">
          <UserCircle size={24} className="text-surface-dim" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-2xl mx-auto">
        {/* Filters + Create */}
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="flex gap-2 flex-1 overflow-x-auto pb-1 scrollbar-hide">
            {(['todas', 'pendientes', 'resueltas'] as const).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`text-xs px-4 py-2 font-label font-semibold rounded-full capitalize transition-colors whitespace-nowrap ${filtro === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[#1A1A24] text-surface-dim border border-white/5 hover:bg-white/5'}`}>
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-[0px_4px_12px_rgba(108,71,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={18} /> Simular transacción
          </button>
        </div>

        {/* Alert Cards */}
        <div className="flex flex-col gap-6">
          {alertasFiltradas.length === 0 ? (
            <div className="bg-[#0F1022] rounded-[20px] p-10 border border-white/5 text-center">
              <ShieldCheck size={48} className="text-[#00FF85] mx-auto mb-4" />
              <p className="text-white font-semibold text-lg">
                {filtro === 'pendientes' ? 'Sin alertas pendientes' : filtro === 'resueltas' ? 'Sin alertas resueltas' : 'Sin transacciones'}
              </p>
              <p className="text-surface-dim text-sm mt-2 mb-6 max-w-[240px] mx-auto">
                {alertas.length === 0
                  ? 'Aún no hay transacciones. Simula una usando el botón +'
                  : 'No hay transacciones que coincidan con este filtro'}
              </p>
              {alertas.length === 0 && (
                <button onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-[0px_8px_16px_rgba(108,71,255,0.3)] hover:brightness-110 active:scale-95 transition-all">
                  <Plus size={16} /> Simular primera transacción
                </button>
              )}
            </div>
          ) : (
            ['Hoy', 'Ayer', 'Anteriores'].map(cat => {
              if (!agrupadas[cat]) return null;
              return (
                <div key={cat} className="mb-6">
                  <h3 className="text-surface-dim text-sm font-semibold mb-4 tracking-wide pl-2">{cat}</h3>
                  <div className="flex flex-col gap-4">
                    {agrupadas[cat].map(a => (
                      <AlertaCard key={a.id} alerta={a} onAccion={handleAccion} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {showModal && user && (
        <CrearAlertaModal
          userId={user.uid}
          onClose={() => setShowModal(false)}
          onCreated={() => { setLoadingData(true); cargarAlertas(); }}
        />
      )}

      <BottomNav />
    </div>
  );
}
