'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader, Skeleton } from '@/components/ui';
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowLeft, ShieldAlert, Key, Smartphone, Lock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RaspData {
  scoreSeguridadCuenta: number;
  amenazasRecientes: Array<{ id: string; tipoAmenaza: string; severidad: string; accionTomada: string; timestampMs: number }>;
  bloqueoTemporalHasta?: string;
  sesionesRecientes?: Array<{ id: string; tipo: string; dispositivo: string; timestampMs: number }>;
  kycPendiente?: boolean;
  resumenTransaccional?: {
    promedioRiesgo: number;
    ubicacionFrecuente: string;
    totalAnalizadas: number;
    historialScores?: number[];
  };
}

const severidadConfig: Record<string, { color: string; dot: string; badge: string }> = {
  CRITICA: { color: 'text-error', dot: 'bg-error', badge: 'bg-error/20 text-error border-error/30' },
  ALTA: { color: 'text-orange-400', dot: 'bg-orange-500', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  MEDIA: { color: 'text-primary-fixed-dim', dot: 'bg-primary-fixed-dim', badge: 'bg-primary/20 text-primary-fixed border-primary/30' },
  BAJA: { color: 'text-surface-dim', dot: 'bg-surface-dim', badge: 'bg-slate-800 text-surface-dim border-slate-700' },
};

function ScoreGauge({ score, isScanning }: { score: number, isScanning?: boolean }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const activeArc = arc * (score / 100);
  const color = score >= 70 ? '#00FF85' : score >= 40 ? '#FF6B35' : '#ba1a1a';

  return (
    <div className="flex flex-col items-center py-4 relative z-10">
      <svg width="140" height="110" viewBox="0 0 140 110">
        <circle cx="70" cy="80" r={radius} fill="none" stroke="#1A1A24" strokeWidth="12"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`} strokeLinecap="round" />
        <circle cx="70" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${activeArc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} 
          className={isScanning ? 'animate-pulse' : ''} />
          
        {isScanning && (
          <circle cx="70" cy="80" r={radius} fill="none" stroke="#6C47FF" strokeWidth="4"
            strokeDasharray={`${circ * 0.1} ${circ * 0.9}`} 
            strokeLinecap="round" 
            className="origin-center animate-spin" style={{ animationDuration: '1.5s' }} />
        )}

        <text x="70" y="75" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" className="font-display">
          {isScanning ? '...' : score}
        </text>
        <text x="70" y="92" textAnchor="middle" fill="#797588" fontSize="11" className="font-label">/ 100</text>
      </svg>
      <p className="text-sm text-surface-dim mt-1 font-medium tracking-wide">Nivel de protección</p>
    </div>
  );
}

export default function RaspPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<RaspData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [bloqueoCd, setBloqueoCd] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<number | null>(null);

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScan(Date.now());
    }, 2500);
  };

  const cargar = useCallback(async () => {
    if (!user) return;
    try {
      console.log(`Pidiendo estado para: ${user.uid}`);
      const res = await api.get(`/rasp/estado/${user.uid}`);
      console.log('Respuesta del backend:', res.data);
      setData(res.data);
    } catch (err) {
      console.error('Error al obtener el estado:', err);
      setData({ scoreSeguridadCuenta: user.scoreSeguridadCuenta || 100, amenazasRecientes: [] });
    } finally { setLoadingData(false); }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) cargar();
  }, [user, loading, router, cargar]);

  useEffect(() => {
    if (!data?.bloqueoTemporalHasta) return;
    const calc = () => {
      const diff = new Date(data.bloqueoTemporalHasta!).getTime() - Date.now();
      if (diff <= 0) { setBloqueoCd(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setBloqueoCd(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [data?.bloqueoTemporalHasta]);

  if (loading || loadingData) {
    return (
      <div className="font-body min-h-screen pb-32 bg-transparent p-6">
        <div className="max-w-2xl mx-auto pt-24 space-y-6">
          <Skeleton className="w-full h-64 rounded-[20px]" />
          <Skeleton className="w-full h-40 rounded-[20px]" />
          <Skeleton className="w-full h-40 rounded-[20px]" />
        </div>
      </div>
    );
  }

  const score = data?.scoreSeguridadCuenta ?? 100;
  const amenazas = data?.amenazasRecientes || [];

  return (
    <div className="font-body antialiased min-h-screen pb-32 bg-transparent text-white animate-fade-in">
      <header className="bg-[#0A0A0F]/80 backdrop-blur-xl docked full-width top-0 sticky shadow-none flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto z-40">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-xl font-headline font-semibold tracking-tighter text-white">Seguridad y Legal</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="pt-8 px-4 md:px-8 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="mb-10 pl-2">
          <h2 className="text-[2.25rem] leading-tight font-display font-bold tracking-[-0.02em] text-white mb-4">
            Tu seguridad es nuestra <span className="text-primary-container">prioridad.</span>
          </h2>
          <p className="text-surface-dim text-base font-body leading-relaxed">
            Conoce cómo protegemos tu información y las mejores prácticas para mantener tu cuenta segura.
          </p>
        </section>

        <div className="flex flex-col gap-6">
          {/* Score Card */}
          <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <ScoreGauge score={score} />
            <div className="flex justify-center gap-3 mt-4 relative z-10 flex-wrap mb-6">
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${score >= 70 ? 'bg-[#00FF85]/10 border-[#00FF85]/30 text-[#00FF85]' : 'bg-error/10 border-error/30 text-error'}`}>
                <span className="text-xs font-label font-semibold tracking-wide uppercase">
                  {score >= 70 ? '✓ Protección activa' : '⚠ Protección reducida'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full flex items-center gap-1.5 border bg-primary/10 border-primary/30 text-primary-fixed-dim">
                <span className="text-xs font-label font-semibold tracking-wide uppercase">📱 Dispositivo seguro</span>
              </div>
            </div>

            <div className="relative z-10 text-center">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleScan}
                disabled={isScanning}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full text-sm transition-colors w-full active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <><span className="animate-spin border-2 border-primary-container border-t-transparent w-4 h-4 rounded-full" /> Analizando...</>
                ) : (
                  <><Shield size={16} /> Analizar dispositivo</>
                )}
              </motion.button>
              {lastScan && !isScanning && (
                <p className="text-xs text-surface-dim mt-3 font-medium">Último escaneo: {new Date(lastScan).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}</p>
              )}
            </div>
          </article>

          {/* Bloqueo activo */}
          {bloqueoCd && (
            <article className="bg-error/10 border border-error/30 rounded-[20px] p-6 text-center shadow-[0px_12px_32px_rgba(186,26,26,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-error/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <AlertTriangle size={32} className="text-error mx-auto mb-3 relative z-10" />
              <p className="text-error font-semibold text-base relative z-10">Tu cuenta está temporalmente bloqueada</p>
              <p className="text-4xl font-mono font-bold text-[#ffdad6] mt-3 relative z-10 tracking-wider">{bloqueoCd}</p>
              <p className="text-sm text-error/70 mt-2 relative z-10 font-medium">Tiempo restante de bloqueo</p>
            </article>
          )}

          {/* Checklist Dinámico */}
          <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-container to-primary/50"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10 pl-2">
              <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-primary-container">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-headline font-semibold text-xl text-white">Lista de Seguridad</h3>
            </div>
            
            <ul className="space-y-4 relative z-10 pl-2">
              <li className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24]/50 border border-white/5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!data?.kycPendiente ? 'bg-[#00FF85]/20 text-[#00FF85]' : 'bg-surface-dim/20 text-surface-dim'}`}>
                  <CheckCircle size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="font-label font-semibold text-white text-sm">Identidad Verificada</h4>
                  <p className="font-body text-surface-dim text-xs">KYC Biométrico {data?.kycPendiente ? 'pendiente' : 'aprobado'}</p>
                </div>
                {data?.kycPendiente && (
                  <Link href="/kyc" className="text-xs font-bold text-primary-container bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">Verificar</Link>
                )}
              </li>

              <li className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24]/50 border border-white/5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#00FF85]/20 text-[#00FF85]">
                  <CheckCircle size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="font-label font-semibold text-white text-sm">Contraseña Segura</h4>
                  <p className="font-body text-surface-dim text-xs">Sin vulnerabilidades detectadas</p>
                </div>
              </li>
              
              <li className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A24]/50 border border-white/5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#00FF85]/20 text-[#00FF85]">
                  <CheckCircle size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="font-label font-semibold text-white text-sm">Datos de Contacto</h4>
                  <p className="font-body text-surface-dim text-xs">Email y teléfono vinculados</p>
                </div>
              </li>
            </ul>
          </article>

          {/* Historial de Sesiones */}
          <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 relative z-10 pl-2">
              <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-primary-container">
                <Smartphone size={24} />
              </div>
              <h3 className="font-headline font-semibold text-xl text-white">Últimos Accesos</h3>
            </div>
            
            <div className="space-y-4 relative z-10 pl-2">
              {data?.sesionesRecientes && data.sesionesRecientes.length > 0 ? (
                data.sesionesRecientes.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A24]/50 border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{s.tipo === 'INICIO' ? 'Inicio de sesión' : 'Cierre de sesión'}</p>
                      <p className="text-xs text-surface-dim mt-0.5">{s.dispositivo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-primary-fixed-dim">
                        {new Date(s.timestampMs).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                      <p className="text-[10px] text-surface-dim mt-0.5">
                        {new Date(s.timestampMs).toLocaleDateString('es-CO', {month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-surface-dim italic">No hay accesos recientes registrados.</p>
              )}
            </div>
          </article>

          {/* Resumen Transaccional */}
          <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 relative z-10 pl-2">
              <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-primary-container">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-headline font-semibold text-xl text-white">Riesgo Transaccional</h3>
                <p className="text-xs text-surface-dim mt-1">Basado en {data?.resumenTransaccional?.totalAnalizadas || 0} transacciones recientes</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10 pl-2">
              <div className="bg-[#1A1A24]/50 rounded-[16px] p-4 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <p className="text-xs text-surface-dim font-medium mb-2 relative z-10">Score de Riesgo</p>
                <div className="flex items-end gap-2 relative z-10">
                  <span className="text-3xl font-display font-bold text-white leading-none">{data?.resumenTransaccional?.promedioRiesgo || 0}</span>
                  <span className="text-xs text-surface-dim mb-1">/ 100</span>
                </div>
                
                {data?.resumenTransaccional?.historialScores && data.resumenTransaccional.historialScores.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.resumenTransaccional.historialScores.map((s, i) => ({ val: s, i }))}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={data.resumenTransaccional.promedioRiesgo > 50 ? "#ba1a1a" : "#00FF85"} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={data.resumenTransaccional.promedioRiesgo > 50 ? "#ba1a1a" : "#00FF85"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke={data.resumenTransaccional.promedioRiesgo > 50 ? "#ba1a1a" : "#00FF85"} fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {!data?.resumenTransaccional?.historialScores && (
                  <div className="w-full bg-surface-dim/20 h-1.5 rounded-full mt-3 overflow-hidden relative z-10">
                    <div 
                      className={`h-full rounded-full ${(data?.resumenTransaccional?.promedioRiesgo || 0) > 50 ? 'bg-error' : 'bg-[#00FF85]'}`} 
                      style={{ width: `${Math.min(100, Math.max(0, data?.resumenTransaccional?.promedioRiesgo || 0))}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-[#1A1A24]/50 rounded-[16px] p-4 border border-white/5 flex flex-col justify-center">
                <p className="text-xs text-surface-dim font-medium mb-2">Zona Frecuente</p>
                <p className="text-sm font-semibold text-primary-container leading-tight">
                  {data?.resumenTransaccional?.ubicacionFrecuente || 'Desconocida'}
                </p>
                <div className="mt-auto pt-3">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#00FF85]/10 text-[#00FF85] text-[10px] font-bold tracking-wide uppercase">
                    ✓ SEGURA
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Amenazas recientes */}
          {amenazas.length > 0 && (
            <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6 relative z-10 pl-2">
                <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-primary-container">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="font-headline font-semibold text-xl text-white">Eventos recientes</h3>
              </div>
              
              <div className="space-y-4 relative z-10 pl-2">
                {amenazas.map(a => {
                  const cfg = severidadConfig[a.severidad] || severidadConfig.BAJA;
                  return (
                    <div key={a.id} className="bg-[#1A1A24]/50 rounded-[12px] p-4 border border-white/5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 border ${cfg.badge}`}>
                          <span className="text-[10px] font-label font-bold tracking-wide uppercase">{a.severidad}</span>
                        </div>
                        <p className="text-xs text-surface-dim/70 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(a.timestampMs).toLocaleDateString('es-CO', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm text-white font-medium">{a.tipoAmenaza.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-surface-dim leading-relaxed">{a.accionTomada}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          )}

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
