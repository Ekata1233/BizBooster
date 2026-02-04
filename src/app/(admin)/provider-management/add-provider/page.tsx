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
/*  VALIDATION PATTERNS & CONSTANTS                                   */
/* ------------------------------------------------------------------ */
const validationPatterns = {
  fullName: /^(?!^\d+$)[a-zA-Z\s]{2,}$/, // Letters and spaces only, min 2 chars, not only numbers
  storeName: /^(?!^\d+$)[a-zA-Z0-9\s\-&.,'()]{2,}$/, // Alphanumeric with special chars, min 2 chars
  phone: /^[0-9]{10}$/, // Exactly 10 digits
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email pattern
  address: /^[a-zA-Z0-9\s\-#,./\\()&'"°]{5,}$/, // Address with min 5 chars
  city: /^[a-zA-Z\s\-']{2,}$/, // City names with letters only
  state: /^[a-zA-Z\s\-']{2,}$/, // State names with letters only
  country: /^[a-zA-Z\s\-']{2,}$/, // Country names with letters only
  password: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, 1 uppercase, 1 number, 1 special char
  pincode: /^[1-9][0-9]{5}$/, // Indian PIN code validation
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, // GSTIN format
};

const validationMessages = {
  fullName: {
    required: "Full Name is required",
    pattern: "Name must contain only letters and spaces (minimum 2 characters)",
    notOnlyNumbers: "Name cannot contain only numbers"
  },
  email: {
    required: "Email is required",
    pattern: "Please enter a valid email address"
  },
  phone: {
    required: "Phone number is required",
    pattern: "Phone number must be exactly 10 digits"
  },
  password: {
    required: "Password is required",
    pattern: "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character"
  },
  storeName: {
    required: "Store Name is required",
    pattern: "Store name must be at least 2 characters (cannot be only numbers)"
  },
  address: {
    required: "Address is required",
    minLength: "Address must be at least 5 characters"
  },
  city: {
    required: "City is required",
    pattern: "City must contain only letters (minimum 2 characters)"
  },
  state: {
    required: "State is required",
    pattern: "State must contain only letters (minimum 2 characters)"
  },
  country: {
    required: "Country is required",
    pattern: "Country must contain only letters (minimum 2 characters)"
  },
  moduleId: "Please select a module",
  zoneId: "Please select a zone",
  storePhone: {
    required: "Store phone is required",
    pattern: "Store phone must be exactly 10 digits"
  },
  storeEmail: {
    required: "Store email is required",
    pattern: "Please enter a valid store email address"
  }
};

/* ------------------------------------------------------------------ */
/*  IMAGE VALIDATION FUNCTION                                         */
/* ------------------------------------------------------------------ */
const validateImage = (file: File, maxSizeMB: number = 1, allowedTypes?: string[]): string | null => {
  const defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const types = allowedTypes || defaultAllowedTypes;
  
  if (!types.includes(file.type)) {
    return `Invalid file type. Allowed: ${types.map(t => t.split('/')[1]).join(', ')}`;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be ≤ ${maxSizeMB}MB (Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
  }

  return null;
};

const validateMultipleImages = (files: File[], maxSizeMB: number = 1, maxFiles: number = 2): string | null => {
  if (files.length > maxFiles) {
    return `Maximum ${maxFiles} files allowed`;
  }

  for (let i = 0; i < files.length; i++) {
    const error = validateImage(files[i], maxSizeMB);
    if (error) {
      return `File ${i + 1}: ${error}`;
    }
  }

  return null;
};

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

  const [logoError, setLogoError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);
  const [panError, setPanError] = useState<string | null>(null);
  const [storeDocError, setStoreDocError] = useState<string | null>(null);
  const [gstError, setGstError] = useState<string | null>(null);
  const [otherError, setOtherError] = useState<string | null>(null);

  // Auto-navigate to first incomplete step
  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setActiveStep(1);
        return;
      }

      try {
        const res = await axios.get(`https://api.fetchtrue.com/api/provider/${providerId}`);
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

  // Enhanced image validation handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoError(null);
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setLogoError(validationError);
        storeForm.setValue("logo", null as any);
        e.target.value = '';
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverError(null);
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setCoverError(validationError);
        storeForm.setValue("cover", null as any);
        e.target.value = '';
      }
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAadhaarError(null);
    
    if (files.length > 0) {
      const validationError = validateMultipleImages(files, 1, 2);
      if (validationError) {
        setAadhaarError(validationError);
        kycForm.setValue("aadhaarCard", null as any);
        e.target.value = '';
      }
    }
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPanError(null);
    
    if (files.length > 0) {
      const validationError = validateMultipleImages(files, 1, 2);
      if (validationError) {
        setPanError(validationError);
        kycForm.setValue("panCard", null as any);
        e.target.value = '';
      }
    }
  };

  const handleStoreDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setStoreDocError(null);
    
    if (files.length > 0) {
      const validationError = validateMultipleImages(files, 1, 2);
      if (validationError) {
        setStoreDocError(validationError);
        kycForm.setValue("storeDocument", null as any);
        e.target.value = '';
      }
    }
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGstError(null);
    
    if (files.length > 0) {
      const validationError = validateMultipleImages(files, 1, 3);
      if (validationError) {
        setGstError(validationError);
        kycForm.setValue("GST", null as any);
        e.target.value = '';
      }
    }
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setOtherError(null);
    
    if (files.length > 0) {
      const validationError = validateMultipleImages(files, 1, 5);
      if (validationError) {
        setOtherError(validationError);
        kycForm.setValue("other", null as any);
        e.target.value = '';
      }
    }
  };

  const onRegister = async (data: any) => {
    try {
      setApiError(null);
      
      // Client-side validation check
      const isValid = await regForm.trigger();
      if (!isValid) {
        setApiError("Please fix validation errors before submitting.");
        return;
      }

      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
      
      await registerProvider(fd);
      setActiveStep(2);
    } catch (err: any) {
      if (err?.response?.data?.error?.includes("already registered") ||
          err?.message?.includes("already exists")) {
        setApiError("Email or phone number is already registered");
      } else {
        setApiError(err?.response?.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  const onStoreSave = async (data: any) => {
    try {
      setApiError(null);
      
      // Client-side validation check
      const isValid = await storeForm.trigger();
      if (!isValid) {
        setApiError("Please fix validation errors before submitting.");
        return;
      }

      if (logoError || coverError) {
        setApiError('Please fix image validation errors before submitting.');
        return;
      }

      const fd = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => fd.append(key, file));
        } else if (key === "tags" && typeof value === "string") {
          const tagsArray = value
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);
          if (tagsArray.length > 0) {
            fd.append("tags", JSON.stringify(tagsArray));
          }
        } else if (typeof value === "number") {
          fd.append(key, String(value));
        } else if (value !== null && value !== undefined) {
          fd.append(key, String(value));
        }
      });

      await updateStoreInfo(fd);
      setActiveStep(3);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to save store information. Please try again.');
      console.error('Store save error:', err);
    }
  };

  const onKycSave = async (data: any) => {
    try {
      setApiError(null);
      
      // Client-side validation check
      const isValid = await kycForm.trigger();
      if (!isValid) {
        setApiError("Please fix validation errors before submitting.");
        return;
      }

      if (aadhaarError || panError || storeDocError || gstError || otherError) {
        setApiError('Please fix document validation errors before submitting.');
        return;
      }

      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof FileList) {
          Array.from(v).forEach((file) => fd.append(k, file));
        } else if (v !== null && v !== undefined) {
          fd.append(k, v as string);
        }
      });

      await updateKycInfo(fd);
      
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to upload KYC documents. Please try again.');
      console.error('KYC save error:', err);
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

            {/* ---------------- STEP 1 - REGISTRATION ---------------- */}
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
                        required: validationMessages.fullName.required,
                        minLength: { value: 2, message: "Name must be at least 2 characters" },
                        pattern: {
                          value: validationPatterns.fullName,
                          message: validationMessages.fullName.pattern
                        },
                        validate: (value) => !/^\d+$/.test(value.trim()) || validationMessages.fullName.notOnlyNumbers
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
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
                        required: validationMessages.email.required,
                        pattern: {
                          value: validationPatterns.email,
                          message: validationMessages.email.pattern
                        }
                      })}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example@domain.com"
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
                        required: validationMessages.phone.required,
                        pattern: {
                          value: validationPatterns.phone,
                          message: validationMessages.phone.pattern
                        },
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10-digit mobile number"
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
                        required: validationMessages.password.required,
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                        pattern: {
                          value: validationPatterns.password,
                          message: validationMessages.password.pattern
                        }
                      })}
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 text-gray-500"
                    >
                      {showPassword ? <EyeCloseIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                    {regForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {regForm.formState.errors.password.message as string}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must contain: uppercase, number, special character
                    </p>
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
                          value === regForm.watch("password") || "Passwords do not match"
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 text-gray-500"
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
                    className="px-10 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
                    // disabled={loading || !regForm.formState.isValid}
                  >
                    {loading ? "Submitting…" : "Register"}
                  </button>
                </div>
              </form>
            )}

            {/* ---------------- STEP 2 - STORE INFORMATION ---------------- */}
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
                        {...storeForm.register("storeName", { 
                          required: validationMessages.storeName.required,
                          minLength: { value: 2, message: "Store name must be at least 2 characters" },
                          pattern: {
                            value: validationPatterns.storeName,
                            message: validationMessages.storeName.pattern
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter store name"
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
                          required: validationMessages.storePhone.required,
                          pattern: { 
                            value: validationPatterns.phone, 
                            message: validationMessages.storePhone.pattern 
                          },
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Store contact number"
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
                          required: validationMessages.storeEmail.required,
                          pattern: {
                            value: validationPatterns.email,
                            message: validationMessages.storeEmail.pattern,
                          },
                        })}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="store@example.com"
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
                        {...storeForm.register("moduleId", { 
                          required: validationMessages.moduleId 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        {...storeForm.register("zoneId", { 
                          required: validationMessages.zoneId 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        {...storeForm.register("address", { 
                          required: validationMessages.address.required,
                          minLength: { value: 5, message: validationMessages.address.minLength },
                          pattern: {
                            value: validationPatterns.address,
                            message: "Address contains invalid characters"
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full address"
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
                        {...storeForm.register("city", { 
                          required: validationMessages.city.required,
                          minLength: { value: 2, message: "City must be at least 2 characters" },
                          pattern: {
                            value: validationPatterns.city,
                            message: validationMessages.city.pattern
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City name"
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
                        {...storeForm.register("state", { 
                          required: validationMessages.state.required,
                          minLength: { value: 2, message: "State must be at least 2 characters" },
                          pattern: {
                            value: validationPatterns.state,
                            message: validationMessages.state.pattern
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State name"
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
                        {...storeForm.register("country", { 
                          required: validationMessages.country.required,
                          minLength: { value: 2, message: "Country must be at least 2 characters" },
                          pattern: {
                            value: validationPatterns.country,
                            message: validationMessages.country.pattern
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Country name"
                      />
                      {storeForm.formState.errors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.country.message as string}
                        </p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...storeForm.register("pincode", {
                          required: "Pincode is required",
                          pattern: {
                            value: validationPatterns.pincode,
                            message: "Please enter a valid 6-digit pincode"
                          },
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="6-digit pincode"
                      />
                      {storeForm.formState.errors.pincode && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.pincode.message as string}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Tags <span className="text-gray-400">(comma separated)</span>
                      </label>
                      <input
                        {...storeForm.register("tags", {
                          validate: (value) => {
                            if (!value) return true;
                            const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                            if (tags.length > 10) {
                              return "Maximum 10 tags allowed";
                            }
                            for (const tag of tags) {
                              if (tag.length > 20) {
                                return "Each tag must be less than 20 characters";
                              }
                            }
                            return true;
                          }
                        })}
                        placeholder="e.g., On Time, Trusted, Reliable"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {storeForm.formState.errors.tags && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.tags.message as string}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Separate with commas (max 10 tags)</p>
                    </div>

                    {/* Total Projects */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Total Projects <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={99999}
                        {...storeForm.register("totalProjects", {
                          required: "Total Projects is required",
                          valueAsNumber: true,
                          min: { value: 0, message: "Value cannot be negative" },
                          max: { value: 99999, message: "Value is too large" }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      {storeForm.formState.errors.totalProjects && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.totalProjects.message as string}
                        </p>
                      )}
                    </div>

                    {/* Total Experience */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">
                        Total Experience (Years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        {...storeForm.register("totalExperience", {
                          required: "Total Experience is required",
                          valueAsNumber: true,
                          min: { value: 0, message: "Value cannot be negative" },
                          max: { value: 100, message: "Value cannot exceed 100 years" }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.0"
                      />
                      {storeForm.formState.errors.totalExperience && (
                        <p className="text-red-500 text-sm mt-1">
                          {storeForm.formState.errors.totalExperience.message as string}
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
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {logoError && (
                        <p className="text-red-500 text-xs mt-1">{logoError}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
                    </div>

                    {/* Cover */}
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Cover Image</label>
                      <input
                        {...storeForm.register("cover")}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {coverError && (
                        <p className="text-red-500 text-xs mt-1">{coverError}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="px-6 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 flex items-center transition-all duration-200"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Previous
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
                      // disabled={loading || !storeForm.formState.isValid || !!logoError || !!coverError}
                    >
                      {loading ? "Saving…" : "Save Store Info"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ---------------- STEP 3 - KYC UPLOADS ---------------- */}
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
                    <p className="text-gray-600 mb-6">
                      Upload clear, legible documents. All required documents must be in JPEG, JPG, PNG, WEBP, GIF, or PDF format (max 1MB each).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Aadhaar - REQUIRED */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 font-medium text-gray-700">
                          Aadhaar Card <span className="text-red-500">*</span>
                          <span className="text-xs text-gray-500 block font-normal">(Front & Back)</span>
                        </label>
                        <input
                          {...kycForm.register("aadhaarCard", {
                            required: "Aadhaar card is required",
                            validate: (files) => {
                              if (files && files.length > 0) {
                                const fileList = Array.from(files);
                                const error = validateMultipleImages(fileList, 1, 2);
                                return error ? error : true;
                              }
                              return "Please upload at least one Aadhaar document";
                            }
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handleAadhaarChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {aadhaarError && (
                          <p className="text-red-500 text-xs mt-2">{aadhaarError}</p>
                        )}
                        {kycForm.formState.errors.aadhaarCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.aadhaarCard.message as string}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Max 2 files, 1MB each</p>
                      </div>

                      {/* PAN - REQUIRED */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 font-medium text-gray-700">
                          PAN Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...kycForm.register("panCard", {
                            required: "PAN card is required",
                            validate: (files) => {
                              if (files && files.length > 0) {
                                const fileList = Array.from(files);
                                const error = validateMultipleImages(fileList, 1, 2);
                                return error ? error : true;
                              }
                              return "Please upload PAN card document";
                            }
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handlePanChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {panError && (
                          <p className="text-red-500 text-xs mt-2">{panError}</p>
                        )}
                        {kycForm.formState.errors.panCard && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.panCard.message as string}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Max 2 files, 1MB each</p>
                      </div>

                      {/* Store Document - REQUIRED */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 font-medium text-gray-700">
                          Store Document <span className="text-red-500">*</span>
                          <span className="text-xs text-gray-500 block font-normal">(Trade License/Registration)</span>
                        </label>
                        <input
                          {...kycForm.register("storeDocument", {
                            required: "Store document is required",
                            validate: (files) => {
                              if (files && files.length > 0) {
                                const fileList = Array.from(files);
                                const error = validateMultipleImages(fileList, 1, 2);
                                return error ? error : true;
                              }
                              return "Please upload store registration document";
                            }
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handleStoreDocChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {storeDocError && (
                          <p className="text-red-500 text-xs mt-2">{storeDocError}</p>
                        )}
                        {kycForm.formState.errors.storeDocument && (
                          <p className="text-red-500 text-sm mt-1">
                            {kycForm.formState.errors.storeDocument.message as string}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Max 2 files, 1MB each</p>
                      </div>

                      {/* GST - Optional */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 font-medium text-gray-700">
                          GST Certificates
                        </label>
                        <input
                          {...kycForm.register("GST", {
                            validate: (files) => {
                              if (files && files.length > 0) {
                                const fileList = Array.from(files);
                                const error = validateMultipleImages(fileList, 1, 3);
                                return error ? error : true;
                              }
                              return true;
                            }
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handleGstChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {gstError && (
                          <p className="text-red-500 text-xs mt-2">{gstError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Optional | Max 3 files, 1MB each</p>
                      </div>

                      {/* Other Docs - Optional */}
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 font-medium text-gray-700">
                          Other Documents
                        </label>
                        <input
                          {...kycForm.register("other", {
                            validate: (files) => {
                              if (files && files.length > 0) {
                                const fileList = Array.from(files);
                                const error = validateMultipleImages(fileList, 1, 5);
                                return error ? error : true;
                              }
                              return true;
                            }
                          })}
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={handleOtherChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {otherError && (
                          <p className="text-red-500 text-xs mt-2">{otherError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Optional | Max 5 files, 1MB each</p>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="px-6 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 flex items-center transition-all duration-200"
                      >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Previous
                      </button>
                      <button
                        type="submit"
                        className="px-10 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-800 shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
                        // disabled={loading || !kycForm.formState.isValid || !!aadhaarError || !!panError || !!storeDocError || !!gstError || !!otherError}
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
                    <button
                      onClick={() => router.push("/")}
                      className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Go to Dashboard
                    </button>
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