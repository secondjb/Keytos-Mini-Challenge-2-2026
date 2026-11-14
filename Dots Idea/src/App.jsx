import React from 'react';
import CaptchaCard from './components/CaptchaCard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full" />
      </div>

      <main className="relative z-10 w-full flex justify-center">
        <CaptchaCard />
      </main>
    </div>
  );
}
