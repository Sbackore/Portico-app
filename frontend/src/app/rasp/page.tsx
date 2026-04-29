'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, PageLoader } from '@/components/ui';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface RaspData {
  scoreSeguridadCuenta: number;
  amenazasRecientes: Array<{ id: string; tipoAmenaza: string; severidad: string; accionTomada: string; timestampMs: number }>;
  bloqueoTemporalHasta?: string;
}

const severidadConfig: Record<string, { color: string; dot: string; badge: 'red' | 'orange' | 'purple' | 'gray' }> = {
  CRITICA: { color: 'text-red-400', dot: 'bg-red-500', badge: 'red' },
  ALTA: { color: 'text-orange-400', dot: 'bg-orange-500', badge: 'orange' },
  MEDIA: { color: 'text-yellow-400', dot: 'bg-yellow-500', badge: 'purple' },
  BAJA: { color: 'text-gray-400', dot: 'bg-gray-500', badge: 'gray' },
};

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 70 ? '#00FF85' : score >= 40 ? '#FF6B35' : '#FF2D55';

  return (
    <div className="flex flex-col items-center py-4">
      <svg width="140" height="110" viewBox="0 0 140 110">
        <circle cx="70" cy="80" r={radius} fill="none" stroke="#1E2040" strokeWidth="12"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125}`} strokeLinecap="round" />
        <circle cx="70" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${-circ * 0.125 + offset}`}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="70" y="75" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{score}</text>
        <text x="70" y="92" textAnchor="middle" fill="#6B7280" fontSize="10">/ 100</text>
      </svg>
      <p className="text-xs text-gray-400 mt-1">Nivel de protección</p>
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
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="bg-[#0F1022] px-5 pt-12 pb-4 border-b border-[#1E2040]">
        <div className="flex items-center gap-3">
          <Shield size={22} className={score >= 70 ? 'text-green-400' : 'text-red-400'} />
          <h1 className="text-xl font-bold text-white">Seguridad de tu cuenta</h1>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Score */}
        <Card className="text-center">
          <ScoreGauge score={score} />
          <div className="flex justify-center gap-3 mt-2">
            <Badge color={score >= 70 ? 'green' : 'red'}>
              {score >= 70 ? '🛡 Protección activa' : '⚠ Protección reducida'}
            </Badge>
            <Badge color="gray">📱 Dispositivo analizado</Badge>
          </div>
        </Card>

        {/* Bloqueo activo */}
        {bloqueoCd && (
          <Card className="border-red-500/40 bg-red-500/5 text-center">
            <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-semibold text-sm">Tu cuenta está temporalmente bloqueada</p>
            <p className="text-3xl font-mono font-bold text-red-300 mt-2">{bloqueoCd}</p>
            <p className="text-xs text-gray-500 mt-1">Tiempo restante de bloqueo</p>
          </Card>
        )}

        {/* Amenazas recientes */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Eventos recientes</p>
          {amenazas.length === 0 ? (
            <Card className="text-center py-8">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Sin amenazas detectadas</p>
              <p className="text-gray-400 text-sm mt-1">Tu dispositivo está seguro.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {amenazas.map(a => {
                const cfg = severidadConfig[a.severidad] || severidadConfig.BAJA;
                return (
                  <Card key={a.id} className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge color={cfg.badge}>{a.severidad}</Badge>
                      </div>
                      <p className="text-sm text-white font-medium">{a.tipoAmenaza.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.accionTomada}</p>
                      <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(a.timestampMs).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
