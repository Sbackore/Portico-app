'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle, Send, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';

const inputStyle = {
  width: '100%',
  height: '56px',
  padding: '0 16px 0 44px',
  borderRadius: '14px',
  background: 'rgba(30,30,48,0.6)',
  border: '1.5px solid rgba(255,255,255,0.06)',
  color: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  fontSize: '15px',
  fontWeight: '500',
  outline: 'none',
  transition: 'all 0.2s ease',
} as React.CSSProperties;

export default function RecuperarPage() {
  const router = useRouter();
  
  // Estado general
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // Datos del flujo
  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ------------------------------------------------------------
  // PASO 1: Solicitar OTP
  // ------------------------------------------------------------
  const handleSolicitarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { 
      toast.error('Ingresa un correo válido'); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/recover-password-otp', { email });
      setOtpId(res.data.otpId);
      
      if (res.data.codigo) {
        toast(`🛠 SIMULADOR: Tu código es ${res.data.codigo}`, { 
          icon: '📱', duration: 10000, style: { background: '#222230', color: '#fff', border: '1px solid #6c47ff' }
        });
      } else {
        toast.success(res.data.mensaje);
      }
      setPaso(2);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // PASO 2: Verificar OTP
  // ------------------------------------------------------------
  const handleVerificarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoOtp.length < 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/verificar-recover-otp', { otpId, codigo: codigoOtp });
      if (res.data.valido) {
        setPaso(3);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // PASO 3: Nueva Contraseña
  // ------------------------------------------------------------
  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.password = 'La contraseña es requerida';
    else if (newPassword.length < 6) e.password = 'Mínimo 6 caracteres';
    else if (!/[A-Z]/.test(newPassword)) e.password = 'Falta al menos una mayúscula';
    else if (!/[!@#$&*]/.test(newPassword)) e.password = 'Falta al menos un carácter especial (!@#$&*)';
    
    if (newPassword !== confirmPassword) e.confirmPass = 'Las contraseñas no coinciden';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        otpId,
        codigo: codigoOtp,
        newPassword
      });
      
      toast.success('¡Contraseña actualizada con éxito!', { duration: 4000 });
      router.replace('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
      // Si el código expira, regresarlo al paso 1
      if (getErrorMessage(err).includes('inválido o expirado')) {
        setPaso(1);
        setCodigoOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#0A0A0F] text-white font-body animate-fade-in selection:bg-primary-container selection:text-white">
      {/* Background Decoration */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 pt-4"> {/* pt-4 para subir un poco el botón como se pidió */}
        {/* Back Button */}
        {paso === 1 ? (
          <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft size={16} className="mr-2 group-active:scale-95 transition-transform" />
            <span className="font-label font-semibold text-sm tracking-wide">Volver al inicio</span>
          </Link>
        ) : (
          <button onClick={() => setPaso(paso === 2 ? 1 : 2)} className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft size={16} className="mr-2 group-active:scale-95 transition-transform" />
            <span className="font-label font-semibold text-sm tracking-wide">Atrás</span>
          </button>
        )}

        <div className="mb-8 text-left">
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-white">Pórtico</h1>
        </div>

        {/* ==================================================== */}
        {/* PASO 1: Ingresar Correo */}
        {/* ==================================================== */}
        {paso === 1 && (
          <div className="animate-fade-in">
            <div className="mb-10">
              <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-4">
                Recuperar <br/><span className="text-violet-500">Contraseña</span>
              </h2>
              <p className="font-body text-base text-slate-400 leading-[1.6]">
                Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para recuperar el acceso a tu cuenta.
              </p>
            </div>

            <form onSubmit={handleSolicitarOtp} className="space-y-6">
              <div className="flex flex-col gap-1.5 group relative">
                <label className="text-[11px] font-semibold text-[#797588] uppercase tracking-[0.1em] ml-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                    onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                    onBlur={e => { e.target.style.border = '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-[0_12px_32px_rgba(108,71,255,0.3)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed group"
                  style={{ background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)' }}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  ) : (
                    <>
                      <span>Enviar Código</span>
                      <Send size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* PASO 2: Verificar OTP */}
        {/* ==================================================== */}
        {paso === 2 && (
          <div className="animate-fade-in flex flex-col items-center text-center mt-8">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
              <Mail size={36} className="text-violet-500" />
            </div>
            
            <h2 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-white mb-3">
              Verifica tu identidad
            </h2>
            <p className="font-body text-base text-slate-400 leading-[1.6] mb-8 max-w-[280px]">
              Ingresa el código de 6 dígitos que enviamos a <strong className="text-white">{email}</strong>.
            </p>

            <form onSubmit={handleVerificarOtp} className="w-full space-y-6">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-semibold text-[#797588] uppercase tracking-[0.1em] ml-1">
                  Código de seguridad
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={codigoOtp}
                  onChange={e => setCodigoOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, padding: '0 16px', letterSpacing: '0.5em', textAlign: 'center', fontSize: '18px' }}
                  onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={codigoOtp.length < 6}
                  className="w-full h-14 rounded-full flex items-center justify-center font-semibold text-white transition-all shadow-[0_12px_32px_rgba(108,71,255,0.3)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)' }}
                >
                  Verificar código
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* PASO 3: Nueva Contraseña */}
        {/* ==================================================== */}
        {paso === 3 && (
          <div className="animate-fade-in mt-4">
            <div className="mb-10">
              <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-4">
                Nueva <br/><span className="text-violet-500">Contraseña</span>
              </h2>
              <p className="font-body text-base text-slate-400 leading-[1.6]">
                Establece tu nueva contraseña segura.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              
              {/* Input Password */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] font-semibold text-[#797588] uppercase tracking-[0.1em] ml-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mín. 6 chars, 1 mayúscula, 1 símbolo"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ ...inputStyle, border: errors.password ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)' }}
                    onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                    onBlur={e => { e.target.style.border = errors.password ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#797588]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPass
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-[#ff6b6b] ml-1 font-medium">⚠ {errors.password}</p>}
              </div>

              {/* Input Confirm */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] font-semibold text-[#797588] uppercase tracking-[0.1em] ml-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ ...inputStyle, border: errors.confirmPass ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)' }}
                    onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                    onBlur={e => { e.target.style.border = errors.confirmPass ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
                  />
                </div>
                {errors.confirmPass && <p className="text-[12px] text-[#ff6b6b] ml-1 font-medium">⚠ {errors.confirmPass}</p>}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-[0_12px_32px_rgba(108,71,255,0.3)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)' }}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  ) : (
                    <>Restablecer contraseña <CheckCircle size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
      </div>
    </div>
  );
}
