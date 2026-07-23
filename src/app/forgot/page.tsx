'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password reset link sent to your email!');
      // After success, we route them back to login page
      router.push('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center p-0 md:p-6 overflow-hidden select-none font-sans text-white">
      {/* Container simulating a desktop application window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full h-screen md:h-[680px] max-w-[1100px] bg-[#0c0f17] md:rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0px_24px_64px_rgba(0,0,0,0.6)] relative"
      >

        {/* LEFT COLUMN: AUTH FORM */}
        <div className="w-full md:w-[48%] p-8 md:p-12 flex flex-col justify-between relative bg-[#0c0f17]">

          {/* Mock Window Controls (Mac Style) */}
          <div className="flex items-center gap-1.5 mb-8 md:mb-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="my-auto py-6">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center">
                <img src="/logo.jpg?v=2" alt="GAMA Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Reset Password
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-[280px] mx-auto">
                Enter your registered email to recover your account access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-[320px] mx-auto">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#151923] border border-white/5 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                />
              </div>

              {/* Submit Action Button with 3D press effect */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer flex justify-center items-center"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Code'
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-gray-400">
            <p>
              Back to{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:underline font-semibold cursor-pointer"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: BEAUTIFUL ANIME BANNER */}
        <div className="hidden md:block w-[52%] relative h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/auth-bg.jpg?v=2')`
            }}
          />
          {/* Dark gradient overlay to match image vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17] via-transparent to-transparent opacity-80" />

          {/* Glowing portal-like circle to simulate the illustration portal */}
          <div className="absolute bottom-1/4 left-1/4 w-36 h-36 border-4 border-cyan-400/30 rounded-full blur-[2px] animate-pulse flex items-center justify-center">
            <div className="w-28 h-28 border border-cyan-300/40 rounded-full blur-[1px] shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
          </div>

          {/* Watermark/Label in the bottom right corner */}
          <div className="absolute bottom-6 right-6 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">One More Gate</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
