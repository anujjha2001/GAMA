'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Heart, Shield, Calendar, Users, ChevronRight, 
  ArrowRight, Globe 
} from 'lucide-react';
import { toast } from 'sonner';

// Import the interactive 3D heart dynamically to prevent SSR hydration errors
const HealthOrb3D = dynamic(() => import('@/components/shared/health-orb-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[600px] flex items-center justify-center bg-transparent">
      <div className="h-48 w-48 rounded-full bg-amber-500/10 animate-pulse blur-xl" />
    </div>
  ),
});

export default function HomePage() {
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
              href="/auth"
              className="px-5 py-2.5 bg-white hover:bg-white/95 text-black font-semibold rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO SECTION */}
      <section id="hero" className="min-h-screen relative flex items-center pt-24 overflow-hidden">
        {/* Relaxing Forest Background with subtle blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 ease-out scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1800')`
          }}
        />
        {/* Dark forest layout overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1d1f]/60 via-[#1c1d1f]/85 to-[#1c1d1f]" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-12">
          
          {/* Left Column: Headline Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-400/20 text-[10px] font-bold text-amber-500 rounded-full uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Intelligence Shell Synchronized
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Precision Health for Peak <span className="text-amber-500">Longevity</span>
            </h1>
            
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-lg">
              Experience GAMA's biometric security framework. Synchronizing epigenetic feedback loops, autonomic resonance profiling, and secure clinical records inside a state-of-the-art biological dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/auth"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl text-sm shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                Enter Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#vision"
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Column: Interactive 3D Heart Component */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="w-full max-w-[500px] aspect-square relative flex justify-center items-center rounded-full bg-black/10 border border-white/5 backdrop-blur-lg shadow-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent z-0 pointer-events-none" />
              
              <div className="relative z-10 w-full h-full flex justify-center items-center">
                <HealthOrb3D />
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] space-y-6 shadow-xl flex flex-col justify-between min-h-[300px]"
          >
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Biometric Sovereignty</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                All patient panels, DNA markers, and health histories are stored in decentralized networks encrypted using client-side cryptographic keys.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] space-y-6 shadow-xl flex flex-col justify-between min-h-[300px]"
          >
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Vitality Core Forecasting</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our machine learning algorithms process 400+ biometric factors to predict metabolic trajectory indices and optimize recovery times.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] space-y-6 shadow-xl flex flex-col justify-between min-h-[300px]"
          >
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Advisory Coordination</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect directly with clinical professionals and metabolic coaches securely through sandboxed consultation portals built into GAMA.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: CONSULTING SECTION */}
      <section id="consulting" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Consulting</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Elite Longevity Protocols</h2>
          <p className="text-sm text-gray-400">
            Book private diagnostics and metabolic coaching consultations with our board-certified health advisors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Consult Card 1 */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-xl flex flex-col justify-between min-h-[380px]"
          >
            <div className="h-44 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1d1f] to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" 
                alt="Diagnostics" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">Metabolic Biomarker Audit</h4>
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Available</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  In-depth analysis of glycemic index variability, VO2 kinetics, and hormone profiles with direct clinical feedback.
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 pt-3 border-t border-white/5">
                <span>60 Minutes</span>
                <span>$250 USD</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Connecting to diagnostic booking portal...')}
                className="w-full py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-2xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Session
              </motion.button>
            </div>
          </motion.div>

          {/* Consult Card 2 */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-xl flex flex-col justify-between min-h-[380px]"
          >
            <div className="h-44 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1d1f] to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80" 
                alt="Cardiology" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">Cardiometabolic Fitness Audit</h4>
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Available</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  Detailed evaluation of cardiovascular efficiency and resting vagal tone. Formulates responsive athletic plans.
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 pt-3 border-t border-white/5">
                <span>45 Minutes</span>
                <span>$180 USD</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Connecting to fitness booking portal...')}
                className="w-full py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-2xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Session
              </motion.button>
            </div>
          </motion.div>

          {/* Consult Card 3 */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-xl flex flex-col justify-between min-h-[380px]"
          >
            <div className="h-44 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1d1f] to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80" 
                alt="Longevity" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">Longevity Optimization</h4>
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Available</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  Targeted longevity sequencing, epigenetic mapping models, and nutrition coordination with longevity coaches.
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 pt-3 border-t border-white/5">
                <span>90 Minutes</span>
                <span>$350 USD</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Connecting to longevity booking portal...')}
                className="w-full py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-2xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Session
              </motion.button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 4: COOL FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center">
                <img src="/logo.jpg" alt="GAMA Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white">GAMA</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Sovereign biological diagnostic dashboard and epigenetic modeling coordinate framework.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/nexus" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/twin" className="hover:text-white transition-colors">Digital Twin</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Insights</Link></li>
              <li><Link href="/vault" className="hover:text-white transition-colors">Secure Vault</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Connect</h5>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                {/* Twitter SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {/* Github SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {/* Youtube SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            © 2026 GAMA. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
