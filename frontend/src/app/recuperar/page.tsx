'use client';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <CheckCircle size={56} className="text-green-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Revisa tu correo</h2>
        <p className="text-gray-400 text-sm mb-8">Enviamos instrucciones a <strong className="text-white">{email}</strong> para recuperar tu contraseña.</p>
        <Link href="/login"><Button fullWidth variant="outline">Volver al inicio de sesión</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/login"><ArrowLeft size={20} className="text-gray-400" /></Link>
        <h1 className="text-xl font-bold text-white">Recuperar contraseña</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Correo electrónico" type="email" placeholder="tu@correo.com"
          value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
        <Button type="submit" loading={loading} fullWidth size="lg">Enviar instrucciones</Button>
      </form>
    </div>
  );
}
