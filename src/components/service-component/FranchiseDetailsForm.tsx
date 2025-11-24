'use client';

import React, { useEffect, useRef, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import dynamic from 'next/dynamic';

const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

// ---------------------------
// Types
// ---------------------------
type RowData = { title: string; description: string };
type InvestmentRange = { minRange: number | null; maxRange: number | null };
type MonthlyEarnPotential = { minEarn: number | null; maxEarn: number | null };
type FranchiseModel = {
  title: string;
  agreement?: string;
  price?: number | null;
  discount?: number | null;
  gst?: number | null;
  fees?: number | null;
};
type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[]; // using URL strings for images to keep consistent with ServiceDetailsForm approach
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};

interface FranchiseData {
  commission?: string;
  commissionType?: 'percentage' | 'amount';
  overview?: string;
  howItWorks?: string;
  termsAndConditions?: string;
  rows?: RowData[];
  investmentRange?: InvestmentRange[];
  monthlyEarnPotential?: MonthlyEarnPotential[];
  franchiseModel?: FranchiseModel[];
  extraSections?: ExtraSection[];
  extraImages?: string[];
}

interface FranchiseDetailsFormProps {
  data: FranchiseData;
  setData: (newData: Partial<FranchiseData>) => void;
  price?: number;
}

const FranchiseDetailsForm: React.FC<FranchiseDetailsFormProps> = ({ data, setData, price }) => {
  const mounted = useRef(false);

  // Commission and related states (unchanged logic / UI as requested)
  const [commissionType, setCommissionType] = useState<'percentage' | 'amount'>(data?.commissionType || 'percentage');
  const [commissionValue, setCommissionValue] = useState(() => {
    if (!data?.commission) return '';
    const numericValue = data.commission.replace(/[^\d]/g, '');
    return numericValue;
  });

  // Editors and simple fields
  const [overview, setOverview] = useState<string>(data?.overview || '');
  const [howItWorks, setHowItWorks] = useState<string>(data?.howItWorks || '');
  const [termsAndConditions, setTermsAndConditions] = useState<string>(data?.termsAndConditions || '');
  const [rows, setRows] = useState<RowData[]>(data?.rows?.length ? data.rows : []);

  // Newly added schema-aligned fields
  const [investmentRange, setInvestmentRange] = useState<InvestmentRange[]>(
    data?.investmentRange?.length ? data.investmentRange : [{ minRange: null, maxRange: null }]
  );
  const [monthlyEarnPotential, setMonthlyEarnPotential] = useState<MonthlyEarnPotential[]>(
    data?.monthlyEarnPotential?.length ? data.monthlyEarnPotential : [{ minEarn: null, maxEarn: null }]
  );
  const [franchiseModel, setFranchiseModel] = useState<FranchiseModel[]>(
    data?.franchiseModel?.length
      ? data.franchiseModel
      : [{ title: '', agreement: '', price: null, discount: null, gst: null, fees: null }]
  );
  const [extraSections, setExtraSections] = useState<ExtraSection[]>(
    data?.extraSections?.length
      ? data.extraSections
      : [{ title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] }]
  );
  const [extraImages, setExtraImages] = useState<string[]>(data?.extraImages?.length ? data.extraImages : []);

  useEffect(() => {
    // no-op to keep behavior consistent with other forms that use mounted ref
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
  }, []);

  // Sync up with parent whenever any local piece changes
  useEffect(() => {
    const newData: FranchiseData = {
      overview,
      howItWorks,
      termsAndConditions,
      rows,
      investmentRange,
      monthlyEarnPotential,
      franchiseModel,
      extraSections,
      extraImages,
    };

    if (commissionValue) {
      newData.commission = commissionType === 'percentage' ? `${commissionValue}%` : `₹${commissionValue}`;
      newData.commissionType = commissionType;
    } else {
      // if empty, still send commissionType maybe
      newData.commissionType = commissionType;
    }

    setData(newData);
  }, [
    overview,
    howItWorks,
    termsAndConditions,
    rows,
    commissionValue,
    commissionType,
    investmentRange,
    monthlyEarnPotential,
    franchiseModel,
    extraSections,
    extraImages,
    setData,
  ]);

  // -----------------------
  // Commission handlers (kept unchanged)
  // -----------------------
  const handleTypeChange = (newType: 'percentage' | 'amount') => {
    setCommissionType(newType);
    const formatted = newType === 'percentage' ? `${commissionValue}%` : `₹${commissionValue}`;
    setData({ commissionType: newType, commission: formatted });
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCommissionValue(value);
      const formatted = commissionType === 'percentage' ? `${value}%` : `₹${value}`;
      setData({ commission: formatted });
    }
  };

  // -----------------------
  // Row handlers
  // -----------------------
  const handleAddRow = () => {
    const newRows = [...rows, { title: '', description: '' }];
    setRows(newRows);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleRowChange = (index: number, field: keyof RowData, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  // -----------------------
  // InvestmentRange handlers
  // -----------------------
  const addInvestmentRange = () => setInvestmentRange([...investmentRange, { minRange: null, maxRange: null }]);
  const removeInvestmentRange = (i: number) => setInvestmentRange(investmentRange.filter((_, idx) => idx !== i));
  const updateInvestmentRange = (i: number, key: 'minRange' | 'maxRange', value: number | null) => {
    const v = [...investmentRange];
    v[i] = { ...v[i], [key]: value };
    setInvestmentRange(v);
  };

  // -----------------------
  // MonthlyEarn handlers
  // -----------------------
  const addMonthlyEarn = () => setMonthlyEarnPotential([...monthlyEarnPotential, { minEarn: null, maxEarn: null }]);
  const removeMonthlyEarn = (i: number) => setMonthlyEarnPotential(monthlyEarnPotential.filter((_, idx) => idx !== i));
  const updateMonthlyEarn = (i: number, key: 'minEarn' | 'maxEarn', value: number | null) => {
    const v = [...monthlyEarnPotential];
    v[i] = { ...v[i], [key]: value };
    setMonthlyEarnPotential(v);
  };

  // -----------------------
  // FranchiseModel handlers
  // -----------------------
  const addFranchiseModel = () =>
    setFranchiseModel([...franchiseModel, { title: '', agreement: '', price: null, discount: null, gst: null, fees: null }]);
  const removeFranchiseModel = (i: number) => setFranchiseModel(franchiseModel.filter((_, idx) => idx !== i));
  const updateFranchiseModel = (i: number, field: keyof FranchiseModel, value: string | number | null) => {
    const v = [...franchiseModel];
    v[i] = { ...v[i], [field]: value as any };
    setFranchiseModel(v);
  };

  // -----------------------
  // ExtraSections handlers (images kept as URL strings to match other forms)
  // -----------------------
  const addExtraSection = () =>
    setExtraSections([
      ...extraSections,
      { title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] },
    ]);
  const removeExtraSection = (i: number) => setExtraSections(extraSections.filter((_, idx) => idx !== i));
  const updateExtraSection = (i: number, newSection: ExtraSection) => {
    const v = [...extraSections];
    v[i] = newSection;
    setExtraSections(v);
  };

  // helper to update nested string arrays in extra sections
  const updateExtraSectionArrayField = (
    sectionIndex: number,
    field: keyof ExtraSection,
    itemIndex: number,
    value: string
  ) => {
    const v = [...extraSections];
    const arr = [...(v[sectionIndex][field] as string[])];
    arr[itemIndex] = value;
    v[sectionIndex] = { ...v[sectionIndex], [field]: arr } as ExtraSection;
    setExtraSections(v);
  };
  const addExtraSectionArrayItem = (sectionIndex: number, field: keyof ExtraSection) => {
    const v = [...extraSections];
    const arr = [...(v[sectionIndex][field] as string[]), ''];
    v[sectionIndex] = { ...v[sectionIndex], [field]: arr } as ExtraSection;
    setExtraSections(v);
  };
  const removeExtraSectionArrayItem = (sectionIndex: number, field: keyof ExtraSection, itemIndex: number) => {
    const v = [...extraSections];
    const arr = [...(v[sectionIndex][field] as string[])].filter((_, idx) => idx !== itemIndex);
    v[sectionIndex] = { ...v[sectionIndex], [field]: arr } as ExtraSection;
    setExtraSections(v);
  };

  // -----------------------
  // ExtraImages handlers
  // -----------------------
  const addExtraImage = () => setExtraImages([...extraImages, '']);
  const updateExtraImage = (i: number, value: string) => {
    const v = [...extraImages];
    v[i] = value;
    setExtraImages(v);
  };
  const removeExtraImage = (i: number) => setExtraImages(extraImages.filter((_, idx) => idx !== i));

  // -----------------------
  // render helper for generic array sections (keeps style similar to ServiceDetailsForm)
  // -----------------------
  const renderArrayField = <T extends object>(
    items: T[] | undefined,
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    renderItem: (item: T, idx: number, updateItem: (newItem: T) => void) => React.ReactNode,
    defaultItem: T
  ) => {
    const safeItems = items || [];
    return (
      <div className="my-3">
        {safeItems.map((item, idx) => (
          <div key={idx} className="border p-4 rounded mb-3 relative">
            {renderItem(item, idx, (newItem: T) =>
              setItems((prev) => {
                const arr = prev || [];
                return arr.map((it, i) => (i === idx ? newItem : it));
              })
            )}
            <button
              type="button"
              className="absolute top-2 right-2 text-red-500"
              onClick={() => setItems(safeItems.filter((_, i) => i !== idx))}
            >
              <TrashBinIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setItems([...safeItems, defaultItem])}
        >
          + Add More
        </button>
      </div>
    );
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">
  🤝 Franchise Details
</h4>


      <div className="space-y-4">
        <div className="flex flex-wrap gap-6">
          {/* Basic Price display (unchanged) */}
          <div className="w-2/6">
            <Label>Basic Price</Label>
            <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
              ₹{price || 0}
            </div>
          </div>

          {/* Commission (UNCHANGED logic/UI) */}
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
                  className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === 'percentage'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('amount')}
                  className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === 'amount'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  ₹
                </button>
              </div>
            </div>
          </div>

          {/* Commission Distribution (unchanged) */}
          {(() => {
            const totalCommission =
              commissionType === 'percentage'
                ? (Number(price || 0) * Number(commissionValue || 0)) / 100
                : Number(commissionValue || 0);

            const distributionPercents = [0.5, 0.2, 0.1, 0.2];
            const distributedValues = distributionPercents.map((ratio) => totalCommission * ratio);

            return (
              <>
                {distributedValues.map((val, idx) => (
                  <div key={idx} className="w-1/5">
                    <Label>Share {idx + 1} ({distributionPercents[idx] * 100}%)</Label>
                    <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
                      ₹{val.toFixed(2)}
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* Editors */}
        <div className="my-3">
          <Label>Overview</Label>
          <ClientSideCustomEditor value={overview || ''} onChange={setOverview} />
        </div>

        {/* <div className="my-3">
          <Label>How It Works</Label>
          <ClientSideCustomEditor value={howItWorks || ''} onChange={setHowItWorks} />
        </div>

        <div className="my-3">
          <Label>Terms & Conditions</Label>
          <ClientSideCustomEditor value={termsAndConditions || ''} onChange={setTermsAndConditions} />
        </div> */}

        {/* Rows */}
        {/* <div className="my-3">
          {rows.map((row, index) => (
            <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-md font-medium text-gray-700">Row #{index + 1}</h2>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveRow(index)}
                >
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label>Title</Label>
                  <Input
                    type="text"
                    value={row.title}
                    onChange={(e) => handleRowChange(index, 'title', e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddRow}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            + Add New Row
          </button>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Investment Range */}
  <div>
    <div className="my-4">
      <Label>Investment Range</Label>
      <div className='border p-4 rounded'>
      {investmentRange.map((item, i) => (
        
        <div key={i} className="flex gap-4 mt-2 items-center  ">
          <Input
            type="number"
            placeholder="Min Range"
            value={item.minRange ?? ''}
            onChange={(e) =>
              updateInvestmentRange(i, 'minRange', e.target.value ? Number(e.target.value) : null)
            }
          />
          <Input
            type="number"
            placeholder="Max Range"
            value={item.maxRange ?? ''}
            onChange={(e) =>
              updateInvestmentRange(i, 'maxRange', e.target.value ? Number(e.target.value) : null)
            }
          />
          <button
            type="button"
            className="text-red-500"
            onClick={() => removeInvestmentRange(i)}
          >
            <TrashBinIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addInvestmentRange}
        className="mt-3 bg-blue-500 text-white px-3 py-2 rounded"
      >
        + Add Investment Range
      </button>
      </div>
    </div>
  </div>

  {/* Monthly Earn Potential */}
  <div>
    <div className="my-4">
      <Label>Monthly Earn Potential</Label>
      <div className='border p-4 rounded'>
      {monthlyEarnPotential.map((item, i) => (
        <div key={i} className="flex gap-4 mt-2 items-center">
          <Input
            type="number"
            placeholder="Min Earn"
            value={item.minEarn ?? ''}
            onChange={(e) =>
              updateMonthlyEarn(i, 'minEarn', e.target.value ? Number(e.target.value) : null)
            }
          />
          <Input
            type="number"
            placeholder="Max Earn"
            value={item.maxEarn ?? ''}
            onChange={(e) =>
              updateMonthlyEarn(i, 'maxEarn', e.target.value ? Number(e.target.value) : null)
            }
          />
          <button
            type="button"
            className="text-red-500"
            onClick={() => removeMonthlyEarn(i)}
          >
            <TrashBinIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addMonthlyEarn}
        className="mt-3 bg-blue-500 text-white px-3 py-2 rounded"
      >
        + Add Monthly Earn
      </button>
      </div>
    </div>
  </div>
</div>


        {/* Franchise Model */}
        <div className="my-4">
          <Label>Franchise Model</Label>
          {franchiseModel.map((item, i) => (
            <div key={i} className="border p-4 rounded mb-3 relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Model #{i + 1}</h3>
                <button className="text-red-500" type="button" onClick={() => removeFranchiseModel(i)}>
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateFranchiseModel(i, 'title', e.target.value)}
                />
                <Input
                  placeholder="Agreement"
                  value={item.agreement || ''}
                  onChange={(e) => updateFranchiseModel(i, 'agreement', e.target.value)}
                />
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price ?? ''}
                    onChange={(e) => updateFranchiseModel(i, 'price', e.target.value ? Number(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Discount"
                    value={item.discount ?? ''}
                    onChange={(e) => updateFranchiseModel(i, 'discount', e.target.value ? Number(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="GST"
                    value={item.gst ?? ''}
                    onChange={(e) => updateFranchiseModel(i, 'gst', e.target.value ? Number(e.target.value) : null)}
                  />
                  <Input
                    type="number"
                    placeholder="Fees"
                    value={item.fees ?? ''}
                    onChange={(e) => updateFranchiseModel(i, 'fees', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFranchiseModel}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Add Franchise Model
          </button>
        </div>

        {/* Extra Images (URLs) */}
        <div className="my-4">
          <Label>Extra Images (URLs)</Label>
          {extraImages.map((img, i) => (
            <div key={i} className="flex gap-3 items-center mt-2">
              <Input placeholder="Image URL" value={img} onChange={(e) => updateExtraImage(i, e.target.value)} />
              <button type="button" className="text-red-500" onClick={() => removeExtraImage(i)}>
                <TrashBinIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addExtraImage} className="mt-3 bg-blue-500 text-white px-3 py-2 rounded">
            + Add Extra Image
          </button>
        </div>

        {/* Extra Sections */}
        <div className="my-4">
          <Label>Extra Sections</Label>
          {extraSections.map((sec, sIdx) => (
            <div key={sIdx} className="border p-4 rounded mb-3 relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Section #{sIdx + 1}</h3>
                <button className="text-red-500" type="button" onClick={() => removeExtraSection(sIdx)}>
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>

              <Input
                placeholder="Section Title"
                value={sec.title}
                onChange={(e) => updateExtraSection(sIdx, { ...sec, title: e.target.value })}
              />

              {/* For each nested string-array field show add/remove items UI */}
              {(['subtitle', 'image', 'description', 'subDescription', 'lists', 'tags'] as (keyof ExtraSection)[]).map(
                (field) => (
                  <div key={field as string} className="mt-3">
                    <Label className="capitalize">{field}</Label>
                    {(sec[field] || []).map((val: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center mt-2">
                        <Input
                          placeholder={`${field} #${idx + 1}`}
                          value={val}
                          onChange={(e) => updateExtraSectionArrayField(sIdx, field, idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => removeExtraSectionArrayItem(sIdx, field, idx)}
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => addExtraSectionArrayItem(sIdx, field)}
                    >
                      + Add {field}
                    </button>
                  </div>
                )
              )}
            </div>
          ))}

          <button type="button" onClick={addExtraSection} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">
            + Add Extra Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default FranchiseDetailsForm;
