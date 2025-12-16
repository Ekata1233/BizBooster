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

// ------------------- TYPES -------------------
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

// ------------------- SERVICE DETAILS -------------------
export type ServiceDetails = {
  benefits: string[];
  aboutUs: string[];
  highlight: string[];

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
  setData: (newData: { serviceDetails: ServiceDetails }) => void;
}


// ------------------- COMPONENT -------------------
const ServiceDetailsForm: React.FC<Props> = ({ data, setData }) => {
  const [editorReady, setEditorReady] = useState(false);
  const mounted = useRef(false);


  // ------------------- STATES -------------------
  const [benefits, setBenefits] = useState<string[]>(Array.isArray(data?.benefits) ? data.benefits : ['']);
  const [aboutUs, setAboutUs] = useState<string[]>(data?.aboutUs || []);
  const [highlight, setHighlight] = useState<string[]>(data?.highlight || ['']);
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
type ExtraImageItem = { icon: string; file?: File };

// Initialize extraImages as an array of objects
const [extraImages, setExtraImages] = useState<ExtraImageItem[]>(
  data?.extraImages?.length
    ? data.extraImages.map(img => ({ icon: img })) // convert existing strings to objects
    : [{ icon: "" }] // default empty object
);  const [showExtraSections, setShowExtraSections] = useState(false);

  useEffect(() => {

    const newData = {
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
    };

    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData);
    }
  }, [ benefits,
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
    extraImages,]);


  useEffect(() => setEditorReady(true), []);

useEffect(() => {
  if (!data) return;

  if (Array.isArray(data.benefits)) setBenefits(data.benefits);
  if (Array.isArray(data.aboutUs)) setAboutUs(data.aboutUs);
  if (Array.isArray(data.highlight)) setHighlight(data.highlight);
  if (Array.isArray(data.highlightPreviews)) setHighlightPreviews(data.highlightPreviews);
  if (Array.isArray(data.document)) setDocument(data.document);
  if (data.assuredByFetchTrue?.length) setAssuredByFetchTrue(data.assuredByFetchTrue);
  if (data.howItWorks?.length) setHowItWorks(data.howItWorks);
  if (Array.isArray(data.termsAndConditions)) setTermsAndConditions(data.termsAndConditions);
  if (data.faq?.length) setFaq(data.faq);
  if (data.extraSections?.length) setExtraSections(data.extraSections);
  if (data.whyChooseUs?.length) setWhyChooseUs(data.whyChooseUs);
  if (data.packages?.length) setPackages(data.packages);
  if (data.weRequired?.length) setWeRequired(data.weRequired);
  if (data.weDeliver?.length) setWeDeliver(data.weDeliver);
  if (data.moreInfo?.length) setMoreInfo(data.moreInfo);
  if (data.connectWith?.length) setConnectWith(data.connectWith);
  if (data.timeRequired?.length) setTimeRequired(data.timeRequired);

}, [data]);


  // ------------------- FILE HANDLERS -------------------
  const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setHighlight(fileArray);
      setHighlightPreviews(fileArray.map(f => URL.createObjectURL(f)));
    }
  };

  // ------------------- ARRAY FIELD RENDERER -------------------
