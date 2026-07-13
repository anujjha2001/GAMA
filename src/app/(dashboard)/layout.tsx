/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, FileText, BarChart2, Mail, Link as LinkIcon, ShoppingBag, 
  Bell, Settings, Search, Command 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

  if (!mounted) return null;

  // Title map matching pathnames
  const titleMap: Record<string, string> = {
    '/nexus': 'Channel Analytics',
    '/twin': 'Twin Sync',
    '/insights': 'Metrics & Insights',
    '/vault': 'Secure Vault',
    '/aura': 'AURA AI',
  };
  const pageTitle = titleMap[pathname] || 'Channel Analytics';

  const navItems = [
    { id: 'nexus', path: '/nexus', icon: BarChart2, label: 'Analytics' },
    { id: 'vault', path: '/vault', icon: FileText, label: 'Vault' },
    { id: 'twin', path: '/twin', icon: Home, label: 'Twin' },
    { id: 'insights', path: '/insights', icon: Mail, label: 'Insights' },
    { id: 'aura', path: '/aura', icon: LinkIcon, label: 'AURA' },
  ];

  return (
    <div className="min-h-screen bg-[#1c1d1f] text-[#f3f4f6] font-sans pb-16 relative overflow-hidden select-none">
      {/* Background gradients mirroring the mockup's atmospheric warm glows */}
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-[#ef4444]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-[#f59e0b]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Outer Container */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex gap-6 relative z-10">
        
        {/* LEFT VERTICAL DOCK SIDEBAR */}
        <motion.aside 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-16 md:w-20 bg-black/35 backdrop-blur-2xl border border-white/5 rounded-3xl p-4 flex flex-col justify-between items-center h-[calc(100vh-64px)] sticky top-8 shadow-2xl"
        >
          {/* Logo at the top */}
          <Link href="/nexus" className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/5 cursor-pointer flex items-center justify-center bg-black">
            <img src="/logo.jpg" alt="GAMA Logo" className="w-full h-full object-cover" />
          </Link>

          {/* Navigation group */}
          <div className="flex flex-col gap-4 mt-8 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 border border-white/10 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-5 bg-amber-500 rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom settings and alerts */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => toast.success('Notifications opened')} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>
            <button 
              onClick={() => toast.success('Settings opened')} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.aside>

        {/* RIGHT WORKSPACE */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* HEADER BAR */}
          <header className="flex justify-between items-center py-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {pageTitle}
            </h1>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toast.info('Direct messaging opened')}
                className="p-2.5 bg-black/20 hover:bg-black/35 rounded-full border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => toast.info('Global search activated')}
                className="p-2.5 bg-black/20 hover:bg-black/35 rounded-full border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              
              <div 
                onClick={() => toast.success('Profile options')}
                className="w-10 h-10 rounded-full border border-white/10 overflow-hidden cursor-pointer shadow-lg hover:scale-105 transition-all duration-300"
              >
                <img 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"
                />
              </div>
            </div>
          </header>

          {/* MAIN PAGE CHILDREN CONTENT */}
          <main className="flex-1">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}
