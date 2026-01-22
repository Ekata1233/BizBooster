'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
import { useParams } from 'next/navigation';
import { useService } from '@/context/ServiceContext';

const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

/* ---------------- TYPES ---------------- */
type InvestmentRange = { range: string; parameters: string };
type MonthlyEarnPotential = { range: string; parameters: string };
type AreaRequired = string;
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
  datas: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  fieldsConfig?: any;
}

/* ---------------- COMPONENT ---------------- */
const FranchiseUpdateForm: React.FC<FranchiseUpdateFormProps> = ({
  datas,
  setData,
  fieldsConfig,
}) => {

      const { id } = useParams();
      const { fetchSingleService, singleService: service } = useService();
      useEffect(() => {
          if (!id) return;
          fetchSingleService(id as string);
        }, [id]);
    const data = service;
    

  // Extract price from form data
  const price = data?.price || 0;

  // Local state for form fields
  const [commissionType, setCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [commissionValue, setCommissionValue] = useState<string>('');
  const [editorReady, setEditorReady] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [investmentRange, setInvestmentRange] = useState<InvestmentRange[]>([
    { range: '', parameters: '' },
  ]);
  const [monthlyEarnPotential, setMonthlyEarnPotential] = useState<MonthlyEarnPotential[]>([
    { range: '', parameters: '' },
  ]);
  const [areaRequired, setAreaRequired] = useState<string>('');
  
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
    if (fd.commission) {
      const numericValue = fd.commission.replace(/[^\d]/g, '');
      setCommissionValue(numericValue);
    }
    
    if (fd.commissionType) {
      setCommissionType(fd.commissionType);
    }
    
    // Set franchise details
    setTermsAndConditions(fd.termsAndConditions || '');
    
    if (fd.investmentRange?.length) {
      setInvestmentRange(fd.investmentRange);
    }
    
    if (fd.monthlyEarnPotential?.length) {
      setMonthlyEarnPotential(fd.monthlyEarnPotential);
    }
    
    setAreaRequired(fd.areaRequired);
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
  }, [data]); // Empty dependency array - runs only on mount

  // Update parent data when local state changes
  const updateParentData = useCallback(() => {
    const franchiseDetails = {
      termsAndConditions,
      investmentRange: investmentRange.filter(item => item.range !== null || item.parameters !== null),
      monthlyEarnPotential: monthlyEarnPotential.filter(item => item.range !== null || item.parameters !== null),
      areaRequired,
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
    areaRequired,
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
  const handleInvestmentRangeChange = useCallback((index: number, field: 'range' | 'parameters', value: string) => {
  setInvestmentRange(prev => 
    prev.map((item, idx) => 
      idx === index 
        ? { ...item, [field]: value } 
        : item
    )
  );
}, []);

  // Handle monthly earn potential change
  const handleMonthlyEarnChange = useCallback((index: number, field: 'range' | 'parameters', value: string) => {
  setMonthlyEarnPotential(prev => 
    prev.map((item, idx) => 
      idx === index 
        ? { ...item, [field]: value } 
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


  const handleExtraSectionTitleChange = useCallback(
    (sectionIndex: number, value: string) => {
      setExtraSections(prev =>
        prev.map((section, idx) =>
          idx === sectionIndex
            ? { ...section, title: value }
            : section
        )
      );
    },
    []
  );
  
  // Handle extra section change
  const handleExtraSectionArrayChange = useCallback(
    (
      sectionIndex: number,
      field: Exclude<keyof ExtraSection, 'title' | 'image'>,
      valueIndex: number,
      value: string
    ) => {
      setExtraSections(prev =>
        prev.map((section, secIdx) => {
          if (secIdx !== sectionIndex) return section;
  
          const arr = section[field] as string[];
          return {
            ...section,
            [field]: arr.map((val, idx) =>
              idx === valueIndex ? value : val
            ),
          };
        })
      );
    },
    []
  );
  

  // Add new array item to extra section
  const addToExtraSection = useCallback((sectionIndex: number, field: keyof ExtraSection) => {
    setExtraSections(prev => 
      prev.map((section, idx) => 
        idx === sectionIndex 
          ? { ...section, [field]: [...(section[field] as string[]), ''] }
          : section
      )
    );
  }, []);

  // Handle file upload for extra images
  const handleExtraImageUpload = useCallback((index: number, files: FileList | null) => {
    if (!files?.[0]) return;
  
    const file = files[0];
    // Use URL.createObjectURL instead of FileReader for blob URLs
    const url = URL.createObjectURL(file);
    
    setExtraImages(prev => 
      prev.map((img, idx) => idx === index ? url : img)
    );
  }, []);

  // Handle single file upload
  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const url = URL.createObjectURL(file);
    callback(url);
  };

  // Add new extra image field
  const addExtraImageField = useCallback(() => {
    setExtraImages(prev => [...prev, '']);
  }, []);

  // Remove extra image field
  const removeExtraImageField = useCallback((index: number) => {
    setExtraImages(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  // Remove image from extra section
  const removeSectionImage = useCallback((sectionIdx: number, imageIdx: number) => {
    setExtraSections(prev =>
      prev.map((section, idx) =>
        idx === sectionIdx
          ? {
              ...section,
              image: section.image.filter((_, i) => i !== imageIdx)
            }
          : section
      )
    );
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
        {/* Change from minRange to range */}
        <Input
          type="text"  // Changed from number to text
          placeholder="Range (e.g., 1L - 5L)"
          value={item.range ?? ''}
          onChange={e => handleInvestmentRangeChange(i, 'range', e.target.value)}
        />
        {/* Change from maxRange to parameters */}
        <Input
          type="text"  // Changed from number to text
          placeholder="Parameters"
          value={item.parameters ?? ''}
          onChange={e => handleInvestmentRangeChange(i, 'parameters', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => setInvestmentRange(v => v.filter((_, idx) => idx !== i))}
        >
          <TrashBinIcon className="w-5 h-5 text-red-500" />
        </button>
      </div>
    ))}
    <button
      type="button"
      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
      onClick={() => setInvestmentRange(v => [...v, { range: '', parameters: '' }])}
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
        {/* Change from minEarn to range */}
        <Input
          type="text"  // Changed from number to text
          placeholder="Range (e.g., 10K - 50K)"
          value={item.range ?? ''}
          onChange={e => handleMonthlyEarnChange(i, 'range', e.target.value)}
        />
        {/* Change from maxEarn to parameters */}
        <Input
          type="text"  // Changed from number to text
          placeholder="Parameters"
          value={item.parameters ?? ''}
          onChange={e => handleMonthlyEarnChange(i, 'parameters', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => setMonthlyEarnPotential(v => v.filter((_, idx) => idx !== i))}
        >
          <TrashBinIcon className="w-5 h-5 text-red-500" />
        </button>
      </div>
    ))}
    <button
      type="button"
      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
      onClick={() => setMonthlyEarnPotential(v => [...v, { range: '', parameters: '' }])}
    >
      + Add Monthly Earn Potential
    </button>
  </div>
)}

{fieldsConfig?.areaRequired && (
<div>
  <div className="my-4">
    <div className="flex items-center gap-2">
      <Label>Area Required</Label>
      <span className="text-red-500 text-sm font-semibold">(Only Franchise Service)</span>
    </div>
    <div className='border p-4 rounded'>
        <div  className="flex gap-4 mt-2 items-center">
        <Input
            placeholder="100sq - 500sq"
            value={areaRequired}
            onChange={(e) => setAreaRequired(e.target.value)}
          />
        </div>
    </div>
  </div>
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
                type="button"
                className="text-red-500 mt-2"
                onClick={() => setFranchiseModel(v => v.filter((_, idx) => idx !== i))}
              >
                Remove Model
              </button>
            </div>
          ))}
          <button
            type="button"
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

      {/* Extra Images */}
       {fieldsConfig?.extraImages && (
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Extra Images</Label>
        {extraImages.map((imageUrl, index) => (
          <div key={index} className="flex items-center gap-3 mb-3">
            <FileInput
              accept="image/*"
              onChange={(e) => handleExtraImageUpload(index, e.target.files)}
            />
            {imageUrl && imageUrl !== '' && (
              <div className="w-24 h-24 relative">
                <Image 
                  src={imageUrl} 
                  alt={`extra-${index}`} 
                  fill 
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => removeExtraImageField(index)}
              className="text-red-500"
            >
              <TrashBinIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={addExtraImageField}
        >
          + Add Extra Image
        </button>
      </div>
       )}

      {/* Extra Sections */}
      {fieldsConfig?.extraSections && (
        <div>
          <Label>Extra Sections</Label>

          {!showExtraSections ? (
            <button
              type="button"
              onClick={() => setShowExtraSections(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              + Add Extra Section
            </button>
          ) : (
            <>
              {extraSections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="border p-4 rounded mt-3 space-y-4">
                  <Input
                    placeholder="Section Title"
                    value={section.title}
                    onChange={e =>
                      handleExtraSectionTitleChange(sectionIdx, e.target.value)
                    }
                  
                  />

                  {(['subtitle', 'description', 'subDescription', 'lists', 'tags'] as const).map(
                    (field) => (
                      <div key={field}>
                        <Label className="capitalize">{field}</Label>
                        {section[field].map((val, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <Input
  value={val || ''}
  onChange={e =>
    handleExtraSectionArrayChange(sectionIdx, field, i, e.target.value)
  }
  placeholder={`Enter ${field}`}
/>

                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => addToExtraSection(sectionIdx, field)}
                        >
                          + Add {field}
                        </button>
                      </div>
                    )
                  )}

<div>
  <Label>Images</Label>
  <FileInput
    multiple
    accept="image/*"
    onChange={(e) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const urls = files.map(file => URL.createObjectURL(file));
        
        setExtraSections(prev =>
          prev.map((sec, idx) =>
            idx === sectionIdx
              ? { ...sec, image: [...sec.image, ...urls] }
              : sec
          )
        );
      }
    }}
  />
  <div className="flex gap-3 mt-3 flex-wrap">
    {section.image.map((img, idx) => (
      <div key={idx} className="w-20 h-20 relative group">
        <Image 
          src={img} 
          alt={`section-${sectionIdx}-${idx}`} 
          fill 
          className="rounded-lg object-cover"
          unoptimized
        />
        <button
          type="button"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeSectionImage(sectionIdx, idx)}
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

                  <button
                    type="button"
                    className="text-red-500 mt-2"
                    onClick={() => setExtraSections(prev => prev.filter((_, idx) => idx !== sectionIdx))}
                  >
                    Remove Section
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() =>
                  setExtraSections(prev => [
                    ...prev,
                    {
                      title: '',
                      subtitle: [''],
                      image: [],
                      description: [''],
                      subDescription: [''],
                      lists: [''],
                      tags: [''],
                    },
                  ])
                }
              >
                + Add Another Section
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FranchiseUpdateForm;