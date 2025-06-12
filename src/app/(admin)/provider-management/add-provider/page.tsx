// /* ------------------------------------------------------------------
//  * src/app/(admin)/providers/add/page.tsx
//  * ------------------------------------------------------------------ */

// 'use client';

// import React, { useCallback, useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// import ComponentCard from '@/components/common/ComponentCard';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';
// import Select from '@/components/form/Select';
// import FileInput from '@/components/form/input/FileInput';
// import { ChevronDownIcon, ArrowRightIcon } from '@/icons';
// import { Check, Clock } from 'lucide-react';
// import { useProvider } from '@/context/ProviderContext';
// import { useModule } from '@/context/ModuleContext';
// import { useZone } from '@/context/ZoneContext';
// import { providerValidationSchema } from '@/validation/providerValidationSchema';

// /* ------------------------------------------------------------------ */
// /*  types & constants                                                 */
// /* ------------------------------------------------------------------ */

// const MAP_STYLE = { width: '100%', height: '300px' } as const;
// const MAP_CENTER = { lat: 18.501426841362647, lng: 73.88318878735599 };

// type WizardStep = 1 | 2 | 3 | 'done';

// /* ------------------------------------------------------------------ */
// /*  main component                                                    */
// /* ------------------------------------------------------------------ */

// export default function AddProvider() {
//   /* ───── context data ───────────────────────────────────────────── */
//   const { provider, registerProvider, updateStoreInfo, updateKycInfo, loading } =
//     useProvider();
//   const { modules } = useModule();
//   const { zones } = useZone();

//   /* ───── RHF (needed only for lat/lng hidden fields) ────────────── */
//   const { handleSubmit, setValue } = useForm();

//   /* ───── component-level state ──────────────────────────────────── */
//   const [step, setStep] = useState<WizardStep>(1);

//   /* basic */
//   const [fullName, setFullName] = useState('');
//   const [phoneNo, setPhoneNo] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [referredBy, setReferredBy] = useState('');

//   /* store-info */
//   const [storeName, setStoreName] = useState('');
//   const [storePhone, setStorePhone] = useState('');
//   const [storeEmail, setStoreEmail] = useState('');
//   const [moduleId, setModuleId] = useState<string | null>(null);
//   const [zoneId, setZoneId] = useState<string | null>(null);
//   const [tax, setTax] = useState('');
//   const [logo, setLogo] = useState<File | null>(null);
//   const [cover, setCover] = useState<File | null>(null);
//   const [marker, setMarker] = useState(MAP_CENTER);
//   const [address, setAddress] = useState('');
//   const [officeNo, setOfficeNo] = useState('');
//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');
//   const [country, setCountry] = useState('');
//   const [locationType, setLocationType] =
//     useState<'home' | 'office' | 'other'>('home');

//   /* kyc */
//   const [aadhaar, setAadhaar] = useState<File[]>([]);
//   const [pan, setPan] = useState<File[]>([]);
//   const [docs, setDocs] = useState<File[]>([]);
//   const [gst, setGst] = useState<File[]>([]);
//   const [other, setOther] = useState<File[]>([]);

//   /* validation errors (zod) */
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   /* maps */
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
//   });
//   const onMapClick = useCallback(
//     (e: google.maps.MapMouseEvent) => {
//       if (!e.latLng) return;
//       const lat = e.latLng.lat();
//       const lng = e.latLng.lng();
//       setMarker({ lat, lng });
//       setValue('latitude', lat);
//       setValue('longitude', lng);
//     },
//     [setValue],
//   );

//   /* ───── determine starting step from server status ─────────────── */
//   useEffect(() => {
//     if (!provider) return;
//     switch (provider.registrationStatus) {
//       case 'basic':
//         setStep(2);
//         break;
//       case 'store':
//         setStep(3);
//         break;
//       case 'kyc':
//       case 'done':
//         setStep('done');
//         break;
//       default:
//         setStep(1);
//     }
//   }, [provider]);

//   /* ---------------------------------------------------------------- */
//   /*  helpers                                                         */
//   /* ---------------------------------------------------------------- */

