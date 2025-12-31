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
type TimeRequired = { range: string; parameters: string };
type ExtraImageItem = { icon: string; file?: File };
type CounterItem = {
  number: number | string;
  title: string;
};

type FranchiseFeatureItem = {
  icon: string | File;
  subtitle: string;
  subDescription: string;
};

type FranchiseOperatingModelItem = {
  info: string;
  title: string;
  description: string;
  features: FranchiseFeatureItem[];
  tags: string[];
  example: string;
};

type BusinessFundamental = {
  description: string;
  points: {
    subtitle: string;
    subDescription: string;
  }[];
};

type KeyAdvantageItem = {
  icon: string | File;
  title: string;
  description: string;
};

type CompleteSupportSystemItem = {
  icon: string | File;
  title: string;
  lists: string[];
};

type CompanyDetailItem = {
  title: string;
  description: string;
};

type CompanyDetails = {
  name: string;
  location: string;
  details: CompanyDetailItem[];
};

type CourseCurriculumItem = {
  title: string;
  lists: string[];
  model: string[];
};

type WhomToSellItem = {
  icon: string | File;
  lists: string;
};

type Duration = {
  weeks: number | null;
  hours: number | null;
};
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

  operatingCities: string[];
  brochureImage: (string | File)[];
  emiavalable: string[];
  counter: CounterItem[];
  franchiseOperatingModel: FranchiseOperatingModelItem[];
  businessFundamental: BusinessFundamental;
  keyAdvantages: KeyAdvantageItem[];
  completeSupportSystem: CompleteSupportSystemItem[];
  trainingDetails: string[];
  agreementDetails: string[];
  goodThings: string[];
  compareAndChoose: string[];
  companyDetails: CompanyDetails[];
  roi: string[];
  level: "beginner" | "medium" | "advanced";
  lessonCount: number | null;
  duration: Duration;
  whatYouWillLearn: string[];
  eligibleFor: string[];
  courseCurriculum: CourseCurriculumItem[];
  courseIncludes: string[];
  certificateImage: (string | File)[];
  whomToSell: WhomToSellItem[];
  include: string[];
  notInclude: string[];
  safetyAndAssurance: string[];
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
  const [timeRequired, setTimeRequired] = useState<TimeRequired[]>([{ range: '', parameters: '' }]);
  const [extraImages, setExtraImages] = useState<ExtraImageItem[]>([{ icon: "" }]);
  const [showExtraSections, setShowExtraSections] = useState(false);

  

// NEW EXTENDED FIELDS STATES
const [operatingCities, setOperatingCities] = useState<string[]>(['']);
const [brochureImage, setBrochureImage] = useState<(string | File)[]>([]);
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
const [level, setLevel] = useState<"beginner" | "medium" | "advanced">("beginner");
const [lessonCount, setLessonCount] = useState<number | null>(null);
const [duration, setDuration] = useState<Duration>({ weeks: null, hours: null });
const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
const [eligibleFor, setEligibleFor] = useState<string[]>(['']);
const [courseCurriculum, setCourseCurriculum] = useState<CourseCurriculumItem[]>([{ 
  title: '', 
  lists: [''], 
  model: [''] 
}]);
const [courseIncludes, setCourseIncludes] = useState<string[]>(['']);
const [certificateImage, setCertificateImage] = useState<(string | File)[]>([]);
const [whomToSell, setWhomToSell] = useState<WhomToSellItem[]>([{ icon: '', lists: '' }]);
const [include, setInclude] = useState<string[]>(['']);
const [notInclude, setNotInclude] = useState<string[]>(['']);
const [safetyAndAssurance, setSafetyAndAssurance] = useState<string[]>(['']);
  
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
    setTimeRequired(data.timeRequired?.length ? data.timeRequired : [{ range: '', parameters: '' }]);
    
    // Convert extraImages strings to objects
    const extraImagesData = data.extraImages?.map(img => 
      typeof img === 'string' ? { icon: img } : { icon: '', file: img }
    ) || [{ icon: "" }];
    setExtraImages(extraImagesData);


