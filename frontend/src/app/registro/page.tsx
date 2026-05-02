'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getErrorMessage } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const inputStyle = {
  width: '100%',
  height: '56px',
  padding: '0 16px',
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

function StyledInput({
  label, placeholder, type = 'text', value, onChange, autoComplete, error, maxLength
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void;
  autoComplete?: string; error?: string; maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#797588', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, border: error ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)' }}
        onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
        onBlur={e => { e.target.style.border = error ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
      />
      {error && <p style={{ fontSize: '12px', color: '#ff6b6b', marginLeft: '4px', fontWeight: 500 }}>⚠ {error}</p>}
    </div>
  );
}

export default function RegistroPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [codigoOtp, setCodigoOtp] = useState('');
  
  const [form, setForm] = useState({
    nombre: '', documento: '', email: '', password: '', confirmPass: '', telefono: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);

  const set = (k: string) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const validatePaso1 = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.documento.trim()) e.documento = 'El documento es requerido';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es requerido';
    if (!form.email) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    
    if (!form.password) e.password = 'La contraseña es requerida';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Falta al menos una mayúscula';
    else if (!/[!@#$&*]/.test(form.password)) e.password = 'Falta al menos un carácter especial (!@#$&*)';
    
    if (form.password !== form.confirmPass) e.confirmPass = 'Las contraseñas no coinciden';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEnviarOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaso1()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/enviar-otp-registro', {
        email: form.email,
        telefono: form.telefono,
      });
      setOtpId(res.data.otpId);
      
      // En modo desarrollo/simulación, mostramos el código en pantalla
      if (res.data.codigo) {
        toast(`🛠 SIMULADOR: Tu código es ${res.data.codigo}`, { 
          icon: '📱', 
          duration: 10000,
          style: { background: '#222230', color: '#fff', border: '1px solid #6c47ff' }
        });
      } else {
        toast.success(res.data.mensaje || 'Código enviado');
      }
      
      setPaso(2);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarYRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoOtp.length < 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    try {
      // 1. Verificar OTP
      const resOtp = await api.post('/auth/verificar-otp-registro', {
        otpId,
        codigo: codigoOtp,
      });
      if (!resOtp.data.valido) {
        toast.error('Código incorrecto o expirado');
        setLoading(false);
        return;
      }
      
      // 2. Crear cuenta real
      await register(form.nombre.trim(), form.documento.trim(), form.email, form.password, form.telefono);
      toast.success('✅ Identidad verificada y cuenta creada');
      router.replace('/kyc');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0A0F', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* TopAppBar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', height: '64px',
      }}>
        {paso === 1 ? (
          <Link href="/login">
            <button style={{
              color: '#6c47ff', background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%',
              transition: 'all 0.2s',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          </Link>
        ) : (
          <button onClick={() => setPaso(1)} style={{
            color: '#6c47ff', background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}
        <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Pórtico</h1>
        <div style={{ width: '40px' }} />
      </header>

      {/* Main */}
      <main style={{ paddingTop: '96px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '448px', margin: '0 auto' }}>
        
        {paso === 1 ? (
          <>
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', marginBottom: '8px' }}>
                Completa tus datos
              </h2>
              <p style={{ color: '#797588', fontSize: '15px', lineHeight: '1.6' }}>
                Únete a Pórtico y transforma tu experiencia financiera.
              </p>
            </div>

            <form onSubmit={handleEnviarOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
              <StyledInput label="Nombre completo" placeholder="Ej. Ana María" value={form.nombre} onChange={set('nombre')} error={errors.nombre} autoComplete="name" />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <StyledInput label="Documento (CC)" placeholder="123456789" type="number" value={form.documento} onChange={set('documento')} error={errors.documento} />
                <StyledInput label="Teléfono" placeholder="300 000 0000" type="tel" value={form.telefono} onChange={set('telefono')} error={errors.telefono} autoComplete="tel" />
              </div>

              <StyledInput label="Correo electrónico" placeholder="correo@ejemplo.com" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />

              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#797588', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mín. 6 caracteres, 1 mayúscula, 1 símbolo"
                    value={form.password}
                    onChange={e => set('password')(e.target.value)}
                    autoComplete="new-password"
                    style={{
                      ...inputStyle,
                      paddingRight: '48px',
                      border: errors.password ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)'
                    }}
                    onFocus={e => { e.target.style.border = '1.5px solid #6c47ff'; e.target.style.background = '#222230'; }}
                    onBlur={e => { e.target.style.border = errors.password ? '1.5px solid #ba1a1a' : '1.5px solid rgba(255,255,255,0.06)'; e.target.style.background = 'rgba(30,30,48,0.6)'; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#797588', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPass
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: '12px', color: '#ff6b6b', marginLeft: '4px', fontWeight: 500 }}>⚠ {errors.password}</p>}
              </div>

              <StyledInput label="Confirmar contraseña" placeholder="Repite tu contraseña" type="password" value={form.confirmPass} onChange={set('confirmPass')} error={errors.confirmPass} autoComplete="new-password" />

              <div style={{ paddingTop: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', height: '56px', borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)',
                    color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0px 12px 32px rgba(108, 71, 255, 0.3)',
                    transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {loading ? (
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <>Continuar <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></>
                  )}
                </button>
              </div>

              <p style={{ textAlign: 'center', color: '#797588', fontSize: '13px', paddingTop: '4px' }}>
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" style={{ color: '#c9beff', fontWeight: 600, textDecoration: 'none' }}>
                  Inicia sesión
                </Link>
              </p>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '24px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(108, 71, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
              border: '1px solid rgba(108, 71, 255, 0.2)'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="1.5">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', marginBottom: '12px' }}>
              Verifica tu identidad
            </h2>
            <p style={{ color: '#797588', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
              Hemos simulado el envío de un código de 6 dígitos a <strong style={{ color: '#fff' }}>{form.email}</strong> y al teléfono <strong style={{ color: '#fff' }}>{form.telefono}</strong>. Revisa la consola del backend.
            </p>

            <form onSubmit={handleVerificarYRegistrar} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <StyledInput 
                label="Código de seguridad" 
                placeholder="000000" 
                type="text" 
                maxLength={6}
                value={codigoOtp} 
                onChange={v => setCodigoOtp(v.replace(/\D/g, ''))} 
              />

              <button
                type="submit"
                disabled={loading || codigoOtp.length < 6}
                style={{
                  width: '100%', height: '56px', borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #5323E6 0%, #6C47FF 100%)',
                  color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '16px',
                  border: 'none', cursor: (loading || codigoOtp.length < 6) ? 'not-allowed' : 'pointer',
                  boxShadow: '0px 12px 32px rgba(108, 71, 255, 0.3)',
                  transition: 'all 0.2s', opacity: (loading || codigoOtp.length < 6) ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
