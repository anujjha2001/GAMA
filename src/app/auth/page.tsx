'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<AuthMode>(initialMode);

  React.useEffect(() => {
    setAuthMode(initialMode);
    setShowOtpScreen(false);
  }, [initialMode]);

  // Form states pre-filled with dummy data for instant testing
  const [email, setEmail] = React.useState('admin@gama.com');
  const [password, setPassword] = React.useState('admin123');
  const [confirmPassword, setConfirmPassword] = React.useState('admin123');
  const [fullName, setFullName] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [showOtpScreen, setShowOtpScreen] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCookie = document.cookie.includes('gama_session=true');
      let hasLocalStorage = false;
      try {
        hasLocalStorage = localStorage.getItem('gama_session') === 'true';
      } catch (e) {}
      if (hasCookie || hasLocalStorage) {
        window.location.href = '/dashboard';
      } else if (window.location.pathname === '/auth') {
        window.location.href = '/login';
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (authMode === 'register') {
      if (!showOtpScreen) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to send verification code');
          }

          toast.success('Verification code sent to your email!');
          setShowOtpScreen(true);
        } catch (err: any) {
          toast.error(err.message || 'Failed to send verification code');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Verification step
        try {
          const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: otpCode, fullName }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Verification failed');
          }

          try {
            localStorage.setItem('gama_session', 'true');
          } catch (e) {}

          toast.success('Account created successfully! Welcome to GAMA.');
          window.location.href = '/dashboard';
        } catch (err: any) {
          toast.error(err.message || 'Verification failed');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    // Default Login flow
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: authMode, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      try {
        localStorage.setItem('gama_session', 'true');
      } catch (e) {}

      setTimeout(() => {
        setIsLoading(false);
        toast.success('Logged in successfully!');
        window.location.href = '/dashboard';
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || 'Failed to communicate with authentication service.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center p-0 md:p-6 overflow-hidden select-none font-sans text-white">
      {/* 3D background effects and panels here */}
      <div className="w-full max-w-[960px] h-full md:h-[600px] flex rounded-none md:rounded-3xl border-0 md:border border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.85)] bg-[#0c0f17]/90 backdrop-blur-3xl overflow-hidden relative">

        {/* LEFT COLUMN: AUTH FORMS */}
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
                <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                {showOtpScreen ? 'Security Verification' : (
                  <>
                    {authMode === 'login' && 'Welcome back'}
                    {authMode === 'register' && 'Create Account'}
                    {authMode === 'forgot' && 'Reset Password'}
                  </>
                )}
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-[280px] mx-auto">
                {showOtpScreen ? `Enter the 6-digit OTP code sent to ${email}` : (
                  <>
                    {authMode === 'login' && 'Sign in to access your Smart AI health tracker- your personal wellness companion'}
                    {authMode === 'register' && 'Register your profile to begin your customized experience.'}
                    {authMode === 'forgot' && 'Enter your registered email to recover your account access.'}
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-[320px] mx-auto">
              {showOtpScreen ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Verification Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-4 py-3 bg-[#151923] border border-white/5 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white tracking-[0.15em] text-center font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer flex justify-center items-center"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setOtpCode('');
                    }}
                    className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-2"
                  >
                    Back to Registration
                  </button>
                </div>
              ) : (
                <>
                  {authMode === 'register' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#151923] border border-white/5 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      />
                    </div>
                  )}

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

                  {authMode !== 'forgot' && (
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#151923] border border-white/5 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#151923] border border-white/5 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      />
                    </div>
                  )}

                  {authMode === 'login' && (
                    <div className="flex items-center justify-between text-xs mt-2 px-1">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded bg-[#151923] border-white/10 text-blue-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                        />
                        Remember me
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-blue-500 hover:text-blue-400 font-medium transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

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
                      <>
                        {authMode === 'login' && 'Log in'}
                        {authMode === 'register' && 'Register'}
                        {authMode === 'forgot' && 'Send Code'}
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </form>

            {/* Social Logins */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-3 max-w-[320px] mx-auto">
                <button
                  onClick={() => toast.success('Google login selected')}
                  className="w-12 h-11 bg-[#151923] hover:bg-[#1a202d] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Google SVG */}
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.027-2.703-6.027-6.028s2.703-6.028 6.027-6.028c1.512 0 2.89.56 3.96 1.48l3.1-3.1C18.913 2.827 15.827 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.36 0 9.8-3.84 9.8-10.5 0-.64-.08-1.24-.2-1.715H12.24z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Facebook login selected')}
                  className="w-12 h-11 bg-[#151923] hover:bg-[#1a202d] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Facebook SVG */}
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Steam login selected')}
                  className="w-12 h-11 bg-[#151923] hover:bg-[#1a202d] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Steam SVG Icon */}
                  <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.018-.01.036-.02.05-.035l4.312-5.18c.677.24 1.41.375 2.183.375 3.313 0 6-2.69 6-6s-2.687-6-6-6-6 2.69-6 6c0 .762.138 1.488.375 2.158l-5.19 4.316a11.9 11.9 0 0 1-.935-4.814c0-5.91 4.793-10.7 10.7-10.7s10.7 4.79 10.7 10.7-4.79 10.7-10.7 10.7c-.504 0-1.002-.037-1.492-.108l.006-.002zm1.25 15.453c-1.795 0-3.25-1.455-3.25-3.25s1.455-3.25 3.25-3.25 3.25 1.455 3.25 3.25-1.455 3.25-3.25 3.25zm0-5c-.966 0-1.75.784-1.75 1.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75-.784-1.75-1.75-1.75z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Apple login selected')}
                  className="w-12 h-11 bg-[#151923] hover:bg-[#1a202d] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Apple SVG */}
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-gray-400">
            {authMode === 'login' && (
              <p>
                Don't have account?{' '}
                <Link
                  href="/register"
                  className="text-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Sign up
                </Link>
                {' '}or{' '}
                <button
                  onClick={async () => {
                    await fetch('/api/auth', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'bypass' }),
                    });
                    try {
                      localStorage.setItem('gama_session', 'true');
                    } catch (e) {}
                    window.location.href = '/dashboard';
                  }}
                  className="text-gray-300 hover:text-white hover:underline cursor-pointer"
                >
                  Sign in Later
                </button>
              </p>
            )}
            {authMode === 'register' && (
              <p>
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            )}
            {authMode === 'forgot' && (
              <p>
                Back to{' '}
                <Link
                  href="/login"
                  className="text-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BEAUTIFUL ANIME BANNER */}
        <div className="hidden md:block w-[52%] relative h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000')`
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
      </div>
    </div>
  );
}
