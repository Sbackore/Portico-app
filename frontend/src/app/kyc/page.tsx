'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card, Badge, Button, PageLoader } from '@/components/ui';
import { UserCheck, Camera, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

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

  const handleIniciar = async () => {
    if (!user) return;
    if (!consentido) { toast.error('Debes aceptar los términos para continuar'); return; }
    if (intentos >= 3) { toast.error('Has alcanzado el máximo de intentos. Contacta soporte.'); return; }
    setLoadingSubmit(true);
    try {
      await api.post('/kyc/consentimiento', {
        uid: user.uid, version: '2.1.0',
        proposito: 'Verificación de identidad para apertura de cuenta',
        dispositivo: navigator.userAgent.slice(0, 50),
      });
      setEstado('EN_PROCESO');
      setIntentos(i => i + 1);
      toast.success('¡Proceso iniciado! Recibirás una notificación con el resultado.');
      await refreshUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading || loadingData) return <PageLoader />;
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
              { label: 'Captura tu documento', desc: 'Foto del documento de identidad por ambos lados' },
              { label: 'Selfie con documento', desc: 'Foto tuya sosteniendo tu documento' },
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
            onClick={handleIniciar}
            disabled={!consentido || loadingSubmit}
            className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold text-base tracking-wide transition-all shadow-[0px_8px_16px_rgba(108,71,255,0.3)]
              ${consentido && !loadingSubmit ? 'bg-primary text-white active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-70'}
            `}
          >
            {loadingSubmit ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <><Camera size={18} /> Comenzar verificación</>
            )}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
