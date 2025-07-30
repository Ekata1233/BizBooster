'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useService } from '@/context/ServiceContext';
import BasicDetailsForm from '@/components/service-component/BasicDetailsForm';
import ServiceDetailsForm from '@/components/service-component/ServiceDetailsForm';
import FranchiseDetailsForm from '@/components/service-component/FranchiseDetailsForm';
import ComponentCard from '@/components/common/ComponentCard';

interface ExtraSection {
  title: string;
  description: string;
}

interface WhyChooseItem {
  _id?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface KeyValue {
  key: string;
  value: string;
}

type FormDataType = {
  basic: {
    name: string;
    category: string;
    subcategory: string;
    price: number;
    discount?: number;
    gst?: number;
    includeGst?: boolean;
    thumbnail: File | null;
    thumbnailPreview?: string;
    bannerImages: File[];
    bannerPreviews?: string[];
    tags?: string[];
    keyValues?: KeyValue[];
    recommendedServices?: boolean;
  };
  service: {
    overview: string;
    highlight: File[] | FileList | null;
    highlightPreviews?: string[] | undefined;
    benefits: string;
    howItWorks: string;
    terms: string;
    document: string;
    rows: ExtraSection[];
    whyChoose: WhyChooseItem[];
    faqs: FaqItem[];
  };
  franchise: {
    overview: string;
    commission: string;
    howItWorks: string;
    termsAndConditions: string;
    rows: ExtraSection[];
  };
};

const EditService: React.FC = () => {
  const { id } = useParams();
  const { fetchSingleService, singleService: service, updateService } = useService();

  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  // console.log("console service : ", service);

  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      name: '',
      category: '',
      subcategory: '',
      price: 0,
      discount: 0,
      gst: 0,
      includeGst: false,
      thumbnail: null,
      bannerImages: [],
      tags: [],
      keyValues: [{ key: '', value: '' }],
    },
    service: {
      overview: '',
      highlight: null,
      benefits: '',
      howItWorks: '',
      terms: '',
      document: '',
      rows: [],
      whyChoose: [],
      faqs: [],
    },
    franchise: {
      overview: '',
      commission: '',
      howItWorks: '',
      termsAndConditions: '',
      rows: [],
    },
  });

  useEffect(() => {
    if (id) {
      fetchSingleService(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (service && !hasInitialized) {
      const mappedKeyValues = Array.isArray(service.keyValues) && service.keyValues.length > 0
        ? service.keyValues.map(({ key, value }) => ({ key, value }))
        : [{ key: '', value: '' }];

      setFormData({
        basic: {
          name: service.serviceName || '',
          category: service.category?._id || '',
          subcategory: service.subcategory?._id || '',
          price: service.price,
          discount: service.discount || 0,
          gst: service.gst || 0,
          includeGst: service.includeGst ?? false,
          thumbnail: null,
          thumbnailPreview: service.thumbnailImage || '',
          bannerImages: [],
          bannerPreviews: service.bannerImages || [],
          tags: service.tags || [],
          keyValues: mappedKeyValues,
          recommendedServices: service.recommendedServices ?? false,
        },
        service: {
          overview: service.serviceDetails?.overview || '',
          // highlight: [], 
          highlight: Array.isArray(service.serviceDetails?.highlight)
            ? service.serviceDetails.highlight.filter((item: any) => typeof item === 'string')
            : [],

          highlightPreviews: Array.isArray(service.serviceDetails?.highlight)
            ? service.serviceDetails.highlight.filter(item => typeof item === 'string')
            : [],
          benefits: service.serviceDetails?.benefits || '',
          howItWorks: service.serviceDetails?.howItWorks || '',
          terms: service.serviceDetails?.termsAndConditions || '',
          document: service.serviceDetails?.document || '',
          rows: service.serviceDetails?.rows || [],
          whyChoose: service.serviceDetails?.whyChoose?.map(item => ({ _id: item._id })) || [],
          faqs: (service.serviceDetails as any)?.faq || [],
        },
        franchise: {
          overview: service.franchiseDetails?.overview || '',
          commission: service.franchiseDetails?.commission || '',
          howItWorks: service.franchiseDetails?.howItWorks || '',
          termsAndConditions: service.franchiseDetails?.termsAndConditions || '',
          rows: service.franchiseDetails?.extraSections || [],
        },
      });
      // console.log("Initialized FAQs:", service);

      if (service.serviceName && service.category?._id && service.subcategory?._id && service.price) {
        setCompletedSteps([1]);
      }

      setHasInitialized(true);

    }
  }, [service]);

  const isStepComplete = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!formData.basic.name.trim() && formData.basic.category !== '' && formData.basic.price >= 0;
      case 2:
        return !!formData.service.overview.trim() && !!formData.service.benefits.trim()
          && !!formData.service.howItWorks.trim() && !!formData.service.document.trim();
      case 3:
        return !!formData.franchise.overview.trim() && !!formData.franchise.commission
          && !!formData.franchise.howItWorks.trim() && !!formData.franchise.termsAndConditions.trim();
      default:
        return false;
    }
  };

  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isStepComplete(step)) {
      alert(`Please complete all required fields in step ${step}`);
      return;
    }
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) setStep(step - 1);
  };

  console.log("formddta of hightlight : ", formData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !isStepComplete(3)) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.basic.name);
      formDataToSend.append('category', formData.basic.category);
      formDataToSend.append('subcategory', formData.basic.subcategory);
      formDataToSend.append('price', formData.basic.price.toString());
      formDataToSend.append('recommendedServices', formData.basic.recommendedServices ? 'true' : 'false');

      if (formData.basic.discount !== undefined) formDataToSend.append('discount', formData.basic.discount.toString());
      if (formData.basic.gst !== undefined) formDataToSend.append('gst', formData.basic.gst.toString());
      if (formData.basic.includeGst !== undefined) formDataToSend.append('includeGst', formData.basic.includeGst.toString());

      if (formData.basic.thumbnail) {
        formDataToSend.append('thumbnailImage', formData.basic.thumbnail);
      }
      console.log("Banner Images to upload:", formData.basic.bannerImages);

      formData.basic.bannerImages.forEach(file => {
        formDataToSend.append('bannerImages', file);
      });
      formData.basic.tags?.forEach((tag, index) => {
        formDataToSend.append(`tags[${index}]`, tag);
      });

      formData.basic.keyValues?.forEach((pair, index) => {
        formDataToSend.append(`keyValues[${index}][key]`, pair.key);
        formDataToSend.append(`keyValues[${index}][value]`, pair.value);
      });


      formDataToSend.append('serviceDetails[overview]', formData.service.overview);
      // if (formData.service.highlight) {
      //   const filesArray = Array.isArray(formData.service.highlight)
      //     ? formData.service.highlight
      //     : Array.from(formData.service.highlight);
      //   filesArray.forEach((file, index) => {
      //     formDataToSend.append(`serviceDetails[highlight][${index}]`, file);
      //   });
      // }
      if (formData.service.highlight) {
        const highlightsArray = Array.isArray(formData.service.highlight)
          ? formData.service.highlight
          : Array.from(formData.service.highlight);

        highlightsArray.forEach((item, index) => {
          if (item instanceof File) {
            formDataToSend.append(`serviceDetails[highlight][${index}]`, item);
          }
        });
      }


      formDataToSend.append('serviceDetails[benefits]', formData.service.benefits);
      formDataToSend.append('serviceDetails[howItWorks]', formData.service.howItWorks);
      formDataToSend.append('serviceDetails[termsAndConditions]', formData.service.terms);
      formDataToSend.append('serviceDetails[document]', formData.service.document);

      formData.service.rows.forEach((section, index) => {
        formDataToSend.append(`serviceDetails[extraSections][${index}][title]`, section.title);
        formDataToSend.append(`serviceDetails[extraSections][${index}][description]`, section.description);
      });

      formData.service.whyChoose.forEach((item, index) => {
        if (item._id) {
          formDataToSend.append(`serviceDetails[whyChoose][${index}][_id]`, item._id);
        }
      });

      formData.service.faqs.forEach((item, index) => {
        formDataToSend.append(`serviceDetails[faq][${index}][question]`, item.question);
        formDataToSend.append(`serviceDetails[faq][${index}][answer]`, item.answer);
      });

      formDataToSend.append('franchiseDetails[overview]', formData.franchise.overview);
      formDataToSend.append('franchiseDetails[commission]', String(formData.franchise.commission));
      formDataToSend.append('franchiseDetails[howItWorks]', formData.franchise.howItWorks);
      formDataToSend.append('franchiseDetails[termsAndConditions]', formData.franchise.termsAndConditions);

      formData.franchise.rows.forEach((section, index) => {
        formDataToSend.append(`franchiseDetails[extraSections][${index}][title]`, section.title);
        formDataToSend.append(`franchiseDetails[extraSections][${index}][description]`, section.description);
      });

      await updateService(service._id, formDataToSend);
      alert('Service updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="no-scrollbar w-full max-w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 mx-auto mt-8">
      <ComponentCard title="Edit Service">
        <div>
          <div className="flex items-center justify-between mb-10 relative">
            {['Basic', 'Service', 'Franchise'].map((label, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber) || step > stepNumber;
              const isActive = step === stepNumber;

              return (
                <div key={label} className="flex-1 flex flex-col items-center relative">
                  {index !== 0 && (
                    <div className="absolute top-5 left-[-50%] w-full h-1">
                      <div className={`h-1 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    </div>
                  )}
                  <div className={`z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-bold
                      ${isCompleted ? 'bg-blue-600 text-white border-blue-600'
                      : isActive ? 'bg-white text-blue-600 border-blue-600'
                        : 'bg-white text-gray-400 border-gray-300'
                    }`}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className={`mt-2 text-sm text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (

              <BasicDetailsForm
                data={formData.basic}
                setData={(newData) => {
                  const bannerImages = (newData.covers instanceof FileList)
                    ? Array.from(newData.covers)
                    : (Array.isArray(newData.covers) ? newData.covers : []);

                  setFormData(prev => ({
                    ...prev,
                    basic: {
                      ...prev.basic,
                      ...newData,
                      bannerImages: bannerImages.length ? bannerImages : prev.basic.bannerImages,
                      tags: newData.tags ?? prev.basic.tags,
                      keyValues: newData.keyValues ?? prev.basic.keyValues,
                    },
                  }));
                }}
              />

            )}

            {step === 2 && (
              <ServiceDetailsForm
                data={formData.service}
                setData={(newData) => setFormData(prev => ({ ...prev, service: { ...prev.service, ...newData } }))}
              />
            )}

            {step === 3 && (
              <FranchiseDetailsForm
                data={formData.franchise}
                setData={(newData) => setFormData(prev => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))}
                price={formData.basic?.price}
              />
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Previous
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepComplete(step) && !completedSteps.includes(step)}
                  className={`ml-auto px-4 py-2 text-white rounded ${isStepComplete(step) || completedSteps.includes(step)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepComplete(3) || isSubmitting}
                  className={`ml-auto px-4 py-2 text-white rounded ${isStepComplete(3)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
              )}
            </div>
          </form>
        </div>
      </ComponentCard>
    </div>
  );
};

export default EditService;
