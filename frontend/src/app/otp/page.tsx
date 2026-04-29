'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button, PageLoader } from '@/components/ui';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export default function OtpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpId, setOtpId] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [intentos, setIntentos] = useState(3);
  const [loadingTrigger, setLoadingTrigger] = useState(true);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const triggerOtp = async () => {
    if (!user) return;
    setLoadingTrigger(true);
    try {
      const res = await api.post('/otp/trigger', { uid: user.uid, nivelRiesgo: 'ALTO', motivo: 'Verificación de seguridad' });
      setOtpId(res.data.otpId || 'demo_otp_123');
      setCountdown(300);
      toast.success('Código enviado a tu dispositivo');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingTrigger(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) triggerOtp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  useEffect(() => {
    if (countdown <= 0 || bloqueado) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, bloqueado]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const codigo = otp.join('');
    if (codigo.length < 6) { toast.error('Ingresa los 6 dígitos del código'); return; }
    setLoadingVerify(true);
    try {
      const res = await api.post('/otp/verificar', { otpId, codigo, uid: user!.uid });
      if (res.data.valido) {
        toast.success('¡Verificación exitosa!');
        router.push('/home');
      } else {
        const restantes = intentos - 1;
        setIntentos(restantes);
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        if (restantes <= 0) {
          setBloqueado(true);
          toast.error('Demasiados intentos. Espera 30 minutos.');
        } else {
          toast.error(`Código incorrecto. Quedan ${restantes} intentos.`);
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingVerify(false);
    }
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  if (loading || loadingTrigger) return <PageLoader />;

  if (bloqueado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Demasiados intentos</h2>
        <p className="text-gray-400 text-sm">Por tu seguridad, bloqueamos el acceso temporalmente. Inténtalo en 30 minutos.</p>
        <Button className="mt-8" variant="outline" onClick={() => router.push('/home')}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-[#7B5EA7]/20 border border-[#7B5EA7]/30 flex items-center justify-center mb-6">
        <ShieldCheck size={28} className="text-[#A78BFA]" />
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Verificación de seguridad</h1>
      <p className="text-gray-400 text-sm text-center mb-8">
        Ingresa el código de 6 dígitos enviado a tu dispositivo.<br />
        <span className="text-xs text-gray-600">Modo demo: usa 000000</span>
      </p>

      {/* OTP inputs */}
      <div className="flex gap-3 mb-6">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-[#13152B] border-2 border-[#1E2040] rounded-xl text-white focus:border-[#7B5EA7] focus:outline-none transition-colors"
          />
        ))}
      </div>

      {/* Countdown */}
      <div className={`text-sm font-mono mb-2 ${countdown < 60 ? 'text-red-400' : 'text-gray-400'}`}>
        {countdown > 0 ? `Expira en ${mm}:${ss}` : 'Código expirado'}
      </div>
      <p className="text-xs text-gray-600 mb-6">Intentos restantes: {intentos}</p>

      <Button fullWidth size="lg" loading={loadingVerify} onClick={handleVerify} className="mb-3">
        Verificar
      </Button>

      <button
        disabled={countdown > 240}
        onClick={triggerOtp}
        className="flex items-center gap-2 text-sm text-[#A78BFA] disabled:text-gray-600 disabled:cursor-not-allowed"
      >
        <RefreshCw size={14} />
        Reenviar código
      </button>
    </div>
  );
}
