import DualStageCaptchaCard from './components/DualStageCaptchaCard';

export function App() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-cyan-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <DualStageCaptchaCard />
      </main>

      {/* Subtle attribution note */}
      <footer className="relative z-10 mt-6 text-center text-[12px] text-slate-500 font-mono">
        Built for Keytos Mini-Challenge #2 • Motion & Flashlight Dual-Entropy Verification
      </footer>
    </div>
  );
}

export default App;
