'use client';

import React, { useEffect, useRef, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';

const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

// ------------------- TYPES -------------------
type FAQ = { question: string; answer: string };
type TitleDescription = { title: string; description: string; icon?: string | File };
type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[];  // Changed to string array for URLs
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};
type Package = { name: string; price: number | null; discount: number | null; discountedPrice: number | null; whatYouGet: string[] };
type MoreInfo = { title: string; image: string | File; description: string };
type ConnectWith = { name: string; mobileNo: string; email: string };
type TimeRequired = { minDays: number | null; maxDays: number | null };
type ExtraImageItem = { icon: string; file?: File };

// ------------------- SERVICE DETAILS -------------------
export type ServiceDetails = {
  benefits: string[];
  aboutUs: string[];
  highlight: (string | File)[];
  document: string[];
  assuredByFetchTrue: TitleDescription[];
  howItWorks: TitleDescription[];
  termsAndConditions: string[];
  faq: FAQ[];
  extraSections: ExtraSection[];
  whyChooseUs: TitleDescription[];
  packages: Package[];
  weRequired: TitleDescription[];
  weDeliver: TitleDescription[];
  moreInfo: MoreInfo[];
  connectWith: ConnectWith[];
  timeRequired: TimeRequired[];
  extraImages: (string | File)[];
};

interface Props {
  data: ServiceDetails;
  setData: (newData: ServiceDetails) => void; 
  fieldsConfig?: typeof moduleFieldConfig["Franchise"]["serviceDetails"];
}

