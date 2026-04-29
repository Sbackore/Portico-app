'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ArrowLeft, Bell, MessageSquare, Mail, Phone } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Config = { permisoNotificacionesActivo: boolean; canalesActivos: string[] };

export default function NotificacionesConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<Config>({
    permisoNotificacionesActivo: true, canalesActivos: ['PUSH', 'EMAIL'],
  });
  const [loading, setLoading] = useState(false);

  const canales = [
    { id: 'PUSH', label: 'Notificaciones push', icon: Bell },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
    { id: 'SMS', label: 'SMS', icon: Phone },
    { id: 'EMAIL', label: 'Email', icon: Mail },
  ];

  const toggleCanal = (id: string) => {
    setConfig(prev => ({
      ...prev,
      canalesActivos: prev.canalesActivos.includes(id)
        ? prev.canalesActivos.filter(c => c !== id)
        : [...prev.canalesActivos, id],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.put(`/notificaciones/config/${user.uid}`, config);
      toast.success('Preferencias guardadas');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-5 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/notificaciones"><ArrowLeft size={20} className="text-gray-400" /></Link>
        <h1 className="text-xl font-bold text-white">Preferencias de alertas</h1>
      </div>

      <div className="space-y-4">
        {/* Master toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Recibir notificaciones</p>
              <p className="text-xs text-gray-400 mt-0.5">Activa o desactiva todas las alertas</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, permisoNotificacionesActivo: !prev.permisoNotificacionesActivo }))}
              className={`w-12 h-6 rounded-full transition-colors ${config.permisoNotificacionesActivo ? 'bg-[#7B5EA7]' : 'bg-gray-700'} relative`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.permisoNotificacionesActivo ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </Card>

        {/* Channels */}
        {config.permisoNotificacionesActivo && (
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Canales de notificación</p>
            <div className="space-y-3">
              {canales.map(({ id, label, icon: Icon }) => (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-gray-400" />
                    <p className="text-sm text-white">{label}</p>
                  </div>
                  <button
                    onClick={() => toggleCanal(id)}
                    className={`w-10 h-5 rounded-full transition-colors ${config.canalesActivos.includes(id) ? 'bg-[#7B5EA7]' : 'bg-gray-700'} relative`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.canalesActivos.includes(id) ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button fullWidth loading={loading} onClick={handleSave}>
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}
