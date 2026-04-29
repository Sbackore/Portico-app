'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VincularBancoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [vinculado, setVinculado] = useState(false);
  const [linkId, setLinkId] = useState('');

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!authCode.trim()) { toast.error('Ingresa el código de autorización'); return; }
    setLoading(true);
    try {
      const res = await api.post('/banking/link', { userId: user.uid, authCode });
      setLinkId(res.data.linkId);
      setVinculado(true);
      toast.success('¡Cuenta bancaria vinculada exitosamente!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (vinculado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="animate-pulse-glow w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">¡Cuenta vinculada!</h2>
        <p className="text-gray-400 text-sm text-center mb-2">Tu banco está conectado correctamente.</p>
        <p className="text-xs text-gray-600 mb-8">ID de vínculo: {linkId}</p>
        <Button fullWidth onClick={() => router.push('/banking')}>Ver mis alertas</Button>
        <Link href="/home" className="mt-3 text-sm text-gray-400">Ir al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/banking"><ArrowLeft size={20} className="text-gray-400" /></Link>
        <h1 className="text-xl font-bold text-white">Vincular cuenta bancaria</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Building2 size={28} className="text-blue-400" />
        </div>
        <p className="text-gray-400 text-sm text-center">
          Conecta tu cuenta bancaria mediante Open Banking para monitorear tus transacciones en tiempo real.
        </p>
      </div>

      <Card className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cómo funciona</p>
        {['Autoriza el acceso en tu banco', 'Copia el código de autorización', 'Pégalo aquí para completar la vinculación'].map((step, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#7B5EA7]/20 text-[#A78BFA] text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <p className="text-sm text-gray-300">{step}</p>
          </div>
        ))}
      </Card>

      <form onSubmit={handleVincular} className="space-y-4">
        <Input
          label="Código de autorización OAuth"
          placeholder="Ej: auth_code_abc123 (modo demo)"
          value={authCode}
          onChange={e => setAuthCode(e.target.value)}
        />
        <p className="text-xs text-gray-500 text-center">
          En modo demo puedes ingresar cualquier código para simular la vinculación.
        </p>
        <Button type="submit" loading={loading} fullWidth size="lg">
          Vincular banco
        </Button>
      </form>
    </div>
  );
}
