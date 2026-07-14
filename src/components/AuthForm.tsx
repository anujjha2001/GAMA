'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState('');
  const [step, setStep] = React.useState<'send' | 'verify'>('send');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email is required');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) throw error;

      toast.success('Verification code sent to your email!');
      setStep('verify');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send verification code');
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Verification code is required');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });

      if (error) throw error;

      // Set cookie session for GAMA compatibility
      document.cookie = "gama_session=true; path=/; max-age=86400; SameSite=Strict";
      try {
        localStorage.setItem('gama_session', 'true');
      } catch (e) {}

      toast.success('Authenticated successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid or expired verification code');
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {step === 'send' ? 'Access Longevity Portal' : 'Confirm Security Code'}
        </h2>
        <p className="text-xs text-neutral-400 mt-2">
          {step === 'send' 
            ? 'Enter your email to receive a secure passwordless access code' 
            : `We've sent a 6-digit OTP code to ${email}`}
        </p>
      </div>

      {step === 'send' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-2 pl-1 font-medium">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-2xl text-sm shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Get OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Verification Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value.replace(/\D/g, ''));
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 tracking-[0.2em] font-mono text-center focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-2 pl-1 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep('send');
                setErrorMsg('');
                setToken('');
              }}
              disabled={isLoading}
              className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 text-white font-medium rounded-2xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-2xl text-xs shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Enter</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
