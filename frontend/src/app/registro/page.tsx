'use client';
import { useState } from 'react';
import { useAuth, getErrorMessage } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { User, Mail, Lock, Phone, ArrowLeft, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegistroPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es requerida';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.password, form.telefono || undefined);
      toast.success('¡Cuenta creada exitosamente!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in text-surface-container-lowest bg-[#0A0A0F]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-2xl shadow-[0px_12px_32px_rgba(108,71,255,0.05)] flex items-center justify-between px-6 h-16">
        <Link href="/login" className="text-primary-container hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-surface-container-lowest font-headline tracking-[-0.02em]">Pórtico</h1>
        <button className="text-primary-container hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <HelpCircle size={24} />
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-12 px-6 max-w-md mx-auto w-full flex flex-col">
        {/* Header Section */}
        <div className="mb-10 pl-2">
          <h2 className="text-3xl font-bold tracking-[-0.02em] font-headline mb-2 text-surface-container-lowest">
            Completa tus datos
          </h2>
          <p className="text-surface-dim text-sm leading-relaxed">
            Únete a Pórtico y transforma tu experiencia financiera.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input 
            label="Nombre completo" 
            placeholder="Ej. Ana María García" 
            value={form.nombre}
            onChange={set('nombre')} 
            icon={<User size={18} />} 
            error={errors.nombre} 
          />
          
          <Input 
            label="Correo electrónico" 
            type="email" 
            placeholder="correo@ejemplo.com" 
            value={form.email}
            onChange={set('email')} 
            icon={<Mail size={18} />} 
            error={errors.email} 
          />
          
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="Mínimo 8 caracteres" 
            value={form.password}
            onChange={set('password')} 
            icon={<Lock size={18} />} 
            error={errors.password} 
          />
          
          <Input 
            label="Número de celular (opcional)" 
            type="tel" 
            placeholder="300 000 0000" 
            value={form.telefono}
            onChange={set('telefono')} 
            icon={<Phone size={18} />} 
          />

          <p className="text-xs text-surface-dim text-center px-4 mt-2">
            Al registrarte aceptas nuestros{' '}
            <span className="text-primary-container font-semibold cursor-pointer">Términos de servicio</span> y{' '}
            <span className="text-primary-container font-semibold cursor-pointer">Política de privacidad</span>
          </p>

          {/* Tonal Separation & Submit */}
          <div className="pt-6 pb-4">
            <Button type="submit" loading={loading} fullWidth size="md">
              Crear cuenta
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-surface-dim mt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-surface-container-lowest font-semibold hover:text-primary-container transition-colors ml-1">
            Inicia sesión
          </Link>
        </div>
      </main>
    </div>
  );
}
