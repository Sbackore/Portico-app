'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, PageLoader } from '@/components/ui';
import { Eye, EyeOff, ChevronRight, Shield, CreditCard, Bell, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Dashboard {
  nombre: string; email: string; kycEstado: string;
  scoreSeguridadCuenta: number; alertasBadge: number;
  ultimasTransacciones: Array<{ idTransaccion: string; comercio: string; monto: number; score?: number; fechaHora: string }>;
}

function getRiskColor(score?: number) {
  if (!score) return 'text-green-400';
  if (score > 80) return 'text-red-400';
  if (score > 60) return 'text-orange-400';
  return 'text-green-400';
}

function getRiskDot(score?: number) {
  if (!score) return 'bg-green-500';
  if (score > 80) return 'bg-red-500';
  if (score > 60) return 'bg-orange-500';
  return 'bg-green-500';
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loadingDash, setLoadingDash] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/users/${user.uid}/dashboard`);
      setDashboard(res.data);
    } catch {
      // Usar datos del user como fallback
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
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0F1022] to-[#0A0B1E] px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">{saludo},</p>
            <h1 className="text-xl font-bold text-white">{nombre} 👋</h1>
          </div>
          <div className="relative">
            {dashboard.alertasBadge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {dashboard.alertasBadge}
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-[#7B5EA7]/20 border border-[#7B5EA7]/30 flex items-center justify-center">
              <span className="text-[#A78BFA] font-bold">{nombre[0]}</span>
            </div>
          </div>
        </div>

        {/* Balance card */}
        <Card className="bg-gradient-to-br from-[#7B5EA7] to-[#5B3E87] border-0 shadow-xl shadow-purple-900/40">
          <div className="flex items-center justify-between mb-1">
            <p className="text-purple-200 text-xs font-medium">Saldo disponible</p>
            <button onClick={() => setBalanceVisible(v => !v)} className="text-purple-200">
              {balanceVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
          <p className="text-white text-3xl font-bold mb-3">
            {balanceVisible ? '$4.850.000' : '••••••••'}
          </p>
          <div className="flex items-center gap-2">
            {dashboard.kycEstado === 'APROBADO'
              ? <Badge color="green">✓ Cuenta verificada</Badge>
              : <Badge color="orange">⚠ Verificación pendiente</Badge>
            }
          </div>
        </Card>
      </div>

      <div className="px-5 space-y-5">
        {/* KYC banner */}
        {dashboard.kycEstado !== 'APROBADO' && (
          <Link href="/kyc">
            <Card className="border-[#7B5EA7]/40 bg-[#7B5EA7]/10 flex items-center gap-3">
              <UserCheck size={20} className="text-[#A78BFA] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Verifica tu identidad</p>
                <p className="text-xs text-gray-400">Desbloquea todas las funciones</p>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </Card>
          </Link>
        )}

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Acciones rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/banking/vincular', icon: CreditCard, label: 'Vincular banco', color: 'text-blue-400' },
              { href: '/kyc', icon: UserCheck, label: 'Verificar identidad', color: 'text-purple-400' },
              { href: '/rasp', icon: Shield, label: 'Seguridad', color: 'text-green-400' },
              { href: '/notificaciones', icon: Bell, label: 'Alertas', color: 'text-orange-400' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <Card className="flex items-center gap-3 hover:border-[#2D3060]">
                  <Icon size={18} className={color} />
                  <span className="text-sm text-white font-medium">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actividad reciente</p>
            <Link href="/banking" className="text-xs text-[#A78BFA]">Ver todo</Link>
          </div>

          {dashboard.ultimasTransacciones.length === 0 ? (
            <Card className="text-center py-8">
              <CreditCard size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Sin actividad aún</p>
              <p className="text-gray-600 text-xs mt-1">Vincula tu banco para ver movimientos</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {dashboard.ultimasTransacciones.map((txn) => (
                <Card key={txn.idTransaccion} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getRiskDot(txn.score)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{txn.comercio}</p>
                    <p className="text-xs text-gray-500">{new Date(txn.fechaHora).toLocaleDateString('es-CO')}</p>
                  </div>
                  <p className={`text-sm font-semibold ${getRiskColor(txn.score)}`}>
                    ${txn.monto.toLocaleString('es-CO')}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Security score */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={20} className={dashboard.scoreSeguridadCuenta >= 70 ? 'text-green-400' : 'text-red-400'} />
              <div>
                <p className="text-sm font-semibold text-white">Nivel de seguridad</p>
                <p className="text-xs text-gray-400">Score de protección de cuenta</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${dashboard.scoreSeguridadCuenta >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                {dashboard.scoreSeguridadCuenta}<span className="text-xs text-gray-500">/100</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav alertaBadge={dashboard.alertasBadge} />
    </div>
  );
}
