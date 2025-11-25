'use client';

import React, { useEffect, useRef, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ClientSideCustomEditor = dynamic(
  () => import('../../components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

type FAQ = { question: string; answer: string };
type TitleDescription = { title: string; description: string; icon?: string };
type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[];
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};
type Package = { name: string; price: number | null; discount: number | null; discountedPrice: number | null; whatYouGet: string[] };
type MoreInfo = { title: string; image: string; description: string };
type ConnectWith = { name: string; mobileNo: string; email: string };
type TimeRequired = { minDays: number | null; maxDays: number | null };

export type ServiceDetails = {
  benefits: string[];
  aboutUs: string[];
  highlight: File[] | FileList | null;
  highlightPreviews?: string[];
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
  extraImages: string[];
};

interface Props {
  data: ServiceDetails;
  setData: (newData: Partial<ServiceDetails>) => void;
}

const ServiceDetailsForm: React.FC<Props> = ({ data, setData }) => {
  const [editorReady, setEditorReady] = useState(false);
  const mounted = useRef(false);

  const [benefits, setBenefits] = useState<string[]>(data?.benefits || []);
  const [aboutUs, setAboutUs] = useState<string[]>(data?.aboutUs || []);
  const [highlight, setHighlight] = useState<File[] | FileList | null>(data?.highlight || null);
  const [highlightPreviews, setHighlightPreviews] = useState<string[]>(data?.highlightPreviews || []);
  const [document, setDocument] = useState<string[]>(data?.document || []);
  const [assuredByFetchTrue, setAssuredByFetchTrue] = useState<TitleDescription[]>(data?.assuredByFetchTrue?.length ? data.assuredByFetchTrue : [{ title: '', description: '', icon: '' }]);
  const [howItWorks, setHowItWorks] = useState<TitleDescription[]>(data?.howItWorks?.length ? data.howItWorks : [{ title: '', description: '', icon: '' }]);
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>(data?.termsAndConditions || []);
  const [faq, setFaq] = useState<FAQ[]>(data?.faq?.length ? data.faq : [{ question: '', answer: '' }]);
  const [extraSections, setExtraSections] = useState<ExtraSection[]>(data?.extraSections?.length ? data.extraSections : [{ title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] }]);
  const [whyChooseUs, setWhyChooseUs] = useState<TitleDescription[]>(data?.whyChooseUs?.length ? data.whyChooseUs : [{ title: '', description: '', icon: '' }]);
  const [packages, setPackages] = useState<Package[]>(data?.packages?.length ? data.packages : [{ name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }]);
  const [weRequired, setWeRequired] = useState<TitleDescription[]>(data?.weRequired?.length ? data.weRequired : [{ title: '', description: '' }]);
  const [weDeliver, setWeDeliver] = useState<TitleDescription[]>(data?.weDeliver?.length ? data.weDeliver : [{ title: '', description: '' }]);
  const [moreInfo, setMoreInfo] = useState<MoreInfo[]>(data?.moreInfo?.length ? data.moreInfo : [{ title: '', image: '', description: '' }]);
  const [connectWith, setConnectWith] = useState<ConnectWith[]>(data?.connectWith?.length ? data.connectWith : [{ name: '', mobileNo: '', email: '' }]);
  const [timeRequired, setTimeRequired] = useState<TimeRequired[]>(data?.timeRequired?.length ? data.timeRequired : [{ minDays: null, maxDays: null }]);
  const [extraImages, setExtraImages] = useState<string[]>(data?.extraImages?.length ? data.extraImages : ['']);

  useEffect(() => setEditorReady(true), []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setData({
      benefits,
      aboutUs,
      highlight,
      highlightPreviews,
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
      extraImages,
    });
  }, [
    benefits,
    aboutUs,
    highlight,
    highlightPreviews,
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
    extraImages,
    setData,
  ]);

  const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setHighlight(fileArray);
      setHighlightPreviews(fileArray.map(f => URL.createObjectURL(f)));
    }
  };

  // CORRECTED renderArrayField to always show at least one item
  const renderArrayField = <T extends object>(
    items: T[] | undefined,
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    renderItem: (item: T, index: number, updateItem: (newItem: T) => void) => React.ReactNode,
    defaultItem: T
  ) => {
    const safeItems = items && items.length > 0 ? items : [defaultItem];

    return (
      <div className="my-3">
        {safeItems.map((item, idx) => (
          <div key={idx} className="border p-4 rounded mb-3 relative">
            {renderItem(item, idx, (newItem: T) =>
              setItems(prev => {
                const arr = prev && prev.length > 0 ? prev : [defaultItem];
                return arr.map((it, i) => (i === idx ? newItem : it));
              })
            )}
            <button
              type="button"
              className="absolute top-2 right-2 text-red-500"
              onClick={() =>
                setItems(prev => {
                  const arr = prev && prev.length > 0 ? prev : [defaultItem];
                  return arr.filter((_, i) => i !== idx);
                })
              }
            >
              <TrashBinIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setItems(prev => (prev && prev.length > 0 ? [...prev, defaultItem] : [defaultItem]))}
        >
          + Add More
        </button>
      </div>
    );
  };

  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">
        ✨ Service Details
      </h4>

      {/* CKEditors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Benefits</Label>
          {editorReady && (
            <ClientSideCustomEditor value={benefits.join('\n')} onChange={val => setBenefits(val.split('\n'))} />
          )}
        </div>
        <div>
          <Label>About Us</Label>
          {editorReady && (
            <ClientSideCustomEditor value={aboutUs.join('\n')} onChange={val => setAboutUs(val.split('\n'))} />
          )}
        </div>
        <div>
          <Label>Document</Label>
          {editorReady && (
            <ClientSideCustomEditor value={document.join('\n')} onChange={val => setDocument(val.split('\n'))} />
          )}
        </div>
        <div>
          <Label>Terms & Conditions</Label>
          {editorReady && (
            <ClientSideCustomEditor value={termsAndConditions.join('\n')} onChange={val => setTermsAndConditions(val.split('\n'))} />
          )}
        </div>
      </div>

      {/* Highlight Images */}
      <Label>Highlight Images</Label>
      <FileInput onChange={handleMultipleFileChange} multiple />
      <div className="flex flex-wrap gap-4 mt-2">
        {highlightPreviews.map((src, idx) => (
          <Image key={idx} src={src} alt={`highlight-${idx}`} width={100} height={100} className="rounded" />
        ))}
      </div>

      {/* Assured By FetchTrue & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Assured By FetchTrue</Label>
          {renderArrayField<TitleDescription>(
            assuredByFetchTrue,
            setAssuredByFetchTrue,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.icon || ''} placeholder="Icon URL" onChange={e => updateItem({ ...item, icon: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', icon: '', description: '' }
          )}
        </div>
        <div>
          <Label>How It Works</Label>
          {renderArrayField<TitleDescription>(
            howItWorks,
            setHowItWorks,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.icon || ''} placeholder="Icon URL" onChange={e => updateItem({ ...item, icon: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', icon: '', description: '' }
          )}
        </div>
      </div>

      {/* Why Choose Us & Connect With */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Why Choose Us</Label>
          {renderArrayField<TitleDescription>(
            whyChooseUs,
            setWhyChooseUs,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.icon || ''} placeholder="Icon URL" onChange={e => updateItem({ ...item, icon: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', icon: '', description: '' }
          )}
        </div>
        <div>
          <Label>Connect With</Label>
          {renderArrayField<ConnectWith>(
            connectWith,
            setConnectWith,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.name} placeholder="Name" onChange={e => updateItem({ ...item, name: e.target.value })} />
                <Input value={item.mobileNo} placeholder="Mobile No" onChange={e => updateItem({ ...item, mobileNo: e.target.value })} />
                <Input value={item.email} placeholder="Email" onChange={e => updateItem({ ...item, email: e.target.value })} />
              </div>
            ),
            { name: '', mobileNo: '', email: '' }
          )}
        </div>
      </div>

      {/* We Required & We Deliver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>We Required</Label>
          {renderArrayField<TitleDescription>(
            weRequired,
            setWeRequired,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', description: '' }
          )}
        </div>
        <div>
          <Label>We Deliver</Label>
          {renderArrayField<TitleDescription>(
            weDeliver,
            setWeDeliver,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', description: '' }
          )}
        </div>
      </div>

      {/* More Info & FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>More Info</Label>
          {renderArrayField<MoreInfo>(
            moreInfo,
            setMoreInfo,
            (item, idx, updateItem) => (
              <div className="grid gap-2">
                <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />
                <Input value={item.image || ''} placeholder="Image URL" onChange={e => updateItem({ ...item, image: e.target.value })} />
                <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
              </div>
            ),
            { title: '', image: '', description: '' }
          )}
        </div>
        <div>
          <Label>FAQs</Label>
          {renderArrayField<FAQ>(
            faq,
            setFaq,
            (item, idx, updateItem) => (
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
            ),
            { question: '', answer: '' }
          )}
        </div>
      </div>

      {/* Packages */}
      <Label>Packages</Label>
      {renderArrayField<Package>(
        packages,
        setPackages,
        (pkg, pkgIdx, updatePackage) => (
          <div className="border p-4 rounded mb-4 relative">
            <div className="grid gap-2">
              <Input value={pkg.name} placeholder="Package Name" onChange={e => updatePackage({ ...pkg, name: e.target.value })} />
              <Input type="number" value={pkg.price || ''} placeholder="Price" onChange={e => updatePackage({ ...pkg, price: Number(e.target.value) })} />
              <Input type="number" value={pkg.discount || ''} placeholder="Discount" onChange={e => updatePackage({ ...pkg, discount: Number(e.target.value) })} />
              <Input type="number" value={pkg.discountedPrice || ''} placeholder="Discounted Price" onChange={e => updatePackage({ ...pkg, discountedPrice: Number(e.target.value) })} />
            </div>

            {/* What You Get */}
            {renderArrayField<string>(
              Array.isArray(pkg.whatYouGet) && pkg.whatYouGet.length > 0 ? pkg.whatYouGet : [''],
              arr => updatePackage({ ...pkg, whatYouGet: arr }),
              (item, idx, updateItem) => (
                <div className="">
                  <Input value={item} placeholder="What You Get" onChange={e => updateItem(e.target.value)} />
                </div>
              ),
              ''
            )}
          </div>
        ),
        { name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }
      )}

      {/* Time Required */}
      <Label>Time Required</Label>
      {renderArrayField<TimeRequired>(
        timeRequired,
        setTimeRequired,
        (item, idx, updateItem) => (
          <div className="grid gap-2">
            <Input type="number" value={item.minDays || ''} placeholder="Min Days" onChange={e => updateItem({ ...item, minDays: Number(e.target.value) })} />
            <Input type="number" value={item.maxDays || ''} placeholder="Max Days" onChange={e => updateItem({ ...item, maxDays: Number(e.target.value) })} />
          </div>
        ),
        { minDays: null, maxDays: null }
      )}

      {/* Extra Images */}
      <Label>Extra Images URLs</Label>
      {renderArrayField<string>(
        extraImages,
        setExtraImages,
        (img, idx, updateItem) => (
          <div className="">
            <Input value={img} placeholder="Image URL" onChange={e => updateItem(e.target.value)} />
          </div>
        ),
        ''
      )}

      {/* Extra Sections */}
      <Label>Extra Sections</Label>
      {renderArrayField<ExtraSection>(
        extraSections,
        setExtraSections,
        (section, idx, updateSection) => (
          <div className="grid gap-2">
            <Input value={section.title} placeholder="Title" onChange={e => updateSection({ ...section, title: e.target.value })} />
            {/* Render subarrays */}
            {['subtitle', 'image', 'description', 'subDescription', 'lists', 'tags'].map(key => (
              <div key={key}>
                <Label>{key}</Label>
                {renderArrayField<string>(
                  section[key as keyof ExtraSection] as string[],
                  arr => updateSection({ ...section, [key]: arr }),
                  (val, subIdx, updateItem) => (
                    <Input value={val} placeholder={key} onChange={e => updateItem(e.target.value)} />
                  ),
                  ''
                )}
              </div>
            ))}
          </div>
        ),
        { title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] }
      )}
    </div>
  );
};

export default ServiceDetailsForm;
