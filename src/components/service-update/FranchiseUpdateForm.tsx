'use client';

import React, { useEffect, useState } from 'react';
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
 data, setData ,
  fieldsConfig,
}) => {

    // console.log("franchise details form  : ", data)

  const [editorReady, setEditorReady] = useState(false);

  /* ---------------- STATES ---------------- */
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

  useEffect(() => {
  if (!data?.franchiseDetails) return;
  const fd = data.franchiseDetails;
  setTermsAndConditions(fd.termsAndConditions || '');
  setInvestmentRange(
    fd.investmentRange?.length
      ? fd.investmentRange
      : [{ minRange: null, maxRange: null }]
  );
  setMonthlyEarnPotential(
    fd.monthlyEarnPotential?.length
      ? fd.monthlyEarnPotential
      : [{ minEarn: null, maxEarn: null }]
  );
  setFranchiseModel(
    fd.franchiseModel?.length
      ? fd.franchiseModel
      : [{ title: '', agreement: '', price: null, discount: null, gst: null, fees: null }]
  );
  setExtraImages(
    fd.extraImages?.length ? fd.extraImages : ['']
  );
  setExtraSections(
    fd.extraSections?.length
      ? fd.extraSections
      : [
          {
            title: '',
            subtitle: [''],
            image: [],
            description: [''],
            subDescription: [''],
            lists: [''],
            tags: [''],
          },
        ]
  );
  setShowExtraSections(!!fd.extraSections?.length);

}, [data]);


  useEffect(() => setEditorReady(true), []);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-center"> Franchise Details</h4>

      {/* Terms & Conditions */}
      {fieldsConfig?.termsAndConditions && (
        <div>
          <Label>Terms & Conditions</Label>
          {editorReady && (
            <ClientSideCustomEditor
              value={termsAndConditions}
              onChange={setTermsAndConditions}
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
                onChange={e =>
                  setInvestmentRange(v =>
                    v.map((x, idx) =>
                      idx === i ? { ...x, minRange: Number(e.target.value) || null } : x
                    )
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max Range"
                value={item.maxRange ?? ''}
                onChange={e =>
                  setInvestmentRange(v =>
                    v.map((x, idx) =>
                      idx === i ? { ...x, maxRange: Number(e.target.value) || null } : x
                    )
                  )
                }
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
                onChange={e =>
                  setMonthlyEarnPotential(v =>
                    v.map((x, idx) =>
                      idx === i ? { ...x, minEarn: Number(e.target.value) || null } : x
                    )
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max Earn"
                value={item.maxEarn ?? ''}
                onChange={e =>
                  setMonthlyEarnPotential(v =>
                    v.map((x, idx) =>
                      idx === i ? { ...x, maxEarn: Number(e.target.value) || null } : x
                    )
                  )
                }
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
                onChange={e =>
                  setFranchiseModel(v =>
                    v.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x))
                  )
                }
              />
              <Input
                placeholder="Agreement"
                value={item.agreement}
                onChange={e =>
                  setFranchiseModel(v =>
                    v.map((x, idx) => (idx === i ? { ...x, agreement: e.target.value } : x))
                  )
                }
              />
              <div className="grid grid-cols-4 gap-2">
                {(['price', 'discount', 'gst', 'fees'] as const).map(field => (
                  <Input
                    key={field}
                    type="number"
                    placeholder={field}
                    value={item[field] ?? ''}
                    onChange={e =>
                      setFranchiseModel(v =>
                        v.map((x, idx) =>
                          idx === i ? { ...x, [field]: Number(e.target.value) || null } : x
                        )
                      )
                    }
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

      {/* Extra Images */}
      {fieldsConfig?.extraImages && (
        <div>
          <Label>Extra Images</Label>
          {extraImages.map((img, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <FileInput
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setExtraImages(v => v.map((x, idx) => (idx === i ? url : x)));
                  }
                }}
              />
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
      )}

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
                    onChange={e =>
                      setExtraSections(v =>
                        v.map((x, idx) =>
                          idx === sIdx ? { ...x, title: e.target.value } : x
                        )
                      )
                    }
                  />

                  {(['subtitle', 'description', 'subDescription', 'lists', 'tags'] as const).map(
                    field => (
                      <div key={field}>
                        <Label>{field}</Label>
                        {sec[field].map((val, i) => (
                          <Input
                            key={i}
                            value={val}
                            onChange={e =>
                              setExtraSections(v =>
                                v.map((x, idx) =>
                                  idx === sIdx
                                    ? {
                                        ...x,
                                        [field]: x[field].map((y, j) =>
                                          j === i ? e.target.value : y
                                        ),
                                      }
                                    : x
                                )
                              )
                            }
                          />
                        ))}
                        <button
                          className="mt-1 bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() =>
                            setExtraSections(v =>
                              v.map((x, idx) =>
                                idx === sIdx
                                  ? { ...x, [field]: [...x[field], ''] }
                                  : x
                              )
                            )
                          }
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
