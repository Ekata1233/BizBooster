'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// ---------------- EDITOR ----------------
const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

// ---------------- TYPES ----------------
type FAQ = { question: string; answer: string };
type TitleDescription = { title: string; description: string; icon?: string };
type Package = {
  name: string;
  price: number | null;
  discount: number | null;
  discountedPrice: number | null;
  whatYouGet: string[];
};
type MoreInfo = { title: string; image: string; description: string };
type ConnectWith = { name: string; mobileNo: string; email: string };
type TimeRequired = { minDays: number | null; maxDays: number | null };
type ExtraImageItem = { icon: string };
type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[];
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};

interface ServiceUpdateFromProps {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

// ---------------- COMPONENT ----------------
const ServiceUpdateFrom: React.FC<ServiceUpdateFromProps> = ({ data, setData }) => {
  // ---------- BASIC STATES ----------
  const [editorReady, setEditorReady] = useState(false);

  const [benefits, setBenefits] = useState<string[]>(['']);
  const [aboutUs, setAboutUs] = useState<string[]>(['']);
  const [terms, setTerms] = useState<string[]>(['']);
  const [document, setDocument] = useState<string[]>(['']);

  const [highlightImages, setHighlightImages] = useState<string[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [howItWorks, setHowItWorks] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [assuredByFetchTrue, setAssuredByFetchTrue] = useState<TitleDescription[]>([{ title: '', description: '', icon: '' }]);
  const [weRequired, setWeRequired] = useState<TitleDescription[]>([{ title: '', description: '' }]);
  const [weDeliver, setWeDeliver] = useState<TitleDescription[]>([{ title: '', description: '' }]);

  const [packages, setPackages] = useState<Package[]>([{
    name: '',
    price: null,
    discount: null,
    discountedPrice: null,
    whatYouGet: ['']
  }]);

  const [moreInfo, setMoreInfo] = useState<MoreInfo[]>([{ title: '', image: '', description: '' }]);
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [connectWith, setConnectWith] = useState<ConnectWith[]>([{ name: '', mobileNo: '', email: '' }]);
  const [timeRequired, setTimeRequired] = useState<TimeRequired[]>([{ minDays: null, maxDays: null }]);
  const [extraImages, setExtraImages] = useState<ExtraImageItem[]>([{ icon: '' }]);

  const [extraSections, setExtraSections] = useState<ExtraSection[]>([]);
  const [showExtraSections, setShowExtraSections] = useState(false);

// Add this at the top of your component after useState declarations
const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

// Replace the problematic useEffect with this:
useEffect(() => {
  // Create the new service details object
  const newServiceDetails = {
    benefits,
    aboutUs,
    termsAndConditions: terms,
    document,
    highlight: highlightImages,
    whyChooseUs,
    howItWorks,
    assuredByFetchTrue,
    weRequired,
    weDeliver,
    packages,
    moreInfo,
    faq: faqs,
    connectWith,
    timeRequired,
    extraImages: extraImages.map(img => img.icon),
    extraSections: showExtraSections ? extraSections : []
  };

  // Only update if the data has actually changed
  if (!isEqual(data?.serviceDetails, newServiceDetails)) {
    setData((prev: any) => ({
      ...prev,
      serviceDetails: newServiceDetails
    }));
  }
}, [
  benefits, aboutUs, terms, document, highlightImages,
  whyChooseUs, howItWorks, assuredByFetchTrue, weRequired,
  weDeliver, packages, moreInfo, faqs, connectWith,
  timeRequired, extraImages, extraSections, showExtraSections,
  // Add data as a dependency to compare
  data?.serviceDetails
]);

// Also, add useMemo to memoize array/object values that are created in render:
const memoizedExtraImages = useMemo(() => extraImages.map(img => img.icon), [extraImages]);

// Update the dependency in useEffect to use the memoized version:
extraImages: memoizedExtraImages,

  useEffect(() => {
    setEditorReady(true);
  }, []);

  // Update parent data whenever any field changes
  useEffect(() => {
    setData((prev: any) => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        benefits,
        aboutUs,
        termsAndConditions: terms,
        document,
        highlight: highlightImages,
        whyChooseUs,
        howItWorks,
        assuredByFetchTrue,
        weRequired,
        weDeliver,
        packages,
        moreInfo,
        faq: faqs,
        connectWith,
        timeRequired,
        extraImages: extraImages.map(img => img.icon),
        extraSections: showExtraSections ? extraSections : []
      }
    }));
  }, [
    benefits, aboutUs, terms, document, highlightImages,
    whyChooseUs, howItWorks, assuredByFetchTrue, weRequired,
    weDeliver, packages, moreInfo, faqs, connectWith,
    timeRequired, extraImages, extraSections, showExtraSections
  ]);

  const benefitsValue = benefits[0] || "";
  const aboutUsValue = aboutUs[0] || "";
  const termsAndConditionValue = terms[0] || "";
  const documentValue = document[0] || "";

  // ---------------- HELPERS ----------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (urls: string[]) => void) => {
    if (e.target.files) {
      const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
      callback(urls);
    }
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      callback(URL.createObjectURL(file));
    }
  };

  function renderArrayField<T>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    renderItem: (item: T, idx: number, update: (v: T) => void) => React.ReactNode,
    defaultItem: T
  ) {
    return (
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="border p-4 rounded relative bg-gray-50">
            {renderItem(item, idx, updated =>
              setItems(prev => prev.map((v, i) => (i === idx ? updated : v)))
            )}

            {items.length > 1 && (
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          onClick={() => setItems(prev => [...prev, defaultItem])}
        >
          + Add More
        </button>
      </div>
    );
  }

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-8 p-4">
      <h4 className="text-2xl font-bold text-center text-gray-800">Service Details</h4>

      {/* Benefits */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Benefits</Label>
        {editorReady && (
          <div className="border rounded-lg overflow-hidden">
            <ClientSideCustomEditor
              value={benefitsValue}
              onChange={(value: string) => setBenefits([value])}
            />
          </div>
        )}
      </div>

      {/* About Us */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">About Us</Label>
        {editorReady && (
          <div className="border rounded-lg overflow-hidden">
            <ClientSideCustomEditor
              value={aboutUsValue}
              onChange={(value: string) => setAboutUs([value])}
            />
          </div>
        )}
      </div>

      {/* Highlight Images */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Highlight Images</Label>
        <FileInput
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e, (urls) => {
            setHighlightImages(prev => [...prev, ...urls]);
          })}
        />
        <div className="flex gap-3 mt-3 flex-wrap">
          {highlightImages.map((src, idx) => (
            <div key={idx} className="w-24 h-24 relative group">
              <Image 
                src={src} 
                alt="highlight" 
                fill 
                className="rounded-lg object-cover"
                sizes="96px"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setHighlightImages(prev => prev.filter((_, i) => i !== idx))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Why Choose Us</Label>
        {renderArrayField(
          whyChooseUs,
          setWhyChooseUs,
          (item, _, update) => (
            <div className="space-y-3">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => update({ ...item, title: e.target.value })} 
              />
              <div>
                <Label>Icon/Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleSingleFileUpload(e, (url) => update({ ...item, icon: url }))}
                />
                {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
              </div>
              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[100px] resize-y"
              />
            </div>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>

      {/* How It Works */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">How It Works</Label>
        {renderArrayField(
          howItWorks,
          setHowItWorks,
          (item, _, update) => (
            <div className="space-y-3">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => update({ ...item, title: e.target.value })} 
              />
              <div>
                <Label>Icon/Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleSingleFileUpload(e, (url) => update({ ...item, icon: url }))}
                />
                {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
              </div>
              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[100px] resize-y"
              />
            </div>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>

      {/* Assured By */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Assured By FetchTrue</Label>
        {renderArrayField(
          assuredByFetchTrue,
          setAssuredByFetchTrue,
          (item, _, update) => (
            <div className="space-y-3">
              <Input 
                value={item.title} 
                placeholder="Title" 
                onChange={e => update({ ...item, title: e.target.value })} 
              />
              <div>
                <Label>Icon/Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleSingleFileUpload(e, (url) => update({ ...item, icon: url }))}
                />
                {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
              </div>
              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[100px] resize-y"
              />
            </div>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>

      {/* Packages */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          Packages <span className="text-red-500 text-sm">(All Services)</span>
        </Label>
        {renderArrayField(
          packages,
          setPackages,
          (pkg, _, updatePkg) => (
            <div className="space-y-4 p-4 bg-white rounded-lg border">
              <Input
                value={pkg.name}
                placeholder="Package Name"
                onChange={e => updatePkg({ ...pkg, name: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  value={pkg.price ?? ''}
                  placeholder="Price"
                  onChange={e => {
                    const price = e.target.value ? Number(e.target.value) : null;
                    const discount = pkg.discount ?? 0;
                    const discountedPrice = price && discount ? 
                      price - (price * discount) / 100 : price;
                    updatePkg({ ...pkg, price, discountedPrice });
                  }}
                />

                <Input
                  type="number"
                  value={pkg.discount ?? ''}
                  placeholder="Discount %"
                  min="0"
                  max="100"
                  onChange={e => {
                    const discount = e.target.value ? Number(e.target.value) : null;
                    const price = pkg.price ?? 0;
                    const discountedPrice = price && discount ? 
                      price - (price * discount) / 100 : price;
                    updatePkg({ ...pkg, discount, discountedPrice });
                  }}
                />

                <Input
                  value={pkg.discountedPrice ?? ''}
                  placeholder="Discounted Price"
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              {/* What You Get */}
              <div>
                <Label className="font-medium">What You Get</Label>
                <div className="space-y-2">
                  {pkg.whatYouGet.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={item}
                        placeholder="Feature"
                        onChange={e => {
                          const newArr = [...pkg.whatYouGet];
                          newArr[idx] = e.target.value;
                          updatePkg({ ...pkg, whatYouGet: newArr });
                        }}
                      />
                      {pkg.whatYouGet.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500 px-3"
                          onClick={() => {
                            const newArr = pkg.whatYouGet.filter((_, i) => i !== idx);
                            updatePkg({ ...pkg, whatYouGet: newArr });
                          }}
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-500 text-sm"
                    onClick={() => updatePkg({ ...pkg, whatYouGet: [...pkg.whatYouGet, ''] })}
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            name: '',
            price: null,
            discount: null,
            discountedPrice: null,
            whatYouGet: ['']
          }
        )}
      </div>

      {/* We Required */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">We Required</Label>
        {renderArrayField(
          weRequired,
          setWeRequired,
          (item, _, update) => (
            <div className="space-y-3">
              <Input
                value={item.title}
                placeholder="Title"
                onChange={e => update({ ...item, title: e.target.value })}
              />
              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[80px] resize-y"
              />
            </div>
          ),
          { title: '', description: '' }
        )}
      </div>

      {/* We Deliver */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">We Deliver</Label>
        {renderArrayField(
          weDeliver,
          setWeDeliver,
          (item, _, update) => (
            <div className="space-y-3">
              <Input
                value={item.title}
                placeholder="Title"
                onChange={e => update({ ...item, title: e.target.value })}
              />
              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[80px] resize-y"
              />
            </div>
          ),
          { title: '', description: '' }
        )}
      </div>

      {/* More Info */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">More Info</Label>
        {renderArrayField(
          moreInfo,
          setMoreInfo,
          (item, _, update) => (
            <div className="space-y-3">
              <Input
                value={item.title}
                placeholder="Title"
                onChange={e => update({ ...item, title: e.target.value })}
              />

              <div>
                <Label>Image</Label>
                <FileInput
                  accept="image/*"
                  onChange={(e) => handleSingleFileUpload(e, (url) => update({ ...item, image: url }))}
                />
                {item.image && (
                  <div className="w-32 h-32 relative mt-2">
                    <Image src={item.image} alt="info" fill className="rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <textarea
                value={item.description}
                placeholder="Description"
                onChange={e => update({ ...item, description: e.target.value })}
                className="w-full border rounded p-3 min-h-[100px] resize-y"
              />
            </div>
          ),
          { title: '', image: '', description: '' }
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Terms & Conditions</Label>
        {editorReady && (
          <div className="border rounded-lg overflow-hidden">
            <ClientSideCustomEditor
              value={termsAndConditionValue}
              onChange={(value: string) => setTerms([value])}
            />
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">FAQs</Label>
        {renderArrayField(
          faqs,
          setFaqs,
          (item, _, update) => (
            <div className="space-y-3">
              <Input
                value={item.question}
                placeholder="Question"
                onChange={e => update({ ...item, question: e.target.value })}
              />
              <textarea
                value={item.answer}
                placeholder="Answer"
                onChange={e => update({ ...item, answer: e.target.value })}
                className="w-full border rounded p-3 min-h-[100px] resize-y"
              />
            </div>
          ),
          { question: '', answer: '' }
        )}
      </div>

      {/* Connect With */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Connect With</Label>
        {renderArrayField(
          connectWith,
          setConnectWith,
          (item, _, update) => (
            <div className="space-y-3">
              <Input 
                value={item.name} 
                placeholder="Name" 
                onChange={e => update({ ...item, name: e.target.value })} 
              />
              <Input 
                value={item.mobileNo} 
                placeholder="Mobile No" 
                onChange={e => update({ ...item, mobileNo: e.target.value })} 
              />
              <Input 
                type="email"
                value={item.email} 
                placeholder="Email" 
                onChange={e => update({ ...item, email: e.target.value })} 
              />
            </div>
          ),
          { name: '', mobileNo: '', email: '' }
        )}
      </div>

      {/* Document */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Document</Label>
        {editorReady && (
          <div className="border rounded-lg overflow-hidden">
            <ClientSideCustomEditor
              value={documentValue}
              onChange={(value: string) => setDocument([value])}
            />
          </div>
        )}
      </div>

      {/* Time Required */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Time Required</Label>
        {renderArrayField(
          timeRequired,
          setTimeRequired,
          (item, _, update) => (
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Min Days</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min Days"
                  value={item.minDays ?? ''}
                  onChange={e =>
                    update({ ...item, minDays: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className="flex-1">
                <Label>Max Days</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max Days"
                  value={item.maxDays ?? ''}
                  onChange={e =>
                    update({ ...item, maxDays: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
            </div>
          ),
          { minDays: null, maxDays: null }
        )}
      </div>

      {/* Extra Images */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Extra Images</Label>
        {renderArrayField(
          extraImages,
          setExtraImages,
          (item, _, update) => (
            <div>
              <FileInput
                accept="image/*"
                onChange={(e) => handleSingleFileUpload(e, (url) => update({ icon: url }))}
              />
              {item.icon && (
                <div className="w-24 h-24 relative mt-2">
                  <Image src={item.icon} alt="extra" fill className="rounded-lg object-cover" />
                </div>
              )}
            </div>
          ),
          { icon: '' }
        )}
      </div>

      {/* EXTRA SECTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Extra Sections</Label>
          
          {!showExtraSections ? (
            <button
              type="button"
              onClick={() => setShowExtraSections(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              + Add Extra Section
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowExtraSections(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Hide Sections
            </button>
          )}
        </div>

        {showExtraSections && (
          <div className="space-y-4">
            {extraSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold">Section {sectionIdx + 1}</h5>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setExtraSections(prev => prev.filter((_, i) => i !== sectionIdx))}
                  >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
                </div>

                <Input
                  value={section.title}
                  placeholder="Section Title"
                  onChange={e => {
                    const newSections = [...extraSections];
                    newSections[sectionIdx] = { ...section, title: e.target.value };
                    setExtraSections(newSections);
                  }}
                />

                {/* Subtitle */}
                <div>
                  <Label>Subtitles</Label>
                  <div className="space-y-2">
                    {section.subtitle.map((sub, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={sub}
                          placeholder="Subtitle"
                          onChange={e => {
                            const newSections = [...extraSections];
                            const newSubtitle = [...section.subtitle];
                            newSubtitle[idx] = e.target.value;
                            newSections[sectionIdx] = { ...section, subtitle: newSubtitle };
                            setExtraSections(newSections);
                          }}
                        />
                        {section.subtitle.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 px-3"
                            onClick={() => {
                              const newSections = [...extraSections];
                              newSections[sectionIdx] = {
                                ...section,
                                subtitle: section.subtitle.filter((_, i) => i !== idx)
                              };
                              setExtraSections(newSections);
                            }}
                          >
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-blue-500 text-sm"
                      onClick={() => {
                        const newSections = [...extraSections];
                        newSections[sectionIdx] = {
                          ...section,
                          subtitle: [...section.subtitle, '']
                        };
                        setExtraSections(newSections);
                      }}
                    >
                      + Add Subtitle
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <Label>Images</Label>
                  <FileInput
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                        const newSections = [...extraSections];
                        newSections[sectionIdx] = {
                          ...section,
                          image: [...section.image, ...urls]
                        };
                        setExtraSections(newSections);
                      }
                    }}
                  />
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {section.image.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 relative group">
                        <Image src={img} alt="section" fill className="rounded-lg object-cover" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newSections = [...extraSections];
                            newSections[sectionIdx] = {
                              ...section,
                              image: section.image.filter((_, i) => i !== idx)
                            };
                            setExtraSections(newSections);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lists, Tags, etc. */}
                {['description', 'subDescription', 'lists', 'tags'].map((field) => (
                  <div key={field}>
                    <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <div className="space-y-2">
                      {(section[field as keyof ExtraSection] as string[]).map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={item}
                            placeholder={field}
                            onChange={e => {
                              const newSections = [...extraSections];
                              const newArray = [...(section[field as keyof ExtraSection] as string[])];
                              newArray[idx] = e.target.value;
                              newSections[sectionIdx] = { ...section, [field]: newArray };
                              setExtraSections(newSections);
                            }}
                          />
                          {(section[field as keyof ExtraSection] as string[]).length > 1 && (
                            <button
                              type="button"
                              className="text-red-500 px-3"
                              onClick={() => {
                                const newSections = [...extraSections];
                                newSections[sectionIdx] = {
                                  ...section,
                                  [field]: (section[field as keyof ExtraSection] as string[]).filter((_, i) => i !== idx)
                                };
                                setExtraSections(newSections);
                              }}
                            >
                              <TrashBinIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-blue-500 text-sm"
                        onClick={() => {
                          const newSections = [...extraSections];
                          newSections[sectionIdx] = {
                            ...section,
                            [field]: [...(section[field as keyof ExtraSection] as string[]), '']
                          };
                          setExtraSections(newSections);
                        }}
                      >
                        + Add {field}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors"
              onClick={() => setExtraSections(prev => [...prev, {
                title: '',
                subtitle: [''],
                image: [],
                description: [''],
                subDescription: [''],
                lists: [''],
                tags: ['']
              }])}
            >
              + Add New Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceUpdateFrom;