'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, Button, PageLoader } from '@/components/ui';
import { AlertTriangle, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Alerta {
  id: string; idTransaccion: string; comercio: string; monto: number;
  score: number; fechaHora: string; estado: 'pendiente' | 'confirmada' | 'reportada';
  ubicacion?: string;
}

function AlertaCard({ alerta, onAccion }: { alerta: Alerta; onAccion: (id: string, accion: string) => void }) {
  const [loading, setLoading] = useState('');
  const riskHigh = alerta.score > 80;
  const riskMed = alerta.score > 60;
  const borderColor = riskHigh ? 'border-l-red-500' : riskMed ? 'border-l-orange-500' : 'border-l-green-500';
  const label = riskHigh ? 'Movimiento inusual' : riskMed ? 'Revisar transacción' : 'Pago verificado';
  const labelColor = riskHigh ? 'red' : riskMed ? 'orange' : 'green';

  const handleAccion = async (accion: string) => {
    setLoading(accion);
    await onAccion(alerta.id, accion);
    setLoading('');
  };

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge color={labelColor as 'red' | 'orange' | 'green'}>{label}</Badge>
          </div>
          <p className="text-sm font-semibold text-white truncate">{alerta.comercio}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            ${alerta.monto.toLocaleString('es-CO')} · {new Date(alerta.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
          {alerta.ubicacion && <p className="text-xs text-gray-600 mt-0.5">📍 {alerta.ubicacion}</p>}
        </div>
        {alerta.score > 60 && <AlertTriangle size={18} className={riskHigh ? 'text-red-400' : 'text-orange-400'} />}
        {alerta.score <= 60 && <CheckCircle size={18} className="text-green-400" />}
      </div>

      {alerta.estado === 'pendiente' && alerta.score > 60 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button size="sm" variant="outline" loading={loading === 'confirmar'} onClick={() => handleAccion('confirmar')}>
            ✓ Sí, fui yo
          </Button>
          <Button size="sm" variant="secondary" loading={loading === 'reportar'} onClick={() => handleAccion('reportar')}>
            Reportar
          </Button>
          {riskHigh && (
            <Button size="sm" variant="danger" loading={loading === 'bloquear'} onClick={() => handleAccion('bloquear')}>
              Bloquear
            </Button>
          )}
        </div>
      )}
      {alerta.estado !== 'pendiente' && (
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <Clock size={10} /> {alerta.estado === 'confirmada' ? 'Confirmada por ti' : 'Reportada · En revisión'}
        </p>
      )}
    </Card>
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
      toast.success(accion === 'confirmar' ? 'Transacción confirmada' : accion === 'reportar' ? 'Reporte enviado. Te contactaremos.' : 'Cuenta bloqueada temporalmente');
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
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="bg-[#0F1022] px-5 pt-12 pb-4 sticky top-0 z-30 border-b border-[#1E2040]">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-white flex-1">Alertas de transacciones</h1>
          <Link href="/banking/vincular">
            <button className="text-xs text-[#A78BFA] bg-[#7B5EA7]/10 px-3 py-1.5 rounded-full border border-[#7B5EA7]/30">
              + Vincular banco
            </button>
          </Link>
        </div>
        <div className="flex gap-2">
          {(['todas', 'pendientes', 'resueltas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${filtro === f ? 'bg-[#7B5EA7] text-white' : 'bg-[#13152B] text-gray-400 border border-[#1E2040]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {alertasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <p className="text-white font-semibold">Sin alertas pendientes</p>
            <p className="text-gray-400 text-sm mt-1">Estás al día. No hay movimientos que revisar.</p>
            <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 inline-flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium">Open Banking conectado ✓</span>
            </div>
          </div>
        ) : (
          alertasFiltradas.map(a => <AlertaCard key={a.id} alerta={a} onAccion={handleAccion} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
