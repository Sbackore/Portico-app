'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-body animate-fade-in p-6">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.back()} className="text-surface-dim hover:text-white transition-colors active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-headline font-bold text-2xl tracking-tight">Términos y Condiciones</h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-6 text-slate-300 leading-relaxed text-[15px]">
        <p className="text-sm text-surface-dim">Última actualización: 2 de Mayo de 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar la aplicación Pórtico ("nosotros", "nuestro", "la App"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios financieros.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Uso de la Cuenta</h2>
          <p>Usted es responsable de mantener la confidencialidad de sus credenciales de acceso, incluyendo su contraseña y el mecanismo de doble factor de autenticación (OTP). Cualquier transacción realizada desde su cuenta será considerada como autorizada por usted.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Servicios Financieros</h2>
          <p>Pórtico proporciona una plataforma para la gestión de fondos, transferencias y análisis de gastos. No somos un banco tradicional, sino una plataforma de tecnología financiera (Fintech) que opera en alianza con instituciones reguladas para el resguardo de su dinero.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Prevención de Fraude y KYC</h2>
          <p>Para cumplir con las regulaciones internacionales contra el lavado de dinero (AML), requerimos validar su identidad a través de nuestro proceso de Conozca a su Cliente (KYC). Nos reservamos el derecho de bloquear temporal o permanentemente cuentas que presenten actividad sospechosa detectada por nuestro sistema RASP (Runtime Application Self-Protection).</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Se le notificará a través de la aplicación o por correo electrónico antes de que los cambios sustanciales entren en vigor.</p>
        </section>
      </main>
    </div>
  );
}
