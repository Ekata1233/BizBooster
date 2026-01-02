'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { BusinessFundamental, CompanyDetails, CompleteSupportSystemItem, CounterItem, CourseCurriculumItem, FranchiseOperatingModelItem, KeyAdvantageItem, useService, WhomToSellItem } from '@/context/ServiceContext';
import { useParams } from 'next/navigation';

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
  datas: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
   fieldsConfig?: typeof moduleFieldConfig["Franchise"]["serviceDetails"];
}

// ---------------- COMPONENT ----------------
const ServiceUpdateFrom: React.FC<ServiceUpdateFromProps> = ({ datas, setData, fieldsConfig }) => {
  // ---------- BASIC STATES ----------
    const { id } = useParams();
    const { fetchSingleService, singleService: service } = useService();
    useEffect(() => {
        if (!id) return;
        fetchSingleService(id as string);
      }, [id]);
  const data = service;
  
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

  const [operatingCities, setOperatingCities] = useState<string[]>(['']);
const [emiavalable, setEmiavalable] = useState<string[]>(['']);
const [counter, setCounter] = useState<CounterItem[]>([{ number: '', title: '' }]);
const [franchiseOperatingModel, setFranchiseOperatingModel] = useState<FranchiseOperatingModelItem[]>([{
  info: '',
  title: '',
  description: '',
  features: [{ icon: '', subtitle: '', subDescription: '' }],
  tags: [''],
  example: ''
}]);
const [businessFundamental, setBusinessFundamental] = useState<BusinessFundamental>({
  description: '',
  points: [{ subtitle: '', subDescription: '' }]
});
const [keyAdvantages, setKeyAdvantages] = useState<KeyAdvantageItem[]>([{ icon: '', title: '', description: '' }]);
const [completeSupportSystem, setCompleteSupportSystem] = useState<CompleteSupportSystemItem[]>([{ icon: '', title: '', lists: [''] }]);
const [trainingDetails, setTrainingDetails] = useState<string[]>(['']);
const [agreementDetails, setAgreementDetails] = useState<string[]>(['']);
const [goodThings, setGoodThings] = useState<string[]>(['']);
const [compareAndChoose, setCompareAndChoose] = useState<string[]>(['']);
const [companyDetails, setCompanyDetails] = useState<CompanyDetails[]>([{ 
  name: '', 
  location: '', 
  details: [{ title: '', description: '' }] 
}]);
const [roi, setRoi] = useState<string[]>(['']);
const [courseCurriculum, setCourseCurriculum] = useState<CourseCurriculumItem[]>([{ 
  title: '', 
  lists: [''], 
  model: [''] 
}]);
const [level, setLevel] = useState<"beginner" | "medium" | "advanced">("beginner");
const [lessonCount, setLessonCount] = useState<number | null>(null);
const [duration, setDuration] = useState<{ weeks: number | null; hours: number | null }>({ weeks: null, hours: null });
const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
const [eligibleFor, setEligibleFor] = useState<string[]>(['']);
const [courseIncludes, setCourseIncludes] = useState<string[]>(['']);
const [whomToSell, setWhomToSell] = useState<WhomToSellItem[]>([{ icon: '', lists: '' }]);
const [brochureImage, setBrochureImage] = useState<File[]>([]);
const [certificateImage, setCertificateImage] = useState<File[]>([]);
const [include, setInclude] = useState<string[]>(['']);
const [notInclude, setNotInclude] = useState<string[]>(['']);
const [safetyAndAssurance, setSafetyAndAssurance] = useState<string[]>(['']);

// Add this at the top of your component after useState declarations
const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

// Replace the problematic useEffect with this:
useEffect(() => {
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
  if (!service?.serviceDetails) return;

  const details = service.serviceDetails;

  console.log("service details for update : ", details)
  
  // Set array fields with proper fallbacks
  setBenefits(details.benefits || ['']);
  setAboutUs(details.aboutUs || ['']);
  setTerms(details.termsAndConditions || ['']);
  setDocument(details.document || ['']);
  setHighlightImages(details.highlight || []);
  setWhyChooseUs(details.whyChooseUs?.length ? details.whyChooseUs : [{ title: '', description: '', icon: '' }]);
  setHowItWorks(details.howItWorks?.length ? details.howItWorks : [{ title: '', description: '', icon: '' }]);
  setAssuredByFetchTrue(details.assuredByFetchTrue?.length ? details.assuredByFetchTrue : [{ title: '', description: '', icon: '' }]);
  setWeRequired(details.weRequired?.length ? details.weRequired : [{ title: '', description: '' }]);
  setWeDeliver(details.weDeliver?.length ? details.weDeliver : [{ title: '', description: '' }]);
  setPackages(details.packages?.length ? details.packages : [{
    name: '',
    price: null,
    discount: null,
    discountedPrice: null,
    whatYouGet: ['']
  }]);
  
  setMoreInfo(details.moreInfo?.length ? details.moreInfo : [{ title: '', image: '', description: '' }]);
  setFaqs(details.faq?.length ? details.faq : [{ question: '', answer: '' }]);
  setConnectWith(details.connectWith?.length ? details.connectWith : [{ name: '', mobileNo: '', email: '' }]);
  setTimeRequired(details.timeRequired?.length ? details.timeRequired : [{ minDays: null, maxDays: null }]);
  const extraImagesArray = details.extraImages?.length 
    ? details.extraImages.map(icon => ({ icon })) 
    : [{ icon: '' }];
  setExtraImages(extraImagesArray);
  setExtraSections(details.extraSections || []);
  setShowExtraSections(!!details.extraSections?.length);
   setOperatingCities(details.operatingCities?.length ? details.operatingCities : ['']);
  setEmiavalable(details.emiavalable?.length ? details.emiavalable : ['']);
setCounter(
  details.counter?.length
    ? details.counter
    : [{ number: 0, title: '' }]
);
setFranchiseOperatingModel(
  details?.franchiseOperatingModel?.length
    ? details.franchiseOperatingModel
    : [
        {
          info: "",
          title: "",
          description: "",
          features: [
            {
              icon: "",
              subtitle: "",
              subDescription: ""
            }
          ],
          tags: [""],
          example: ""
        }
      ]
);
  setBusinessFundamental(details.businessFundamental || {
    description: '',
    points: [{ subtitle: '', subDescription: '' }]
  });
  setKeyAdvantages(details.keyAdvantages?.length ? details.keyAdvantages : [{ icon: '', title: '', description: '' }]);
  setCompleteSupportSystem(details.completeSupportSystem?.length ? details.completeSupportSystem : [{ icon: '', title: '', lists: [''] }]);
  setTrainingDetails(details.trainingDetails?.length ? details.trainingDetails : ['']);
  setAgreementDetails(details.agreementDetails?.length ? details.agreementDetails : ['']);
  setGoodThings(details.goodThings?.length ? details.goodThings : ['']);
  setCompareAndChoose(details.compareAndChoose?.length ? details.compareAndChoose : ['']);
  setCompanyDetails(details.companyDetails?.length ? details.companyDetails : [{ 
    name: '', 
    location: '', 
    details: [{ title: '', description: '' }] 
  }]);
  setRoi(details.roi?.length ? details.roi : ['']);
  setCourseCurriculum(details.courseCurriculum?.length ? details.courseCurriculum : [{ 
    title: '', 
    lists: [''], 
    model: [''] 
  }]);
  setLevel(details.level || 'beginner');
  setLessonCount(details.lessonCount || null);
  setDuration({
    weeks: details.duration?.weeks || null,
    hours: details.duration?.hours || null
  });
  setWhatYouWillLearn(details.whatYouWillLearn?.length ? details.whatYouWillLearn : ['']);
  setEligibleFor(details.eligibleFor?.length ? details.eligibleFor : ['']);
  setCourseIncludes(details.courseIncludes?.length ? details.courseIncludes : ['']);
  setWhomToSell(details.whomToSell?.length ? details.whomToSell : [{ icon: '', lists: '' }]);
  setInclude(details.include?.length ? details.include : ['']);
  setNotInclude(details.notInclude?.length ? details.notInclude : ['']);
  setSafetyAndAssurance(details.safetyAndAssurance?.length ? details.safetyAndAssurance : ['']);
  setBrochureImage(details.brochureImage?.length ? details.brochureImage : []
);
setCertificateImage(
  details.certificateImage?.length ? details.certificateImage : []
);

}, [service]);

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
       {fieldsConfig?.benefits && (
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
       )}

      {/* About Us */}
       {fieldsConfig?.aboutUs && (
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
       )}

      {/* Highlight Images */}
       {fieldsConfig?.highlight && (
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
       )}

      {/* Why Choose Us */}
       {fieldsConfig?.whyChooseUs && (
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
       )}

      {/* How It Works */}
      {fieldsConfig?.howItWork && (
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
      )}

      {/* Assured By */}
       {fieldsConfig?.assuredByFetchTrue && (
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
       )}

      {/* Packages */}
      {fieldsConfig?.packages && (
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
      )}

      {/* We Required */}
      {fieldsConfig?.weRequired && (
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
      )}

      {/* We Deliver */}
      {fieldsConfig?.weDeliver && (
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
      )}

{/* NEW EXTENDED FIELDS SECTION - Add RIGHT AFTER PACKAGES SECTION */}
      <div className="border-t pt-6 mt-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">🆕 Extended Service Details</h4>
        
        {/* ============= SECTION 1: BASIC FIELDS ============= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Operating Cities */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Operating Cities</Label>
            {renderArrayField<string>(
              operatingCities,
              setOperatingCities,
              (city, idx, updateCity) => (
                <Input
                  value={city}
                  placeholder="City name"
                  onChange={(e) => updateCity(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
      
          {/* EMI Available */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">EMI Available</Label>
            {renderArrayField<string>(
              emiavalable,
              setEmiavalable,
              (emi, idx, updateEmi) => (
                <Input
                  value={emi}
                  placeholder="EMI Option (e.g., 0% EMI for 6 months)"
                  onChange={(e) => updateEmi(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
      
        </div>
      
        {/* ============= SECTION 2: COUNTER ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6">
          <Label className="mb-2">Counter Stats</Label>
          {renderArrayField<CounterItem>(
            counter,
            setCounter,
            (item, idx, updateItem) => (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-sm mb-1">Number</Label>
                  <Input
                    type="number"
                    value={item.number}
                    placeholder="e.g., 100"
                    onChange={(e) => updateItem({ ...item, number: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1">Title</Label>
                  <Input
                    value={item.title}
                    placeholder="e.g., Happy Clients"
                    onChange={(e) => updateItem({ ...item, title: e.target.value })}
                  />
                </div>
              </div>
            ),
            { number: '', title: '' }
          )}
        </div>
         )}
      
        {/* ============= SECTION 3: FRANCHISE OPERATING MODEL ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Franchise Operating Model</Label>
          {renderArrayField<FranchiseOperatingModelItem>(
            franchiseOperatingModel,
            setFranchiseOperatingModel,
            (model, modelIdx, updateModel) => (
              <div className="border p-4 rounded mb-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-sm mb-1">Info</Label>
                    <Input
                      value={model.info}
                      placeholder="Model info"
                      onChange={(e) => updateModel({ ...model, info: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1">Title</Label>
                    <Input
                      value={model.title}
                      placeholder="Model title"
                      onChange={(e) => updateModel({ ...model, title: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <Label className="text-sm mb-1">Description</Label>
                  <textarea
                    value={model.description}
                    onChange={(e) => updateModel({ ...model, description: e.target.value })}
                    placeholder="Model description"
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
      
                {/* Features */}
                <div className="mb-3">
                  <Label className="text-sm mb-1">Features</Label>
                  {renderArrayField<FranchiseFeatureItem>(
                    model.features,
                    (newFeatures) => {
                      updateModel({ 
                        ...model, 
                        features: typeof newFeatures === 'function' ? 
                          newFeatures(model.features) : newFeatures 
                      });
                    },
                    (feature, featureIdx, updateFeature) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <div>
                          <Label className="text-xs mb-1">Icon</Label>
                          <FileInput
                            onChange={(e) => handleFileUpload(e, feature, updateFeature, 'icon')}
                          />
                          {feature.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={feature.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
                        </div>
                        <div>
                          <Label className="text-xs mb-1">Subtitle</Label>
                          <Input
                            value={feature.subtitle}
                            placeholder="Feature title"
                            onChange={(e) => updateFeature({ ...feature, subtitle: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs mb-1">Description</Label>
                          <Input
                            value={feature.subDescription}
                            placeholder="Feature description"
                            onChange={(e) => updateFeature({ ...feature, subDescription: e.target.value })}
                          />
                        </div>
                      </div>
                    ),
                    { icon: '', subtitle: '', subDescription: '' }
                  )}
                </div>
      
                {/* Tags */}
                <div className="mb-3">
                  <Label className="text-sm mb-1">Tags</Label>
                  {renderArrayField<string>(
                    model.tags,
                    (newTags) => {
                      updateModel({ 
                        ...model, 
                        tags: typeof newTags === 'function' ? 
                          newTags(model.tags) : newTags 
                      });
                    },
                    (tag, tagIdx, updateTag) => (
                      <Input
                        value={tag}
                        placeholder="Tag"
                        onChange={(e) => updateTag(e.target.value)}
                        className="mb-1"
                      />
                    ),
                    ''
                  )}
                </div>
      
                {/* Example */}
                <div>
                  <Label className="text-sm mb-1">Example</Label>
                  <textarea
                    value={model.example}
                    onChange={(e) => updateModel({ ...model, example: e.target.value })}
                    placeholder="Example of this model"
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                </div>
              </div>
            ),
            {
              info: '',
              title: '',
              description: '',
              features: [{ icon: '', subtitle: '', subDescription: '' }],
              tags: [''],
              example: ''
            }
          )}
        </div>
         )}
      
        {/* ============= SECTION 4: BUSINESS FUNDAMENTAL ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Business Fundamental</Label>
          <div className="mb-4">
            <Label className="text-sm mb-1">Description</Label>
            <textarea
              value={businessFundamental.description}
              onChange={(e) => setBusinessFundamental({...businessFundamental, description: e.target.value})}
              placeholder="Business fundamental description"
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <Label className="text-sm mb-1">Key Points</Label>
            {renderArrayField<{subtitle: string; subDescription: string}>(
              businessFundamental.points,
              (newPoints) => {
                setBusinessFundamental({
                  ...businessFundamental, 
                  points: typeof newPoints === 'function' ? 
                    newPoints(businessFundamental.points) : newPoints
                });
              },
              (point, idx, updatePoint) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <Input
                    value={point.subtitle}
                    placeholder="Point title"
                    onChange={(e) => updatePoint({...point, subtitle: e.target.value})}
                  />
                  <Input
                    value={point.subDescription}
                    placeholder="Point description"
                    onChange={(e) => updatePoint({...point, subDescription: e.target.value})}
                  />
                </div>
              ),
              { subtitle: '', subDescription: '' }
            )}
          </div>
        </div>
         )}
      
        {/* ============= SECTION 5: KEY ADVANTAGES ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6">
          <Label className="mb-2 font-semibold">Key Advantages</Label>
          {renderArrayField<KeyAdvantageItem>(
            keyAdvantages,
            setKeyAdvantages,
            (item, idx, updateItem) => (
              <div className="border p-4 rounded mb-3">
                <div className="grid gap-3">
                  <Input
                    value={item.title}
                    placeholder="Advantage Title"
                    onChange={(e) => updateItem({ ...item, title: e.target.value })}
                  />
                  <div>
                    <Label className="text-sm mb-1">Icon</Label>
                    <FileInput
                      onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
                    />
                    {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
                  </div>
                  <Input
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => updateItem({ ...item, description: e.target.value })}
                  />
                </div>
              </div>
            ),
            { icon: '', title: '', description: '' }
          )}
        </div>
         )}
      
        {/* ============= SECTION 6: COMPLETE SUPPORT SYSTEM ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Complete Support System</Label>
          {renderArrayField<CompleteSupportSystemItem>(
            completeSupportSystem,
            setCompleteSupportSystem,
            (item, idx, updateItem) => (
              <div className="border p-3 rounded mb-2">
                <Input
                  value={item.title}
                  placeholder="Support Title"
                  onChange={(e) => updateItem({ ...item, title: e.target.value })}
                  className="mb-2"
                />
                <FileInput
                  onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
                  className="mb-2"
                />
                {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
                <Label className="text-sm mb-1">Support Points</Label>
                {renderArrayField<string>(
                  item.lists,
                  (newLists) => {
                    updateItem({ 
                      ...item, 
                      lists: typeof newLists === 'function' ? 
                        newLists(item.lists) : newLists 
                    });
                  },
                  (listItem, listIdx, updateListItem) => (
                    <Input
                      value={listItem}
                      placeholder="Support point"
                      onChange={(e) => updateListItem(e.target.value)}
                      className="mb-1"
                    />
                  ),
                  ''
                )}
              </div>
            ),
            { icon: '', title: '', lists: [''] }
          )}
        </div>
         )}
      
        {/* ======== SECTION 7: TRAINING & AGREEMENT DETAILS ======== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Training Details */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Training Details</Label>
            {renderArrayField<string>(
              trainingDetails,
              setTrainingDetails,
              (detail, idx, updateDetail) => (
                <Input
                  value={detail}
                  placeholder="Training detail (e.g., Online/Offline, Duration)"
                  onChange={(e) => updateDetail(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
      
          {/* Agreement Details */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Agreement Details</Label>
            {renderArrayField<string>(
              agreementDetails,
              setAgreementDetails,
              (detail, idx, updateDetail) => (
                <Input
                  value={detail}
                  placeholder="Agreement detail"
                  onChange={(e) => updateDetail(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
        </div>
      
        {/* ============= SECTION 8: GOOD THINGS & COMPARE ============= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Good Things */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Good Things</Label>
            {renderArrayField<string>(
              goodThings,
              setGoodThings,
              (thing, idx, updateThing) => (
                <Input
                  value={thing}
                  placeholder="Positive point about the service"
                  onChange={(e) => updateThing(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
      
          {/* Compare and Choose */}
           {fieldsConfig?.weDeliver && (
           <div>
          <Label className="mb-2">Compare and Choose</Label>
          {editorReady && (
            <ClientSideCustomEditor
              value={compareAndChoose[0] || ''}
              onChange={(val) => handleEditorChange(setCompareAndChoose, val)}
            />
          )}
        </div>
           )}
        </div>
      
        {/* ============= SECTION 9: COMPANY DETAILS ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Company Details</Label>
          {renderArrayField<CompanyDetails>(
            companyDetails,
            setCompanyDetails,
            (company, companyIdx, updateCompany) => (
              <div className="border p-4 rounded mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <Input
                    value={company.name}
                    placeholder="Company Name"
                    onChange={(e) => updateCompany({ ...company, name: e.target.value })}
                  />
                  <Input
                    value={company.location}
                    placeholder="Location"
                    onChange={(e) => updateCompany({ ...company, location: e.target.value })}
                  />
                </div>
                
                <div className="mb-2">
                  <Label className="text-sm mb-1">Details</Label>
                  {renderArrayField<CompanyDetailItem>(
                    company.details,
                    (newDetails) => {
                      updateCompany({ 
                        ...company, 
                        details: typeof newDetails === 'function' ? 
                          newDetails(company.details) : newDetails 
                      });
                    },
                    (detail, detailIdx, updateDetail) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <Input
                          value={detail.title}
                          placeholder="Detail title"
                          onChange={(e) => updateDetail({ ...detail, title: e.target.value })}
                        />
                        <Input
                          value={detail.description}
                          placeholder="Detail description"
                          onChange={(e) => updateDetail({ ...detail, description: e.target.value })}
                        />
                      </div>
                    ),
                    { title: '', description: '' }
                  )}
                </div>
              </div>
            ),
            { 
              name: '', 
              location: '', 
              details: [{ title: '', description: '' }] 
            }
          )}
        </div>
         )}
      
        {/* ============= SECTION 10: ROI ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6">
          <Label className="mb-2">Return on Investment (ROI)</Label>
          {renderArrayField<string>(
            roi,
            setRoi,
            (item, idx, updateItem) => (
              <Input
                value={item}
                placeholder="ROI detail (e.g., 30% ROI in 6 months)"
                onChange={(e) => updateItem(e.target.value)}
                className="mb-2"
              />
            ),
            ''
          )}
        </div>
         )}
      
        {/* ============= SECTION 11: COURSE CURRICULUM ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Course Curriculum</Label>
          {renderArrayField<CourseCurriculumItem>(
            courseCurriculum,
            setCourseCurriculum,
            (curriculum, curriculumIdx, updateCurriculum) => (
              <div className="border p-4 rounded mb-3">
                <Input
                  value={curriculum.title}
                  placeholder="Curriculum Title"
                  onChange={(e) => updateCurriculum({ ...curriculum, title: e.target.value })}
                  className="mb-3"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lists */}
                  <div>
                    <Label className="text-sm mb-1">Lists</Label>
                    {renderArrayField<string>(
                      curriculum.lists,
                      (newLists) => {
                        updateCurriculum({ 
                          ...curriculum, 
                          lists: typeof newLists === 'function' ? 
                            newLists(curriculum.lists) : newLists 
                        });
                      },
                      (listItem, listIdx, updateListItem) => (
                        <Input
                          value={listItem}
                          placeholder="List item"
                          onChange={(e) => updateListItem(e.target.value)}
                          className="mb-1"
                        />
                      ),
                      ''
                    )}
                  </div>
      
                  {/* Model */}
                   <div>
                  <Label className="text-sm mb-1">Model</Label>
      
                  {renderArrayField<string>(
                    curriculum.model,
                    (newModels) => {
                      updateCurriculum({ 
                        ...curriculum, 
                        model: typeof newModels === 'function' ? 
                          newModels(curriculum.model) : newModels 
                      });
                    },
                    (modelItem, modelIdx, updateModelItem) => (
                      <div key={modelIdx} className="mb-3 relative">
                        {editorReady && (
                          <div className="relative">
                            <ClientSideCustomEditor
                              value={modelItem}
                              onChange={(val) => updateModelItem(val)}
                            />
                            {curriculum.model.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newModels = curriculum.model.filter((_, idx) => idx !== modelIdx);
                                  updateCurriculum({ ...curriculum, model: newModels });
                                }}
                                className="absolute top-0 right-0 z-10 bg-red-500 text-white text-xs p-1 rounded-bl"
                              >
                                <TrashBinIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                    ''
                  )}
                </div>
                </div>
              </div>
            ),
            { 
              title: '', 
              lists: [''], 
              model: [''] 
            }
          )}
        </div>
         )}
      
        {/* ============= SECTION 12: COURSE DETAILS ROW ============= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Level</Label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as "beginner" | "medium" | "advanced")}
              className="w-full p-2 border rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
           )}
      
       {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Lesson Count</Label>
            <Input
              type="number"
              value={lessonCount || ''}
              onChange={(e) => setLessonCount(e.target.value ? Number(e.target.value) : null)}
              placeholder="Number of lessons"
            />
          </div>
       )}
      
       {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Duration (Weeks)</Label>
            <Input
              type="number"
              value={duration.weeks || ''}
              onChange={(e) => setDuration({ ...duration, weeks: e.target.value ? Number(e.target.value) : null })}
              placeholder="Weeks"
            />
          </div>
       )}
      
       {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Duration (Hours)</Label>
            <Input
              type="number"
              value={duration.hours || ''}
              onChange={(e) => setDuration({ ...duration, hours: e.target.value ? Number(e.target.value) : null })}
              placeholder="Hours"
            />
          </div>
       )}
        </div>
      
        {/* ===========SECTION 13: LEARNING & ELIGIBILITY =========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* What You Will Learn */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">What You Will Learn</Label>
            {renderArrayField<string>(
              whatYouWillLearn,
              setWhatYouWillLearn,
              (item, idx, updateItem) => (
                <Input
                  value={item}
                  placeholder="Learning outcome"
                  onChange={(e) => updateItem(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
      
          {/* Eligible For */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Eligible For</Label>
            {renderArrayField<string>(
              eligibleFor,
              setEligibleFor,
              (item, idx, updateItem) => (
                <Input
                  value={item}
                  placeholder="Eligibility criteria"
                  onChange={(e) => updateItem(e.target.value)}
                  className="mb-2"
                />
              ),
              ''
            )}
          </div>
           )}
        </div>
      
        {/* ============= SECTION 14: COURSE INCLUDES ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6">
          <Label className="mb-2">Course Includes</Label>
          {renderArrayField<string>(
            courseIncludes,
            setCourseIncludes,
            (item, idx, updateItem) => (
              <Input
                value={item}
                placeholder="What's included in course"
                onChange={(e) => updateItem(e.target.value)}
                className="mb-2"
              />
            ),
            ''
          )}
        </div>
         )}
      
        {/* ============= SECTION 15: WHOM TO SELL ============= */}
         {fieldsConfig?.weDeliver && (
        <div className="mb-6 border p-4 rounded">
          <Label className="mb-2 font-semibold">Whom To Sell</Label>
          {renderArrayField<WhomToSellItem>(
            whomToSell,
            setWhomToSell,
            (item, idx, updateItem) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label className="text-sm mb-1">Icon</Label>
                  <FileInput
                    onChange={(e) => handleFileUpload(e, item, updateItem, 'icon')}
                  />
                  {item.icon && (
                  <div className="w-16 h-16 relative mt-2">
                    <Image src={item.icon} alt="icon" fill className="rounded object-cover" />
                  </div>
                )}
                  
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm mb-1">Lists (comma separated)</Label>
                  <textarea
                    value={item.lists}
                    onChange={(e) => updateItem({ ...item, lists: e.target.value })}
                    placeholder="Target audience, e.g., Students, Professionals, Business Owners"
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter as comma separated values</p>
                </div>
              </div>
            ),
            { icon: '', lists: '' }
          )}
        </div>
         )}
      
        {/* ============= SECTION 16: FILE UPLOADS ============= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Brochure Image */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Brochure Images</Label>
            <FileInput
              multiple
              onChange={(e) => handleFileChange(e, setBrochureImage)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {brochureImage.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                  {typeof img === 'string' ? (
                    <Image src={img} alt="brochure" fill className="object-cover" />
                  ) : (
                    <Image src={URL.createObjectURL(img)} alt="brochure" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx, setBrochureImage)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
           )}
      
          {/* Certificate Image */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Certificate Images</Label>
            <FileInput
              multiple
              onChange={(e) => handleFileChange(e, setCertificateImage)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {certificateImage.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                  {typeof img === 'string' ? (
                    <Image src={img} alt="certificate" fill className="object-cover" />
                  ) : (
                    <Image src={URL.createObjectURL(img)} alt="certificate" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx, setCertificateImage)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
           )}
        </div>
      
        {/* ============= SECTION 17: CKEDITOR FIELDS ============= */}
        <div className="space-y-6">
          {/* Include - CKEditor */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Include (Rich Text)</Label>
            {editorReady && (
              <ClientSideCustomEditor
                value={include[0] || ''}
                onChange={(val) => handleEditorChange(setInclude, val)}
              />
            )}
          </div>
           )}
      
          {/* Not Include - CKEditor */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Not Include (Rich Text)</Label>
            {editorReady && (
              <ClientSideCustomEditor
                value={notInclude[0] || ''}
                onChange={(val) => handleEditorChange(setNotInclude, val)}
              />
            )}
          </div>
           )}
      
          {/* Safety and Assurance - CKEditor */}
           {fieldsConfig?.weDeliver && (
          <div>
            <Label className="mb-2">Safety and Assurance (Rich Text)</Label>
            {editorReady && (
              <ClientSideCustomEditor
                value={safetyAndAssurance[0] || ''}
                onChange={(val) => handleEditorChange(setSafetyAndAssurance, val)}
              />
            )}
          </div>
           )}
        </div>
      
      </div>

      {/* More Info */}
       {fieldsConfig?.moreInfo && (
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
       )}

      {/* Terms & Conditions */}
       {fieldsConfig?.termsAndCondition && (
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
       )}

      {/* FAQs */}
      {fieldsConfig?.faqs && (
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
      )}

      {/* Connect With */}
      {fieldsConfig?.connectWith && (
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
      )}

      {/* Document */}
      {fieldsConfig?.document && (
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
      )}

      {/* Time Required */}
       {fieldsConfig?.timeRequired && (
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
       )}

      {/* Extra Images */}
      {fieldsConfig?.extraImage && (
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
      )}

      {/* EXTRA SECTIONS */}
       {fieldsConfig?.extraSection && (
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
       )}
    </div>
  );
};

export default ServiceUpdateFrom;