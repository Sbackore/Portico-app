'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Button, Input, PageLoader } from '@/components/ui';
import { Menu, Bell, Mail, Phone, Edit2, LogOut, ChevronRight, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [loading, setLoading] = useState(false);

  // Sync state when user loads
  if (!user && !authLoading) { router.replace('/login'); return null; }
  if (authLoading || !user) return <PageLoader />;

  const handleSave = async () => {
    setLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      await api.put(`/users/${user.uid}`, { nombre, telefono });
      await refreshUser();
      setEditing(false);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const inicial = user.nombre ? user.nombre[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen pb-32 animate-fade-in bg-[#0A0A0F] text-surface-container-lowest font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl shadow-[0px_12px_32px_rgba(108,71,255,0.08)] flex items-center justify-between px-6 py-4 w-full">
        <button className="active:scale-95 transition-transform duration-200">
          <Menu className="text-surface-dim hover:bg-slate-800/50 transition-colors p-1.5 rounded-full w-9 h-9" />
        </button>
        <h1 className="font-headline tracking-tighter font-bold text-2xl text-white">Perfil</h1>
        <button className="active:scale-95 transition-transform duration-200">
          <Bell className="text-surface-dim hover:bg-slate-800/50 transition-colors p-1.5 rounded-full w-9 h-9" />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col px-6 pt-24 pb-12 gap-8 max-w-2xl mx-auto w-full">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center gap-4 relative">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#1A1A24] shadow-[0px_12px_32px_rgba(108,71,255,0.08)] z-10 relative bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-5xl font-bold text-white">
              {inicial}
            </div>
            <div className="absolute inset-0 rounded-full bg-primary-container blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <button 
              onClick={() => setEditing(!editing)}
              className="absolute bottom-0 right-0 bg-[#1A1A24] p-2 rounded-full border border-white/10 hover:bg-[#222230] transition-colors z-20"
            >
              <Edit2 size={16} className="text-surface-container-lowest" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[2rem] font-bold tracking-tight text-white flex items-center gap-2">
              {user.nombre.split(' ')[0]}
              {user.kycEstado === 'APROBADO' && <ShieldCheck className="text-primary-fixed-dim" size={24} />}
            </h2>
            <span className="text-surface-dim font-medium tracking-wide text-sm bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
              {user.kycEstado === 'APROBADO' ? 'Cuenta Verificada' : 'Verificación Pendiente'}
            </span>
          </div>
        </section>

        {editing ? (
          <section className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-6 space-y-4">
            <h3 className="font-headline font-semibold text-white mb-2">Editar Información</h3>
            <Input label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} icon={<User size={18} />} />
            <Input label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} icon={<Phone size={18} />} />
            <div className="pt-2 flex gap-3">
              <Button fullWidth variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button fullWidth loading={loading} onClick={handleSave}>Guardar</Button>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4">
            {/* User Details Bento Grid */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                  <Mail size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Correo Electrónico</span>
                  <span className="text-white font-medium mt-0.5">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                  <Phone size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Teléfono</span>
                  <span className="text-white font-medium mt-0.5">{user.telefono || 'No registrado'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-primary-fixed-dim">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Score de Seguridad</span>
                  <span className={`font-medium mt-0.5 ${user.scoreSeguridadCuenta >= 70 ? 'text-[#00FF85]' : 'text-error'}`}>
                    {user.scoreSeguridadCuenta}/100
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="mt-4 flex flex-col gap-4 justify-center w-full">
          <Button fullWidth onClick={() => setEditing(true)} variant="secondary" className="!bg-white/5 !border !border-white/10 hover:!bg-white/10">
            <Edit2 size={18} /> Configurar perfil
          </Button>
          <Button fullWidth onClick={logout} variant="danger">
            <LogOut size={18} /> Cerrar sesión
          </Button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
