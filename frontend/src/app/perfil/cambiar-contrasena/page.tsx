'use client';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuth, getErrorMessage } from '@/lib/auth';

export default function CambiarContrasenaPage() {
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /(?=.*[A-Z])/.test(newPassword);
  const hasSpecial = /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const isValid = hasMinLength && hasUppercase && hasSpecial && passwordsMatch && oldPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });

      setExito(true);
      toast.success('Contraseña actualizada con éxito');
      
      // Cerrar sesión después de 2 segundos para dar tiempo a ver el mensaje de éxito
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in bg-[#0A0A0F] text-surface-container-lowest">
        <ShieldCheck size={56} className="text-[#00FF85] mb-4 animate-bounce" />
        <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-2">
          Contraseña Actualizada
        </h2>
        <p className="text-surface-dim text-base mb-8 max-w-[280px]">
          Tu contraseña ha sido cambiada con éxito. Por tu seguridad, cerraremos la sesión actual.
        </p>
        <p className="text-surface-dim/60 text-sm animate-pulse">Cerrando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0F] text-white font-body animate-fade-in selection:bg-primary-container selection:text-white pb-32">
      {/* Background Decoration */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[0%] right-[0%] w-[30vw] h-[30vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link href="/perfil" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="mr-2 group-active:scale-95 transition-transform" />
          <span className="font-label font-semibold text-sm tracking-wide">Volver a Mi cuenta</span>
        </Link>

        {/* Hero Content Area */}
        <div className="mb-10">
          <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-4">
            Cambiar <br/>
            <span className="text-violet-500">Contraseña</span>
          </h2>
          <p className="font-body text-base text-slate-400 leading-[1.6]">
            Crea una nueva contraseña segura para proteger tu cuenta.
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Input 
              label="Contraseña actual" 
              type={showOld ? 'text' : 'password'}
              placeholder="••••••••"
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              icon={<Lock size={20} className="group-focus-within:text-violet-500 transition-colors" />} 
              required
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-[38px] text-surface-dim hover:text-white transition-colors z-20">
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative group">
            <Input 
              label="Nueva contraseña" 
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              icon={<Lock size={20} className="group-focus-within:text-violet-500 transition-colors" />} 
              required
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-[38px] text-surface-dim hover:text-white transition-colors z-20">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Validation Checklist */}
          {newPassword.length > 0 && (
            <div className="bg-white/5 border border-white/5 rounded-[12px] p-4 text-sm space-y-2 mt-2">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-[#00FF85]' : 'text-slate-400'}`}>
                {hasMinLength ? <Check size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-0.5" />}
                Mínimo 6 caracteres
              </div>
              <div className={`flex items-center gap-2 ${hasUppercase ? 'text-[#00FF85]' : 'text-slate-400'}`}>
                {hasUppercase ? <Check size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-0.5" />}
                Al menos una letra mayúscula
              </div>
              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-[#00FF85]' : 'text-slate-400'}`}>
                {hasSpecial ? <Check size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-0.5" />}
                Al menos un carácter especial (!@#$...)
              </div>
            </div>
          )}

          <div className="relative group pt-1">
            <Input 
              label="Confirmar nueva contraseña" 
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              icon={<Lock size={20} className="group-focus-within:text-violet-500 transition-colors" />} 
              required
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-[42px] text-surface-dim hover:text-white transition-colors z-20">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-error text-xs font-medium pl-1">Las contraseñas no coinciden</p>
          )}

          {/* Action Area */}
          <div className="pt-6">
            <Button 
              type="submit" 
              loading={loading} 
              disabled={!isValid || loading} 
              fullWidth 
              size="md" 
            >
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
