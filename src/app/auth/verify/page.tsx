'use client';

/**
 * /auth/verify — Email Verification Page
 *
 * Premium GAMA-branded OTP verification experience.
 * Users arrive here after registration to verify their email.
 */

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
// Custom verification flow
import { Mail, RefreshCw, CheckCircle, ArrowLeft, Shield, Zap } from 'lucide-react';

// ─── OTP Input Component ──────────────────────────────────────────────────────

function OTPInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    onChange(newDigits.join(''));
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, ''));
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          whileFocus={{ scale: 1.05 }}
          className={`
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold font-mono
            rounded-xl border transition-all duration-200 outline-none
            bg-white/5 text-white
            ${digits[i]
              ? 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'border-white/10 focus:border-white/30'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}

// ─── Success Animation ────────────────────────────────────────────────────────

function SuccessState() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]"
      >
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-white">Email Verified!</h2>
        <p className="text-sm text-white/60 mt-2">Setting up your GAMA profile…</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
        </motion.div>
        <span className="text-sm text-amber-400">Redirecting to dashboard…</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Countdown timer — 60 seconds
  const [countdown, setCountdown] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendCount, setResendCount] = React.useState(0); // rate limit

  // Start countdown
  React.useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Verify OTP via custom API
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailParam,
          code: otp,
        }),
      });

      const data = await verifyRes.json();
      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      setIsSuccess(true);
      toast.success('Email verified! Welcome to GAMA 🎉');

      // Redirect after animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 2200);
    } catch (err: any) {
      const msg = err.message || 'Verification failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend Verification ────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    if (resendCount >= 3) {
      toast.error('Too many resend attempts. Please wait a few minutes.');
      return;
    }
    if (!emailParam) {
      toast.error('Email address not found. Please go back and register again.');
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to resend code');
      }

      toast.success('A new verification email has been sent!');

      setCountdown(60);
      setCanResend(false);
      setOtp('');
      setError('');
      setResendCount((c) => c + 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatCountdown = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 md:p-6 overflow-hidden select-none font-sans text-white relative">

      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-[480px] relative z-10">

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-black/90 backdrop-blur-3xl border border-white/8 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] p-8 sm:p-10"
        >

          {/* Mac window controls + back */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <SuccessState key="success" />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-7"
              >

                {/* Logo */}
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center"
                  >
                    <img src="/logo.jpg?v=2" alt="GAMA" className="w-full h-full object-cover" />
                  </motion.div>
                </div>

                {/* Animated email icon */}
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.2)]"
                  >
                    <Mail className="w-7 h-7 text-amber-400" />
                  </motion.div>

                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                      Verify your email
                    </h1>
                    <p className="text-sm text-white/55 mt-2 max-w-[300px] mx-auto leading-relaxed">
                      {emailParam ? (
                        <>
                          We sent a 6-digit code to{' '}
                          <span className="text-white/80 font-medium">{emailParam}</span>
                        </>
                      ) : (
                        'Enter the 6-digit code we sent to your email address.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Features row */}
                <div className="flex items-center justify-center gap-4 text-xs text-white/35">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant access</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>One-time only</span>
                  </div>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleVerify} className="space-y-5">
                  <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-white text-black font-semibold rounded-xl text-sm
                               shadow-[0_4px_20px_rgba(255,255,255,0.12)] transition-all cursor-pointer
                               hover:bg-neutral-100 flex items-center justify-center gap-2
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Verify &amp; Enter GAMA</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Countdown + Resend */}
                <div className="text-center space-y-2">
                  {!canResend ? (
                    <p className="text-xs text-white/40">
                      Resend available in{' '}
                      <span className="text-white/70 font-mono font-semibold tabular-nums">
                        {formatCountdown(countdown)}
                      </span>
                    </p>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleResend}
                      disabled={resendLoading || resendCount >= 3}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer
                                 underline underline-offset-4 disabled:opacity-40 disabled:cursor-not-allowed
                                 flex items-center gap-1.5 mx-auto"
                    >
                      {resendLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </motion.div>
                          Sending…
                        </>
                      ) : resendCount >= 3 ? (
                        'Max resends reached — check your spam folder'
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Resend verification email
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Help text */}
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    Check your spam folder if you don&apos;t see it.
                    <br />
                    The code expires in 5 minutes.
                  </p>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          GAMA Health Intelligence Platform &bull; Secure Verification
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    }>
      <VerifyEmailPageContent />
    </React.Suspense>
  );
}
