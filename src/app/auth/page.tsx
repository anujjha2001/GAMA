'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<AuthMode>(initialMode);

  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('other');
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [primaryGoal, setPrimaryGoal] = React.useState('fitness');
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [showOtpScreen, setShowOtpScreen] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  // Real-time OTP countdown states (5 minutes = 300 seconds)
  const [otpTimer, setOtpTimer] = React.useState(300);
  const [canResendOtp, setCanResendOtp] = React.useState(false);

  React.useEffect(() => {
    setAuthMode(initialMode);
    setShowOtpScreen(false);
    setOtpTimer(300);
    setCanResendOtp(false);
  }, [initialMode]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpScreen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendOtp(true);
            return 0;
          }
          // Enable resend after 30 seconds
          if (prev === 270) {
            setCanResendOtp(true);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const endpoint = authMode === 'forgot' ? '/api/auth' : '/api/send-otp';
      const body = authMode === 'forgot' ? { action: 'forgot', email } : { email };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      toast.success('A new verification code has been sent!');
      setOtpTimer(300);
      setCanResendOtp(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Facebook');
      setIsLoading(false);
    }
  };

  const handleOutlookLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Outlook');
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (authMode === 'register') {
      if (!showOtpScreen) {
        if (!firstName || !lastName || !username || !email || !password || !dob || !height || !weight) {
          toast.error('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (!acceptTerms) {
          toast.error('You must accept the Terms and Conditions');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const computedFullName = `${firstName} ${lastName}`;

        try {
          // Pre-verify that the email/username isn't already taken before sending OTP
          const checkRes = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'register',
              email,
              password,
              fullName: computedFullName,
              firstName,
              lastName,
              username,
              dob,
              gender,
              height,
              weight,
              primaryGoal
            }),
          });
          const checkData = await checkRes.json();
          if (!checkData.success) {
            throw new Error(checkData.error || 'Registration pre-check failed');
          }

          // Trigger OTP send
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
          toast.error(err.message || 'Failed to register');
        } finally {
          setIsLoading(false);
        }
      } else {
        const computedFullName = `${firstName} ${lastName}`;
        // Verification step
        try {
          const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              code: otpCode,
              fullName: computedFullName,
              password,
              firstName,
              lastName,
              username,
              dob,
              gender,
              height,
              weight,
              primaryGoal
            }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Verification failed');
          }

          try {
            if (data.user && data.user.fullName) {
              localStorage.setItem('gama_user_name', data.user.fullName);
            }
            localStorage.setItem('gama_session', 'true');
          } catch (e) { }

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

    if (authMode === 'forgot') {
      if (!showOtpScreen) {
        if (!email) {
          toast.error('Email is required');
          setIsLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'forgot', email }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to send recovery code');
          }

          toast.success('Password reset code sent to your email!');
          setShowOtpScreen(true);
        } catch (err: any) {
          toast.error(err.message || 'Failed to initiate recovery');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Verify OTP for password recovery
        try {
          const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: otpCode }),
          });
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Verification failed');
          }

          try {
            if (data.user && data.user.fullName) {
              localStorage.setItem('gama_user_name', data.user.fullName);
            }
            localStorage.setItem('gama_session', 'true');
          } catch (e) { }

          toast.success('Access recovered successfully!');
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
        if (data.user && data.user.fullName) {
          localStorage.setItem('gama_user_name', data.user.fullName);
        }
        localStorage.setItem('gama_session', 'true');
      } catch (e) { }

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
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 md:p-6 overflow-hidden select-none font-sans text-white relative">
      {/* Dynamic background atmospheric warm/cool glows matching GAMA vibe */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* 3D background effects and panels here */}
      <div className="w-full max-w-[960px] h-full md:h-[680px] flex rounded-none md:rounded-3xl border-0 md:border border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.85)] bg-black/90 backdrop-blur-3xl overflow-hidden relative z-10">

        {/* LEFT COLUMN: AUTH FORMS */}
        <div className="w-full md:w-[48%] p-8 md:p-12 flex flex-col justify-between relative bg-black overflow-y-auto max-h-full">

          {/* Mock Window Controls (Mac Style) & Back to Home */}
          <div className="flex items-center justify-between mb-8 md:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <Link
              href="/"
              className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors font-medium"
            >
              <span>← Back to Home</span>
            </Link>
          </div>

          <div className="my-auto py-6">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center">
                <img src="/logo.jpg?v=2" alt="GAMA" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl md:text-whitexl font-semibold tracking-tight text-white">
                {showOtpScreen ? 'Security Verification' : (
                  <>
                    {authMode === 'login' && 'Welcome back'}
                    {authMode === 'register' && 'Create Account'}
                    {authMode === 'forgot' && 'Reset Password'}
                  </>
                )}
              </h1>
              <p className="text-sm text-white/60 mt-2 max-w-[280px] mx-auto">
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
                      className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white tracking-[0.15em] text-center font-mono"
                    />
                  </div>

                  <div className="text-center text-xs text-white/60">
                    {otpTimer > 0 ? (
                      <p>Code expires in: <span className="text-white font-semibold">{formatTime(otpTimer)}</span></p>
                    ) : (
                      <p className="text-red-500 font-semibold">Verification code has expired</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpTimer === 0}
                    className="w-full py-3 mt-2 bg-white text-black font-semibold hover:bg-neutral-100 rounded-xl text-sm shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all cursor-pointer flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enter'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={!canResendOtp || isLoading}
                      onClick={handleResendOtp}
                      className="text-xs text-white hover:underline transition-colors disabled:text-white/30 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      Resend Code {!canResendOtp && `(${formatTime(otpTimer)})`}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setOtpCode('');
                    }}
                    className="w-full text-center text-xs text-white/60 hover:text-white transition-colors py-2"
                  >
                    Back to Registration
                  </button>
                </div>
              ) : (
                <>
                  {authMode === 'register' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="date"
                            placeholder="Birth Date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                          />
                        </div>
                        <div>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all text-white/70"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Height (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <select
                          value={primaryGoal}
                          onChange={(e) => setPrimaryGoal(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-xs focus:border-white/20 focus:outline-none transition-all text-white/70"
                        >
                          <option value="fitness">Weight Loss & Fitness</option>
                          <option value="muscle">Muscle Gain</option>
                          <option value="longevity">Circadian Sync & Longevity</option>
                          <option value="recovery">Autonomic Stress Recovery</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
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
                        className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
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
                        className="w-full px-4 py-3 bg-[black] border border-white/5 rounded-xl text-sm focus:border-white/20 focus:outline-none transition-all placeholder-white/50 text-white"
                      />
                    </div>
                  )}

                  {authMode === 'login' && (
                    <div className="flex items-center justify-between text-xs mt-2 px-1">
                      <label className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded bg-[black] border-white/10 text-white focus:ring-0 focus:ring-offset-0 h-4 w-4"
                        />
                        Remember me
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-white hover:text-white font-medium transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}
                  {authMode === 'register' && (
                    <div className="flex items-start gap-2 text-[10px] text-white/60 mt-2 px-1">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="rounded bg-[black] border-white/10 text-white focus:ring-0 focus:ring-offset-0 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="terms" className="cursor-pointer select-none">
                        I accept the <span className="text-[#00f0ff] hover:underline">Terms of Service</span> and <span className="text-[#00f0ff] hover:underline">Privacy Policy</span>.
                      </label>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 mt-4 bg-white text-black font-semibold rounded-xl text-sm shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all cursor-pointer flex justify-center items-center"
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
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sign in with Google"
                >
                  {/* Google SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58v2.24h3.94c2.3-2.12 3.67-5.02 3.67-8.64z"/>
                    <path fill="#34A853" d="M12 24c3.27 0 6.02-1.08 8.02-2.92l-3.94-2.24c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.78-2.12-6.73-4.96H1.27v2.3C3.26 21.6 7.23 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 15.03c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28v-2.3H1.27C.46 9.4 0 10.66 0 12s.46 2.6 1.27 3.55l4-2.52z"/>
                    <path fill="#EA4335" d="M12 4.8c1.74 0 3.3.6 4.52 1.77l3.39-3.39C17.65 1.13 15.15 0 12 0 7.23 0 3.26 2.4 1.27 6.35l4 2.52c.95-2.84 3.6-4.96 6.73-4.96z"/>
                  </svg>
                </button>
                <button
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sign in with Facebook"
                >
                  {/* Facebook SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" fill="#ffffff" />
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={handleOutlookLogin}
                  disabled={isLoading}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sign in with Outlook"
                >
                  {/* Outlook SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="outlook_grad1" gradientUnits="userSpaceOnUse" x1="315.53" y1="-877.43" x2="315.53" y2="-651.19" gradientTransform="translate(0, 1145.33)">
                        <stop offset="0" stopColor="#35B8F1"/>
                        <stop offset="1" stopColor="#28A8EA"/>
                      </linearGradient>
                      <linearGradient id="outlook_grad2" gradientUnits="userSpaceOnUse" x1="45.51" y1="-1037.36" x2="216.45" y2="-741.3" gradientTransform="translate(0, 1145.33)">
                        <stop offset="0" stopColor="#1784D9"/>
                        <stop offset="0.5" stopColor="#107AD5"/>
                        <stop offset="1" stopColor="#0A63C9"/>
                      </linearGradient>
                    </defs>
                    <path fill="#0A2767" d="M512,267.91c0.03-4-2.04-7.73-5.45-9.82h-0.06l-0.21-0.12L328.86,152.95c-0.77-0.52-1.56-0.99-2.38-1.42c-6.85-3.53-14.99-3.53-21.84,0c-0.82,0.43-1.62,0.9-2.38,1.42L124.84,257.96l-0.21,0.12c-5.42,3.37-7.08,10.5-3.71,15.92c0.99,1.6,2.36,2.93,3.99,3.88L302.32,382.9c0.77,0.51,1.56,0.99,2.38,1.42c6.85,3.53,14.99,3.53,21.84,0c0.82-0.43,1.61-0.9,2.38-1.42l177.41-105.02C509.88,275.82,512.04,272.01,512,267.91z"/>
                    <path fill="#0364B8" d="M145.53,197.79h116.43v106.72H145.53V197.79z M488.19,89.3V40.48c0.28-12.21-9.38-22.33-21.59-22.62H164.47c-12.21,0.29-21.87,10.42-21.59,22.62V89.3l178.6,47.63L488.19,89.3z"/>
                    <path fill="#0078D4" d="M142.88,89.3h119.07v107.16H142.88V89.3z"/>
                    <path fill="#28A8EA" d="M381.02,89.3H261.95v107.16l119.07,107.16h107.16V196.47L381.02,89.3z"/>
                    <path fill="#0078D4" d="M261.95,196.47h119.07v107.16H261.95V196.47z"/>
                    <path fill="#0364B8" d="M261.95,303.63h119.07v107.16H261.95V303.63z"/>
                    <path fill="#14447D" d="M145.53,304.51h116.43v97.02H145.53V304.51z"/>
                    <path fill="#0078D4" d="M381.02,303.63h107.16v107.16H381.02V303.63z"/>
                    <path fill="url(#outlook_grad1)" d="M506.55,277.23l-0.23,0.12l-177.41,99.78c-0.77,0.48-1.56,0.93-2.38,1.33c-3.01,1.43-6.29,2.25-9.62,2.38l-9.69-5.67c-0.82-0.41-1.61-0.87-2.38-1.37l-179.8-102.61h-0.08l-5.88-3.29V469.9c0.09,13.48,11.09,24.33,24.56,24.24h344.18c0.2,0,0.38-0.1,0.6-0.1c2.85-0.18,5.65-0.77,8.33-1.74c1.16-0.49,2.28-1.07,3.35-1.74c0.8-0.45,2.17-1.44,2.17-1.44c6.1-4.51,9.71-11.64,9.74-19.23V267.91C512,271.77,509.91,275.33,506.55,277.23z"/>
                    <path fill="#0A2767" opacity="0.5" d="M502.47,267.11v12.38L316.96,407.22L124.9,271.28c0-0.07-0.05-0.12-0.12-0.12l0,0l-17.62-10.6v-8.93l7.26-0.12l15.36,8.81l0.36,0.12l1.31,0.83c0,0,180.51,103,180.99,103.23l6.91,4.05c0.6-0.24,1.19-0.48,1.91-0.71c0.36-0.24,179.2-100.85,179.2-100.85L502.47,267.11z"/>
                    <path fill="#1490DF" d="M506.55,277.23l-0.23,0.13l-177.41,99.78c-0.77,0.48-1.56,0.93-2.38,1.33c-6.89,3.37-14.95,3.37-21.84,0c-0.82-0.4,1.61-0.85-2.38-1.33l-177.41-99.78l-0.21-0.13c-3.43-1.86-5.57-5.43-5.61-9.32V469.9c0.09,13.47,11.08,24.33,24.55,24.24c0,0,0,0,0,0h343.83c13.47,0.09,24.47-10.77,24.55-24.24c0,0,0,0,0,0V267.91C512,271.77,509.91,275.33,506.55,277.23z"/>
                    <path fill="#000000" opacity="0.1" d="M331.49,375.67l-2.66,1.49c-0.77,0.49-1.56,0.94-2.38,1.35c-2.93,1.44-6.11,2.28-9.36,2.48l67.5,79.82l117.75,28.37c3.23-2.44,5.79-5.64,7.47-9.32L331.49,375.67z"/>
                    <path fill="#000000" opacity="0.05" d="M343.52,368.9l-14.68,8.25c-0.77,0.49-1.56,0.94-2.38,1.35c-2.93,1.44-6.11,2.28-9.36,2.48l31.62,87.19l153.66,20.97c6.05-4.54,9.62-11.67,9.62-19.24v-2.61L343.52,368.9z"/>
                    <path fill="#28A8EA" d="M143.96,494.14h343.46c5.29,0.03,10.44-1.64,14.7-4.76L307.2,375.2c-0.82-0.41-1.61-0.87-2.38-1.37l-179.8-102.61h-0.08l-5.87-3.31v201.3C119.06,482.96,130.2,494.13,143.96,494.14C143.96,494.14,143.96,494.14,143.96,494.14z"/>
                    <path fill="#000000" opacity="0.1" d="M285.77,134.94v253.98c-0.02,8.9-5.44,16.91-13.69,20.24c-2.56,1.1-5.31,1.67-8.1,1.67H119.07v-285.8h23.81v-11.91h121.09C276.01,113.16,285.74,122.91,285.77,134.94z"/>
                    <path fill="#000000" opacity="0.2" d="M273.86,146.85v253.98c0.03,2.88-0.58,5.72-1.79,8.33c-3.31,8.15-11.21,13.5-20,13.54h-133V125.02h133c3.45-0.03,6.86,0.83,9.88,2.5C269.25,131.2,273.86,138.68,273.86,146.85z"/>
                    <path fill="#000000" opacity="0.2" d="M273.86,146.85v230.16c-0.06,12.02-9.77,21.77-21.79,21.87h-133V125.02h133c3.45-0.03,6.86,0.83,9.88,2.5C269.25,131.2,273.86,138.68,273.86,146.85z"/>
                    <path fill="#000000" opacity="0.2" d="M261.95,146.85v230.16c-0.01,12.04-9.75,21.81-21.79,21.87H119.07V125.02h121.09c12.04,0.01,21.8,9.77,21.79,21.81C261.95,146.84,261.95,146.84,261.95,146.85z"/>
                    <path fill="url(#outlook_grad2)" d="M21.83,125.02h218.3c12.05,0,21.83,9.77,21.83,21.83v218.3c0,12.05-9.77,21.83-21.83,21.83H21.83C9.77,386.98,0,377.2,0,365.15v-218.3C0,134.8,9.77,125.02,21.83,125.02z"/>
                    <path fill="#FFFFFF" d="M68.22,216.56c5.38-11.46,14.06-21.05,24.93-27.54c12.04-6.89,25.75-10.33,39.61-9.93c12.85-0.28,25.53,2.98,36.66,9.42c10.46,6.24,18.89,15.38,24.25,26.31c5.85,12.05,8.76,25.31,8.5,38.7c0.28,13.99-2.71,27.86-8.75,40.48c-5.49,11.33-14.19,20.79-25,27.23c-11.56,6.64-24.71,9.98-38.03,9.67c-13.13,0.32-26.09-2.98-37.47-9.53c-10.55-6.25-19.08-15.4-24.58-26.36c-5.88-11.87-8.83-24.99-8.6-38.23C59.5,242.91,62.4,229.16,68.22,216.56z M94.79,281.22c2.87,7.25,7.73,13.53,14.03,18.12c6.41,4.48,14.09,6.79,21.91,6.6c8.33,0.33,16.54-2.06,23.39-6.81c6.22-4.58,10.95-10.88,13.62-18.12c2.99-8.09,4.46-16.66,4.35-25.28c0.09-8.7-1.29-17.36-4.1-25.6c-2.48-7.44-7.06-14-13.19-18.88c-6.68-4.97-14.86-7.5-23.18-7.14c-7.99-0.21-15.84,2.12-22.42,6.66c-6.4,4.61-11.36,10.95-14.29,18.28c-6.5,16.79-6.54,35.4-0.1,52.21L94.79,281.22z"/>
                    <path fill="#50D9FF" d="M381.02,89.3h107.16v107.16H381.02V89.3z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-white/60">
            {authMode === 'login' && (
              <p>
                Don't have account?{' '}
                <Link
                  href="/register"
                  className="text-white hover:underline font-semibold cursor-pointer"
                >
                  Sign up
                </Link>
                {' '}or{' '}
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'bypass' }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        localStorage.setItem('gama_session', 'true');
                        if (data.user && data.user.fullName) {
                          localStorage.setItem('gama_user_name', data.user.fullName);
                        }
                        toast.success('Logged in as Guest!');
                        window.location.href = '/dashboard';
                      } else {
                        toast.error(data.error || 'Failed to bypass login');
                      }
                    } catch (e) {
                      toast.error('Could not connect to authentication service');
                    }
                  }}
                  className="text-white/70 hover:text-white hover:underline cursor-pointer"
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
                  className="text-white hover:underline font-semibold cursor-pointer"
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
                  className="text-white hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BEAUTIFUL RESET/BREATHE BANNER */}
        <div className="hidden md:block w-[52%] relative h-full">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-110"
              style={{ 
                backgroundImage: `url('/auth-bg.jpg?v=2')`
              }}
            />
          {/* Dark gradient overlay to match image vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-[black] via-transparent to-transparent opacity-80" />
        </div>
      </div>
    </div>
  );
}