//   /** Validate only the fields belonging to the _current_ step */
//   const validateCurrentStep = () => {
//     try {
//       if (step === 1) {
//         providerValidationSchema
//           .pick({
//             fullName: true,
//             phoneNo: true,
//             email: true,
//             password: true,
//             confirmPassword: true,
//           })
//           .parse({ fullName, phoneNo, email, password, confirmPassword });
//       } else if (step === 2) {
//         providerValidationSchema.shape.storeInfo.parse({
//           storeName,
//           storePhone,
//           storeEmail,
//           module: moduleId,
//           zone: zoneId,
//           tax,
//           location: {
//             type: locationType,
//             coordinates: [marker.lng, marker.lat],
//           },
//           address,
//           officeNo,
//           city,
//           state,
//           country,
//         });
//       }
//       setErrors({});
//       return true;
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         const obj: Record<string, string> = {};
//         err.errors.forEach((e) => (obj[e.path.join('.')] = e.message));
//         setErrors(obj);
//       }
//       return false;
//     }
//   };

//   /** Save step-1 → advance to step 2 */
//   const handleBasicSubmit = async () => {
//     if (!validateCurrentStep()) return;
//     const fd = new FormData();
//     fd.append('fullName', fullName);
//     fd.append('phoneNo', phoneNo);
//     fd.append('email', email);
//     fd.append('password', password);
//     if (confirmPassword) fd.append('confirmPassword', confirmPassword);
//     if (referredBy) fd.append('referredBy', referredBy);

//     const ok = await registerProvider(fd);
//     if (ok) setStep(2);
//   };

//   /** Save step-2 → advance to step 3 */
//   const handleStoreSubmit = async () => {
//     if (!validateCurrentStep()) return;
//     const fd = new FormData();
//     fd.append('storeName', storeName);
//     fd.append('storePhone', storePhone);
//     fd.append('storeEmail', storeEmail);
//     fd.append('module', moduleId!);
//     fd.append('zone', zoneId!);
//     fd.append('tax', tax);
//     fd.append('locationType', locationType);
//     fd.append('longitude', String(marker.lng));
//     fd.append('latitude', String(marker.lat));
//     fd.append('address', address);
//     fd.append('officeNo', officeNo);
//     fd.append('city', city);
//     fd.append('state', state);
//     fd.append('country', country);
//     if (logo) fd.append('logo', logo);
//     if (cover) fd.append('cover', cover);

//     const ok = await updateStoreInfo(fd);
//     if (ok) setStep(3);
//   };

//   /** Save step-3 → show DONE */
//   const handleKycSubmit = async () => {
//     const fd = new FormData();
//     aadhaar.forEach((f) => fd.append('aadhaarCard', f));
//     pan.forEach((f) => fd.append('panCard', f));
//     docs.forEach((f) => fd.append('storeDocument', f));
//     gst.forEach((f) => fd.append('GST', f));
//     other.forEach((f) => fd.append('other', f));

//     const ok = await updateKycInfo(fd);
//     if (ok) setStep('done');
//   };

//   /* ---------------------------------------------------------------- */
//   /*  UI                                                              */
//   /* ---------------------------------------------------------------- */

//   const moduleOpts = modules.map((m) => ({ value: m._id, label: m.name }));
//   const zoneOpts = zones.map((z) => ({ value: z._id, label: z.name }));

//   if (loadError) return <p>Error loading map</p>;
//   if (!isLoaded) return <p>Loading map…</p>;

//   return (
//     <div className="container mx-auto p-4">
//       <ComponentCard title="Provider On-Boarding">

//         {/* ────────── ROAD-MAP ───────────────────────────────────── */}
//         <RoadMap current={step} />

//         {/* ────────── STEP-1: BASIC ─────────────────────────────── */}
//         {step === 1 && (
//           <form onSubmit={handleSubmit(handleBasicSubmit)}>
//             <Section title="Basic Information">
//               <GridTwo>
//                 <TextField label="Full Name" val={fullName} set={setFullName} err={errors.fullName} />
//                 <TextField label="Phone"     val={phoneNo} set={setPhoneNo}  err={errors.phoneNo}  />
//                 <TextField label="Email"     val={email}   set={setEmail}    err={errors.email}    />
//                 <TextField label="Password"  val={password} set={setPassword} type="password" err={errors.password}/>
//                 <TextField label="Confirm Password" val={confirmPassword} set={setConfirmPassword} type="password" err={errors.confirmPassword}/>
//                 <TextField label="Referral Code (optional)" val={referredBy} set={setReferredBy}/>
//               </GridTwo>

//               <SubmitBar loading={loading} label="Register" />
//             </Section>
//           </form>
//         )}

//         {/* ────────── STEP-2: STORE‐INFO ────────────────────────── */}
//         {step === 2 && (
//           <form onSubmit={handleSubmit(handleStoreSubmit)}>
//             <Section title="Store Information">
//               <GridTwo>
//                 <TextField label="Store Name" val={storeName} set={setStoreName} err={errors['storeInfo.storeName']}/>
//                 <TextField label="Store Phone" val={storePhone} set={setStorePhone}/>
//                 <TextField label="Store Email" val={storeEmail} set={setStoreEmail}/>
//                 <SelectField label="Module" opts={moduleOpts} val={moduleId} set={setModuleId}/>
//                 <SelectField label="Zone"   opts={zoneOpts}   val={zoneId}   set={setZoneId}/>
//                 <TextField label="VAT / Tax" val={tax} set={setTax}/>
//                 <FileField label="Logo"  setFile={setLogo}/>
//                 <FileField label="Cover" setFile={setCover}/>
//               </GridTwo>

//               <Section title="Location">
//                 <GoogleMap
//                   mapContainerStyle={MAP_STYLE}
//                   center={marker}
//                   zoom={12}
//                   onClick={onMapClick}
//                 >
//                   <Marker position={marker} />
//                 </GoogleMap>

//                 <GridTwo className="mt-4">
//                   <TextField label="Address" val={address} set={setAddress}/>
//                   <TextField label="Office No" val={officeNo} set={setOfficeNo}/>
//                   <TextField label="City" val={city} set={setCity}/>
//                   <TextField label="State" val={state} set={setState}/>
//                   <TextField label="Country" val={country} set={setCountry}/>
//                 </GridTwo>
//               </Section>

//               <SubmitBar loading={loading} label="Save & Continue" />
//             </Section>
//           </form>
//         )}

//         {/* ────────── STEP-3: KYC ───────────────────────────────── */}
//         {step === 3 && (
//           <form onSubmit={handleSubmit(handleKycSubmit)}>
//             <Section title="KYC Documents">
//               <GridTwo>
//                 <FileField label="Aadhaar" multiple setFiles={setAadhaar}/>
//                 <FileField label="PAN Card" multiple setFiles={setPan}/>
//                 <FileField label="Business Docs" multiple setFiles={setDocs}/>
//                 <FileField label="GST" multiple setFiles={setGst}/>
//                 <FileField label="Other" multiple setFiles={setOther}/>
//               </GridTwo>

//               <SubmitBar loading={loading} label="Submit KYC" />
//             </Section>
//           </form>
//         )}

//         {/* ────────── DONE ─────────────────────────────────────── */}
//         {step === 'done' && (
//           <div className="text-center py-20">
//             <Check className="mx-auto h-16 w-16 text-green-600 mb-4" />
//             <h2 className="text-2xl font-semibold text-green-700">
//               All steps completed!
//             </h2>
//             <p className="text-gray-600 mt-2">
//               Thank you. Your account and documents are now fully verified.
//             </p>
//           </div>
//         )}
//       </ComponentCard>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Road-map component (fixed)                                        */
// /* ------------------------------------------------------------------ */

// function RoadMap({ current }: { current: WizardStep }) {
//   type StepNumber = 1 | 2 | 3;

//   const items: { step: StepNumber; label: string }[] = [
//     { step: 1, label: 'Basic' },
//     { step: 2, label: 'Store Info' },
//     { step: 3, label: 'KYC' },
//   ];

//   /* Convert "done" to a numeric sentinel so we can compare safely */
//   const numericCurrent: number =
//     current === 'done' ? 4 : (current as StepNumber);

//   const icon = (s: StepNumber) => {
//     if (s < numericCurrent) return <Check className="h-4 w-4" />;       // ✅ completed
//     if (current !== 'done' && s === current)                            // ✅ active
//       return <ArrowRightIcon className="h-4 w-4" />;
//     return <Clock className="h-4 w-4" />;                               // ✅ pending
//   };

//   return (
//     <div className="flex justify-between mb-6">
//       {items.map(({ step, label }) => {
//         const completed = step < numericCurrent;
//         const active = current !== 'done' && step === current;
//         return (
//           <div key={step} className="flex-1 text-center">
//             <div
//               className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center
//                 ${completed ? 'bg-green-600 text-white' :
//                   active ? 'bg-blue-600 text-white' :
//                   'bg-gray-300 text-gray-700'}`}>
//               {icon(step)}
//             </div>
//             <p className={`mt-1 text-sm ${completed ? 'text-green-700' :
//               active ? 'text-blue-700' : 'text-gray-500'}`}>
//               {label}
//             </p>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Tiny UI helpers                                                   */
// /* ------------------------------------------------------------------ */

// function Section({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="border rounded-lg p-6 shadow-sm mb-8 bg-white">
//       <h2 className="text-lg font-semibold mb-4 text-blue-700">{title}</h2>
//       {children}
//     </section>
//   );
// }

// function GridTwo({
//   children,
//   className = '',
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
//       {children}
//     </div>
//   );
// }

// function TextField({
//   label,
//   val,
//   set,
//   err,
//   type = 'text',
// }: {
//   label: string;
//   val: string;
//   set: (v: string) => void;
//   err?: string;
//   type?: string;
// }) {
//   return (
//     <div>
//       <Label className="block mb-1 font-medium text-gray-700">{label}</Label>
//       <Input type={type} value={val} onChange={(e) => set(e.target.value)} />
//       {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
//     </div>
//   );
// }

// function SelectField<T>({
//   label,
//   opts,
//   val,
//   set,
// }: {
//   label: string;
//   opts: { value: T; label: string }[];
//   val: T | null;
//   set: (v: T) => void;
// }) {
//   return (
//     <div className="relative">
//       <Label className="block mb-1 font-medium text-gray-700">{label}</Label>
//       <Select
//         options={opts}
//         value={val}
//         placeholder={`Select ${label}`}
//         onChange={(v) => set(v as T)}
//         className="dark:bg-dark-900"
//       />
//       <span className="absolute right-3 top-9 pointer-events-none text-gray-500">
//         <ChevronDownIcon />
//       </span>
//     </div>
//   );
// }

// function FileField({
//   label,
//   setFile,
//   setFiles,
//   multiple = false,
// }: {
//   label: string;
//   setFile?: (f: File | null) => void;
//   setFiles?: (f: File[]) => void;
//   multiple?: boolean;
// }) {
//   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     if (multiple) setFiles?.(Array.from(e.target.files));
//     else setFile?.(e.target.files[0] ?? null);
//   };
//   return (
//     <div>
//       <Label className="block mb-1 font-medium text-gray-700">{label}</Label>
//       <FileInput
//         multiple={multiple}
//         onChange={onChange}
//         className="custom-class"
//       />
//     </div>
//   );
// }

// function SubmitBar({ loading, label }: { loading: boolean; label: string }) {
//   return (
//     <div className="flex justify-end mt-8">
//       <button
//         type="submit"
//         disabled={loading}
//         className="px-8 py-3 rounded text-white font-semibold
//                    bg-gradient-to-r from-blue-600 to-blue-800
//                    disabled:opacity-60"
//       >
//         {label}
//       </button>
//     </div>
//   );
// }
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
    console.log("formdata of the register : ",fd);
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as string));
    await registerProvider(fd);
    regForm.reset();
  };

  const onStoreSave = async (data: any) => {
    const fd = new FormData();
    console.log("formdata of the store data : ",fd);
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as any));
    await updateStoreInfo(fd);
    storeForm.reset();
  };

  const onKycSave = async (data: any) => {
    const fd = new FormData();
    console.log("formdata of the kyc : ",fd);
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
