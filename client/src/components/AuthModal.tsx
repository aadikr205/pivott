import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, Check, X, ShieldCheck, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { api, setToken, User } from '../api/client';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password validation rules
  const passwordRules = {
    length: password.length >= 8,
    startsWithUpper: /^[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  // Resend countdown timer
  useEffect(() => {
    let timer: any = null;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCooldown]);

  // Focus first OTP input when opening OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isLogin) {
      setLoading(true);
      try {
        const res = await api.login({ email, password });
        setToken(res.token);
        onSuccess(res.user);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Signup Flow: Enforce 4 password rules
      if (!isPasswordValid) {
        setError('Please meet all 4 password security criteria before proceeding.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const payload = {
          name,
          email,
          password,
          exam_name: 'NEET 2026',
          exam_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          max_daily_hours: 6.0,
          off_days: [0]
        };

        const res = await api.sendSignupOtp(payload);
        setStep('otp');
        setResendCooldown(res.expires_in_seconds ? Math.min(45, res.expires_in_seconds) : 45);
        setCanResend(false);
        setAttemptsRemaining(5);
        if (res.dev_otp) {
          setDevOtpHint(res.dev_otp);
        }
        setSuccessMsg(`Verification code sent to ${email}`);
      } catch (err: any) {
        setError(err.message || 'Failed to send verification email. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    // Handle pasting a full 6-digit code
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, '').slice(0, 6);
      if (cleaned) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIdx = Math.min(cleaned.length, 5);
        otpInputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const char = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifySignupOtp({ email, otp: fullOtp });
      setToken(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
      setAttemptsRemaining(prev => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.resendSignupOtp({ email });
      setResendCooldown(45);
      setCanResend(false);
      setAttemptsRemaining(5);
      setOtpDigits(['', '', '', '', '', '']);
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
      setSuccessMsg('A new 6-digit code has been dispatched to your email.');
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    const demoEmail = `demo_${Date.now()}@pivott.app`;
    try {
      const res = await api.signup({
        name: 'Demo Student',
        email: demoEmail,
        password: 'Password123!',
        exam_name: 'NEET 2026',
        exam_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_daily_hours: 6.0,
        off_days: [0]
      });
      setToken(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden my-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to edit details
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-teal-500/20">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verify Your Email</h2>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
                We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {successMsg}
              </div>
            )}

            {devOtpHint && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">Dev/Local Mode OTP:</span> <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest text-amber-900">{devOtpHint}</code>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devOtpHint.split('').slice(0, 6);
                    setOtpDigits(digits);
                  }}
                  className="ml-2 text-indigo-700 font-bold underline hover:text-indigo-900"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                  Enter 6-digit Code
                </label>
                <div className="flex justify-between items-center gap-2 max-w-xs mx-auto">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800"
                    />
                  ))}
                </div>
                <div className="text-center mt-2 text-[11px] text-slate-400">
                  {attemptsRemaining < 5 && (
                    <span className="text-rose-600 font-medium">{attemptsRemaining} attempts remaining</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-teal-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Launch Pivott'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {canResend ? 'Resend code' : `Resend code in ${resendCooldown}s`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: FORM (LOGIN OR SIGNUP) */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-teal-500/20">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isLogin ? 'Welcome Back to Pivott' : 'Get Started with Pivott'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your syllabus, re-balanced daily — never overwhelmed, always on track.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* 1-Click Direct Demo Access at Top */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>1-Click Instant Access (Explore All Features)</span>
              </button>
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                  or {isLogin ? 'sign in' : 'register'} with email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Policy Live Checklist (Signup only) */}
                {!isLogin && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600 mb-1">Password Requirements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      <div className={`flex items-center space-x-1.5 ${passwordRules.length ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordRules.length ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passwordRules.startsWithUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordRules.startsWithUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                        <span>Starts with capital letter</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passwordRules.hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordRules.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                        <span>At least one number</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${passwordRules.hasSymbol ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordRules.hasSymbol ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                        <span>At least one special symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && (!isPasswordValid || password !== confirmPassword))}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Continue to Email Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign up with verification" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