function renderArrayField<T extends object>(
  items: T[] | null | undefined,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  renderItem: (
    item: T,
    idx: number,
    updateItem: (updated: T) => void
  ) => React.ReactNode,
  defaultItem: T
) {
  // Only for rendering, DO NOT modify state here
  const safeItems: T[] = Array.isArray(items) && items.length > 0 ? items : [defaultItem];

  const handleAdd = () => {
    setItems(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      arr.push(defaultItem);
      return arr;
    });
  };

  const handleUpdate = (idx: number, updatedItem: T) => {
    setItems(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      arr[idx] = updatedItem;
      return arr;
    });
  };

  const handleRemove = (idx: number) => {
    setItems(prev => {
      const arr = Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : [];
      return arr.length > 0 ? arr : [defaultItem]; // Ensure at least one item
    });
  };

  return (
    <div className="my-3">
      {safeItems.map((item, idx) => (
        <div key={idx} className=" p-2 rounded  relative">
          {renderItem(item, idx, updated => handleUpdate(idx, updated))}

          {/* DELETE BUTTON */}
          {safeItems.length > 1 && (
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

      {/* ADD BUTTON */}
      <button
        type="button"
        className="bg-blue-500 text-white px-3 py-1 rounded"
        onClick={handleAdd}
      >
        + Add More
      </button>
    </div>
  );
}





  // ------------------- RENDER -------------------
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">
        ✨ Service Details
      </h4>

      {/* CKEditor fields */}
    <div className="space-y-6">
  <div>
  <div className="flex items-center gap-2">
  <Label>Benefits</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>

    {editorReady && (
      <ClientSideCustomEditor
        value={benefits.join('\n')}
        onChange={(val) => setBenefits(val.split('\n'))}
      />
    )}
  </div>

  <div>
     <div className="flex items-center gap-2">
      
  <Label>About Us</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
    {editorReady && (
      <ClientSideCustomEditor
        value={aboutUs.join('\n')}
        onChange={(val) => setAboutUs(val.split('\n'))}
      />
    )}
  </div>

    {/* Highlight Images */}
<div className="flex items-center gap-2">
      
      <Label>Highlight Images</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>

      <FileInput onChange={handleMultipleFileChange} multiple />
      <div className="flex flex-wrap gap-4 mt-2">
        {highlightPreviews.map((src, idx) => (
          <Image key={idx} src={src} alt={`highlight-${idx}`} width={100} height={100} className="rounded" />
        ))}
      </div>
        
        {/* Why Choose Us */}
         <div>
          <div className="flex items-center gap-2">
      
          <Label>Why Choose Us</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
{renderArrayField<TitleDescription>(whyChooseUs, setWhyChooseUs, (item, idx, updateItem) => (
  <div className="grid gap-2">
    <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />

    {/* FILE UPLOAD FOR ICON */}
    <FileInput
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          updateItem({ ...item, icon: url });
        }
      }}
    />

    <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
  </div>
), { title: '', description: '', icon: '' })}

        </div>

       {/* How It Works */}
        <div>
            <div className="flex items-center gap-2">
      
          <Label>How It Works</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
{renderArrayField<TitleDescription>(howItWorks, setHowItWorks, (item, idx, updateItem) => (
  <div className="grid gap-2">
    <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />

    {/* FILE UPLOAD FOR ICON */}
    <FileInput
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          updateItem({ ...item, icon: url });
        }
      }}
    />

    <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
  </div>
), { title: '', description: '', icon: '' })}

        </div>

     {/* Arrays and Nested Arrays */}
       
        <div>
           <div className="flex items-center gap-2">
      
          <Label>Assured By FetchTrue</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
{renderArrayField<TitleDescription>(
  assuredByFetchTrue,
  setAssuredByFetchTrue,
  (item, idx, updateItem) => (
    <div className="grid gap-2">
      <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />

      {/* FILE UPLOAD FOR ICON */}
      <FileInput
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            updateItem({ ...item, icon: url });
          }
        }}
      />

      <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
    </div>
  ),
  { title: '', description: '', icon: '' }
)}

        </div>

       {/* Packages */}
       <div className="flex items-center gap-2">
      
          <Label>Packages</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
{renderArrayField<Package>(
  packages,
  setPackages,
  (pkg, pkgIdx, updatePackage) => (
    <div className="border p-2 rounded mb-2 relative">
      <div className="grid gap-2">
        
        {/* Package Name */}
        <Input
          value={pkg.name}
          placeholder="Package Name"
          onChange={(e) =>
            updatePackage({ ...pkg, name: e.target.value })
          }
        />

        {/* Price */}
        <Input
          type="number"
          value={pkg.price || ""}
          placeholder="Price"
          onChange={(e) => {
            const price = Number(e.target.value);
            const discount = pkg.discount || 0;

            const discountedPrice =
              price && discount
                ? price - (price * discount) / 100
                : price;

            updatePackage({
              ...pkg,
              price,
              discountedPrice,
            });
          }}
        />

        {/* Discount (%) */}
        <Input
          type="number"
          value={pkg.discount || ""}
          placeholder="Discount %"
          onChange={(e) => {
            const discount = Number(e.target.value);
            const price = pkg.price || 0;

            const discountedPrice =
              price && discount
                ? price - (price * discount) / 100
                : price;

            updatePackage({
              ...pkg,
              discount,
              discountedPrice,
            });
          }}
        />

        {/* Discounted Price (Auto Calculated) */}
        <Input
          type="number"
          value={pkg.discountedPrice || ""}
          placeholder="Discounted Price"
          readOnly
          className="bg-gray-100"
        />
      </div>

      {/* What You Get */}
      {renderArrayField<string>(
        pkg.whatYouGet && pkg.whatYouGet.length > 0
          ? pkg.whatYouGet
          : [""],
        (arrUpdater) =>
          setPackages((prev) => {
            const updated = [...prev];
            const current = updated[pkgIdx];

            const newWhatYouGet =
              typeof arrUpdater === "function"
                ? arrUpdater(current.whatYouGet || [""])
                : arrUpdater;

            updated[pkgIdx] = {
              ...current,
              whatYouGet: newWhatYouGet,
            };
            return updated;
          }),
        (item, idx, updateItem) => (
          <Input
            value={item}
            placeholder="What You Get"
            onChange={(e) => updateItem(e.target.value)}
          />
        ),
        ""
      )}
    </div>
  ),
  {
    name: "",
    price: null,
    discount: null,
    discountedPrice: null,
    whatYouGet: [""],
  }
)}

          {/* We Required */}
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

        {/* We Deliver */}
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
   {/* More Info */}
        <div>
           <div className="flex items-center gap-2">
      
