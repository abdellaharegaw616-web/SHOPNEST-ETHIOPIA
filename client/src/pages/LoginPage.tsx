import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, ShoppingBag } from 'lucide-react';
import { useLoginMutation } from '../store/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { BRAND } from '@shopnest/shared';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const cleanIdentifier = emailOrPhone.trim();
      const response = await login({
        emailOrPhone: cleanIdentifier,
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
      if (Array.isArray(err?.data?.errors) && err.data.errors.length > 0) {
        const errorList = err.data.errors.map((e: any) => e.message).join(' • ');
        setErrorMessage(errorList);
      } else {
        setErrorMessage(
          err?.data?.message || 'Invalid email/phone or password. Please try again.'
        );
      }
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setEmailOrPhone(email);
    setPassword(pass);
  };


  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-[#E5E7EB] dark:border-gray-800 p-8 shadow-xs space-y-6 transition-colors">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F97316] flex items-center justify-center text-white shadow-xs">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2937] dark:text-white">Sign In to {BRAND.name}</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400">
            Manage your orders, saved wishlist, and addresses in Ethiopia
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#1F2937] dark:text-gray-200">Email or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="customer@shopnest.et or +251 9..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="font-semibold text-[#1F2937] dark:text-gray-200">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
              />
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick-fill Demo Accounts Box */}
        <div className="border-t border-[#F3F4F6] dark:border-gray-800 pt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] dark:text-gray-400">
            <UserCheck className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Quick-Fill Seeded Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@shopnest.et', 'Customer@123')}
              className="p-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800/80 hover:bg-[#FFF7ED] dark:hover:bg-gray-750 border border-[#E5E7EB] dark:border-gray-700 text-left text-[#1F2937] dark:text-white transition-colors cursor-pointer"
            >
              <span className="font-bold block">Demo Customer</span>
              <span className="text-[#6B7280] dark:text-gray-400">customer@shopnest.et</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@shopnest.et', 'AdminSecure2026!')}
              className="p-2 rounded-xl bg-[#F9FAFB] dark:bg-gray-800/80 hover:bg-[#FFF7ED] dark:hover:bg-gray-750 border border-[#E5E7EB] dark:border-gray-700 text-left text-[#1F2937] dark:text-white transition-colors cursor-pointer"
            >
              <span className="font-bold block">Demo Admin</span>
              <span className="text-[#6B7280] dark:text-gray-400">admin@shopnest.et</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center text-xs text-[#6B7280] dark:text-gray-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#F97316] hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
