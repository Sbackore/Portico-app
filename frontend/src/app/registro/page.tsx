'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { User, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegistroPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es requerida';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.password, form.telefono || undefined);
      toast.success('¡Cuenta creada exitosamente!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 animate-fade-in">
      <div className="flex flex-col items-center gap-2 mt-8 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B5EA7] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-purple-900/40">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
        <p className="text-gray-400 text-sm">Empieza a gestionar tu dinero</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nombre completo" placeholder="Juan Pérez" value={form.nombre}
          onChange={set('nombre')} icon={<User size={16} />} error={errors.nombre} />
        <Input label="Correo electrónico" type="email" placeholder="tu@correo.com" value={form.email}
          onChange={set('email')} icon={<Mail size={16} />} error={errors.email} />
        <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={form.password}
          onChange={set('password')} icon={<Lock size={16} />} error={errors.password} />
        <Input label="Teléfono (opcional)" type="tel" placeholder="+57 300 000 0000" value={form.telefono}
          onChange={set('telefono')} icon={<Phone size={16} />} />

        <p className="text-xs text-gray-500 text-center px-4">
          Al registrarte aceptas nuestros{' '}
          <span className="text-[#A78BFA]">Términos de servicio</span> y{' '}
          <span className="text-[#A78BFA]">Política de privacidad</span>
        </p>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Crear cuenta
        </Button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#A78BFA] font-semibold">Inicia sesión</Link>
      </div>
    </div>
  );
}
