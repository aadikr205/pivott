import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Check, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time password validation criteria
  const hasMinLength = newPassword.length >= 8;
  const startsWithCapital = /^[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword);
  const allCriteriaMet = hasMinLength && startsWithCapital && hasNumber && hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!allCriteriaMet) {
      setErrorMessage('New password does not meet all the security requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMessage(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div 
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 animate-scale-up"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                <p className="text-xs text-slate-500">Update your account security credential</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fadeIn">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">{errorMessage}</span>
                {errorMessage.toLowerCase().includes('already exists') && (
                  <span className="text-[11px] text-rose-600">
                    System security rule: Har student ka password unique hona zaroori hai. Please choose another combination.
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create unique new password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px]">
                  <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3 h-3 ${hasMinLength ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${startsWithCapital ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3 h-3 ${startsWithCapital ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span>Starts with a capital letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3 h-3 ${hasNumber ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span>Contains at least 1 number (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3 h-3 ${hasSpecial ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span>Contains at least 1 special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center space-x-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-teal-600" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !currentPassword || !allCriteriaMet || !passwordsMatch}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
