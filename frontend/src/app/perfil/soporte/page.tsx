'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MessageSquare, Clock } from 'lucide-react';

export default function SoportePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-body animate-fade-in p-6">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.back()} className="text-surface-dim hover:text-white transition-colors active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-headline font-bold text-2xl tracking-tight">Ayuda y Soporte</h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <MessageSquare size={32} className="text-primary-fixed-dim" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">¿Cómo podemos ayudarte?</h2>
          <p className="text-slate-400 text-sm">
            Nuestro equipo de especialistas financieros está disponible para resolver tus dudas y proteger tu cuenta.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2">Canales de contacto</h3>

          <a href="mailto:PorticoApp@gmail.com" className="bg-white/5 border border-white/5 rounded-[16px] p-5 flex items-center gap-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-violet-400 group-hover:text-violet-300 transition-colors">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-white font-semibold">Correo electrónico</p>
              <p className="text-slate-400 text-sm mt-0.5">PorticoApp@gmail.com</p>
            </div>
          </a>

          <a href="tel:+573045512467" className="bg-white/5 border border-white/5 rounded-[16px] p-5 flex items-center gap-4 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-[#00FF85] group-hover:text-green-300 transition-colors">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-white font-semibold">Línea de atención</p>
              <p className="text-slate-400 text-sm mt-0.5">+57 304 551 2467</p>
            </div>
          </a>
        </div>

        <div className="bg-surface-container-lowest border border-white/5 rounded-[16px] p-5 flex items-start gap-4">
          <Clock size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm">Horario de atención</p>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              Lunes a Viernes: 8:00 AM - 6:00 PM<br/>
              Sábados: 9:00 AM - 1:00 PM<br/>
              * Para bloqueos por fraude, atención 24/7.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
