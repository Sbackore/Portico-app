'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, PageLoader } from '@/components/ui';
import { Camera, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam';

type KycEstado = 'PENDIENTE' | 'EN_PROCESO' | 'APROBADO' | 'RECHAZADO' | 'REVISION';

const estadoConfig: Record<KycEstado, { label: string; color: 'green' | 'orange' | 'red' | 'purple' | 'gray'; icon: typeof CheckCircle; desc: string }> = {
  PENDIENTE: { label: 'Sin iniciar', color: 'gray', icon: Clock, desc: 'Aún no has iniciado tu verificación de identidad.' },
  EN_PROCESO: { label: 'En proceso', color: 'purple', icon: Camera, desc: 'Tu solicitud está siendo procesada. Te notificaremos pronto.' },
  APROBADO: { label: 'Verificado ✓', color: 'green', icon: CheckCircle, desc: 'Tu identidad ha sido verificada exitosamente.' },
  RECHAZADO: { label: 'Rechazado', color: 'red', icon: AlertCircle, desc: 'No pudimos verificar tu identidad. Inténtalo de nuevo.' },
  REVISION: { label: 'En revisión', color: 'orange', icon: Clock, desc: 'Tu caso está siendo revisado por nuestro equipo.' },
};

export default function KycPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [estado, setEstado] = useState<KycEstado>('PENDIENTE');
  const [intentos, setIntentos] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [consentido, setConsentido] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [fotoRostro, setFotoRostro] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const cargarEstado = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/kyc/estado/${user.uid}`);
      setEstado(res.data.estadoProcesoBiometrico || 'PENDIENTE');
      setIntentos(res.data.intentosBiometricos || 0);
    } catch { /* pendiente */ }
    finally { setLoadingData(false); }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (user) { setEstado((user.kycEstado as KycEstado) || 'PENDIENTE'); setLoadingData(false); cargarEstado(); }
  }, [user, loading, router, cargarEstado]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setFotoRostro(imageSrc);
  }, [webcamRef]);

  const handleIniciarCamera = () => {
    if (!consentido) { toast.error('Debes aceptar los términos para continuar'); return; }
    if (intentos >= 3) { toast.error('Has alcanzado el máximo de intentos. Contacta soporte.'); return; }
    setShowCamera(true);
  };

  const handleSubirBiometria = async () => {
    if (!user || !fotoRostro) return;
    setLoadingSubmit(true);
    try {
      await api.post('/kyc/consentimiento', {
        uid: user.uid, version: '2.1.0',
        proposito: 'Verificación de identidad para apertura de cuenta',
        dispositivo: navigator.userAgent.slice(0, 50),
      });
      setEstado('EN_PROCESO');
      setIntentos(i => i + 1);
      toast.success('¡Proceso iniciado! Analizando biometría...');
      setShowCamera(false);
      await refreshUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading || loadingData) return <PageLoader />;
  
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-[#0F1022] z-50 flex flex-col animate-fade-in">
        <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
          {!fotoRostro ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[40px] border-[#0F1022]/80 pointer-events-none rounded-[120px] shadow-[inset_0_0_0_2px_#6C47FF]"></div>
              <div className="absolute top-12 left-0 right-0 text-center z-10 px-6">
                <h2 className="text-white font-bold text-xl mb-2">Ubica tu rostro en el óvalo</h2>
                <p className="text-white/80 text-sm">Asegúrate de tener buena iluminación</p>
              </div>
              <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10 gap-4 px-6">
                <button onClick={() => setShowCamera(false)} className="px-6 py-4 rounded-full bg-white/10 backdrop-blur text-white font-bold text-sm">Cancelar</button>
                <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white active:scale-95 transition-transform" />
                </button>
                <div className="w-[100px]" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center w-full h-full justify-center p-6 bg-[#0F1022]">
              <h2 className="text-white font-bold text-2xl mb-6">Confirma tu foto</h2>
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#6C47FF] mb-8">
                <img src={fotoRostro} alt="Selfie" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4 w-full max-w-sm">
                <button onClick={() => setFotoRostro(null)} disabled={loadingSubmit} className="flex-1 py-4 rounded-full border border-white/20 text-white font-bold">Tomar otra</button>
                <button onClick={handleSubirBiometria} disabled={loadingSubmit} className="flex-1 py-4 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                  {loadingSubmit ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const cfg = estadoConfig[estado];
  const Icon = cfg.icon;
  const bloqueado = intentos >= 3 && estado !== 'APROBADO';

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="bg-[#0F1022] px-5 pt-12 pb-6 border-b border-[#1E2040]">
        <h1 className="text-xl font-bold text-white mb-1">Verificación de identidad</h1>
        <p className="text-sm text-gray-400">KYC — Know Your Customer</p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Estado actual */}
        <Card className="text-center py-6">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            estado === 'APROBADO' ? 'bg-green-500/20 border border-green-500/30' :
            estado === 'RECHAZADO' ? 'bg-red-500/20 border border-red-500/30' :
            'bg-[#7B5EA7]/20 border border-[#7B5EA7]/30'
          }`}>
            <Icon size={28} className={estado === 'APROBADO' ? 'text-green-400' : estado === 'RECHAZADO' ? 'text-red-400' : 'text-[#A78BFA]'} />
          </div>
          <Badge color={cfg.color}>{cfg.label}</Badge>
          <p className="text-gray-400 text-sm mt-3 px-4">{cfg.desc}</p>
          {intentos > 0 && <p className="text-xs text-gray-600 mt-2">Intentos: {intentos}/3</p>}
        </Card>

        {/* Steps */}
        {(estado === 'PENDIENTE' || estado === 'RECHAZADO') && !bloqueado && (
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Proceso de verificación</p>
            {[
              { label: 'Acepta los términos', desc: 'Consentimiento de verificación de identidad' },
              { label: 'Selfie en vivo', desc: 'Prueba de vida con tu cámara' },
              { label: 'Verificación biométrica', desc: 'Análisis automático por IA' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <span className="w-6 h-6 rounded-full bg-[#7B5EA7]/20 text-[#A78BFA] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm text-white font-medium">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Consent */}
        {(estado === 'PENDIENTE' || estado === 'RECHAZADO') && !bloqueado && (
          <div className="bg-[#1A1A24] border border-white/5 rounded-[16px] p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setConsentido(!consentido)}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${consentido ? 'bg-primary border-primary' : 'bg-[#0F1022] border-slate-600'}`}>
                  {consentido && <CheckCircle size={14} className="text-white" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed select-none">
                Autorizo a Pórtico a procesar mis datos biométricos para verificación de identidad conforme a la Ley 1581 de 2012 (HABEAS DATA). Mis datos serán usados exclusivamente para este propósito y eliminados tras la verificación.
              </p>
            </div>
          </div>
        )}

        {/* Acción */}
        {estado === 'APROBADO' ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Identidad verificada</p>
            <p className="text-gray-400 text-sm mt-1">Tienes acceso completo a todas las funciones de Pórtico.</p>
          </div>
        ) : bloqueado ? (
          <Card className="border-red-500/20 bg-red-500/5 text-center py-4">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-medium text-sm">Límite de intentos alcanzado</p>
            <p className="text-gray-400 text-xs mt-1">Contacta a soporte para desbloquear tu cuenta.</p>
          </Card>
        ) : estado === 'EN_PROCESO' ? (
          <Card className="border-[#7B5EA7]/20 bg-[#7B5EA7]/5 text-center py-4">
            <div className="animate-spin w-8 h-8 border-2 border-[#7B5EA7] border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-[#A78BFA] font-medium text-sm">Verificación en curso...</p>
            <p className="text-gray-400 text-xs mt-1">Esto puede tardar unos minutos.</p>
          </Card>
        ) : (
          <button 
            onClick={handleIniciarCamera}
            disabled={!consentido}
            className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold text-base tracking-wide transition-all shadow-[0px_8px_16px_rgba(108,71,255,0.3)]
              ${consentido ? 'bg-primary text-white active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-70'}
            `}
          >
            <Camera size={18} /> Comenzar verificación
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