// NEW EXTENDED FIELDS INITIALIZATION
setOperatingCities(data.operatingCities?.length ? data.operatingCities : ['']);
setBrochureImage(data.brochureImage || []);
setEmiavalable(data.emiavalable?.length ? data.emiavalable : ['']);
setCounter(data.counter?.length ? data.counter : [{ number: '', title: '' }]);
setFranchiseOperatingModel(data.franchiseOperatingModel?.length ? data.franchiseOperatingModel : [{
  info: '',
  title: '',
  description: '',
  features: [{ icon: '', subtitle: '', subDescription: '' }],
  tags: [''],
  example: ''
}]);
setBusinessFundamental(data.businessFundamental || {
  description: '',
  points: [{ subtitle: '', subDescription: '' }]
});
setKeyAdvantages(data.keyAdvantages?.length ? data.keyAdvantages : [{ icon: '', title: '', description: '' }]);
setCompleteSupportSystem(data.completeSupportSystem?.length ? data.completeSupportSystem : [{ icon: '', title: '', lists: [''] }]);
setTrainingDetails(data.trainingDetails?.length ? data.trainingDetails : ['']);
setAgreementDetails(data.agreementDetails?.length ? data.agreementDetails : ['']);
setGoodThings(data.goodThings?.length ? data.goodThings : ['']);
setCompareAndChoose(data.compareAndChoose?.length ? data.compareAndChoose : ['']);
setCompanyDetails(data.companyDetails?.length ? data.companyDetails : [{ 
  name: '', 
  location: '', 
  details: [{ title: '', description: '' }] 
}]);
setRoi(data.roi?.length ? data.roi : ['']);
setLevel(data.level || "beginner");
setLessonCount(data.lessonCount || null);
setDuration(data.duration || { weeks: null, hours: null });
setWhatYouWillLearn(data.whatYouWillLearn?.length ? data.whatYouWillLearn : ['']);
setEligibleFor(data.eligibleFor?.length ? data.eligibleFor : ['']);
setCourseCurriculum(data.courseCurriculum?.length ? data.courseCurriculum : [{ 
  title: '', 
  lists: [''], 
  model: [''] 
}]);
setCourseIncludes(data.courseIncludes?.length ? data.courseIncludes : ['']);
setCertificateImage(data.certificateImage || []);
setWhomToSell(data.whomToSell?.length ? data.whomToSell : [{ icon: '', lists: '' }]);
setInclude(data.include?.length ? data.include : ['']);
setNotInclude(data.notInclude?.length ? data.notInclude : ['']);
setSafetyAndAssurance(data.safetyAndAssurance?.length ? data.safetyAndAssurance : ['']);

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
      highlightPreviews, // Keep previews separate

       // NEW EXTENDED FIELDS
  operatingCities,
  brochureImage,
  emiavalable,
  counter,
  franchiseOperatingModel,
  businessFundamental,
  keyAdvantages,
  completeSupportSystem,
  trainingDetails,
  agreementDetails,
  goodThings,
  compareAndChoose,
  companyDetails,
  roi,
  level,
  lessonCount,
  duration,
  whatYouWillLearn,
  eligibleFor,
  courseCurriculum,
  courseIncludes,
  certificateImage,
  whomToSell,
  include,
  notInclude,
  safetyAndAssurance

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
    extraImages,


    operatingCities,
  brochureImage,
  emiavalable,
  counter,
  franchiseOperatingModel,
  businessFundamental,
  keyAdvantages,
  completeSupportSystem,
  trainingDetails,
  agreementDetails,
  goodThings,
  compareAndChoose,
  companyDetails,
  roi,
  level,
  lessonCount,
  duration,
  whatYouWillLearn,
  eligibleFor,
  courseCurriculum,
  courseIncludes,
  certificateImage,
  whomToSell,
  include,
  notInclude,
  safetyAndAssurance
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
// Helper function for file upload handling
const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: React.Dispatch<React.SetStateAction<(string | File)[]>>
) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    setter(prev => [...prev, ...Array.from(files)]);
  }
};

// Helper to remove file from array
const removeFile = (index: number, setter: React.Dispatch<React.SetStateAction<(string | File)[]>>) => {
  setter(prev => prev.filter((_, i) => i !== index));
};
  // ------------------- RENDER -------------------
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">
        ✨ Service Details
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


        {/* 🔥🆕 NEW EXTENDED FIELDS SECTION - Add this RIGHT AFTER PACKAGES SECTION */}
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

  {/* ============= SECTION 7: TRAINING & AGREEMENT DETAILS ============= */}
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
            {/* {editorReady && (
              <ClientSideCustomEditor
                value={curriculum.model[0] || ''}
                onChange={(val) => {
                  // Update the model array with the rich text content
                  const updatedCurriculum = { ...curriculum };
                  updatedCurriculum.model = [val];
                  updateCurriculum(updatedCurriculum);
                }}
              />
            )} */}

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

  {/* ============= SECTION 13: LEARNING & ELIGIBILITY ============= */}
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
          <Label>Extra CkEditor</Label>
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
        value={item.range || ''} 
        placeholder="Range (e.g., 3-5)" 
        onChange={e => updateItem({ ...item, range: e.target.value })} 
      />
      <Input 
        value={item.parameters || ''} 
        placeholder="Parameters (e.g., days, weeks)" 
        onChange={e => updateItem({ ...item, parameters: e.target.value })} 
      />
    </div>
  ), { range: '', parameters: '' })}
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


