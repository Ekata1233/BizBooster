'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useService } from '@/context/ServiceContext';
import BasicDetailsForm, { BasicDetailsData } from '@/components/service-component/BasicDetailsForm';
import ServiceDetailsForm, { ServiceDetails } from '@/components/service-component/ServiceDetailsForm';
import FranchiseDetailsForm from '@/components/service-component/FranchiseDetailsForm';
import ComponentCard from '@/components/common/ComponentCard';

/**
 * Central "edit" shape. We keep types loose (any) in some places because
 * child components emit slightly different shapes; this keeps the page usable.
 */
type EditState = {
  basic: Partial<BasicDetailsData> & {
    // extras we use internally
    bannerPreviews?: string[];
    thumbnailPreview?: string;
  };
  service: Partial<ServiceDetails> & { highlight?: any[]; highlightPreviews?: string[] };
  franchise: any; // FranchiseDetails shape lives inside FranchiseDetailsForm — keep flexible
};

const EditService: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { fetchSingleService, singleService: service, updateService } = useService();

  const [state, setState] = useState<EditState>({
    basic: {
      name: '',
      serviceName: '',
      category: '',
      subcategory: '',
      price: 0,
      discount: 0,
      gst: 0,
      includeGst: false,
      thumbnail: null,
      bannerImages: [],
      bannerPreviews: [],
      tags: [],
      keyValues: [{ key: '', value: '' }],
      recommendedServices: false,
      discountedPrice: 0,
    },
    service: {
      overview: '',
      highlight: [],
      highlightPreviews: [],
      benefits: [],
      howItWorks: [],
      termsAndConditions: [],
      document: [],
      extraSections: [],
      faq: [],
      whyChooseUs: [],
      packages: [],
      timeRequired: [],
      extraImages: [],
    },
    franchise: {
      overview: '',
      commission: '',
      commissionType: 'percentage',
      commissionValue: '',
      howItWorks: '',
      termsAndConditions: '',
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      extraSections: [],
      extraImages: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1) Fetch single service on load
  useEffect(() => {
    if (!id) return;
    fetchSingleService(id as string);
  }, [id]);

  // 2) When service arrives, map fields into our state shape
  useEffect(() => {
    if (!service) return;

    const mappedBasic: any = {
      name: service.serviceName || '',
      serviceName: service.serviceName || '',
      category: service.category?._id || '',
      subcategory: service.subcategory?._id || '',
      price: service.price ?? 0,
      discount: service.discount ?? 0,
      gst: service.gst ?? 0,
      includeGst: service.includeGst ?? false,
      thumbnail: null,
      thumbnailPreview: service.thumbnailImage || '',
      bannerImages: [], // actual File objects are not present — user may upload
      bannerPreviews: Array.isArray(service.bannerImages) ? service.bannerImages : [],
      tags: service.tags || [],
      keyValues: Array.isArray(service.keyValues) ? service.keyValues.map((kv: any) => ({ key: kv.key, value: kv.value })) : [{ key: '', value: '' }],
      recommendedServices: service.recommendedServices ?? false,
      discountedPrice: service.discountedPrice ?? 0,
    };

    // Map service details (preserve arrays if already arrays; fallback to simple transforms)
    const svcDetails: any = service.serviceDetails || {};
    const mappedService: any = {
      overview: svcDetails.overview ?? '',
      highlight: Array.isArray(svcDetails.highlight) ? svcDetails.highlight.filter((x: any) => typeof x === 'string') : [],
      highlightPreviews: Array.isArray(svcDetails.highlight) ? svcDetails.highlight.filter((x: any) => typeof x === 'string') : [],
      benefits: Array.isArray(svcDetails.benefits) ? svcDetails.benefits : (svcDetails.benefits ? [svcDetails.benefits] : []),
      howItWorks: Array.isArray(svcDetails.howItWorks) ? svcDetails.howItWorks : (svcDetails.howItWorks ? [svcDetails.howItWorks] : []),
      termsAndConditions: Array.isArray(svcDetails.termsAndConditions) ? svcDetails.termsAndConditions : (svcDetails.termsAndConditions ? [svcDetails.termsAndConditions] : []),
      document: Array.isArray(svcDetails.document) ? svcDetails.document : (svcDetails.document ? [svcDetails.document] : []),
      extraSections: Array.isArray(svcDetails.extraSections) ? svcDetails.extraSections : [],
      faq: Array.isArray(svcDetails.faq) ? svcDetails.faq : [],
      whyChooseUs: svcDetails.whyChoose || [],
      packages: svcDetails.packages || [],
      timeRequired: svcDetails.timeRequired || [],
      extraImages: svcDetails.extraImages || [],
      // keep any other props
      ...svcDetails,
    };

    const fr = service.franchiseDetails || {};
    const mappedFranchise: any = {
      overview: fr.overview ?? '',
      commission: fr.commission ?? '',
      commissionType: fr.commissionType ?? 'percentage',
      commissionValue: typeof fr.commission === 'string' ? fr.commission.replace(/[^\d]/g, '') : (fr.commissionValue ?? ''),
      howItWorks: fr.howItWorks ?? '',
      termsAndConditions: fr.termsAndConditions ?? '',
      investmentRange: fr.investmentRange ?? [],
      monthlyEarnPotential: fr.monthlyEarnPotential ?? [],
      franchiseModel: fr.franchiseModel ?? [],
      extraSections: fr.extraSections ?? [],
      extraImages: fr.extraImages ?? [],
      // keep other props
      ...fr,
    };

    setState({
      basic: mappedBasic,
      service: mappedService,
      franchise: mappedFranchise,
    });
  }, [service]);

  // ---------- Child setData handlers ----------
  const onBasicSet = (newData: Partial<BasicDetailsData>) => {
    // normalize old 'covers' -> bannerImages if present (your BasicDetailsForm code used covers in the past)
    const normalized = { ...newData } as any;
    if ((normalized as any).covers instanceof FileList) {
      normalized.bannerImages = Array.from((normalized as any).covers as FileList);
      delete (normalized as any).covers;
    }
    setState(prev => ({ ...prev, basic: { ...prev.basic, ...normalized } }));
  };

  const onServiceSet = (newData: Partial<ServiceDetails> | any) => {
    setState(prev => ({ ...prev, service: { ...prev.service, ...newData } }));
  };

  const onFranchiseSet = (newData: any) => {
    setState(prev => ({ ...prev, franchise: { ...prev.franchise, ...newData } }));
  };

  // ---------- Build FormData and send update ----------
  const handleUpdate = async () => {
    if (!service) {
      alert('Service not loaded yet.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // --- BASIC fields ---
      const b = state.basic;
      fd.append('name', String(b.name ?? b.serviceName ?? ''));
      fd.append('category', String(b.category ?? ''));
      fd.append('subcategory', String(b.subcategory ?? ''));
      fd.append('price', String(b.price ?? 0));
      fd.append('recommendedServices', b.recommendedServices ? 'true' : 'false');

      if (typeof b.discount !== 'undefined') fd.append('discount', String(b.discount ?? 0));
      if (typeof b.gst !== 'undefined') fd.append('gst', String(b.gst ?? 0));
      if (typeof b.includeGst !== 'undefined') fd.append('includeGst', String(!!b.includeGst));

      // thumbnail file (if user selected a File)
      if (b.thumbnail instanceof File) fd.append('thumbnailImage', b.thumbnail);

      // banner images - File objects
      if (Array.isArray(b.bannerImages) && b.bannerImages.length) {
        (b.bannerImages as File[]).forEach((f: File) => {
          if (f instanceof File) fd.append('bannerImages', f);
        });
      }

      // tags
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t: string, i: number) => fd.append(`tags[${i}]`, t));
      }

      // keyValues -> send as repeated pairs
      if (Array.isArray(b.keyValues)) {
        b.keyValues.forEach((kv: any, i: number) => {
          fd.append(`keyValues[${i}][key]`, String(kv.key ?? ''));
          fd.append(`keyValues[${i}][value]`, String(kv.value ?? ''));
        });
      }

      // --- SERVICE fields ---
      const s = state.service || {};

      if (s.overview) fd.append('serviceDetails[overview]', String(s.overview));

      // highlights: append files and send any existing preview URLs under highlightPreviews
      if (Array.isArray(s.highlight)) {
        s.highlight.forEach((h: any, idx: number) => {
          if (h instanceof File) fd.append(`serviceDetails[highlight][${idx}]`, h);
          else if (typeof h === 'string') fd.append(`serviceDetails[highlightPreviews][${idx}]`, h);
        });
      }

      // For arrays that are content (benefits, howItWorks, terms, document) we serialize as JSON.
      // This keeps the API shape clear on the server side (server can JSON.parse).
      const safeAppendJson = (field: string, value: any) => {
        if (typeof value === 'undefined' || value === null) return;
        if (Array.isArray(value)) fd.append(field, JSON.stringify(value));
        else fd.append(field, typeof value === 'string' ? value : JSON.stringify(value));
      };

      safeAppendJson('serviceDetails[benefits]', s.benefits);
      safeAppendJson('serviceDetails[howItWorks]', s.howItWorks);
      safeAppendJson('serviceDetails[termsAndConditions]', s.termsAndConditions);
      safeAppendJson('serviceDetails[document]', s.document);

      // faq
      if (Array.isArray(s.faq)) {
        s.faq.forEach((f: any, idx: number) => {
          fd.append(`serviceDetails[faq][${idx}][question]`, String(f.question ?? ''));
          fd.append(`serviceDetails[faq][${idx}][answer]`, String(f.answer ?? ''));
        });
      }

      // extraSections: send title + description (and upload images if File)
      if (Array.isArray(s.extraSections)) {
        s.extraSections.forEach((sec: any, i: number) => {
          if (sec.title) fd.append(`serviceDetails[extraSections][${i}][title]`, String(sec.title));
          if (sec.description) {
            if (Array.isArray(sec.description)) fd.append(`serviceDetails[extraSections][${i}][description]`, JSON.stringify(sec.description));
            else fd.append(`serviceDetails[extraSections][${i}][description]`, String(sec.description));
          }
          // images in section
          if (sec.image) {
            if (Array.isArray(sec.image)) {
              sec.image.forEach((img: any, j: number) => {
                if (img instanceof File) fd.append(`serviceDetails[extraSections][${i}][images][${j}]`, img);
                else if (typeof img === 'string') fd.append(`serviceDetails[extraSections][${i}][imagePreviews][${j}]`, img);
              });
            } else {
              if (sec.image instanceof File) fd.append(`serviceDetails[extraSections][${i}][images][0]`, sec.image);
              else if (typeof sec.image === 'string') fd.append(`serviceDetails[extraSections][${i}][imagePreviews][0]`, sec.image);
            }
          }
        });
      }

      // whyChoose, packages, timeRequired, extraImages -> serialize as JSON (except files)
      safeAppendJson('serviceDetails[whyChoose]', s.whyChoose || s.whyChooseUs);
      safeAppendJson('serviceDetails[packages]', s.packages);
      safeAppendJson('serviceDetails[timeRequired]', s.timeRequired);
      // extraImages may be files or urls
      if (Array.isArray(s.extraImages)) {
        s.extraImages.forEach((img: any, idx: number) => {
          if (img instanceof File) fd.append('serviceDetails[extraImages]', img);
          else fd.append(`serviceDetails[extraImagesPreviews][${idx}]`, String(img));
        });
      }

      // --- FRANCHISE fields ---
      const f = state.franchise || {};
      if (f.overview) fd.append('franchiseDetails[overview]', String(f.overview));
      if (typeof f.commission !== 'undefined') fd.append('franchiseDetails[commission]', String(f.commission));
      if (f.howItWorks) fd.append('franchiseDetails[howItWorks]', String(f.howItWorks));
      if (f.termsAndConditions) fd.append('franchiseDetails[termsAndConditions]', String(f.termsAndConditions));

      // extraSections for franchise (title+description + images)
      if (Array.isArray(f.extraSections)) {
        f.extraSections.forEach((sec: any, i: number) => {
          if (sec.title) fd.append(`franchiseDetails[extraSections][${i}][title]`, String(sec.title));
          if (sec.description) {
            if (Array.isArray(sec.description)) fd.append(`franchiseDetails[extraSections][${i}][description]`, JSON.stringify(sec.description));
            else fd.append(`franchiseDetails[extraSections][${i}][description]`, String(sec.description));
          }
          if (sec.image) {
            if (Array.isArray(sec.image)) {
              sec.image.forEach((img: any, j: number) => {
                if (img instanceof File) fd.append(`franchiseDetails[extraSections][${i}][images][${j}]`, img);
                else fd.append(`franchiseDetails[extraSections][${i}][imagePreviews][${j}]`, String(img));
              });
            } else {
              if (sec.image instanceof File) fd.append(`franchiseDetails[extraSections][${i}][images][0]`, sec.image);
              else fd.append(`franchiseDetails[extraSections][${i}][imagePreviews][0]`, String(sec.image));
            }
          }
        });
      }

      // franchiseModel, investmentRange, monthlyEarnPotential -> send as JSON
      if (Array.isArray(f.franchiseModel)) fd.append('franchiseDetails[franchiseModel]', JSON.stringify(f.franchiseModel));
      if (Array.isArray(f.investmentRange)) fd.append('franchiseDetails[investmentRange]', JSON.stringify(f.investmentRange));
      if (Array.isArray(f.monthlyEarnPotential)) fd.append('franchiseDetails[monthlyEarnPotential]', JSON.stringify(f.monthlyEarnPotential));
      if (Array.isArray(f.extraImages)) {
        f.extraImages.forEach((img: any, idx: number) => {
          if (img instanceof File) fd.append('franchiseDetails[extraImages]', img);
          else fd.append(`franchiseDetails[extraImagesPreviews][${idx}]`, String(img));
        });
      }

      // finally call updateService (your context function)
      const response = await updateService(service._id, fd);

      if (response?.success) {
        alert('Service updated successfully!');
        router.push('/service-management/service-list');
      } else {
        console.error('Update failed', response);
        alert('Update failed — check console for details.');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      alert('An error occurred while updating. See console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("selected service  : ", state)

  return (
    <div className="no-scrollbar w-full max-w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 mx-auto mt-8">
      <ComponentCard title="Edit Service — All Sections">
        <div className="space-y-6">

          <BasicDetailsForm
            data={{
              serviceName: state.basic.serviceName ?? state.basic.name,
              category: state.basic.category,
              subcategory: state.basic.subcategory,
              price: state.basic.price,
              discount: state.basic.discount,
              includeGst: state.basic.includeGst,
              gst: state.basic.gst,
              recommendedServices: state.basic.recommendedServices,
              discountedPrice: state.basic.discountedPrice,
              thumbnailImage: state.basic.thumbnail,
              bannerImages: state.basic.bannerImages,
              tags: state.basic.tags,
              keyValues: state.basic.keyValues,
            }}
            setData={(d) => onBasicSet(d)}
          />

          <ServiceDetailsForm
            data={state.service as ServiceDetails}
            setData={(d: any) => onServiceSet(d)}
          />

          <FranchiseDetailsForm
            data={state.franchise}
            setData={(d: any) => onFranchiseSet(d)}
            price={state.basic.discountedPrice}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default EditService;
