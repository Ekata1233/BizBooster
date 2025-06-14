'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProvider } from '@/context/ProviderContext';
import { Check, ArrowRightIcon, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

function Stepper({
  storeDone,
  kycDone,
  activeStep,
}: {
  storeDone: boolean;
  kycDone: boolean;
  activeStep: number;
}) {
  const items = [
    { step: 1, label: 'Registration', done: activeStep > 1 }, // Changed from 'true' to 'activeStep > 1'
    { step: 2, label: 'Store Info', done: storeDone },
    { step: 3, label: 'KYC Uploads', done: kycDone },
  ];

  const icon = (step: number, done: boolean, isActive: boolean) => {
    if (done) return <Check className="h-4 w-4" />;
    if (isActive) return <ArrowRightIcon className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="flex justify-between mb-6">
      {items.map(({ step, label, done }) => {
        const isActive = step === activeStep;
        const isCompleted = done;
        
        return (
          <div key={step} className="flex-1 text-center">
            <div
              className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center
                ${isCompleted ? 'bg-green-600 text-white' :
                  isActive ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-700'}`}
            >
              {icon(step, isCompleted, isActive)}
            </div>
            <p className={`mt-1 text-sm ${isCompleted ? 'text-green-700' :
              isActive ? 'text-blue-700' : 'text-gray-500'}`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ProviderOnboardingPage() {
  const {
    provider,
    loading,
    error,
    registerProvider,
    updateStoreInfo,
    updateKycInfo,
  } = useProvider();
  console.log("Register Provider :", provider);
  

   const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProviderId(params.get('id'));
  }, []);
  // const searchParams = useSearchParams();
  // const providerId = searchParams.get('id');

  
  const regForm = useForm();
  const storeForm = useForm();
  const kycForm = useForm();
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setActiveStep(1);
        return;
      }

      try {
        const res = await axios.get(`/api/provider/${providerId}`);
        const provider = res.data;

        if (!provider) {
          setActiveStep(1);
          return;
        }

        if (!provider.step1Completed) {
          setActiveStep(1);
        } else if (provider.step1Completed && !provider.storeInfoCompleted) {
          setActiveStep(2);
        } else if (provider.step1Completed && provider.storeInfoCompleted && !provider.kycCompleted) {
          setActiveStep(3);
        } else {
          setActiveStep(3); // All steps completed
        }
      } catch (err) {
        console.error('Failed to fetch provider:', err);
        setActiveStep(1);
      }
    };

    fetchProvider();
  }, [providerId]);

  const onRegister = async (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
    await registerProvider(fd);
    regForm.reset();
    setActiveStep(2);
  };

  const onStoreSave = async (data: any) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as any));
    await updateStoreInfo(fd);
    storeForm.reset();
    setActiveStep(3);
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

  const storeDone = !!provider?.storeInfoCompleted;
  const kycDone = !!provider?.kycCompleted;

  if (loading && !provider) return <p className="py-10 text-center">Loading…</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="border rounded-lg p-6 shadow-sm bg-white">
        <Stepper
          storeDone={storeDone}
          kycDone={kycDone}
          activeStep={activeStep}
        />

        {/* ---------------- STEP 1 ---------------- */}
        {activeStep === 1 && (
          <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Step 1 • Registration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <input
                  {...regForm.register('fullName')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  {...regForm.register('email')}
                  required
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Phone No</label>
                <input
                  {...regForm.register('phoneNo')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <input
                  {...regForm.register('password')}
                  required
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
                <input
                  {...regForm.register('confirmPassword')}
                  required
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Register'}
              </button>
            </div>
          </form>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {activeStep === 2 && (
          <>
            {provider && !storeDone && (
              <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-green-800">
                ✅ Registration completed. Please fill in your Store Information next.
              </div>
            )}
            <form onSubmit={storeForm.handleSubmit(onStoreSave)} className="space-y-6">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Step 2 • Store Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Store Name</label>
                  <input
                    {...storeForm.register('storeName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Store Phone</label>
                  <input
                    {...storeForm.register('storePhone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Store Email</label>
                  <input
                    {...storeForm.register('storeEmail')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Address</label>
                  <input
                    {...storeForm.register('address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">City</label>
                  <input
                    {...storeForm.register('city')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">State</label>
                  <input
                    {...storeForm.register('state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Country</label>
                  <input
                    {...storeForm.register('country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Logo</label>
                  <input
                    {...storeForm.register('logo')}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Cover</label>
                  <input
                    {...storeForm.register('cover')}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Saving…' : 'Save Store Info'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {activeStep === 3 && (
          <>
            {provider && storeDone && !kycDone && (
              <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-green-800">
                ✅ Store information completed. Please upload your KYC documents.
              </div>
            )}
            
            {!kycDone ? (
              <form onSubmit={kycForm.handleSubmit(onKycSave)} className="space-y-6">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Step 3 • KYC Documents</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Aadhaar (up to 2)</label>
                    <input
                      {...kycForm.register('aadhaarCard')}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">PAN Card</label>
                    <input
                      {...kycForm.register('panCard')}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Store Docs</label>
                    <input
                      {...kycForm.register('storeDocument')}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">GST Certificates</label>
                    <input
                      {...kycForm.register('GST')}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Other Docs</label>
                    <input
                      {...kycForm.register('other')}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Uploading…' : 'Submit KYC'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-20">
                <Check className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-semibold text-green-700">
                  All steps completed!
                </h2>
                <p className="text-gray-600 mt-2">
                  🎉 All steps completed — your account is under review. We'll notify
                  you once everything is verified.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';

