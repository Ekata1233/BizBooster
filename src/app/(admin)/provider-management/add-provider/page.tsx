/*  src/app/(provider-portal)/page.tsx  */
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useProvider } from '@/context/ProviderContext';

/* ------------------------------------------------------------------ */
/*  VISUAL STEPPER                                                    */
/* ------------------------------------------------------------------ */
function Stepper({ storeDone, kycDone }: { storeDone: boolean; kycDone: boolean }) {
  const steps = [
    { label: 'Registration', done: true },
    { label: 'Store Info',   done: storeDone },
    { label: 'KYC Uploads',  done: kycDone },
  ];

  return (
    <ol className="mb-10 flex items-center justify-between gap-4">
      {steps.map(({ label, done }, i) => (
        <li key={label} className="flex flex-1 items-center">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium
              ${done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}
          >
            {i + 1}
          </span>
          <span className="ml-2 text-sm">
            {label}{!done && i > 0 && ' — Pending'}
          </span>
          {i < steps.length - 1 && (
            <span className="mx-2 flex-1 border-t border-gray-300" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */
export default function ProviderOnboardingPage() {
  const {
    provider,
    loading,
    error,
    registerProvider,
    updateStoreInfo,
    updateKycInfo,
  } = useProvider();

  /* --- React-Hook-Form instances --- */
  const regForm   = useForm();
  const storeForm = useForm();
  const kycForm   = useForm();

  /* --- submit handlers --- */
  const onRegister = async (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
    await registerProvider(fd);
    regForm.reset();
  };

  const onStoreSave = async (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as any));
    await updateStoreInfo(fd);
    storeForm.reset();
  };

  const onKycSave = async (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((f) => fd.append(k, f));
      else fd.append(k, v as any);
    });
    await updateKycInfo(fd);
    kycForm.reset();
  };

  /* --- derived step flags --- */
  const storeDone = !!provider?.storeInfoCompleted;
  const kycDone   = !!provider?.kycCompleted;

  /* --- RENDER --- */
  if (loading && !provider) return <p className="py-10 text-center">Loading…</p>;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <Stepper storeDone={storeDone} kycDone={kycDone} />

      {/* ---------------- STEP 1 ---------------- */}
      {!provider && (
        <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1 • Registration</h2>

          <input {...regForm.register('fullName')} required placeholder="Full Name" />
          <input {...regForm.register('email')}    required placeholder="Email" type="email" />
          <input {...regForm.register('phoneNo')}  required placeholder="Phone No" />
          <input {...regForm.register('password')} required placeholder="Password" type="password" />
          <input {...regForm.register('confirmPassword')} required placeholder="Confirm Password" type="password" />

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Register'}
          </button>
        </form>
      )}

      {/* after registration is done show banner, hide step-1 form */}
      {provider && !storeDone && (
        <p className="mb-8 rounded-lg bg-emerald-50 p-4 text-center text-emerald-800">
          ✅ Registration completed. Please fill in your Store Information next.
        </p>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {provider && !storeDone && (
        <form onSubmit={storeForm.handleSubmit(onStoreSave)} className="space-y-4">
          <h2 className="text-lg font-semibold">Step 2 • Store Information</h2>

          <input {...storeForm.register('storeName')} placeholder="Store Name" />
          <input {...storeForm.register('storePhone')} placeholder="Store Phone" />
          <input {...storeForm.register('storeEmail')} type="email" placeholder="Store Email" />
          <input {...storeForm.register('address')} placeholder="Address" />
          <input {...storeForm.register('city')} placeholder="City" />
          <input {...storeForm.register('state')} placeholder="State" />
          <input {...storeForm.register('country')} placeholder="Country" />

          <label className="block">
            Logo <input {...storeForm.register('logo')} type="file" accept="image/*" />
          </label>
          <label className="block">
            Cover <input {...storeForm.register('cover')} type="file" accept="image/*" />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Store Info'}
          </button>
        </form>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {provider && storeDone && !kycDone && (
        <form onSubmit={kycForm.handleSubmit(onKycSave)} className="space-y-4">
          <h2 className="text-lg font-semibold">Step 3 • KYC Documents</h2>

          <label className="block">
            Aadhaar (up to 2)
            <input {...kycForm.register('aadhaarCard')} type="file" multiple accept="image/*,application/pdf" />
          </label>
          <label className="block">
            PAN Card
            <input {...kycForm.register('panCard')} type="file" multiple accept="image/*,application/pdf" />
          </label>
          <label className="block">
            Store Docs
            <input {...kycForm.register('storeDocument')} type="file" multiple accept="image/*,application/pdf" />
          </label>
          <label className="block">
            GST Certificates
            <input {...kycForm.register('GST')} type="file" multiple accept="image/*,application/pdf" />
          </label>
          <label className="block">
            Other Docs
            <input {...kycForm.register('other')} type="file" multiple accept="image/*,application/pdf" />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Uploading…' : 'Submit KYC'}
          </button>
        </form>
      )}

      {/* ---------------- DONE ---------------- */}
      {provider && storeDone && kycDone && (
        <p className="mt-10 rounded-lg bg-emerald-50 p-6 text-center text-emerald-800">
          🎉 All steps completed — your account is under review. We’ll notify
          you once everything is verified.
        </p>
      )}
    </section>
  );
}
