'use client';
import React, { useEffect, useState } from 'react'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import { TrashBinIcon } from '@/icons';
import dynamic from 'next/dynamic';

const ClientSideCustomEditor = dynamic(() => import('../../components/custom-editor/CustomEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface RowData {
  title: string;
  description: string;
}

interface FranchiseData {
  commission?: string;
  commissionType?: string;
  overview?: string;
  howItWorks?: string;
  termsAndConditions?: string;
  rows?: RowData[];
}

interface FranchiseDetailsFormProps {
  data: FranchiseData;
  setData: (newData: Partial<FranchiseData>) => void;
   basicPrice?: number;
   
}

const FranchiseDetailsForm = ({ data, setData, basicPrice }: FranchiseDetailsFormProps) => {
  const [overview, setOverview] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);
  const [commissionType, setCommissionType] = useState<'percentage' | 'amount'>('percentage');
  const [commissionValue, setCommissionValue] = useState("");

  useEffect(() => {
  if (data) {
    setOverview(data.overview || '');
    setHowItWorks(data.howItWorks || '');
    setTermsAndConditions(data.termsAndConditions || '');
    setRows(data.rows?.length ? data.rows : []);

    if (data.commission) {
      const isPercentage = data.commission.includes('%');
      const isAmount = data.commission.includes('₹');
      const numericValue = data.commission.replace(/[^\d]/g, '');

      setCommissionType(isPercentage ? 'percentage' : 'amount');
      setCommissionValue(numericValue);
    }
  }
}, []);

 console.log("franchise details : ",data);
 

  useEffect(() => {
    const newData: FranchiseData = {
      overview,
      howItWorks,
      termsAndConditions,
      rows
    };
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      setData(newData);
    }
  }, [overview, howItWorks, termsAndConditions, rows]);

  const handleTypeChange = (newType: 'percentage' | 'amount') => {
    setCommissionType(newType);
    const formatted =
      newType === 'percentage' ? `${commissionValue}%` : `₹${commissionValue}`;
    setData({ commissionType: newType, commission: formatted });
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCommissionValue(value);
      const formatted =
        commissionType === "percentage" ? `${value}%` : `₹${value}`;
      setData({ commission: formatted });
    }
  };

  const handleAddRow = () => {
    const newRows = [...rows, { title: '', description: '' }];
    setRows(newRows);
    setData({ rows: newRows });
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
    setData({ rows: updatedRows });
  };

  const handleRowChange = (
    index: number,
    field: keyof RowData,
    value: string
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
    setData({ rows: updatedRows });
  };

  return (
    <div>
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Franchise Details</h4>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-6">
          {/* Basic Price */}
          <div className="w-2/6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Basic Price
            </Label>
            <div className="px-4 py-2 border rounded-md bg-gray-50 text-gray-800 text-base">
              ₹{basicPrice || 0}
            </div>
          </div>

          {/* Commission Section */}
          <div className="w-3/6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              {commissionType === "percentage" ? "Commission (%)" : "Commission (₹)"}
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
                  {commissionType === "percentage" ? "%" : "₹"}
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
                  onClick={() => handleTypeChange("percentage")}
                  className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === "percentage"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("amount")}
                  className={`px-3 py-2 rounded-md border text-sm transition ${commissionType === "amount"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  ₹
                </button>
              </div>
            </div>
          </div>

          {/* Commission Distribution */}
          {(() => {
            const totalCommission =
              commissionType === "percentage"
                ? (Number(basicPrice || 0) * Number(commissionValue || 0)) / 100
                : Number(commissionValue || 0);

            const distributionPercents = [0.5, 0.2, 0.1, 0.2];
            const distributedValues = distributionPercents.map(
              (ratio) => totalCommission * ratio
            );

            return (
              <>
                {distributedValues.map((val, idx) => (
                  <div key={idx} className="w-1/5">
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Share {idx + 1} ({distributionPercents[idx] * 100}%)
                    </Label>
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
        <div className='my-3'>
          <Label>Overview</Label>
          <div className="my-editor">
            <ClientSideCustomEditor value={overview} onChange={setOverview} />
          </div>
        </div>

        <div className='my-3'>
          <Label>How It&apos;s Works</Label>
          <div className="my-editor">
            <ClientSideCustomEditor value={howItWorks} onChange={setHowItWorks} />
          </div>
        </div>

        <div className='my-3'>
          <Label>Terms &amp; Conditions</Label>
          <ClientSideCustomEditor value={termsAndConditions} onChange={setTermsAndConditions} />
        </div>

        {/* Rows Section */}
        <div className="my-3">
          {rows.map((row, index) => (
            <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-md font-medium text-gray-700">Row #{index + 1}</h2>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveRow(index)}
                  aria-label="Remove Row"
                >
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label>Title</Label>
                  <Input
                    type="text"
                    placeholder="Enter Document Name"
                    value={row.title}
                    onChange={(e) => handleRowChange(index, 'title', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-1/2">
                  <Label>Description</Label>
                  <Input
                    type="text"
                    placeholder="Enter Description"
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                    className="w-full"
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
        </div>
      </div>
    </div>
  );
};

export default FranchiseDetailsForm;
