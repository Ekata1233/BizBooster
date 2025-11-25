'use client';

import React, { useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import ServiceDetailsForm, { ServiceDetails } from './ServiceDetailsForm';
import { useService } from '@/context/ServiceContext';
import BasicDetailsForm from './BasicDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';

// -------------------------------
// TYPES (ALL OPTIONAL NOW)
// -------------------------------
type KeyValue = { key?: string; value?: string };

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
  covers?: File[] | FileList | null;
  tags?: string[];
  keyValues?: KeyValue[];
  recommendedServices?: boolean;
};

type FranchiseDetails = {
  commission?: string;
  termsAndConditions?: string;
  investmentRange?: any[];
  monthlyEarnPotential?: any[];
  franchiseModel?: any[];
  extraSections?: any[];
  extraImages?: any[];
};

type FormDataType = {
  basic: BasicDetailsData;
  service: ServiceDetails;
  franchise: FranchiseDetails;
};

const AddNewService = () => {

  // ------------------------------------------------
  // INITIAL STATE (ALL FIELDS OPTIONAL)
  // ------------------------------------------------
  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      name: '',
      category: '',
      subcategory: '',
      price: undefined,
      discount: undefined,
      discountedPrice: undefined,
      gst: undefined,
      includeGst: false,
      gstInRupees: undefined,
      totalWithGst: undefined,
      thumbnail: null,
      covers: [],
      tags: [],
      keyValues: [{ key: '', value: '' }],
      recommendedServices: false,
    },

    service: {
      benefits: [],
      aboutUs: [],
      highlight: [],
      document: [],
      assuredByFetchTrue: [],
      howItWorks: [],
      termsAndConditions: [],
      faq: [],
      extraSections: [],
      whyChooseUs: [],
      packages: [],
      weRequired: [],
      weDeliver: [],
      moreInfo: [],
      connectWith: [],
      timeRequired: [],
      extraImages: [],
    },

    franchise: {
      commission: '',
      termsAndConditions: '',
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      extraSections: [],
      extraImages: [],
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createService } = useService();

  // ------------------------------------------------
  // UNIVERSAL FORMDATA BUILDER (SAFE FOR OPTIONAL)
  // ------------------------------------------------
  const buildFormData = (
    data: any,
    fd = new FormData(),
    parentKey = ''
  ) => {
    if (data === null || data === undefined) {
      // store empty string for null/undefined
      fd.append(parentKey, '');
      return fd;
    }

    if (data instanceof File || data instanceof Blob) {
      fd.append(parentKey, data);
      return fd;
    }

    if (Array.isArray(data)) {
      data.forEach((value, index) => {
        buildFormData(value, fd, `${parentKey}[${index}]`);
      });
      return fd;
    }

    if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        buildFormData(value, fd, fullKey);
      });
      return fd;
    }

    fd.append(parentKey, String(data));
    return fd;
  };

  // ------------------------------------------------
  // SUBMIT HANDLER (NO REQUIRED FIELDS)
  // ------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = buildFormData(formData);
      const result = await createService(fd);

      if (!result) {
        alert("Service creation failed!");
        setIsSubmitting(false);
        return;
      }

      alert("Service added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <ComponentCard title="Add New Service">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* BASIC DETAILS */}
          <BasicDetailsForm
            data={formData.basic}
            setData={(newData) =>
              setFormData((prev) => ({
                ...prev,
                basic: { ...prev.basic, ...newData }
              }))
            }
          />

          <hr className="border-gray-300" />

          {/* SERVICE DETAILS */}
          <ServiceDetailsForm
            data={formData.service}
            setData={(newData) =>
              setFormData((prev) => ({
                ...prev,
                service: { ...prev.service, ...newData }
              }))
            }
          />

          <hr className="border-gray-300" />

          {/* FRANCHISE DETAILS */}
          <FranchiseDetailsForm
            data={formData.franchise}
            setData={(newData) =>
              setFormData((prev) => ({
                ...prev,
                franchise: { ...prev.franchise, ...newData }
              }))
            }
            price={formData.basic.discountedPrice}
          />

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded 
                ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

        </form>
      </ComponentCard>
    </div>
  );
};

export default AddNewService;
