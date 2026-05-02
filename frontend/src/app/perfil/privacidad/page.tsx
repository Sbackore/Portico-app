'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-body animate-fade-in p-6">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.back()} className="text-surface-dim hover:text-white transition-colors active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-headline font-bold text-2xl tracking-tight">Política de Privacidad</h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-6 text-slate-300 leading-relaxed text-[15px]">
        <p className="text-sm text-surface-dim">Última actualización: 2 de Mayo de 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Información que recopilamos</h2>
          <p>Recopilamos información personal que usted nos proporciona directamente al registrarse, incluyendo: nombre completo, documento de identidad, correo electrónico, número de teléfono y datos biométricos durante el proceso KYC.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Cómo usamos su información</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Para procesar sus transacciones financieras.</li>
            <li>Para verificar su identidad y prevenir fraudes.</li>
            <li>Para comunicarnos con usted sobre su cuenta o alertas de seguridad.</li>
            <li>Para mejorar nuestros algoritmos de open banking y sugerencias personalizadas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Compartición de datos</h2>
          <p>No vendemos su información personal. Solo compartimos sus datos con autoridades reguladoras cuando la ley lo exige, o con proveedores de servicios de terceros (como procesadores de pagos o servicios de verificación de identidad) bajo estrictos acuerdos de confidencialidad y encriptación.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Seguridad de los datos</h2>
          <p>Implementamos medidas de seguridad de grado bancario, incluyendo encriptación AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Sin embargo, ningún método de transmisión por Internet es 100% seguro.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Sus derechos</h2>
          <p>Usted tiene derecho a acceder, corregir o solicitar la eliminación de sus datos personales. Puede ejercer estos derechos contactando a nuestro equipo de soporte.</p>
        </section>
      </main>
    </div>
  );
}
