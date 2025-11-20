'use client';

import React, { useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import ServiceDetailsForm, { ServiceDetails } from './ServiceDetailsForm';
import { useService } from '@/context/ServiceContext';
import BasicDetailsForm from './BasicDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';


type RowData = {
  title: string;
  description: string;
};

type FranchiseDetails = {
  commission?: string;
  commissionType?: string;
  overview?: string;
  howItWorks?: string;
  terms?: string;
  rows?: RowData[];
};

interface KeyValue {
  key: string;
  value: string;
}

type BasicDetailsData = {
  name?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  discount?: number;
  discountedPrice?: number;
  gst?: number;
  includeGst?: boolean;
  gstInRupees?: number;
  totalWithGst?: number;
  thumbnail?: File | null;
  covers?: FileList | File[] | null;
  tags?: string[];
  keyValues?: KeyValue[];
  recommendedServices?: boolean;
};

type FormDataType = {
  basic: BasicDetailsData;
  service: ServiceDetails;
  franchise: FranchiseDetails;
};

const AddNewService = () => {
  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      name: '',
      category: '',
      subcategory: '',
      price: 0,
      discount: 0,
      discountedPrice: 0,
      gst: 0,
      includeGst: false,
      thumbnail: null,
      covers: [],
      tags: [],
      keyValues: [{ key: '', value: '' }],
      recommendedServices: false,
    },
    service: {
      benefits: '',
      overview: '',
      highlight: null,
      document: '',
      howItWorks: '',
      terms: '',
      faqs: [{ question: '', answer: '' }],
      rows: [{ title: '', description: '' }],
      whyChoose: [],

    },
    franchise: {
      commission: '',
      overview: '',
      howItWorks: '',
      terms: '',
      rows: [{ title: '', description: '' }],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createService } = useService();

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          !!formData?.basic?.name?.trim()
          &&
          !!formData?.basic?.category &&
          !!formData?.basic?.price &&
          !!formData?.basic?.discount &&
          !!formData?.basic?.thumbnail &&
          !!formData?.basic?.covers &&
          !!formData?.basic?.tags
        );
      case 2:
        return (
          !!formData?.service?.benefits?.trim()
          &&
          !!formData?.service?.overview?.trim() &&
          !!formData?.service?.howItWorks?.trim() &&
          !!formData?.service?.document?.trim() &&
          !!formData?.service?.terms?.trim() &&
          !!formData?.service?.faqs &&
          !!formData?.service?.whyChoose
        );
      case 3:
        return (
          !!formData?.franchise?.commission &&
          !!formData?.franchise?.overview?.trim() &&
          !!formData?.franchise?.howItWorks?.trim()
        );
      default:
        return false;
    }
  };

  const buildFormData = (
    data: unknown,
    formDataInstance = new FormData(),
    parentKey = ''
  ): FormData => {
    if (
      data !== null &&
      typeof data === 'object' &&
      !(data instanceof File) &&
      !(data instanceof Blob)
    ) {
      Object.keys(data).forEach((key) => {
        const value = (data as Record<string, unknown>)[key];
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        buildFormData(value, formDataInstance, fullKey);
      });
    } else if (typeof data === 'boolean') {
      formDataInstance.append(parentKey, data ? 'true' : 'false');
    } else if (typeof data === 'number') {
      formDataInstance.append(parentKey, data.toString());
    } else if (data === null || data === undefined) {
      formDataInstance.append(parentKey, '');
    } else if (typeof data === 'string' || data instanceof Blob) {
      formDataInstance.append(parentKey, data);
    } else {
      formDataInstance.append(parentKey, String(data));
    }

    return formDataInstance;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStepComplete(3)) {
      alert("Please complete all steps before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const { price = 0, gst = 0 } = formData.basic;
      const gstInRupees = (price * gst) / 100;
      const totalWithGst = price + gstInRupees
      const formDataWithGst = {
        ...formData,
        basic: {
          ...formData.basic,
          gstInRupees,
          totalWithGst,
        },
      };

      const fd = buildFormData(formDataWithGst);
      const result = await createService(fd);
      if (!result) {
        alert("Service creation failed");
        return;
      }
      alert("Service added successfully!");
      setFormData({
        basic: {
          name: '',
          category: '',
          subcategory: '',
          price: 0,
          discount: 0,
          gst: 0,
          includeGst: false,
          thumbnail: null,
          covers: [],
          tags: [],
          keyValues: [{ key: '', value: '' }],
          recommendedServices: false,
        },
        service: {
          benefits: '',
          overview: '',
          highlight: null,
          document: '',
          howItWorks: '',
          terms: '',
          faqs: [{ question: '', answer: '' }],
          rows: [{ title: '', description: '' }],
          whyChoose: [],
        },
        franchise: {
          commission: '',
          overview: '',
          howItWorks: '',
          terms: '',
          rows: [{ title: '', description: '' }],
        },
      });

    } catch (err) {
      console.error("Failed to add service:", err);
      alert("Failed to add service");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div>
      <ComponentCard title="Add New Service">
        <div>
         
          <form onSubmit={handleSubmit} className="space-y-5">
            
              <BasicDetailsForm
                data={formData.basic}
                setData={(newData) =>
                  setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))
                }
              />
               <hr className="border-gray-300" />
            
              <ServiceDetailsForm
                data={formData.service}
                setData={(newData) =>
                  setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))
                }
              />
               <hr className="border-gray-300" />
           
              <FranchiseDetailsForm
                data={formData.franchise}
                setData={(newData) =>
                  setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))
                }
                price={formData.basic.price}
              />

            <div className="flex justify-between pt-4">
                <button
                  type="submit"
                  disabled={!isStepComplete(3) || isSubmitting}
                  className={`ml-auto px-4 py-2 text-white rounded ${isStepComplete(3)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
          </form>
        </div>
      </ComponentCard>
    </div>
  );
};

export default AddNewService;
