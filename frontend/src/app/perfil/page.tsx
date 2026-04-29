'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Button, Input } from '@/components/ui';
import { User, Mail, Phone, Shield, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [loading, setLoading] = useState(false);

  if (!user) { router.replace('/login'); return null; }

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
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="bg-gradient-to-b from-[#0F1022] to-[#0A0B1E] px-5 pt-12 pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#7B5EA7] flex items-center justify-center mx-auto mb-3 text-3xl font-bold text-white">
          {inicial}
        </div>
        <h1 className="text-xl font-bold text-white">{user.nombre}</h1>
        <p className="text-gray-400 text-sm">{user.email}</p>
        <div className="mt-2 flex justify-center">
          {user.kycEstado === 'APROBADO'
            ? <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">✓ Identidad verificada</span>
            : <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">⚠ Verificación pendiente</span>
          }
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Datos personales */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Datos personales</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-xs text-[#A78BFA]">Editar</button>
            ) : (
              <button onClick={() => setEditing(false)} className="text-xs text-gray-500">Cancelar</button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} icon={<User size={14} />} />
              <Input label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} icon={<Phone size={14} />} />
              <Button fullWidth loading={loading} onClick={handleSave}>Guardar cambios</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: User, label: 'Nombre', value: user.nombre },
                { icon: Mail, label: 'Email', value: user.email },
                { icon: Phone, label: 'Teléfono', value: user.telefono || 'No registrado' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={16} className="text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Accesos rápidos */}
        <Card>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cuenta</p>
          <div className="space-y-1">
            {[
              { href: '/kyc', icon: User, label: 'Verificación de identidad' },
              { href: '/rasp', icon: Shield, label: 'Seguridad de cuenta' },
              { href: '/notificaciones/config', icon: Mail, label: 'Preferencias de alertas' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 py-2 hover:bg-white/5 rounded-lg px-1 transition-colors">
                  <Icon size={16} className="text-gray-400" />
                  <p className="text-sm text-white flex-1">{label}</p>
                  <ChevronRight size={14} className="text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Info */}
        <Card>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sesión</p>
          <p className="text-xs text-gray-500 mb-1">ID de usuario: <span className="text-gray-400 font-mono">{user.uid}</span></p>
          <p className="text-xs text-gray-500">Score de seguridad: <span className={user.scoreSeguridadCuenta >= 70 ? 'text-green-400' : 'text-red-400'}>{user.scoreSeguridadCuenta}/100</span></p>
        </Card>

        <Button variant="danger" fullWidth onClick={logout} className="flex items-center justify-center gap-2">
          <LogOut size={16} /> Cerrar sesión
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
