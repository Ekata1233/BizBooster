'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProvider } from '@/context/ProviderContext';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import { Check, ArrowRightIcon, Clock, ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthContext } from '@/context/AuthContext';

/* ------------------------------------------------------------------ /
/ VISUAL STEPPER                                                    /
/ ------------------------------------------------------------------ */
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
    { step: 1, label: 'Registration', done: activeStep > 1 },
    { step: 2, label: 'Store Info', done: storeDone },
    { step: 3, label: 'KYC Uploads', done: kycDone },
  ];

  const icon = (step: number, done: boolean, isActive: boolean) => {
    if (done) return <Check className="h-4 w-4" />;
    if (isActive) return <ArrowRightIcon className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="flex justify-between mb-8">
      {items.map(({ step, label, done }) => {
        const isActive = step === activeStep;
        const isCompleted = done;

        return (
          <div key={step} className="flex-1 text-center">
            <div
              className={`mx-auto h-10 w-10 rounded-full flex items-center justify-center
                ${isCompleted ? 'bg-green-600 text-white' :
                  isActive ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-700'}`}
            >
              {icon(step, isCompleted, isActive)}
            </div>
            <p className={`mt-2 text-sm ${isCompleted ? 'text-green-700' :
              isActive ? 'text-blue-700' : 'text-gray-500'}`}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ /
/ PAGE                                                               /
/ ------------------------------------------------------------------ */

// Validation functions
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || "Invalid email address";
};

const validatePhone = (phone: string) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone) || "Enter a valid 10-digit phone number";
};

const validateRequired = (value: string) => {
  return !!value || "This field is required";
};

const validateMinLength = (value: string, min: number) => {
  return value.length >= min || `Must be at least ${min} characters`;
};

const validatePasswordMatch = (password: string, confirmPassword: string) => {
  return password === confirmPassword || "Passwords do not match";
};

const validateFile = (files: FileList | null, required: boolean = false) => {
  if (required && (!files || files.length === 0)) {
    return "This file is required";
  }
  return true;
};

export default function ProviderOnboardingPage() {
  const {
    provider,
    loading,
    error,
    registerProvider,
    updateStoreInfo,
    updateKycInfo,
  } = useProvider();

  const router = useRouter();
  const { providerDetails } = useAuthContext();

  const regForm = useForm();
  const storeForm = useForm();
  const kycForm = useForm();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const providerId = providerDetails?._id as string | undefined;

  // Auto-navigate to first incomplete step
  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setActiveStep(1);
        return;
      }

      try {
        const res = await axios.get(`https://biz-booster.vercel.app/api/provider/${providerId}`);
        const p = res.data;

        if (!p) {
          setActiveStep(1);
          return;
        }

        if (!p.step1Completed) {
          setActiveStep(1);
        } else if (p.step1Completed && !p.storeInfoCompleted) {
          setActiveStep(2);
        } else if (p.step1Completed && p.storeInfoCompleted && !p.kycCompleted) {
          setActiveStep(3);
        } else {
          setActiveStep(3);
        }
      } catch (err) {
        console.error('Failed to fetch provider:', err);
        setActiveStep(1);
      }
    };

    fetchProvider();
  }, [providerId]);

  const onRegister = async (data: any) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
      await registerProvider(fd);
      setActiveStep(2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      if (
        error.response?.data?.error?.includes("already registered") ||
        error.response?.data?.error?.includes("already exists")
      ) {
        setApiError("Email or phone number is already registered");
      } else {
        setApiError("Registration failed. Please try again.");
      }
    }
  };

  const onStoreSave = async (data: any) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'logo' || k === 'cover') {
          // @ts-ignore
          if (v && v[0]) fd.append(k, v[0]);
        } else {
          fd.append(k, v as string);
        }
      });
      await updateStoreInfo(fd);
      setActiveStep(3);
    } catch (err: unknown) {
      setApiError('Failed to save store information. Please try again.');
    }
  };

  const onKycSave = async (data: any) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        // @ts-ignore
        if (v && v.length > 0) {
          // @ts-ignore
          Array.from(v).forEach((file) => fd.append(k, file));
        }
      });
      await updateKycInfo(fd);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: unknown) {
      setApiError('Failed to upload KYC documents. Please try again.');
    }
  };

  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      setApiError(null);
    }
  };

  const storeDone = !!provider?.storeInfoCompleted;
  const kycDone = !!provider?.kycCompleted;

  if (loading && !provider) return <p className="py-10 text-center">Loading…</p>;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar mb-10">
      <div className="flex flex-col justify-center flex-1 w-full max-w-6xl mx-auto px-6">
        <div>
          <section className="mx-auto max-w-5xl px-8 py-5 mb-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="flex justify-center py-5">
              <div className="text-center">
                <h1 className="font-bold text-gray-800 text-4xl md:text-5xl dark:text-white/90 mb-4">
                  Sign Up
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Create your account to get started 🚀
                </p>
                <div className="mt-6 w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
              </div>
            </div>
            <Stepper storeDone={storeDone} kycDone={kycDone} activeStep={activeStep} />
            {error && <p className="text-red-500 text-center text-md mt-2">{error}</p>}

            {apiError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-red-800">
                {apiError}
              </div>
            )}

            {/* ---------------- STEP 1 ---------------- */}
            {activeStep === 1 && (
              <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-6">Step 1 • Registration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...regForm.register("fullName", {
                        required: "Full Name is required",
                        validate: (value) => validateMinLength(value, 3)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {regForm.formState.errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.fullName.message as string}
                      </p>
                    )}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...regForm.register("email", {
                        required: "Email is required",
                        validate: validateEmail
                      })}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {regForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.email.message as string}
                      </p>
                    )}
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">
                      Phone No <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...regForm.register("phoneNo", {
                        required: "Phone number is required",
                        validate: validatePhone
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {regForm.formState.errors.phoneNo && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.phoneNo.message as string}
                      </p>
                    )}
                  </div>
                  {/* Password */}
                  <div className="relative">
                    <label className="block mb-1 font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...regForm.register("password", {
                        required: "Password is required",
                        validate: (value) => validateMinLength(value, 6)
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
                    </button>
                    {regForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.password.message as string}
                      </p>
                    )}
                  </div>
                  {/* Confirm Password */}
                  <div className="relative">
                    <label className="block mb-1 font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...regForm.register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) => validatePasswordMatch(regForm.getValues("password"), value)
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                    >
                      {showConfirmPassword ? <EyeCloseIcon /> : <EyeIcon />}
                    </button>
                    {regForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.confirmPassword.message as string}
                      </p>
                    )}
                  </div>
                </div>
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
                <form onSubmit={storeForm.handleSubmit(onStoreSave)} className="space-y-8">
                  <h2 className="text-xl font-semibold text-blue-700 mb-6">Step 2 • Store Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Store Name */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Store Name</label>
                      <input
                        {...storeForm.register('storeName', {
                          required: "Store Name is required"
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storeName && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storeName.message as string}
                        </p>
                      )}
                    </div>
                    {/* Store Phone */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Store Phone</label>
                      <input
                        {...storeForm.register('storePhone', {
                          required: "Store Phone is required",
                          validate: validatePhone
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storePhone && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storePhone.message as string}
                        </p>
                      )}
                    </div>
                    {/* Store Email */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Store Email</label>
                      <input
                        {...storeForm.register('storeEmail', {
                          required: "Store Email is required",
                          validate: validateEmail
                        })}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storeEmail && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storeEmail.message as string}
                        </p>
                      )}
                    </div>
                    {/* Address */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Address</label>
                      <input
                        {...storeForm.register('address', {
                          required: "Address is required"
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.address.message as string}
                        </p>
                      )}
                    </div>
                    {/* City */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">City</label>
                      <input
                        {...storeForm.register('city', {
                          required: "City is required"
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.city.message as string}
                        </p>
                      )}
                    </div>
                    {/* State */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">State</label>
                      <input
                        {...storeForm.register('state', {
                          required: "State is required"
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.state.message as string}
                        </p>
                      )}
                    </div>
                    {/* Country */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Country</label>
                      <input
                        {...storeForm.register('country', {
                          required: "Country is required"
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.country.message as string}
                        </p>
                      )}
                    </div>
                    {/* Logo */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Logo</label>
                      <input
                        {...storeForm.register('logo')}
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-lg file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-blue-50 file:text-blue-700
                                   hover:file:bg-blue-100"
                      />
                    </div>
                    {/* Cover */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Cover</label>
                      <input
                        {...storeForm.register('cover')}
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-lg file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-blue-50 file:text-blue-700
                                   hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="px-6 py-3 rounded text-white font-semibold bg-gray-500 disabled:opacity-60"
                      disabled={loading}
                    >
                      <ArrowLeftIcon className="h-4 w-4 inline-block mr-2" /> Back
                    </button>
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
                  <form onSubmit={kycForm.handleSubmit(onKycSave)} className="space-y-8">
                    <h2 className="text-xl font-semibold text-blue-700 mb-6">Step 3 • KYC Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Aadhaar */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Aadhaar (front and back) <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register('aadhaarCard', {
                            validate: (files) => validateFile(files, true)
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />
                        {kycForm.formState.errors.aadhaarCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.aadhaarCard.message as string}
                          </p>
                        )}
                      </div>
                      {/* PAN */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          PAN Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register('panCard', {
                            validate: (files) => validateFile(files, true)
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />
                        {kycForm.formState.errors.panCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.panCard.message as string}
                          </p>
                        )}
                      </div>
                      {/* Store Docs */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">Store Docs</label>
                        <input
                          {...kycForm.register('storeDocument')}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />
                      </div>
                      {/* GST Certificates */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">GST Certificates</label>
                        <input
                          {...kycForm.register('GST')}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />
                      </div>
                      {/* Other Docs */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">Other Docs</label>
                        <input
                          {...kycForm.register('other')}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-blue-50 file:text-blue-700
                                     hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="px-6 py-3 rounded text-white font-semibold bg-gray-500 disabled:opacity-60"
                        disabled={loading}
                      >
                        <ArrowLeftIcon className="h-4 w-4 inline-block mr-2" /> Back
                      </button>
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
          </section>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';