'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui';
import Link from 'next/link';
import api from '@/lib/api';

interface DashboardData {
  nombre?: string;
  scoreSeguridadCuenta?: number;
  kycEstado?: string;
  alertasRecientes?: Array<{
    id: string; comercio: string; monto: number; score: number;
    fechaHora: string; estado: string;
  }>;
  notificacionesNoleidas?: number;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function AlertCard({ alerta }: { alerta: NonNullable<DashboardData['alertasRecientes']>[0] }) {
  const isHigh = alerta.score > 60;
  const isPending = alerta.estado === 'pendiente';

  const badgeStyle: React.CSSProperties = {
    padding: '4px 12px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em',
    textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px',
    ...(isPending && isHigh
      ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
      : isPending
      ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }
      : { background: 'rgba(108,71,255,0.15)', color: '#c9beff', border: '1px solid rgba(108,71,255,0.25)' }
    ),
  };

  const glowColor = isPending && isHigh ? 'rgba(239,68,68,0.08)' : isPending ? 'rgba(251,146,60,0.08)' : 'rgba(108,71,255,0.08)';

  return (
    <article style={{
      background: '#0F1022', borderRadius: '20px', padding: '24px',
      border: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden',
      boxShadow: `0px 12px 32px ${glowColor}`,
      transition: 'transform 0.15s ease',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px',
        borderRadius: '50%', background: glowColor, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {alerta.comercio}
          </h3>
          <p style={{ fontSize: '13px', color: '#797588', fontWeight: 500 }}>
            {new Date(alerta.fechaHora).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} • {new Date(alerta.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span style={badgeStyle}>
          {isPending && isHigh ? '⚠ Sospechosa' : isPending ? '⏳ Pendiente' : '✓ Verificada'}
        </span>
      </div>

      <p style={{ fontSize: '28px', fontWeight: 700, color: isPending && isHigh ? '#f87171' : '#fff', letterSpacing: '-0.02em', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        ${alerta.monto.toLocaleString('es-CO')}{' '}
        <span style={{ fontSize: '16px', color: '#4a4a6a', fontWeight: 500 }}>COP</span>
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px 16px',
        display: 'flex', flexWrap: 'wrap', gap: '16px',
        border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>ID Alerta</div>
          <div style={{ fontSize: '13px', color: '#c9c3d9', fontFamily: 'monospace', fontWeight: 500 }}>{alerta.id.substring(0, 8).toUpperCase()}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#4a4a6a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Score</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: alerta.score > 60 ? '#f87171' : alerta.score > 40 ? '#fb923c' : '#00FF85' }}>
            {alerta.score}/100
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const [alertasRes] = await Promise.allSettled([
        api.get(`/banking/alertas/${user.uid}`),
      ]);
      setDashboard({
        nombre: user.nombre,
        scoreSeguridadCuenta: user.scoreSeguridadCuenta || 100,
        kycEstado: user.kycEstado,
        alertasRecientes: alertasRes.status === 'fulfilled' ? alertasRes.value.data?.slice(0, 3) : [],
      });
    } catch {
      setDashboard({ nombre: user.nombre, scoreSeguridadCuenta: 100, kycEstado: user.kycEstado, alertasRecientes: [] });
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) fetchDashboard();
  }, [user, loading, router, fetchDashboard]);

  if (loading || loadingData) return <PageLoader />;

  const firstName = dashboard?.nombre?.split(' ')[0] || 'Usuario';
  const score = dashboard?.scoreSeguridadCuenta || 100;
  const scoreColor = score >= 70 ? '#00FF85' : score >= 40 ? '#fb923c' : '#f87171';

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0B1E', color: '#fff', fontFamily: 'Inter, sans-serif', paddingBottom: '96px' }}
      className="animate-fade-in">

      {/* TopAppBar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(10,11,30,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
      }}>
        <button style={{ background: 'transparent', border: 'none', color: '#6c47ff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Principal</h1>
        <Link href="/perfil">
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #5323e6, #6c47ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer',
            border: '2px solid rgba(108,71,255,0.3)',
          }}>
            {firstName[0]?.toUpperCase()}
          </div>
        </Link>
      </header>

      {/* Main */}
      <main style={{ paddingTop: '88px', padding: '88px 20px 0', maxWidth: '672px', margin: '0 auto' }}>

        {/* Greeting */}
        <section style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', marginBottom: '8px', lineHeight: '1.15' }}>
            {getGreeting()}, {firstName} 👋
          </h2>
          <p style={{ color: '#797588', fontSize: '16px' }}>
            Revisa la actividad reciente de tus cuentas.
          </p>
        </section>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {/* Security score */}
          <div style={{
            background: '#0F1022', borderRadius: '20px', padding: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#797588', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Score de seguridad
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: scoreColor, letterSpacing: '-0.02em' }}>{score}</span>
              <span style={{ fontSize: '16px', color: '#4a4a6a', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ marginTop: '12px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: scoreColor, borderRadius: '9999px', transition: 'width 1s ease' }} />
            </div>
          </div>

          {/* KYC status */}
          <div style={{
            background: '#0F1022', borderRadius: '20px', padding: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#797588', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Estado KYC
            </p>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '9999px',
              fontSize: '12px', fontWeight: 600,
              ...(dashboard?.kycEstado === 'APROBADO'
                ? { background: 'rgba(0,255,133,0.12)', color: '#00FF85', border: '1px solid rgba(0,255,133,0.2)' }
                : { background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }
              )
            }}>
              {dashboard?.kycEstado === 'APROBADO' ? '✓ Verificado' : '⏳ Pendiente'}
            </span>
            <Link href="/kyc">
              <p style={{ color: '#6c47ff', fontSize: '12px', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                {dashboard?.kycEstado !== 'APROBADO' ? 'Verificar ahora →' : 'Ver detalles →'}
              </p>
            </Link>
          </div>
        </div>

        {/* Alerts section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingLeft: '4px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            Alertas recientes
          </h3>
          <Link href="/banking">
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#6c47ff', cursor: 'pointer' }}>Ver todo</span>
          </Link>
        </div>

        {/* Alert cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {dashboard?.alertasRecientes && dashboard.alertasRecientes.length > 0 ? (
            dashboard.alertasRecientes.map(a => (
              <AlertCard key={a.id} alerta={a} />
            ))
          ) : (
            <div style={{
              background: '#0F1022', borderRadius: '20px', padding: '48px 24px',
              border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Todo tranquilo</p>
              <p style={{ color: '#797588', fontSize: '14px', lineHeight: '1.6', maxWidth: '220px', margin: '0 auto 24px' }}>
                Sin alertas recientes. ¡Tu cuenta está protegida!
              </p>
              <Link href="/banking">
                <button style={{
                  padding: '12px 24px', borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #5323e6, #6c47ff)',
                  color: '#fff', fontWeight: 600, fontSize: '14px',
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  Simular transacción
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