<Label>More Info</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
{renderArrayField<MoreInfo>(moreInfo, setMoreInfo, (item, idx, updateItem) => (
  <div className="grid gap-2">
    <Input value={item.title} placeholder="Title" onChange={e => updateItem({ ...item, title: e.target.value })} />

    {/* FILE UPLOAD FOR IMAGE */}
    <FileInput
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          updateItem({ ...item, image: url });
        }
      }}
    />

    <Input value={item.description} placeholder="Description" onChange={e => updateItem({ ...item, description: e.target.value })} />
  </div>
), { title: '', image: '', description: '' })}

        </div>
         <div>
           <div className="flex items-center gap-2">
      
<Label>Terms & Conditions</Label>
  <span className="text-red-500 text-sm font-semibold">(All Services)</span>
</div>
    {editorReady && (
      <ClientSideCustomEditor
        value={termsAndConditions.join('\n')}
        onChange={(val) => setTermsAndConditions(val.split('\n'))}
      />
    )}
  </div>

        {/* FAQ */}
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
 {/* Connect With */}
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

  <div>
    <Label>Document</Label>
    {editorReady && (
      <ClientSideCustomEditor
        value={document.join('\n')}
        onChange={(val) => setDocument(val.split('\n'))}
      />
    )}
  </div>

 
</div>


      {/* Time Required */}
      <Label>Time Required</Label>
      {renderArrayField<TimeRequired>(timeRequired, setTimeRequired, (item, idx, updateItem) => (
        <div className="grid gap-2">
          <Input type="number" value={item.minDays || ''} placeholder="Min Days" onChange={e => updateItem({ ...item, minDays: Number(e.target.value) })} />
          <Input type="number" value={item.maxDays || ''} placeholder="Max Days" onChange={e => updateItem({ ...item, maxDays: Number(e.target.value) })} />
        </div>
      ), { minDays: null, maxDays: null })}

      {/* Extra Images */}
<Label>Extra Images</Label>
{renderArrayField<{ icon: string; file?: File }>(extraImages, setExtraImages, (img, idx, updateImg) => (
  <div className="flex items-center gap-2">
    <FileInput
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          // Save both the preview URL and the actual File
          updateImg({ icon: url, file });
        }
      }}
    />
  </div>
), { icon: "" })}


    
{/* Extra Sections */}
<div className="my-4">
  <Label>Extra Sections</Label>

  {!showExtraSections ? (
    // ONLY SHOW BUTTON INITIALLY
    <button
      type="button"
      onClick={() => setShowExtraSections(true)}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      + Add Extra Section
    </button>
  ) : (
    <>
      {/* Render existing UI */}
      {renderArrayField<ExtraSection>(
        extraSections,
        setExtraSections,
        (section, idx, updateSection) => (
          <div className="grid gap-2 p-2 rounded ">
            <Input
              value={section.title}
              placeholder="Title"
              onChange={(e) =>
                updateSection({ ...section, title: e.target.value })
              }
            />

          {["subtitle", "description", "subDescription", "lists", "tags", "image"].map(
  (key: any) => (
    <div key={key} className="my-3">
      <Label className="capitalize">{key}</Label>

      {/* If field is IMAGE → use FileInput */}
      {key === "image" ? (
        <>
          <FileInput
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              updateSection({
                ...section,
                image: file || null,
              });
            }}
          />

          {/* Preview */}
          {section.image && typeof section.image === "string" && (
            <img
              src={section.image}
              alt="preview"
              className="w-24 h-24 rounded mt-2 object-cover"
            />
          )}

          {section.image && section.image instanceof File && (
            <p className="text-sm mt-1 text-gray-500">
              {section.image.name}
            </p>
          )}
        </>
      ) : (
        // Normal Input for all other keys
        renderArrayField<string>(
          section[key] || [""],
          (arrUpdater) =>
            updateSection({
              ...section,
              [key]:
                typeof arrUpdater === "function"
                  ? arrUpdater(section[key] || [""])
                  : arrUpdater,
            }),
          (val, idx2, updateVal) => (
            <Input
              value={val}
              placeholder={key}
              onChange={(e) => updateVal(e.target.value)}
            />
          ),
          ""
        )
      )}
    </div>
  )
)}

          </div>
        ),
        { title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] }
      )}

      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
        onClick={() =>
          setExtraSections(prev => [
            ...prev,
            { title: '', subtitle: [''], image: [''], description: [''], subDescription: [''], lists: [''], tags: [''] }
          ])
        }
      >
        + Add Extra Section
      </button>

      {/* Collapse Button */}
      <button
        type="button"
        onClick={() => setShowExtraSections(false)}
        className="m-3 bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Hide Sections
      </button>
    </>
  )}
</div>


    </div>
  );
};

export default ServiceDetailsForm;
