"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1c1d1f] text-[#f3f4f6] font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-white relative">
      {/* Dynamic background atmospheric warm glows */}
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-[#ef4444]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-[#f59e0b]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <img src="/logo.jpg" alt="GAMA Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">GAMA</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#hero" className="hover:text-white transition-colors">Hero</a>
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#consulting" className="hover:text-white transition-colors">Consulting</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white hover:bg-white/95 text-black font-semibold rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO SECTION */}
      <section id="hero" className="min-h-screen relative flex items-center pt-24 overflow-hidden justify-center text-center">
        {/* Background Video Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: -1 }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
          >
            <source src="/fitness-track-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-transparent via-[#1c1d1f]/80 to-[#1c1d1f]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 w-full relative z-10 py-12 flex flex-col items-center justify-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-400/20 text-[10px] font-bold text-amber-500 rounded-full uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Intelligence Shell Synchronized
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight max-w-3xl">
              Precision Health for Peak <span className="text-amber-500">Longevity</span>
            </h1>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-xl">
              Experience GAMA's biometric security framework. Synchronizing epigenetic feedback loops, autonomic resonance profiling, and secure clinical records inside a state-of-the-art biological dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                href="/login"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl text-sm shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                Enter Portal
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#vision"
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VISION OF GAMA */}
      <section id="vision" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Vision</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">The Epigenetic Architecture</h2>
          <p className="text-sm text-gray-400">
            We merge diagnostic precision with decentralized cloud privacy, giving you ultimate sovereign control over your diagnostic telemetry.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row justify-center items-center">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-black transition-colors hover:bg-white/90 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-white/10 px-5 transition-colors hover:bg-white/5 md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </section>
    </div>
  );
}
