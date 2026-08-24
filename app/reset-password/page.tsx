'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validation/schemas';
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ResetPasswordInput>({
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordInput | 'general', string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ResetPasswordInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validation = resetPasswordSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ResetPasswordInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: formData.password,
        });

        if (error) {
          setErrors({ general: error.message || 'Failed to update password.' });
          setLoading(false);
          return;
        }
      }

      router.push('/login?reset=success');
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-slate-900/10">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500">
            Choose a strong new password for your account
          </p>
        </div>

        {errors.general && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-rose-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            {errors.confirm_password && (
              <p className="text-xs font-medium text-rose-600">{errors.confirm_password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 transition-all shadow-sm hover:shadow"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating Password...
              </span>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
