'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-surface-container-lowest animate-fade-in">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col min-h-screen justify-center">
        {/* Top App Bar / Brand Header */}
        <header className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-primary-container w-10 h-10" fill="currentColor" />
            <span className="font-headline font-bold text-3xl tracking-tighter text-primary-container">Pórtico</span>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="mb-10 text-center space-y-3">
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-[-0.02em] text-surface-container-lowest">
            Bienvenido
          </h1>
          <p className="font-body text-surface-dim text-base leading-relaxed max-w-[280px] mx-auto">
            Ingresa tus credenciales para acceder a tu cuenta protegida.
          </p>
        </section>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
          <div className="space-y-4">
            {/* User/Email Input */}
            <div className="relative">
              <Input
                type="email"
                placeholder="Usuario o Correo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail size={20} />}
                error={errors.email}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={20} />}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-[26px] -translate-y-1/2 text-outline hover:text-surface-container-lowest transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link href="/recuperar" className="font-label font-semibold text-sm text-primary-container hover:text-primary-fixed-dim transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <Button type="submit" loading={loading} fullWidth size="md">
              Iniciar sesión
            </Button>
          </div>
          
          {/* Demo hint */}
          <div className="bg-[#1A1A24] border border-outline/20 rounded-xl p-3 text-xs text-surface-dim text-center mt-2">
            Modo demo activo · Usa correo falso y clave libre
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center">
          <p className="font-label text-sm text-surface-dim">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-surface-container-lowest font-semibold hover:text-primary-container transition-colors ml-1">
              Regístrate
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
