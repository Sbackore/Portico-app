'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#0A0B1E]">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
      <p className="text-gray-400 text-sm mb-6">No pudimos completar tu solicitud. Por favor inténtalo de nuevo.</p>
      <button onClick={reset} className="bg-[#7B5EA7] text-white px-6 py-3 rounded-xl font-semibold text-sm">Reintentar</button>
      <a href="/home" className="mt-3 text-sm text-gray-400">Ir al inicio</a>
    </div>
  );
}
