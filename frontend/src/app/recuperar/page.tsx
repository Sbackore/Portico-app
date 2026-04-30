'use client';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, Mail, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error('Ingresa un correo válido'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setEnviado(true);
    setLoading(false);
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in bg-[#0A0A0F] text-surface-container-lowest">
        <CheckCircle size={56} className="text-[#00FF85] mb-4" />
        <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-2">
          Revisa tu correo
        </h2>
        <p className="text-surface-dim text-base mb-8 max-w-[280px]">
          Enviamos instrucciones a <strong className="text-white">{email}</strong> para recuperar tu contraseña.
        </p>
        <Link href="/login" className="w-full max-w-[280px]">
          <Button fullWidth variant="secondary" className="shadow-none">Volver al inicio de sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0F] text-white font-body animate-fade-in selection:bg-primary-container selection:text-white">
      {/* Background Decoration (Ambient Depth) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button Context */}
        <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="mr-2 group-active:scale-95 transition-transform" />
          <span className="font-label font-semibold text-sm tracking-wide">Volver al inicio</span>
        </Link>

        {/* Logo / Brand Anchor */}
        <div className="mb-10 text-left">
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-white">Pórtico</h1>
        </div>

        {/* Hero Content Area */}
        <div className="mb-12">
          <h2 className="font-display text-[2.25rem] leading-tight font-bold tracking-[-0.02em] text-white mb-4">
            Recuperar <br/>
            <span className="text-violet-500">Contraseña</span>
          </h2>
          <p className="font-body text-base text-slate-400 leading-[1.6]">
            Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative group">
            <Input 
              label="Correo electrónico" 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              icon={<Mail size={20} className="group-focus-within:text-violet-500 transition-colors" />} 
              required
            />
          </div>

          {/* Action Area */}
          <div className="pt-8">
            <Button type="submit" loading={loading} fullWidth size="md" className="group">
              <span className="font-label font-bold text-white text-base tracking-wide">Enviar Instrucciones</span>
              <Send size={18} className="ml-1 text-white/80 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
