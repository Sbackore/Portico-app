'use client';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export function DynamicGlow() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const score = user.scoreSeguridadCuenta ?? 100;
  
  let color = 'rgba(108,71,255,0.12)'; // Default purplish
  if (score >= 70) {
    color = 'rgba(0,255,133,0.1)'; // Green
  } else if (score >= 40) {
    color = 'rgba(251,146,60,0.12)'; // Orange
  } else {
    color = 'rgba(248,113,113,0.15)'; // Red
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-1000 ease-in-out" 
      style={{ 
        background: `radial-gradient(circle at 50% 0%, ${color} 0%, transparent 70%)` 
      }} 
    />
  );
}
