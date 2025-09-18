'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProvider } from '@/context/ProviderContext';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import { Check, ArrowRightIcon, Clock, ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useZone } from '@/context/ZoneContext';
import { useModule } from '@/context/ModuleContext';

/* ------------------------------------------------------------------ */
/*  VISUAL STEPPER                                                    */
/* ------------------------------------------------------------------ */
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

  const router = useRouter();
  const { providerDetails } = useProvider();

  const regForm = useForm();
  const storeForm = useForm();
  const kycForm = useForm();
  const [activeStep, setActiveStep] = useState<number>(1);
  const { zones } = useZone();
  const { modules } = useModule();
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

  const onRegister = async (data: Record<string, FormDataEntryValue | Blob>) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
      
      await registerProvider(fd);
      setActiveStep(2);
    } catch (err: unknown) {
      const error = err as Error;

      if (
        error.message?.includes("already registered") ||
        error.message?.includes("already exists")
      ) {
        setApiError("Email or phone number is already registered");
      } else {
        setApiError("Registration failed. Please try again.");
      }
    }
  };

  const onStoreSave = async (data: Record<string, FormDataEntryValue | FileList>) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof FileList) {
          Array.from(v).forEach((file) => fd.append(k, file));
        } else {
          fd.append(k, v);
        }
      });
      
      await updateStoreInfo(fd);
      setActiveStep(3);
    } catch (err: unknown) {
      setApiError('Failed to save store information. Please try again.');
      console.log(err);
    }
  };

  const onKycSave = async (data: Record<string, FormDataEntryValue | FileList>) => {
    try {
      setApiError(null);
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof FileList) {
          Array.from(v).forEach((file) => fd.append(k, file));
        } else {
          fd.append(k, v as string);
        }
      });

      await updateKycInfo(fd);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: unknown) {
      setApiError('Failed to upload KYC documents. Please try again.');
      console.log(err);
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
                        minLength: { value: 3, message: "Name must be at least 3 characters" },
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
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
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
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit phone number",
                        },
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
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                        validate: (value) =>
                          /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                      })}
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-12 right-0 flex items-center pr-3 text-gray-500"
                    >
                      {showPassword ? <EyeCloseIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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
                        validate: (value) =>
                          value === regForm.watch("password") || "Passwords do not match",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-12 right-0 flex items-center pr-3 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeCloseIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                    {regForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.confirmPassword.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="px-10 py-3 rounded-lg text-white font-semibold bg-gradient-to-r 
                               from-blue-600 to-blue-800 shadow-md hover:shadow-lg disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Submitting…" : "Register"}
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
                      <label className="block mb-1 font-medium text-gray-700">
                        Store Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("storeName", { required: "Store Name is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storeName && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storeName.message as string}
                        </p>
                      )}
                    </div>

                    {/* Store Phone */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Store Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("storePhone", {
                          required: "Store Phone is required",
                          pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" },
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storePhone && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storePhone.message as string}
                        </p>
                      )}
                    </div>

                    {/* Store Email */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Store Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("storeEmail", {
                          required: "Store Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.storeEmail && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.storeEmail.message as string}
                        </p>
                      )}
                    </div>

                    {/* Module Dropdown */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Select Module <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...storeForm.register("moduleId", { required: "Please select a Module" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Module</option>
                        {modules?.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      {storeForm.formState.errors.moduleId && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.moduleId.message as string}
                        </p>
                      )}
                    </div>

                    {/* Zone Dropdown */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Select Zone <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...storeForm.register("zoneId", { required: "Please select a Zone" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Zone</option>
                        {zones?.map((z) => (
                          <option key={z._id} value={z._id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                      {storeForm.formState.errors.zoneId && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.zoneId.message as string}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("address", { required: "Address is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.address.message as string}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("city", { required: "City is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.city.message as string}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("state", { required: "State is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.state.message as string}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("country", { required: "Country is required" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                        {...storeForm.register("logo")}
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {/* Cover */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Cover</label>
                      <input
                        {...storeForm.register("cover")}
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="px-6 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 flex items-center"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Previous
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-md hover:shadow-lg disabled:opacity-60"
                      disabled={loading}
                    >
                      {loading ? "Saving…" : "Save Store Info"}
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
                      {/* Aadhaar - REQUIRED */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Aadhaar (up to 2) <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register("aadhaarCard", {
                            required: "Aadhaar card is required",
                          })}
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
                        {kycForm.formState.errors.aadhaarCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.aadhaarCard.message as string}
                          </p>
                        )}
                      </div>

                      {/* PAN - REQUIRED */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          PAN Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register("panCard", {
                            required: "PAN card is required",
                          })}
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
                        {kycForm.formState.errors.panCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.panCard.message as string}
                          </p>
                        )}
                      </div>

                      {/* Store Document - REQUIRED */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">
                          Store Document <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register("storeDocument", {
                            required: "Store document is required",
                          })}
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
                        {kycForm.formState.errors.storeDocument && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.storeDocument.message as string}
                          </p>
                        )}
                      </div>

                      {/* GST - Optional */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">GST Certificates</label>
                        <input
                          {...kycForm.register("GST")}
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

                      {/* Other Docs - Optional */}
                      <div>
                        <label className="block mb-1 font-medium text-gray-700">Other Docs</label>
                        <input
                          {...kycForm.register("other")}
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

                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="px-6 py-3 rounded text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 flex items-center"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Previous
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 rounded text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 disabled:opacity-60"
                        disabled={loading}
                      >
                        {loading ? "Uploading…" : "Submit KYC"}
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
                      🎉 All steps completed — your account is under review. We&apos;ll notify
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