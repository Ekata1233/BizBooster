// 'use client';

// import React, { useEffect, useState } from 'react';
// import Label from '../form/Label';
// import Input from '../form/input/InputField';
// import FileInput from '../form/input/FileInput';
// import { TrashBinIcon } from '../../icons';
// import dynamic from 'next/dynamic';
// import { moduleFieldConfig } from '@/utils/moduleFieldConfig';

// const ClientSideCustomEditor = dynamic(
//   () => import('../../components/custom-editor/CustomEditor'),
//   { ssr: false, loading: () => <p>Loading editor...</p> }
// );

// /* ---------------- TYPES ---------------- */
// type InvestmentRange = { minRange: number | null; maxRange: number | null };
// type MonthlyEarnPotential = { minEarn: number | null; maxEarn: number | null };
// type FranchiseModel = {
//   title: string;
//   agreement: string;
//   price: number | null;
//   discount: number | null;
//   gst: number | null;
//   fees: number | null;
// };
// type ExtraSection = {
//   title: string;
//   subtitle: string[];
//   image: string[];
//   description: string[];
//   subDescription: string[];
//   lists: string[];
//   tags: string[];
// };

// interface FranchiseUpdateFormProps {
//   data: any;
//   setData: React.Dispatch<React.SetStateAction<any>>;
//   fieldsConfig?: any;
// }

// /* ---------------- COMPONENT ---------------- */
// const FranchiseUpdateForm: React.FC<FranchiseUpdateFormProps> = ({
//  data, setData ,
//   fieldsConfig,
// }) => {

//     // console.log("franchise details form  : ", data)
//   const [commissionType, setCommissionType] = useState<'percentage' | 'amount'>(data?.commissionType || 'percentage');
//   const [commissionValue, setCommissionValue] = useState(() => {
//     if (!data?.commission) return '';
//     const numericValue = data.commission.replace(/[^\d]/g, '');
//     return numericValue;
//   });
//   const [editorReady, setEditorReady] = useState(false);
//   const [termsAndConditions, setTermsAndConditions] = useState('');
//   const [investmentRange, setInvestmentRange] = useState<InvestmentRange[]>([
//     { minRange: null, maxRange: null },
//   ]);
//   const [monthlyEarnPotential, setMonthlyEarnPotential] = useState<MonthlyEarnPotential[]>([
//     { minEarn: null, maxEarn: null },
//   ]);
//   const [franchiseModel, setFranchiseModel] = useState<FranchiseModel[]>([
//     { title: '', agreement: '', price: null, discount: null, gst: null, fees: null },
//   ]);
//   const [extraImages, setExtraImages] = useState<string[]>(['']);
//   const [extraSections, setExtraSections] = useState<ExtraSection[]>([
//     {
//       title: '',
//       subtitle: [''],
//       image: [],
//       description: [''],
//       subDescription: [''],
//       lists: [''],
//       tags: [''],
//     },
//   ]);

//   const [showExtraSections, setShowExtraSections] = useState(false);

//   useEffect(() => {
//   if (!data?.franchiseDetails) return;
//   const fd = data.franchiseDetails;
//   if (data.commission) {
//     const numericValue = data.commission.replace(/[^\d]/g, '');
//     setCommissionValue(numericValue);
//   }

//   setCommissionType(data.commissionType || 'percentage');
//   setTermsAndConditions(fd.termsAndConditions || '');
//   setInvestmentRange(
//     fd.investmentRange?.length
//       ? fd.investmentRange
//       : [{ minRange: null, maxRange: null }]
//   );
//   setMonthlyEarnPotential(
//     fd.monthlyEarnPotential?.length
//       ? fd.monthlyEarnPotential
//       : [{ minEarn: null, maxEarn: null }]
//   );
//   setFranchiseModel(
//     fd.franchiseModel?.length
//       ? fd.franchiseModel
//       : [{ title: '', agreement: '', price: null, discount: null, gst: null, fees: null }]
//   );
//   setExtraImages(
//     fd.extraImages?.length ? fd.extraImages : ['']
//   );
//   setExtraSections(
//     fd.extraSections?.length
//       ? fd.extraSections
//       : [
//           {
//             title: '',
//             subtitle: [''],
//             image: [],
//             description: [''],
//             subDescription: [''],
//             lists: [''],
//             tags: [''],
//           },
//         ]
//   );
//   setShowExtraSections(!!fd.extraSections?.length);

// }, [data]);

// const handleTypeChange = (newType: 'percentage' | 'amount') => {
//     setCommissionType(newType);
//     const formatted = newType === 'percentage' ? `${commissionValue}%` : `₹${commissionValue}`;
//     setData({ commissionType: newType, commission: formatted });
//   };

//   const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     if (/^\d*$/.test(value)) {
//       setCommissionValue(value);
//       const formatted = commissionType === 'percentage' ? `${value}%` : `₹${value}`;
//       setData({ commission: formatted });
//     }
//   };

//   useEffect(() => setEditorReady(true), []);

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div className="space-y-6">
//       <h4 className="text-xl font-bold text-center"> Franchise Details</h4>

//       <div className="flex flex-wrap gap-6">
//           {/* Basic Price display (unchanged) */}
//           <div className="w-2/6">
//             <Label>Basic Price</Label>
//             <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
//               ₹{price || 0}
//             </div>
//           </div>

//           {/* Commission (UNCHANGED logic/UI) */}
//           <div className="w-3/6">
//             <Label>{commissionType === 'percentage' ? 'Commission (%)' : 'Commission (₹)'}</Label>
//             <div className="flex items-center gap-4">
//               <div className="relative w-32">
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
//                   {commissionType === 'percentage' ? '%' : '₹'}
//                 </span>
//                 <Input
//                   type="text"
//                   value={commissionValue}
//                   onChange={handleCommissionChange}
//                   placeholder="Commission"
//                   className="pl-8"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => handleTypeChange('percentage')}
//                   className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === 'percentage'
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
//                 >
//                   %
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => handleTypeChange('amount')}
//                   className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === 'amount'
//                     ? 'bg-blue-600 text-white border-blue-600'
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
//                 >
//                   ₹
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Commission Distribution (unchanged) */}
//           {(() => {
//             const totalCommission =
//               commissionType === 'percentage'
//                 ? (Number(price || 0) * Number(commissionValue || 0)) / 100
//                 : Number(commissionValue || 0);

//             const distributionPercents = [0.5, 0.2, 0.1, 0.2];
//             const distributedValues = distributionPercents.map((ratio) => totalCommission * ratio);

//             return (
//               <>
//                 {distributedValues.map((val, idx) => (
//                   <div key={idx} className="w-1/5">
//                     <Label>Share {idx + 1} ({distributionPercents[idx] * 100}%)</Label>
//                     <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
//                       ₹{val.toFixed(2)}
//                     </div>
//                   </div>
//                 ))}
//               </>
//             );
//           })()}
//         </div>

//       {/* Terms & Conditions */}
//       {fieldsConfig?.termsAndConditions && (
//         <div>
//           <Label>Terms & Conditions</Label>
//           {editorReady && (
//             <ClientSideCustomEditor
//               value={termsAndConditions}
//               onChange={setTermsAndConditions}
//             />
//           )}
//         </div>
//       )}

//       {/* Investment Range */}
//       {fieldsConfig?.investmentRange && (
//         <div>
//           <Label>Investment Range</Label>
//           {investmentRange.map((item, i) => (
//             <div key={i} className="flex gap-3 mt-2">
//               <Input
//                 type="number"
//                 placeholder="Min Range"
//                 value={item.minRange ?? ''}
//                 onChange={e =>
//                   setInvestmentRange(v =>
//                     v.map((x, idx) =>
//                       idx === i ? { ...x, minRange: Number(e.target.value) || null } : x
//                     )
//                   )
//                 }
//               />
//               <Input
//                 type="number"
//                 placeholder="Max Range"
//                 value={item.maxRange ?? ''}
//                 onChange={e =>
//                   setInvestmentRange(v =>
//                     v.map((x, idx) =>
//                       idx === i ? { ...x, maxRange: Number(e.target.value) || null } : x
//                     )
//                   )
//                 }
//               />
//               <button onClick={() => setInvestmentRange(v => v.filter((_, idx) => idx !== i))}>
//                 <TrashBinIcon className="w-5 h-5 text-red-500" />
//               </button>
//             </div>
//           ))}
//           <button
//             className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
//             onClick={() => setInvestmentRange(v => [...v, { minRange: null, maxRange: null }])}
//           >
//             + Add Investment Range
//           </button>
//         </div>
//       )}

//       {/* Monthly Earn Potential */}
//       {fieldsConfig?.monthlyEarnPotential && (
//         <div>
//           <Label>Monthly Earn Potential</Label>
//           {monthlyEarnPotential.map((item, i) => (
//             <div key={i} className="flex gap-3 mt-2">
//               <Input
//                 type="number"
//                 placeholder="Min Earn"
//                 value={item.minEarn ?? ''}
//                 onChange={e =>
//                   setMonthlyEarnPotential(v =>
//                     v.map((x, idx) =>
//                       idx === i ? { ...x, minEarn: Number(e.target.value) || null } : x
//                     )
//                   )
//                 }
//               />
//               <Input
//                 type="number"
//                 placeholder="Max Earn"
//                 value={item.maxEarn ?? ''}
//                 onChange={e =>
//                   setMonthlyEarnPotential(v =>
//                     v.map((x, idx) =>
//                       idx === i ? { ...x, maxEarn: Number(e.target.value) || null } : x
//                     )
//                   )
//                 }
//               />
//               <button onClick={() => setMonthlyEarnPotential(v => v.filter((_, idx) => idx !== i))}>
//                 <TrashBinIcon className="w-5 h-5 text-red-500" />
//               </button>
//             </div>
//           ))}
//           <button
//             className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
//             onClick={() => setMonthlyEarnPotential(v => [...v, { minEarn: null, maxEarn: null }])}
//           >
//             + Add Monthly Earn
//           </button>
//         </div>
//       )}

//       {/* Franchise Model */}
//       {fieldsConfig?.franchiseModel && (
//         <div>
//           <Label>Franchise Model</Label>
//           {franchiseModel.map((item, i) => (
//             <div key={i} className="border p-4 rounded mt-2 space-y-2">
//               <Input
//                 placeholder="Title"
//                 value={item.title}
//                 onChange={e =>
//                   setFranchiseModel(v =>
//                     v.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x))
//                   )
//                 }
//               />
//               <Input
//                 placeholder="Agreement"
//                 value={item.agreement}
//                 onChange={e =>
//                   setFranchiseModel(v =>
//                     v.map((x, idx) => (idx === i ? { ...x, agreement: e.target.value } : x))
//                   )
//                 }
//               />
//               <div className="grid grid-cols-4 gap-2">
//                 {(['price', 'discount', 'gst', 'fees'] as const).map(field => (
//                   <Input
//                     key={field}
//                     type="number"
//                     placeholder={field}
//                     value={item[field] ?? ''}
//                     onChange={e =>
//                       setFranchiseModel(v =>
//                         v.map((x, idx) =>
//                           idx === i ? { ...x, [field]: Number(e.target.value) || null } : x
//                         )
//                       )
//                     }
//                   />
//                 ))}
//               </div>
//               <button
//                 className="text-red-500 mt-2"
//                 onClick={() => setFranchiseModel(v => v.filter((_, idx) => idx !== i))}
//               >
//                 Remove Model
//               </button>
//             </div>
//           ))}
//           <button
//             className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
//             onClick={() =>
//               setFranchiseModel(v => [
//                 ...v,
//                 { title: '', agreement: '', price: null, discount: null, gst: null, fees: null },
//               ])
//             }
//           >
//             + Add Franchise Model
//           </button>
//         </div>
//       )}

//       {/* Extra Images */}
//       {fieldsConfig?.extraImages && (
//         <div>
//           <Label>Extra Images</Label>
//           {extraImages.map((img, i) => (
//             <div key={i} className="flex gap-3 mt-2">
//               <FileInput
//                 onChange={e => {
//                   const file = e.target.files?.[0];
//                   if (file) {
//                     const url = URL.createObjectURL(file);
//                     setExtraImages(v => v.map((x, idx) => (idx === i ? url : x)));
//                   }
//                 }}
//               />
//               <button onClick={() => setExtraImages(v => v.filter((_, idx) => idx !== i))}>
//                 <TrashBinIcon className="w-5 h-5 text-red-500" />
//               </button>
//             </div>
//           ))}
//           <button
//             className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
//             onClick={() => setExtraImages(v => [...v, ''])}
//           >
//             + Add Extra Image
//           </button>
//         </div>
//       )}

//       {/* Extra Sections */}
//       {fieldsConfig?.extraSections && (
//         <div>
//           <Label>Extra Sections</Label>

//           {!showExtraSections ? (
//             <button
//               onClick={() => setShowExtraSections(true)}
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//             >
//               + Add Extra Section
//             </button>
//           ) : (
//             <>
//               {extraSections.map((sec, sIdx) => (
//                 <div key={sIdx} className="border p-4 rounded mt-3 space-y-2">
//                   <Input
//                     placeholder="Section Title"
//                     value={sec.title}
//                     onChange={e =>
//                       setExtraSections(v =>
//                         v.map((x, idx) =>
//                           idx === sIdx ? { ...x, title: e.target.value } : x
//                         )
//                       )
//                     }
//                   />

//                   {(['subtitle', 'description', 'subDescription', 'lists', 'tags'] as const).map(
//                     field => (
//                       <div key={field}>
//                         <Label>{field}</Label>
//                         {sec[field].map((val, i) => (
//                           <Input
//                             key={i}
//                             value={val}
//                             onChange={e =>
//                               setExtraSections(v =>
//                                 v.map((x, idx) =>
//                                   idx === sIdx
//                                     ? {
//                                         ...x,
//                                         [field]: x[field].map((y, j) =>
//                                           j === i ? e.target.value : y
//                                         ),
//                                       }
//                                     : x
//                                 )
//                               )
//                             }
//                           />
//                         ))}
//                         <button
//                           className="mt-1 bg-blue-500 text-white px-2 py-1 rounded"
//                           onClick={() =>
//                             setExtraSections(v =>
//                               v.map((x, idx) =>
//                                 idx === sIdx
//                                   ? { ...x, [field]: [...x[field], ''] }
//                                   : x
//                               )
//                             )
//                           }
//                         >
//                           + Add {field}
//                         </button>
//                       </div>
//                     )
//                   )}
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FranchiseUpdateForm;


'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import dynamic from 'next/dynamic';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';

const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

/* ---------------- TYPES ---------------- */
type InvestmentRange = { minRange: number | null; maxRange: number | null };
type MonthlyEarnPotential = { minEarn: number | null; maxEarn: number | null };
type FranchiseModel = {
  title: string;
  agreement: string;
  price: number | null;
  discount: number | null;
  gst: number | null;
  fees: number | null;
};
type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[];
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};

interface FranchiseUpdateFormProps {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  fieldsConfig?: any;
}

/* ---------------- COMPONENT ---------------- */
const FranchiseUpdateForm: React.FC<FranchiseUpdateFormProps> = ({
  data,
  setData,
  fieldsConfig,
}) => {
  // Extract price from form data
  const price = data?.price || 0;

  // Local state for form fields
  const [commissionType, setCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [commissionValue, setCommissionValue] = useState<string>('');
  const [editorReady, setEditorReady] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [investmentRange, setInvestmentRange] = useState<InvestmentRange[]>([
    { minRange: null, maxRange: null },
  ]);
  const [monthlyEarnPotential, setMonthlyEarnPotential] = useState<MonthlyEarnPotential[]>([
    { minEarn: null, maxEarn: null },
  ]);
  const [franchiseModel, setFranchiseModel] = useState<FranchiseModel[]>([
    { title: '', agreement: '', price: null, discount: null, gst: null, fees: null },
  ]);
  const [extraImages, setExtraImages] = useState<string[]>(['']);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>([
    {
      title: '',
      subtitle: [''],
      image: [],
      description: [''],
      subDescription: [''],
      lists: [''],
      tags: [''],
    },
  ]);
  const [showExtraSections, setShowExtraSections] = useState(false);

  // Initialize form from parent data - RUNS ONLY ONCE
  useEffect(() => {
    if (!data?.franchiseDetails) return;
    
    const fd = data.franchiseDetails;
    
    // Set commission values
    if (data.commission) {
      const numericValue = data.commission.replace(/[^\d]/g, '');
      setCommissionValue(numericValue);
    }
    
    if (data.commissionType) {
      setCommissionType(data.commissionType);
    }
    
    // Set franchise details
    setTermsAndConditions(fd.termsAndConditions || '');
    
    if (fd.investmentRange?.length) {
      setInvestmentRange(fd.investmentRange);
    }
    
    if (fd.monthlyEarnPotential?.length) {
      setMonthlyEarnPotential(fd.monthlyEarnPotential);
    }
    
    if (fd.franchiseModel?.length) {
      setFranchiseModel(fd.franchiseModel);
    }
    
    if (fd.extraImages?.length) {
      setExtraImages(fd.extraImages);
    }
    
    if (fd.extraSections?.length) {
      setExtraSections(fd.extraSections);
      setShowExtraSections(true);
    }
  }, []); // Empty dependency array - runs only on mount

  // Update parent data when local state changes
  const updateParentData = useCallback(() => {
    const franchiseDetails = {
      termsAndConditions,
      investmentRange: investmentRange.filter(item => item.minRange !== null || item.maxRange !== null),
      monthlyEarnPotential: monthlyEarnPotential.filter(item => item.minEarn !== null || item.maxEarn !== null),
      franchiseModel: franchiseModel.filter(item => item.title.trim() !== ''),
      extraImages: extraImages.filter(img => img !== ''),
      extraSections: showExtraSections ? extraSections.filter(section => section.title.trim() !== '') : [],
    };

    setData((prev: any) => ({
      ...prev,
      franchiseDetails,
      commission: commissionType === 'percentage' 
        ? `${commissionValue}%` 
        : `₹${commissionValue}`,
      commissionType,
    }));
  }, [
    termsAndConditions,
    investmentRange,
    monthlyEarnPotential,
    franchiseModel,
    extraImages,
    extraSections,
    showExtraSections,
    commissionType,
    commissionValue,
    setData,
  ]);

  // Debounced update to parent - prevents too many updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateParentData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [updateParentData]);

  // Handle commission type change
  const handleTypeChange = (newType: 'percentage' | 'amount') => {
    setCommissionType(newType);
  };

  // Handle commission value change
  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCommissionValue(value);
    }
  };

  // Initialize editor
  useEffect(() => {
    setEditorReady(true);
  }, []);

  // Calculate commission distribution
  const commissionDistribution = useMemo(() => {
    const totalCommission = commissionType === 'percentage'
      ? (Number(price || 0) * Number(commissionValue || 0)) / 100
      : Number(commissionValue || 0);

    const distributionPercents = [0.5, 0.2, 0.1, 0.2];
    return distributionPercents.map((ratio) => totalCommission * ratio);
  }, [price, commissionType, commissionValue]);

  // Handle investment range change
  const handleInvestmentRangeChange = useCallback((index: number, field: 'minRange' | 'maxRange', value: string) => {
    setInvestmentRange(prev => 
      prev.map((item, idx) => 
        idx === index 
          ? { ...item, [field]: value === '' ? null : Number(value) } 
          : item
      )
    );
  }, []);

  // Handle monthly earn potential change
  const handleMonthlyEarnChange = useCallback((index: number, field: 'minEarn' | 'maxEarn', value: string) => {
    setMonthlyEarnPotential(prev => 
      prev.map((item, idx) => 
        idx === index 
          ? { ...item, [field]: value === '' ? null : Number(value) } 
          : item
      )
    );
  }, []);

  // Handle franchise model change
  const handleFranchiseModelChange = useCallback((index: number, field: keyof FranchiseModel, value: string) => {
    setFranchiseModel(prev => 
      prev.map((item, idx) => 
        idx === index 
          ? { 
              ...item, 
              [field]: field === 'title' || field === 'agreement' 
                ? value 
                : value === '' ? null : Number(value)
            } 
          : item
      )
    );
  }, []);

  // Handle extra section change
  const handleExtraSectionChange = useCallback((
    sectionIndex: number, 
    field: keyof ExtraSection, 
    valueIndex: number, 
    value: string
  ) => {
    setExtraSections(prev => 
      prev.map((section, secIdx) => {
        if (secIdx !== sectionIndex) return section;
        
        return {
          ...section,
          [field]: Array.isArray(section[field]) 
            ? section[field].map((val: string, idx: number) => 
                idx === valueIndex ? value : val
              )
            : [value]
        };
      })
    );
  }, []);

  // Add new array item to extra section
  const addToExtraSection = useCallback((sectionIndex: number, field: keyof ExtraSection) => {
    setExtraSections(prev => 
      prev.map((section, idx) => 
        idx === sectionIndex 
          ? { ...section, [field]: [...section[field], ''] }
          : section
      )
    );
  }, []);

  // Handle file upload for extra images
  const handleExtraImageUpload = useCallback((index: number, files: FileList | null) => {
    if (!files?.[0]) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const url = reader.result as string;
      setExtraImages(prev => 
        prev.map((img, idx) => idx === index ? url : img)
      );
    };
    
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-center">Franchise Details</h4>

      <div className="flex flex-wrap gap-6">
        {/* Basic Price display */}
        <div className="w-2/6">
          <Label>Basic Price</Label>
          <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
            ₹{price || 0}
          </div>
        </div>

        {/* Commission */}
        <div className="w-3/6">
          <Label>{commissionType === 'percentage' ? 'Commission (%)' : 'Commission (₹)'}</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                {commissionType === 'percentage' ? '%' : '₹'}
              </span>
              <Input
                type="text"
                value={commissionValue}
                onChange={handleCommissionChange}
                placeholder="Commission"
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('percentage')}
                className={`px-3 py-2 rounded-md border text-sm transition ${
                  commissionType === 'percentage'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('amount')}
                className={`px-3 py-2 rounded-md border text-sm transition ${
                  commissionType === 'amount'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                ₹
              </button>
            </div>
          </div>
        </div>

        {/* Commission Distribution */}
        {commissionDistribution.map((value, idx) => {
          const percentages = ['50%', '20%', '10%', '20%'];
          return (
            <div key={idx} className="w-1/5">
              <Label>Share {idx + 1} ({percentages[idx]})</Label>
              <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
                ₹{value.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terms & Conditions */}
      {fieldsConfig?.termsAndConditions && (
        <div>
          <Label>Terms & Conditions</Label>
          {editorReady && (
            <ClientSideCustomEditor
              value={termsAndConditions}
              onChange={(content) => {
                setTermsAndConditions(content);
                updateParentData();
              }}
            />
          )}
        </div>
      )}

      {/* Investment Range */}
      {fieldsConfig?.investmentRange && (
        <div>
          <Label>Investment Range</Label>
          {investmentRange.map((item, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <Input
                type="number"
                placeholder="Min Range"
                value={item.minRange ?? ''}
                onChange={e => handleInvestmentRangeChange(i, 'minRange', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Range"
                value={item.maxRange ?? ''}
                onChange={e => handleInvestmentRangeChange(i, 'maxRange', e.target.value)}
              />
              <button onClick={() => setInvestmentRange(v => v.filter((_, idx) => idx !== i))}>
                <TrashBinIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => setInvestmentRange(v => [...v, { minRange: null, maxRange: null }])}
          >
            + Add Investment Range
          </button>
        </div>
      )}

      {/* Monthly Earn Potential */}
      {fieldsConfig?.monthlyEarnPotential && (
        <div>
          <Label>Monthly Earn Potential</Label>
          {monthlyEarnPotential.map((item, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <Input
                type="number"
                placeholder="Min Earn"
                value={item.minEarn ?? ''}
                onChange={e => handleMonthlyEarnChange(i, 'minEarn', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Earn"
                value={item.maxEarn ?? ''}
                onChange={e => handleMonthlyEarnChange(i, 'maxEarn', e.target.value)}
              />
              <button onClick={() => setMonthlyEarnPotential(v => v.filter((_, idx) => idx !== i))}>
                <TrashBinIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => setMonthlyEarnPotential(v => [...v, { minEarn: null, maxEarn: null }])}
          >
            + Add Monthly Earn
          </button>
        </div>
      )}

      {/* Franchise Model */}
      {fieldsConfig?.franchiseModel && (
        <div>
          <Label>Franchise Model</Label>
          {franchiseModel.map((item, i) => (
            <div key={i} className="border p-4 rounded mt-2 space-y-2">
              <Input
                placeholder="Title"
                value={item.title}
                onChange={e => handleFranchiseModelChange(i, 'title', e.target.value)}
              />
              <Input
                placeholder="Agreement"
                value={item.agreement}
                onChange={e => handleFranchiseModelChange(i, 'agreement', e.target.value)}
              />
              <div className="grid grid-cols-4 gap-2">
                {(['price', 'discount', 'gst', 'fees'] as const).map(field => (
                  <Input
                    key={field}
                    type="number"
                    placeholder={field}
                    value={item[field] ?? ''}
                    onChange={e => handleFranchiseModelChange(i, field, e.target.value)}
                  />
                ))}
              </div>
              <button
                className="text-red-500 mt-2"
                onClick={() => setFranchiseModel(v => v.filter((_, idx) => idx !== i))}
              >
                Remove Model
              </button>
            </div>
          ))}
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() =>
              setFranchiseModel(v => [
                ...v,
                { title: '', agreement: '', price: null, discount: null, gst: null, fees: null },
              ])
            }
          >
            + Add Franchise Model
          </button>
        </div>
      )}

      {/* Extra Images
      {fieldsConfig?.extraImages && (
        <div>
          <Label>Extra Images</Label>
          {extraImages.map((img, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <FileInput
                onChange={e => handleExtraImageUpload(i, e.target.files)}
              />
              {img && img !== '' && (
                <div className="w-20 h-20 border rounded overflow-hidden">
                  <img src={img} alt={`Extra ${i}`} className="w-full h-full object-cover" />
                </div>
              )}
              <button onClick={() => setExtraImages(v => v.filter((_, idx) => idx !== i))}>
                <TrashBinIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => setExtraImages(v => [...v, ''])}
          >
            + Add Extra Image
          </button>
        </div>
      )} */}

      {/* Extra Sections */}
      {fieldsConfig?.extraSections && (
        <div>
          <Label>Extra Sections</Label>

          {!showExtraSections ? (
            <button
              onClick={() => setShowExtraSections(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              + Add Extra Section
            </button>
          ) : (
            <>
              {extraSections.map((sec, sIdx) => (
                <div key={sIdx} className="border p-4 rounded mt-3 space-y-2">
                  <Input
                    placeholder="Section Title"
                    value={sec.title}
                    onChange={e => handleExtraSectionChange(sIdx, 'title', 0, e.target.value)}
                  />

                  {(['subtitle', 'description', 'subDescription', 'lists', 'tags'] as const).map(
                    field => (
                      <div key={field}>
                        <Label>{field}</Label>
                        {sec[field].map((val, i) => (
                          <Input
                            key={i}
                            value={val}
                            onChange={e => handleExtraSectionChange(sIdx, field, i, e.target.value)}
                          />
                        ))}
                        <button
                          className="mt-1 bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => addToExtraSection(sIdx, field)}
                        >
                          + Add {field}
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FranchiseUpdateForm;