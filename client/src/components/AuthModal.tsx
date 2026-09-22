import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, Check, X, ShieldCheck, RefreshCw, KeyRound, ArrowLeft, HelpCircle } from 'lucide-react';
import { api, setToken, User } from '../api/client';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

type AuthViewMode = 'login' | 'signup' | 'otp' | 'forgot_email' | 'forgot_reset';

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification state (for Signup and Forgot Password)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Forgot password specific fields
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password validation rules (for Signup)
  const passwordRules = {
    length: password.length >= 8,
    startsWithUpper: /^[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  // Password validation rules (for Forgot Password)
  const forgotPasswordRules = {
    length: forgotNewPassword.length >= 8,
    startsWithUpper: /^[A-Z]/.test(forgotNewPassword),
    hasNumber: /\d/.test(forgotNewPassword),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword)
  };
  const isForgotPasswordValid = Object.values(forgotPasswordRules).every(Boolean);

  // Resend countdown timer
  useEffect(() => {
    let timer: any = null;
    if ((viewMode === 'otp' || viewMode === 'forgot_reset') && resendCooldown > 0) {
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
  }, [viewMode, resendCooldown]);

  // Focus first OTP input when opening OTP steps
  useEffect(() => {
    if (viewMode === 'otp' || viewMode === 'forgot_reset') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [viewMode]);

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

  // 1. Submit Login or Signup
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (viewMode === 'login') {
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
    } else if (viewMode === 'signup') {
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

        await api.sendSignupOtp(payload);
        setViewMode('otp');
        setResendCooldown(45);
        setCanResend(false);
        setAttemptsRemaining(5);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(`A 6-digit verification code has been sent to ${email}. Please check your email inbox.`);
      } catch (err: any) {
        setError(err.message || 'Failed to send verification email. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Verify Signup OTP
  const handleVerifySignupOtp = async (e?: React.FormEvent) => {
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

  // 3. Resend Signup OTP
  const handleResendSignupOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError(null);
    try {
      await api.resendSignupOtp({ email });
      setResendCooldown(45);
      setCanResend(false);
      setAttemptsRemaining(5);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`A fresh 6-digit verification code has been sent to ${email}. Check your email.`);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Request Forgot Password OTP
  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.forgotPasswordSendOtp({ email });
      setViewMode('forgot_reset');
      setResendCooldown(45);
      setCanResend(false);
      setAttemptsRemaining(5);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`A 6-digit password reset code has been sent to ${email}. Check your email.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify & Reset Password
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the reset code.');
      return;
    }

    if (!isForgotPasswordValid) {
      setError('Please ensure your new password satisfies all 4 security criteria.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.forgotPasswordVerifyAndReset({
        email,
        otp: fullOtp,
        new_password: forgotNewPassword,
        confirm_password: forgotConfirmPassword
      });

      // Reset successful! Redirect to login view with success banner
      setViewMode('login');
      setPassword(forgotNewPassword);
      setSuccessMsg('Password has been successfully updated! Please sign in with your new password.');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Quick 1-Click Demo Explore
  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    const demoTimestamp = Date.now();
    const demoEmail = `demo_${demoTimestamp}@pivott.app`;
    const demoPassword = `Demo#${demoTimestamp}!`;
    try {
      const res = await api.signup({
        name: 'Demo Student',
        email: demoEmail,
        password: demoPassword,
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

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: SIGNUP OTP VERIFICATION (NO OTP DISPLAYED ON SCREEN)  */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'otp' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setViewMode('signup');
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
                We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>. Please check your Gmail/email inbox.
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

            {/* Email-Only Notice (No on-screen OTP code) */}
            <div className="mb-5 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-900 flex items-start space-x-2.5">
              <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-teal-950">Email Verification Active</p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Code sent to <strong>{email}</strong>. Open your Gmail or email app and enter the 6 digits below.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifySignupOtp} className="space-y-5">
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
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendSignupOtp}
                className={`text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  canResend
                    ? 'text-indigo-600 hover:text-indigo-800'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {canResend
                    ? 'Resend Verification Code'
                    : `Resend code in ${resendCooldown}s`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: FORGOT PASSWORD - STEP 1 (ENTER EMAIL)                */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'forgot_email' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setViewMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
                Enter your registered Gmail or email ID. We'll send a 6-digit OTP to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSendForgotPasswordOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: FORGOT PASSWORD - STEP 2 (OTP + NEW/CONFIRM PASSWORD) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'forgot_reset' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setViewMode('forgot_email');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{email}</span> and your new password.
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

            <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                  Enter 6-digit Reset Code
                </label>
                <div className="flex justify-between items-center gap-1.5 max-w-xs mx-auto">
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
                      className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Policy Live Checklist */}
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[10px]">
                  <div className={`flex items-center space-x-1.5 ${forgotPasswordRules.length ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {forgotPasswordRules.length ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-0.5 mr-0.5" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${forgotPasswordRules.startsWithUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {forgotPasswordRules.startsWithUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-0.5 mr-0.5" />}
                    <span>Starts with uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${forgotPasswordRules.hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {forgotPasswordRules.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-0.5 mr-0.5" />}
                    <span>Contains at least one number</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${forgotPasswordRules.hasSymbol ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {forgotPasswordRules.hasSymbol ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-0.5 mr-0.5" />}
                    <span>Contains special symbol (@, #, $, etc.)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    required
                    value={forgotConfirmPassword}
                    onChange={e => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6 || !isForgotPasswordValid || forgotNewPassword !== forgotConfirmPassword}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Resetting...' : 'Reset Password & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: MAIN FORM (LOGIN OR SIGNUP)                           */}
        {/* ------------------------------------------------------------- */}
        {(viewMode === 'login' || viewMode === 'signup') && (
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-teal-500/20">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {viewMode === 'login' ? 'Welcome Back to Pivott' : 'Create Your Study Plan'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {viewMode === 'login'
                  ? 'Sign in to access your adaptive study timetable'
                  : 'Get a personalized syllabus re-balanced daily with zero fatigue'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex flex-col gap-1.5">
                <span>{error}</span>
                {error.toLowerCase().includes('already exists') && viewMode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setError(null);
                    }}
                    className="self-start text-[11px] font-bold text-indigo-700 underline hover:text-indigo-900 cursor-pointer"
                  >
                    Switch to Sign In &rarr;
                  </button>
                )}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {successMsg}
              </div>
            )}

            {/* Quick Demo Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>1-Click Instant Access (Explore All Features)</span>
              </button>
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                  or {viewMode === 'login' ? 'sign in' : 'register'} with email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {viewMode === 'signup' && (
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
                  {viewMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot_email');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
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
                {viewMode === 'signup' && (
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
              {viewMode === 'signup' && (
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
                disabled={loading || (viewMode === 'signup' && (!isPasswordValid || password !== confirmPassword))}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Please wait...' : viewMode === 'login' ? 'Sign In' : 'Continue to Email Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer"
              >
                {viewMode === 'login' ? "Don't have an account? Sign up with verification" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