// ------------------- COMPONENT -------------------
const ServiceDetailsForm: React.FC<Props> = ({ data, setData ,fieldsConfig }) => {
  const [editorReady, setEditorReady] = useState(false);
  
  // ------------------- STATES -------------------
  const [benefits, setBenefits] = useState<string[]>([]);
  const [aboutUs, setAboutUs] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<(string | File)[]>([]);
  const [highlightPreviews, setHighlightPreviews] = useState<string[]>([]);
  const [document, setDocument] = useState<string[]>([]);
  const [assuredByFetchTrue, setAssuredByFetchTrue] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [howItWorks, setHowItWorks] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>([{ 
    title: '', 
    subtitle: [''], 
    image: [], 
    description: [''], 
    subDescription: [''], 
    lists: [''], 
    tags: [''] 
  }]);
  const [whyChooseUs, setWhyChooseUs] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [packages, setPackages] = useState<Package[]>([{ 
    name: '', 
    price: null, 
    discount: null, 
    discountedPrice: null, 
    whatYouGet: [''] 
  }]);
  const [weRequired, setWeRequired] = useState<TitleDescription[]>([{ title: '', description: '' }]);
  const [weDeliver, setWeDeliver] = useState<TitleDescription[]>([{ title: '', description: '' }]);
  const [moreInfo, setMoreInfo] = useState<MoreInfo[]>([{ title: '', image: '', description: '' }]);
  const [connectWith, setConnectWith] = useState<ConnectWith[]>([{ name: '', mobileNo: '', email: '' }]);
  const [timeRequired, setTimeRequired] = useState<TimeRequired[]>([{ minDays: null, maxDays: null }]);
  const [extraImages, setExtraImages] = useState<ExtraImageItem[]>([{ icon: "" }]);
  const [showExtraSections, setShowExtraSections] = useState(false);
  
  const didInit = useRef(false);

  // Initialize from props
  useEffect(() => {
    if (!data || didInit.current) return;
    didInit.current = true;

    // Convert single strings to arrays if needed
    setBenefits(Array.isArray(data.benefits) ? data.benefits : [data.benefits || '']);
    setAboutUs(Array.isArray(data.aboutUs) ? data.aboutUs : [data.aboutUs || '']);
    setHighlight(data.highlight || []);
    setHighlightPreviews(data.highlight?.map(img => 
      typeof img === 'string' ? img : URL.createObjectURL(img)
    ) || []);
    setDocument(Array.isArray(data.document) ? data.document : [data.document || '']);
    setAssuredByFetchTrue(data.assuredByFetchTrue?.length ? data.assuredByFetchTrue : [{ title: '', description: '', icon: '' }]);
    setHowItWorks(data.howItWorks?.length ? data.howItWorks : [{ title: '', description: '', icon: '' }]);
    setTermsAndConditions(Array.isArray(data.termsAndConditions) ? data.termsAndConditions : [data.termsAndConditions || '']);
    setFaq(data.faq?.length ? data.faq : [{ question: '', answer: '' }]);
    setExtraSections(data.extraSections?.length ? data.extraSections : [{ 
      title: '', 
      subtitle: [''], 
      image: [], 
      description: [''], 
      subDescription: [''], 
      lists: [''], 
      tags: [''] 
    }]);
    setWhyChooseUs(data.whyChooseUs?.length ? data.whyChooseUs : [{ title: '', description: '', icon: '' }]);
    setPackages(data.packages?.length ? data.packages : [{ 
      name: '', 
      price: null, 
      discount: null, 
      discountedPrice: null, 
      whatYouGet: [''] 
    }]);
    setWeRequired(data.weRequired?.length ? data.weRequired : [{ title: '', description: '' }]);
    setWeDeliver(data.weDeliver?.length ? data.weDeliver : [{ title: '', description: '' }]);
    setMoreInfo(data.moreInfo?.length ? data.moreInfo : [{ title: '', image: '', description: '' }]);
    setConnectWith(data.connectWith?.length ? data.connectWith : [{ name: '', mobileNo: '', email: '' }]);
    setTimeRequired(data.timeRequired?.length ? data.timeRequired : [{ minDays: null, maxDays: null }]);
    
    // Convert extraImages strings to objects
    const extraImagesData = data.extraImages?.map(img => 
      typeof img === 'string' ? { icon: img } : { icon: '', file: img }
    ) || [{ icon: "" }];
    setExtraImages(extraImagesData);
  }, [data]);

  // Update parent when any field changes
  useEffect(() => {
    if (!didInit.current) return;

    const updatedData: ServiceDetails = {
      benefits,
      aboutUs,
      highlight,
      document,
      assuredByFetchTrue,
      howItWorks,
      termsAndConditions,
      faq,
      extraSections,
      whyChooseUs,
      packages,
      weRequired,
      weDeliver,
      moreInfo,
      connectWith,
      timeRequired,
      extraImages: extraImages.map(item => item.file || item.icon), // Convert back to string/File array
      highlightPreviews // Keep previews separate
    };

    setData(updatedData);
  }, [
    benefits,
    aboutUs,
    highlight,
    document,
    assuredByFetchTrue,
    howItWorks,
    termsAndConditions,
    faq,
    extraSections,
    whyChooseUs,
    packages,
    weRequired,
    weDeliver,
    moreInfo,
    connectWith,
    timeRequired,
    extraImages
  ]);

  useEffect(() => setEditorReady(true), []);

  // ------------------- FILE HANDLERS -------------------
  const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setHighlight(fileArray);
      setHighlightPreviews(fileArray.map(f => URL.createObjectURL(f)));
    }
  };

  // Convert CKEditor values to array format
  const handleEditorChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    // Store as array with single item for compatibility
    setter([value]);
  };

  // ------------------- ARRAY FIELD RENDERER -------------------
  function renderArrayField<T extends object>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    renderItem: (
      item: T,
      idx: number,
      updateItem: (updated: T) => void
    ) => React.ReactNode,
    defaultItem: T
  ) {
    const handleAdd = () => {
      setItems(prev => [...prev, defaultItem]);
    };

    const handleUpdate = (idx: number, updatedItem: T) => {
      setItems(prev => {
        const arr = [...prev];
        arr[idx] = updatedItem;
        return arr;
      });
    };

    const handleRemove = (idx: number) => {
      setItems(prev => {
        const arr = prev.filter((_, i) => i !== idx);
        return arr.length > 0 ? arr : [defaultItem];
      });
    };

    return (
      <div className="my-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-2 rounded relative border mb-2">
            {renderItem(item, idx, updated => handleUpdate(idx, updated))}

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 text-red-500"
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          onClick={handleAdd}
        >
          + Add More
        </button>
      </div>
    );
  }

  // Helper to handle file uploads in arrays
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, 
                           currentItem: any, 
                           updateItem: (updated: any) => void, 
                           fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateItem({ ...currentItem, [fieldName]: url });
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">
        Service Details
      </h4>

      <div className="space-y-6">
        {/* Benefits */}
        {fieldsConfig?.benefits && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Benefits</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {editorReady && (
            <ClientSideCustomEditor
              value={benefits[0] || ''}
              onChange={(val) => handleEditorChange(setBenefits, val)}
            />
          )}
        </div>
        )}

        {/* About Us */}
        {fieldsConfig?.aboutUs && (
        <div>
          <div className="flex items-center gap-2">
            <Label>About Us</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {editorReady && (
            <ClientSideCustomEditor
              value={aboutUs[0] || ''}
              onChange={(val) => handleEditorChange(setAboutUs, val)}
            />
          )}
        </div>
        )}

        {/* Highlight Images */}
            {fieldsConfig?.highlight && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Highlight Images</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          <FileInput onChange={handleMultipleFileChange} multiple />
          <div className="flex flex-wrap gap-4 mt-2">
            {highlightPreviews.map((src, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <Image 
                  src={src} 
                  alt={`highlight-${idx}`} 
                  fill
                  className="rounded object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
            )}

        {/* Why Choose Us */}
        {fieldsConfig?.whyChooseUs && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Why Choose Us</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<TitleDescription>(whyChooseUs, setWhyChooseUs, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => updateItem({ ...item, title: e.target.value })} 
              />
              <FileInput
                onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
              />
              <Input 
                value={item.description} 
                placeholder="Description" 
                onChange={e => updateItem({ ...item, description: e.target.value })} 
              />
            </div>
          ), { title: '', description: '', icon: '' })}
        </div>
        )}

        {/* How It Works */}
        {fieldsConfig?.howItWork && (
        <div>
          <div className="flex items-center gap-2">
            <Label>How It Works</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<TitleDescription>(howItWorks, setHowItWorks, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => updateItem({ ...item, title: e.target.value })} 
              />
              <FileInput
                onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
              />
              <Input 
                value={item.description} 
                placeholder="Description" 
                onChange={e => updateItem({ ...item, description: e.target.value })} 
              />
            </div>
          ), { title: '', description: '', icon: '' })}
        </div>
        )}

        {/* Assured By FetchTrue */}
        {fieldsConfig?.assuredByFetchTrue && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Assured By FetchTrue</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<TitleDescription>(assuredByFetchTrue, setAssuredByFetchTrue, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => updateItem({ ...item, title: e.target.value })} 
              />
              <FileInput
                onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
              />
              <Input 
                value={item.description} 
                placeholder="Description" 
                onChange={e => updateItem({ ...item, description: e.target.value })} 
              />
            </div>
          ), { title: '', description: '', icon: '' })}
        </div>
        )}

        {/* Packages */}
        {fieldsConfig?.packages && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Packages</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<Package>(packages, setPackages, (pkg, pkgIdx, updatePackage) => (
            <div className="border p-4 rounded mb-4 relative">
              <div className="grid gap-3">
                <Input
                  value={pkg.name}
                  placeholder="Package Name"
                  onChange={(e) => updatePackage({ ...pkg, name: e.target.value })}
                />
                <Input
                  type="number"
                  value={pkg.price || ''}
                  placeholder="Price"
                  onChange={(e) => {
                    const price = e.target.value ? Number(e.target.value) : null;
                    const discount = pkg.discount || 0;
                    const discountedPrice = price && discount ? 
                      price - (price * discount / 100) : price;
                    updatePackage({ ...pkg, price, discountedPrice });
                  }}
                />
                <Input
                  type="number"
                  value={pkg.discount || ''}
                  placeholder="Discount %"
                  onChange={(e) => {
                    const discount = e.target.value ? Number(e.target.value) : null;
                    const price = pkg.price || 0;
                    const discountedPrice = price && discount ? 
                      price - (price * discount / 100) : price;
                    updatePackage({ ...pkg, discount, discountedPrice });
                  }}
                />
                <Input
                  type="number"
                  value={pkg.discountedPrice || ''}
                  placeholder="Discounted Price"
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              {/* What You Get */}
              <div className="mt-3">
                <Label className="mb-2">What You Get</Label>
                {renderArrayField<string>(
                  pkg.whatYouGet,
                  (newWhatYouGet) => {
                    updatePackage({ ...pkg, whatYouGet: typeof newWhatYouGet === 'function' ? 
                      newWhatYouGet(pkg.whatYouGet) : newWhatYouGet });
                  },
                  (item, idx, updateItem) => (
                    <Input
                      value={item}
                      placeholder="What You Get"
                      onChange={(e) => updateItem(e.target.value)}
                    />
                  ),
                  ''
                )}
              </div>
            </div>
          ), {
            name: '',
            price: null,
            discount: null,
            discountedPrice: null,
            whatYouGet: ['']
          })}
        </div>
        )}

        {/* We Required */}
        {fieldsConfig?.weRequired && (
        <div>
          <div className="flex items-center gap-2">
            <Label>We Required</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<TitleDescription>(weRequired, setWeRequired, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
              <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
            </div>
          ), { title: '', description: '' })}
        </div>
        )}

        {/* We Deliver */}
        {fieldsConfig?.weDeliver && (
        <div>
          <div className="flex items-center gap-2">
            <Label>We Deliver</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<TitleDescription>(weDeliver, setWeDeliver, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
              <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
            </div>
          ), { title: '', description: '' })}
        </div>
        )}

        {/* More Info */}
        {fieldsConfig?.moreInfo && (
        <div>
          <div className="flex items-center gap-2">
            <Label>More Info</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<MoreInfo>(moreInfo, setMoreInfo, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
              <FileInput
                onChange={(e) => handleFileUpload(e, item, updateItem, 'image')}
              />
              <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
            </div>
          ), { title: '', image: '', description: '' })}
        </div>
        )}

        {/* Terms & Conditions */}
        {fieldsConfig?.termsAndCondition && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Terms & Conditions</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {editorReady && (
            <ClientSideCustomEditor
              value={termsAndConditions[0] || ''}
              onChange={(val) => handleEditorChange(setTermsAndConditions, val)}
            />
          )}
        </div>
        )}

        {/* FAQ */}
        {fieldsConfig?.faqs && (
        <div>
          <div className="flex items-center gap-2">
            <Label>FAQs</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<FAQ>(faq, setFaq, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input value={item.question} placeholder="Question" onChange={e => updateItem({ ...item, question: e.target.value })} />
              <textarea
                value={item.answer}
                placeholder="Answer"
                onChange={e => updateItem({ ...item, answer: e.target.value })}
                className="w-full border rounded p-2 resize-none"
                rows={3}
              />
            </div>
          ), { question: '', answer: '' })}
        </div>
        )}

        {/* Connect With */}
         {fieldsConfig?.connectWith && (
        <div>
          <div className="flex items-center gap-2">
            <Label>Connect With</Label>
            <span className="text-red-500 text-sm font-semibold">(All Services)</span>
          </div>
          {renderArrayField<ConnectWith>(connectWith, setConnectWith, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input value={item.name} placeholder="Name" onChange={e => updateItem({ ...item, name: e.target.value })} />
              <Input value={item.mobileNo} placeholder="Mobile No" onChange={e => updateItem({ ...item, mobileNo: e.target.value })} />
              <Input value={item.email} placeholder="Email" onChange={e => updateItem({ ...item, email: e.target.value })} />
            </div>
          ), { name: '', mobileNo: '', email: '' })}
        </div>
         )}

        {/* Document */}
        {fieldsConfig?.document && (
        <div>
          <Label>Document</Label>
          {editorReady && (
            <ClientSideCustomEditor
              value={document[0] || ''}
              onChange={(val) => handleEditorChange(setDocument, val)}
            />
          )}
        </div>
        )}

        {/* Time Required */}
        {fieldsConfig?.timeRequired && (
        <div>
          <Label>Time Required</Label>
          {renderArrayField<TimeRequired>(timeRequired, setTimeRequired, (item, idx, updateItem) => (
            <div className="grid gap-2">
              <Input 
                type="number" 
                value={item.minDays || ''} 
                placeholder="Min Days" 
                onChange={e => updateItem({ ...item, minDays: e.target.value ? Number(e.target.value) : null })} 
              />
              <Input 
                type="number" 
                value={item.maxDays || ''} 
                placeholder="Max Days" 
                onChange={e => updateItem({ ...item, maxDays: e.target.value ? Number(e.target.value) : null })} 
              />
            </div>
          ), { minDays: null, maxDays: null })}
        </div>
        )}

        {/* Extra Images */}
        {fieldsConfig?.extraImage && (
        <div>
          <Label>Extra Images</Label>
          {renderArrayField<ExtraImageItem>(extraImages, setExtraImages, (img, idx, updateImg) => (
            <div className="flex items-center gap-2">
              <FileInput
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    updateImg({ icon: url, file });
                  }
                }}
              />
            </div>
          ), { icon: "" })}
        </div>
        )}

        {/* Extra Sections */}
        {fieldsConfig?.extraSection && (
        <div className="my-4">
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
              {renderArrayField<ExtraSection>(
                extraSections,
                setExtraSections,
                (section, idx, updateSection) => (
                  <div className="grid gap-2 p-4 border rounded mb-4">
                    <Input
                      value={section.title}
                      placeholder="Title"
                      onChange={(e) => updateSection({ ...section, title: e.target.value })}
                    />
                    
                    {['subtitle', 'description', 'subDescription', 'lists', 'tags'].map((field) => (
                      <div key={field} className="my-2">
                        <Label className="capitalize mb-1">{field}</Label>
                        {renderArrayField<string>(
                          section[field as keyof ExtraSection] as string[],
                          (newArray) => {
                            const updated = { ...section };
                            updated[field as keyof ExtraSection] = typeof newArray === 'function' ? 
                              newArray(updated[field as keyof ExtraSection] as string[]) : 
                              newArray;
                            updateSection(updated);
                          },
                          (val, idx2, updateVal) => (
                            <Input
                              value={val}
                              placeholder={field}
                              onChange={(e) => updateVal(e.target.value)}
                            />
                          ),
                          ''
                        )}
                      </div>
                    ))}
                    
                    <div className="my-2">
                      <Label>Images</Label>
                      <FileInput
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            const fileArray = Array.from(files);
                            const urls = fileArray.map(file => URL.createObjectURL(file));
                            updateSection({ 
                              ...section, 
                              image: [...section.image, ...urls] 
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                ),
                { 
                  title: '', 
                  subtitle: [''], 
                  image: [], 
                  description: [''], 
                  subDescription: [''], 
                  lists: [''], 
                  tags: [''] 
                }
              )}
              
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
                onClick={() => setExtraSections(prev => [
                  ...prev, 
                  { 
                    title: '', 
                    subtitle: [''], 
                    image: [], 
                    description: [''], 
                    subDescription: [''], 
                    lists: [''], 
                    tags: [''] 
                  }
                ])}
              >
                + Add Extra Section
              </button>
              
              <button
                type="button"
                onClick={() => setShowExtraSections(false)}
                className="ml-3 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Hide Sections
              </button>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailsForm;