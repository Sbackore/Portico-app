'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

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
      const msg = getErrorMessage(err);
      setGlobalError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden animate-fade-in"
      style={{ background: '#0A0A0F' }}>

      {/* Decorative orbs — exacto del diseño */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #6c47ff 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #5323e6 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Main container */}
      <main className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col min-h-screen justify-center">

        {/* Brand header */}
        <header className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5323e6] to-[#6c47ff] flex items-center justify-center shadow-[0_4px_20px_rgba(108,71,255,0.4)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="white"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-[-0.03em] text-white">Pórtico</span>
          </div>
        </header>

        {/* Welcome */}
        <section className="mb-10 text-center">
          <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.025em] text-white mb-3">
            Bienvenido
          </h1>
          <p className="text-[#797588] text-base leading-relaxed max-w-[260px] mx-auto">
            Ingresa tus credenciales para acceder a tu cuenta protegida.
          </p>
        </section>

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 flex flex-col items-center text-center animate-fade-in">
            <p className="text-sm font-semibold text-error mb-2">{globalError}</p>
            {globalError === 'No existe una cuenta con este correo' && (
              <Link href="/registro" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors shadow-lg active:scale-95">
                Regístrate aquí
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#797588" strokeWidth="2">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="Usuario o Correo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-14 pl-12 pr-4 rounded-[14px] text-white text-[15px] font-medium outline-none transition-all duration-200"
                style={{
                  background: '#1A1A24',
                  border: errors.email ? '1.5px solid #ba1a1a' : '1.5px solid transparent',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => { if (!errors.email) e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                onBlur={e => { if (!errors.email) e.target.style.border = '1.5px solid transparent'; e.target.style.background = '#1A1A24'; }}
              />
            </div>
            {errors.email && <p className="text-[12px] text-red-400 ml-1">⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#797588" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-14 pl-12 pr-12 rounded-[14px] text-white text-[15px] font-medium outline-none transition-all duration-200"
                style={{
                  background: '#1A1A24',
                  border: errors.password ? '1.5px solid #ba1a1a' : '1.5px solid transparent',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => { if (!errors.password) e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                onBlur={e => { if (!errors.password) e.target.style.border = '1.5px solid transparent'; e.target.style.background = '#1A1A24'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#797588] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-[12px] text-red-400 ml-1">⚠ {errors.password}</p>}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link href="/recuperar"
              className="text-sm font-semibold text-[#6c47ff] hover:text-[#c9beff] transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full text-white font-semibold text-base tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)',
                boxShadow: '0px 12px 32px rgba(108, 71, 255, 0.3)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Iniciando sesión...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-auto pt-10 text-center">
          <p className="text-sm text-[#797588]">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro"
              className="text-white font-semibold hover:text-[#c9beff] transition-colors ml-1">
              Regístrate
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
