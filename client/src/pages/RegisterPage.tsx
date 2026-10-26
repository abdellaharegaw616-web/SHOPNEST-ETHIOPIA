import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShoppingBag, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRegisterMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [register, { isLoading }] = useRegisterMutation();

  // Clean phone string for validation
  const cleanPhone = useMemo(() => phone.replace(/[\s\-\(\)]/g, ''), [phone]);

  // Real-time checks
  const isPhoneValid = useMemo(() => {
    if (!cleanPhone) return null;
    return ETHIOPIA_CONSTANTS.phoneRegex.test(cleanPhone);
  }, [cleanPhone]);

  const isPasswordValid = useMemo(() => {
    if (!password) return null;
    return password.length >= 6;
  }, [password]);

  const doPasswordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const isEmailFormatValid = useMemo(() => {
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors([]);

    // Client-side pre-validations
    if (name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    if (!isEmailFormatValid) {
      setErrorMessage('Please provide a valid email address (e.g., abebe@example.et).');
      return;
    }

    if (!ETHIOPIA_CONSTANTS.phoneRegex.test(cleanPhone)) {
      setErrorMessage(
        'Invalid Ethiopian phone number. Must start with 09..., +2519..., 07..., or +2517... followed by 8 digits (e.g. 0911234567 or +251911234567).'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your confirmation password.');
      return;
    }

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        password,
      }).unwrap();

      if (response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.tokens.accessToken,
          })
        );
        navigate('/account');
      }
    } catch (err: any) {
      // Unpack backend Zod validation errors or operational error messages
      if (Array.isArray(err?.data?.errors) && err.data.errors.length > 0) {
        const errorList = err.data.errors.map((e: any) => e.message);
        setValidationErrors(errorList);
        setErrorMessage('Please fix the following validation errors:');
      } else {
        setErrorMessage(
          err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          'Registration failed. Please check your details and try again.'
        );
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F97316] flex items-center justify-center text-white shadow-xs">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] dark:text-white">Create an Account</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            Join ShopNest Ethiopia for fast ordering & delivery in Addis Ababa & regions
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-rose-600 dark:text-rose-300">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
            {errorMessage.includes('already exists') && (
              <div className="pt-1">
                <Link to="/login" className="font-bold underline text-[#F97316] hover:text-[#EA580C]">
                  Click here to Sign In with your existing account →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Full Name *</label>
              {name.trim().length >= 2 && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Valid name
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abebe Bikila"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border ${
                  name && name.trim().length < 2
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-[#E5E7EB] dark:border-gray-700'
                } text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316] transition-colors`}
              />
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Email Address *</label>
              {isEmailFormatValid && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Valid email
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abebe@example.et"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border ${
                  isEmailFormatValid === false
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-[#E5E7EB] dark:border-gray-700'
                } text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316] transition-colors`}
              />
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Ethiopian Phone Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Ethiopian Phone Number *</label>
              {isPhoneValid && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Valid Ethiopian phone
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911234567 or +251 911 234567"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border ${
                  isPhoneValid === false
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-[#E5E7EB] dark:border-gray-700'
                } text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316] transition-colors`}
              />
              <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-[#6B7280] dark:text-gray-400">
              Format: 0911234567, 0711234567, or +251 9... (Ethio Telecom / Safaricom Ethiopia)
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Password (Min 6 Characters) *</label>
              {isPasswordValid && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Length OK
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border ${
                  isPasswordValid === false
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-[#E5E7EB] dark:border-gray-700'
                } text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316] transition-colors`}
              />
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Confirm Password *</label>
              {doPasswordsMatch && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </span>
              )}
              {doPasswordsMatch === false && (
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  Passwords do not match
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border ${
                  doPasswordsMatch === false
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-[#E5E7EB] dark:border-gray-700'
                } text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316] transition-colors`}
              />
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6B7280] dark:text-gray-400 border-t border-[#F3F4F6] dark:border-gray-800 pt-4">
          Already have a ShopNest account?{' '}
          <Link to="/login" className="font-bold text-[#F97316] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
