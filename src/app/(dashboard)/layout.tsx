'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, User, BarChart2, Calendar, Inbox, Sliders, Settings, Award, ShieldAlert, Sparkles, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch (e) {}
    try {
      localStorage.removeItem('gama_session');
    } catch (e) {}
    window.location.href = '/login';
  };

  if (!mounted) return null;

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/twin', icon: User, label: 'Digital Twin' },
    { href: '/insights', icon: BarChart2, label: 'Insights' },
    { href: '/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/vault', icon: Inbox, label: 'Vault' },
    { href: '/settings', icon: Sliders, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-between p-4 md:p-6 overflow-x-hidden selection:bg-orange-500/30 selection:text-foreground relative w-full transition-colors duration-300">
      
      {/* Outer Dashboard Window container */}
      <div className="w-full max-w-[1440px] flex flex-col gap-6 relative z-10 items-stretch">
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch w-full">
          {/* LEFT VERTICAL DOCK SIDEBAR */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className="w-full md:w-20 bg-card/60 backdrop-blur-2xl border border-border rounded-[32px] p-4 flex flex-row md:flex-col justify-between items-center py-4 md:py-8 shadow-2xl relative z-20 shrink-0 gap-4"
          >
            {/* Logo at the top */}
            <div className="flex items-center gap-1.5 md:flex-col shrink-0">
              <Link href="/" className="flex items-center gap-2 md:flex-col md:gap-1.5 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-border shadow-lg bg-black flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 duration-300">
                  <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
                </div>
                <span className="font-extrabold text-sm md:text-[11px] uppercase tracking-widest text-foreground">GAMA</span>
              </Link>
            </div>

            {/* Navigation group */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-6 flex-1 justify-center items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl md:rounded-full flex items-center justify-center transition-all duration-300 relative cursor-pointer hover:scale-105 ${
                      isActive 
                        ? 'bg-foreground text-background shadow-xl scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.span 
                        layoutId="activeIndicator"
                        className="absolute hidden md:block -right-1 w-1.5 h-6 rounded-l-full bg-foreground" 
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom/Right spacer or ambient element */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-5 shrink-0">
              <button
                onClick={handleLogout}
                title="Log Out"
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl md:rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="hidden md:block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          </motion.aside>

          {/* RIGHT WORKSPACE */}
          <div className="flex-1 min-w-0">
            <main className="w-full h-full">
              {children}
            </main>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-border bg-card/45 backdrop-blur-xl py-10 rounded-[32px] px-6 mt-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-border shadow-lg bg-black flex items-center justify-center">
                  <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
                </div>
                <span className="font-extrabold text-2xl tracking-wider text-foreground">GAMA</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Sovereign biological diagnostic dashboard and epigenetic modeling coordinate framework.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest">Platform</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Overview</Link></li>
                <li><Link href="/twin" className="hover:text-foreground transition-colors">Digital Twin</Link></li>
                <li><Link href="/insights" className="hover:text-foreground transition-colors">Insights</Link></li>
                <li><Link href="/vault" className="hover:text-foreground transition-colors">Secure Vault</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest">Connect</h5>
              <div className="flex gap-4 text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              © 2026 GAMA. All rights reserved.
            </p>
            <div className="flex gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
