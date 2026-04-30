'use client';
import { useState, useCallback } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Button, Input, PageLoader } from '@/components/ui';
import {
  Menu, Bell, Mail, Phone, Edit2, LogOut, User, ShieldCheck,
  Lock, ChevronRight, Fingerprint, FileText, HelpCircle,
  BellRing, BellOff, Shield, ArrowLeft, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'perfil' | 'configuracion';

export default function PerfilPage() {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('perfil');
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [loading, setLoading] = useState(false);
  const [notifActivas, setNotifActivas] = useState(
    user?.notificacionesConfig?.permisoNotificacionesActivo ?? true
  );

  if (!user && !authLoading) { router.replace('/login'); return null; }
  if (authLoading || !user) return <PageLoader />;

  const inicial = user.nombre ? user.nombre[0].toUpperCase() : '?';

  const handleSave = async () => {
    if (!nombre.trim()) { toast.error('El nombre no puede estar vacío'); return; }
    setLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      await api.put(`/users/${user.uid}`, { nombre: nombre.trim(), telefono: telefono || null });
      await refreshUser();
      setEditing(false);
      toast.success('✅ Perfil actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const handleToggleNotif = async () => {
    const nuevo = !notifActivas;
    setNotifActivas(nuevo);
    try {
      const api = (await import('@/lib/api')).default;
      await api.put(`/notificaciones/config/${user.uid}`, {
        permisoNotificacionesActivo: nuevo,
        canalesActivos: nuevo ? ['PUSH', 'EMAIL'] : [],
      });
      toast.success(nuevo ? '🔔 Notificaciones activadas' : '🔕 Notificaciones desactivadas');
    } catch (err) {
      setNotifActivas(!nuevo);
      toast.error(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    toast('Cerrando sesión...', { icon: '👋' });
    setTimeout(logout, 800);
  };

  const scoreColor = user.scoreSeguridadCuenta >= 70 ? 'text-[#00FF85]' : user.scoreSeguridadCuenta >= 40 ? 'text-orange-400' : 'text-error';
  const scoreBg = user.scoreSeguridadCuenta >= 70 ? 'bg-[#00FF85]/10 border-[#00FF85]/30' : user.scoreSeguridadCuenta >= 40 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-error/10 border-error/30';

  return (
    <div className="min-h-screen pb-32 animate-fade-in bg-[#0A0A0F] text-white font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl shadow-[0px_12px_32px_rgba(108,71,255,0.08)] flex items-center justify-between px-6 py-4 w-full border-b border-white/5">
        <button className="active:scale-95 transition-transform duration-200 p-1">
          <Menu className="text-surface-dim w-7 h-7" />
        </button>
        <h1 className="font-headline tracking-tighter font-bold text-xl text-white">Mi cuenta</h1>
        <Link href="/notificaciones">
          <button className="active:scale-95 transition-transform duration-200 p-1">
            <Bell className="text-surface-dim w-7 h-7" />
          </button>
        </Link>
      </header>

      <main className="flex-grow flex flex-col px-6 pt-24 pb-12 gap-6 max-w-2xl mx-auto w-full">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center gap-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-[#1A1A24] shadow-[0px_12px_32px_rgba(108,71,255,0.15)] z-10 relative bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-5xl font-bold text-white">
              {inicial}
            </div>
            <div className="absolute inset-0 rounded-full bg-primary-container blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            {!editing && (
              <button
                onClick={() => { setTab('perfil'); setEditing(true); }}
                className="absolute bottom-0 right-0 bg-[#1A1A24] p-2 rounded-full border border-white/10 hover:bg-[#222230] transition-colors z-20 active:scale-95"
              >
                <Edit2 size={14} className="text-surface-container-lowest" />
              </button>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[1.75rem] font-bold tracking-tight text-white flex items-center gap-2">
              {user.nombre.split(' ')[0]}
              {user.kycEstado === 'APROBADO' && <ShieldCheck className="text-primary-fixed-dim" size={22} />}
            </h2>
            <span className={`text-sm font-medium tracking-wide px-3 py-1 rounded-full border ${user.kycEstado === 'APROBADO' ? 'bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
              {user.kycEstado === 'APROBADO' ? '✓ Cuenta Verificada' : '⏳ Verificación Pendiente'}
            </span>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex bg-[#1A1A24] rounded-[16px] p-1">
          <button onClick={() => { setTab('perfil'); setEditing(false); }}
            className={`flex-1 py-3 rounded-[12px] text-sm font-label font-semibold transition-all ${tab === 'perfil' ? 'bg-primary text-white shadow-[0px_4px_12px_rgba(108,71,255,0.3)]' : 'text-surface-dim hover:text-white'}`}>
            Perfil
          </button>
          <button onClick={() => setTab('configuracion')}
            className={`flex-1 py-3 rounded-[12px] text-sm font-label font-semibold transition-all ${tab === 'configuracion' ? 'bg-primary text-white shadow-[0px_4px_12px_rgba(108,71,255,0.3)]' : 'text-surface-dim hover:text-white'}`}>
            Configuración
          </button>
        </div>

        {/* PESTAÑA PERFIL */}
        {tab === 'perfil' && (
          <div className="flex flex-col gap-4">
            {editing ? (
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline font-semibold text-white">Editar información</h3>
                  <button onClick={() => setEditing(false)} className="text-surface-dim hover:text-white">
                    <ArrowLeft size={20} />
                  </button>
                </div>
                <Input label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} icon={<User size={18} />} />
                <Input label="Teléfono" type="tel" placeholder="300 000 0000" value={telefono} onChange={e => setTelefono(e.target.value)} icon={<Phone size={18} />} />
                <div className="pt-2 flex gap-3">
                  <Button fullWidth variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button fullWidth loading={loading} onClick={handleSave}>
                    <Check size={16} /> Guardar
                  </Button>
                </div>
              </section>
            ) : (
              <>
                {/* User Info Cards */}
                {[
                  { icon: <Mail size={20} />, label: 'Correo electrónico', value: user.email },
                  { icon: <Phone size={20} />, label: 'Teléfono', value: user.telefono || 'No registrado' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-white font-medium mt-0.5 text-sm">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Security Score */}
                <div className={`bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Score de Seguridad</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`font-bold text-lg ${scoreColor}`}>{user.scoreSeguridadCuenta}</span>
                        <span className="text-surface-dim text-sm">/ 100</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${scoreBg} ${scoreColor}`}>
                          {user.scoreSeguridadCuenta >= 70 ? 'Protegida' : user.scoreSeguridadCuenta >= 40 ? 'En riesgo' : 'Crítico'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/rasp">
                    <ChevronRight size={20} className="text-surface-dim" />
                  </Link>
                </div>

                {/* KYC Status */}
                <Link href="/kyc">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                        <Fingerprint size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Verificación KYC</span>
                        <span className={`font-medium mt-0.5 text-sm ${user.kycEstado === 'APROBADO' ? 'text-[#00FF85]' : 'text-orange-400'}`}>
                          {user.kycEstado === 'APROBADO' ? '✓ Completada' : user.kycEstado === 'EN_PROCESO' ? 'En proceso...' : 'Pendiente — Completar'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-surface-dim" />
                  </div>
                </Link>

                <Button fullWidth onClick={() => setEditing(true)} variant="secondary" className="!bg-white/5 !border !border-white/10 hover:!bg-white/10">
                  <Edit2 size={16} /> Editar información
                </Button>
              </>
            )}
          </div>
        )}

        {/* PESTAÑA CONFIGURACIÓN */}
        {tab === 'configuracion' && (
          <div className="flex flex-col gap-4">
            {/* Notificaciones */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-5">
              <h3 className="font-headline font-semibold text-white mb-4 flex items-center gap-2">
                <Bell size={18} className="text-primary-fixed-dim" /> Notificaciones
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Alertas y avisos</p>
                  <p className="text-xs text-surface-dim mt-0.5">
                    {notifActivas ? 'Recibirás alertas de transacciones y seguridad' : 'No recibirás notificaciones'}
                  </p>
                </div>
                <button
                  onClick={handleToggleNotif}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${notifActivas ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${notifActivas ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-surface-dim">
                {notifActivas
                  ? <><BellRing size={14} className="text-[#00FF85]" /> Canales activos: Push · Email</>
                  : <><BellOff size={14} className="text-error" /> Notificaciones desactivadas</>
                }
              </div>
            </section>

            {/* Seguridad y privacidad */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-5">
              <h3 className="font-headline font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-primary-fixed-dim" /> Seguridad y privacidad
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { icon: <Lock size={16} />, label: 'Cambiar contraseña', href: '/recuperar' },
                  { icon: <Fingerprint size={16} />, label: 'Verificación biométrica (KYC)', href: '/kyc' },
                  { icon: <Shield size={16} />, label: 'Estado de seguridad de cuenta', href: '/rasp' },
                ].map(item => (
                  <Link key={item.label} href={item.href}>
                    <div className="flex items-center justify-between py-3 hover:bg-white/5 rounded-[12px] px-2 transition-colors -mx-2">
                      <div className="flex items-center gap-3">
                        <span className="text-primary-fixed-dim">{item.icon}</span>
                        <span className="text-sm text-white font-medium">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-surface-dim" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Legal */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-5">
              <h3 className="font-headline font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-primary-fixed-dim" /> Legal
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { icon: <FileText size={16} />, label: 'Términos y condiciones' },
                  { icon: <FileText size={16} />, label: 'Política de privacidad' },
                  { icon: <HelpCircle size={16} />, label: 'Ayuda y soporte' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 hover:bg-white/5 rounded-[12px] px-2 transition-colors -mx-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-primary-fixed-dim">{item.icon}</span>
                      <span className="text-sm text-white font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-surface-dim" />
                  </div>
                ))}
              </div>
            </section>

            {/* Version info */}
            <div className="text-center text-xs text-surface-dim/60 py-2">
              Pórtico v1.0.0 · Todos los derechos reservados
            </div>

            {/* Cerrar sesión */}
            <Button fullWidth onClick={handleLogout} variant="danger">
              <LogOut size={16} /> Cerrar sesión
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
