'use client';

import React, { useState } from 'react';
import { PersonalProfileInput, personalProfileSchema } from '@/lib/validation/schemas';
import { Profile } from '@/types/database';
import { User, MapPin, Briefcase, Calendar, Check, AlertCircle } from 'lucide-react';

interface PersonalProfileFormProps {
  initialData?: Profile | null;
  onSave: (data: PersonalProfileInput) => Promise<void>;
  onNext?: () => void;
  isLoading?: boolean;
}

export default function PersonalProfileForm({
  initialData,
  onSave,
  onNext,
  isLoading = false,
}: PersonalProfileFormProps) {
  const [formData, setFormData] = useState<PersonalProfileInput>({
    full_name: initialData?.full_name || '',
    age: initialData?.age || ('' as unknown as number),
    employment_type: initialData?.employment_type || 'Salaried',
    location: initialData?.location || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalProfileInput, string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[name as keyof PersonalProfileInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const validation = personalProfileSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof PersonalProfileInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PersonalProfileInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSave(validation.data);
      setSaveSuccess(true);
      if (onNext) {
        setTimeout(() => {
          onNext();
        }, 400);
      }
    } catch (err: any) {
      setErrors({ full_name: err.message || 'Failed to save personal profile.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Personal information saved successfully.</span>
        </div>
      )}

      {/* Desktop 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="full_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Full Name <span className="text-rose-500">*</span>
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
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label htmlFor="age" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Age (Years) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="age"
              name="age"
              type="number"
              min={18}
              max={65}
              required
              value={formData.age === 0 || formData.age === ('' as unknown as number) ? '' : formData.age}
              onChange={handleChange}
              placeholder="18 – 65"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.age
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.age ? (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.age}
            </p>
          ) : (
            <span className="text-[11px] text-slate-400">Eligible age range: 18 to 65 years</span>
          )}
        </div>

        {/* Employment Type */}
        <div className="space-y-2">
          <label htmlFor="employment_type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Employment Status <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <select
              id="employment_type"
              name="employment_type"
              required
              value={formData.employment_type}
              onChange={handleChange}
              className={`w-full pl-10 pr-8 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                errors.employment_type
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            >
              <option value="Salaried">Salaried (Full-time / Corporate / Govt)</option>
              <option value="Self-employed">Self-employed / Business Owner / Professional</option>
              <option value="Student">Student (Education Loan / Co-borrower)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-xs">▼</span>
            </div>
          </div>
          {errors.employment_type && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.employment_type}
            </p>
          )}
        </div>

        {/* Location / City */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Current City / Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Pune, Maharashtra"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.location
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.location && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.location}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Profile...
            </span>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </form>
  );
}
