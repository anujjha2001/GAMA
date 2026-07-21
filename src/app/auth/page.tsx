'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
 feature-dashboard
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
          } catch (e) {}

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
                <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
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
                        I accept the <span className="text-[#f97316] hover:underline">Terms of Service</span> and <span className="text-[#f97316] hover:underline">Privacy Policy</span>.
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
                  onClick={() => toast.success('Google login selected')}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Google SVG */}
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.324 0-6.027-2.703-6.027-6.028s2.703-6.028 6.027-6.028c1.512 0 2.89.56 3.96 1.48l3.1-3.1C18.913 2.827 15.827 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.36 0 9.8-3.84 9.8-10.5 0-.64-.08-1.24-.2-1.715H12.24z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Facebook login selected')}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Facebook SVG */}
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Steam login selected')}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {/* Steam SVG Icon */}
                  <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.018-.01.036-.02.05-.035l4.312-5.18c.677.24 1.41.375 2.183.375 3.313 0 6-2.69 6-6s-2.687-6-6-6-6 2.69-6 6c0 .762.138 1.488.375 2.158l-5.19 4.316a11.9 11.9 0 0 1-.935-4.814c0-5.91 4.793-10.7 10.7-10.7s10.7 4.79 10.7 10.7-4.79 10.7-10.7 10.7c-.504 0-1.002-.037-1.492-.108l.006-.002zm1.25 15.453c-1.795 0-3.25-1.455-3.25-3.25s1.455-3.25 3.25-3.25 3.25 1.455 3.25 3.25-1.455 3.25-3.25 3.25zm0-5c-.966 0-1.75.784-1.75 1.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75-.784-1.75-1.75-1.75z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.success('Apple login selected')}
                  className="w-12 h-11 bg-[black] hover:bg-[#111] border border-white/5 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
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
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/auth.png')`
            }}
          />
          {/* Dark gradient overlay to match image vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-[black] via-transparent to-transparent opacity-80" />
        </div>


export default function AuthPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Redirecting to login portal...</p>
develop
      </div>
    </div>
  );
}
