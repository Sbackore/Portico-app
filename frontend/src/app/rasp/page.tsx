'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui';
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowLeft, ShieldAlert, Key, Smartphone, Lock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface RaspData {
  scoreSeguridadCuenta: number;
  amenazasRecientes: Array<{ id: string; tipoAmenaza: string; severidad: string; accionTomada: string; timestampMs: number }>;
  bloqueoTemporalHasta?: string;
}

const severidadConfig: Record<string, { color: string; dot: string; badge: string }> = {
  CRITICA: { color: 'text-error', dot: 'bg-error', badge: 'bg-error/20 text-error border-error/30' },
  ALTA: { color: 'text-orange-400', dot: 'bg-orange-500', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  MEDIA: { color: 'text-primary-fixed-dim', dot: 'bg-primary-fixed-dim', badge: 'bg-primary/20 text-primary-fixed border-primary/30' },
  BAJA: { color: 'text-surface-dim', dot: 'bg-surface-dim', badge: 'bg-slate-800 text-surface-dim border-slate-700' },
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 70 ? '#00FF85' : score >= 40 ? '#FF6B35' : '#ba1a1a';

  return (
    <div className="flex flex-col items-center py-4 relative z-10">
      <svg width="140" height="110" viewBox="0 0 140 110">
        <circle cx="70" cy="80" r={radius} fill="none" stroke="#1A1A24" strokeWidth="12"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`} strokeLinecap="round" />
        <circle cx="70" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125 + offset}`}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="70" y="75" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" className="font-display">{score}</text>
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

  const cargar = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/rasp/estado/${user.uid}`);
      setData(res.data);
    } catch {
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

  if (loading || loadingData) return <PageLoader />;

  const score = data?.scoreSeguridadCuenta ?? 100;
  const amenazas = data?.amenazasRecientes || [];

  return (
    <div className="font-body antialiased min-h-screen pb-32 bg-[#0A0A0F] text-white animate-fade-in">
      {/* TopAppBar */}
      <header className="bg-[#0A0A0F]/80 backdrop-blur-xl docked full-width top-0 sticky shadow-none flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto z-40">
        <Link href="/home">
          <button className="text-primary-container hover:bg-slate-800/50 transition-colors scale-95 active:scale-90 duration-200 p-2 rounded-full">
            <ArrowLeft size={24} />
          </button>
        </Link>
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
            <div className="flex justify-center gap-3 mt-4 relative z-10 flex-wrap">
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${score >= 70 ? 'bg-[#00FF85]/10 border-[#00FF85]/30 text-[#00FF85]' : 'bg-error/10 border-error/30 text-error'}`}>
                <span className="text-xs font-label font-semibold tracking-wide uppercase">
                  {score >= 70 ? '✓ Protección activa' : '⚠ Protección reducida'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full flex items-center gap-1.5 border bg-primary/10 border-primary/30 text-primary-fixed-dim">
                <span className="text-xs font-label font-semibold tracking-wide uppercase">📱 Dispositivo analizado</span>
              </div>
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

          {/* Recomendaciones de Seguridad Card */}
          <article className="bg-[#0F1022] rounded-[20px] p-6 shadow-[0px_12px_32px_rgba(108,71,255,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-container to-primary/50"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10 pl-2">
              <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-primary-container">
                <Lock size={24} />
              </div>
              <h3 className="font-headline font-semibold text-xl text-white">Recomendaciones de seguridad</h3>
            </div>
            
            <ul className="space-y-6 relative z-10 pl-2">
              <li className="flex items-start gap-4">
                <Key className="text-primary-container mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-label font-semibold text-white mb-1 text-sm">Contraseñas seguras</h4>
                  <p className="font-body text-surface-dim text-sm leading-relaxed">Utiliza combinaciones únicas de letras, números y símbolos. No recicles contraseñas de otros servicios.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <ShieldAlert className="text-primary-container mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-label font-semibold text-white mb-1 text-sm">No compartas códigos</h4>
                  <p className="font-body text-surface-dim text-sm leading-relaxed">Nunca te pediremos tus códigos de verificación (SMS/Email) ni tu clave PIN por ningún medio.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Smartphone className="text-primary-container mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-label font-semibold text-white mb-1 text-sm">Dispositivos de confianza</h4>
                  <p className="font-body text-surface-dim text-sm leading-relaxed">Mantén tu dispositivo actualizado y no ingreses a tu cuenta desde redes Wi-Fi públicas o dispositivos compartidos.</p>
                </div>
              </li>
            </ul>
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
