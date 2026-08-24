'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { signupSchema, SignupInput } from '@/lib/validation/schemas';
import { ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { upsertProfile } from '@/services/profile/profileService';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupInput>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput | 'general', string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
            },
          },
        });

        if (error) {
          setErrors({ general: error.message || 'Failed to create account.' });
          setLoading(false);
          return;
        }

        // If user is auto-signed in, pre-seed their base profile
        if (data.user) {
          try {
            await upsertProfile(data.user.id, {
              full_name: formData.full_name,
              age: 28, // initial default placeholder until updated in step 2
              employment_type: 'Salaried',
              location: 'India',
            });
          } catch {
            // Profile can be filled in profile wizard
          }
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        // Fallback for local demo mode
        const demoUser = {
          id: 'demo-user-123',
          email: formData.email,
          full_name: formData.full_name,
        };
        localStorage.setItem('loanfit_demo_user', JSON.stringify(demoUser));
        await upsertProfile('demo-user-123', {
          full_name: formData.full_name,
          age: 28,
          employment_type: 'Salaried',
          location: 'Pune',
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred during signup.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-slate-900/10">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Create Borrower Account
          </h1>
          <p className="text-xs text-slate-500">
            Establish your confidential profile to evaluate suitable loans
          </p>
        </div>

        {errors.general && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.full_name
                    ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.full_name && (
              <p className="text-xs font-medium text-rose-600">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-rose-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-rose-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.confirm_password
                    ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
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
                Creating Account...
              </span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
