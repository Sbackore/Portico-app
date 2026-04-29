'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo inválido';
    if (!password) e.password = 'La contraseña es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mt-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B5EA7] to-[#A78BFA] flex items-center justify-center mb-2 shadow-lg shadow-purple-900/40">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
        <p className="text-gray-400 text-sm text-center">Ingresa a tu cuenta Pórtico</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          error={errors.email}
          autoComplete="email"
        />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Contraseña"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            error={errors.password}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="self-end text-xs text-[#A78BFA] flex items-center gap-1"
          >
            {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPass ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        <Link href="/recuperar" className="text-xs text-[#A78BFA] self-end -mt-2">
          ¿Olvidaste tu contraseña?
        </Link>

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Iniciar sesión
        </Button>

        {/* Demo hint */}
        <div className="bg-[#13152B] border border-[#1E2040] rounded-xl p-3 text-xs text-gray-400 text-center">
          Modo demo activo · Crea una cuenta para comenzar
        </div>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 mt-8">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#A78BFA] font-semibold">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
