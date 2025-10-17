'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import FileInput from '@/components/form/input/FileInput';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';

import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useService } from '@/context/ServiceContext';

const ClientSideCustomEditor = dynamic(
  () => import('@/components/custom-editor/CustomEditor'),
  { ssr: false, loading: () => <p>Loading rich text editor...</p> }
);

interface AddOfferProps {
  offerIdToEdit?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  _id?: string;
}

interface OfferResponse {
  _id: string;
  bannerImage: string;
  thumbnailImage: string;
  offerStartTime: string;
  offerEndTime: string;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: string | FAQItem[];
  termsAndConditions: string;
  service?: string | { _id: string };
}

// Updated image validation function - allows exactly 1MB or less
const validateImage = (file: File, maxSizeMB: number = 1): string | null => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  // Check file size (1MB = 1024 * 1024 bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image size must be less than or equal to ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
  }

  return null;
};

function toDatetimeLocalValue(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function normalizeDateForSubmit(v: string): string {
  if (!v) return '';
  if (v.includes('T')) return v;
  return `${v}T00:00`;
}

function tryFormatDMYtoISO(v: string): string {
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return v;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}T00:00`;
}

function parseFaq(raw: string | FAQItem[] | undefined | null): FAQItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((r: FAQItem) => ({
        question: r.question ?? '',
        answer: r.answer ?? '',
        _id: r._id,
      }))
      .filter((r) => r.question || r.answer);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseFaq(parsed);
    } catch {
      return [{ question: raw, answer: raw }];
    }
  }
  return [];
}

function extractId(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null) {
    // @ts-expect-error dynamic access
    return v._id ?? v.id ?? '';
  }
  return '';
}

const AddOffer: React.FC<AddOfferProps> = ({ offerIdToEdit }) => {
  const API_BASE = '/api/offer';

  /* ---------------- Context Data ---------------- */
  const { modules } = useModule();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { services } = useService();

  /* ---------------- Dropdown State ---------------- */
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedService, setSelectedService] = useState('');

  /* ---------------- Offer Form State ---------------- */
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [bannerImageError, setBannerImageError] = useState<string | null>(null);

  const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
  const [thumbnailImageError, setThumbnailImageError] = useState<string | null>(null);

  const [offerStartTime, setOfferStartTime] = useState('');
  const [offerEndTime, setOfferEndTime] = useState('');

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [galleryImagesError, setGalleryImagesError] = useState<string | null>(null);

  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [howToParticipate, setHowToParticipate] = useState('');
  const [faqList, setFaqList] = useState<FAQItem[]>([{ question: '', answer: '' }]);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(true);

  /* ---------------- Filtering Chains ---------------- */
  const filteredCategories = categories.filter(
    (cat) => extractId(cat.module) === selectedModule
  );

  const filteredSubcategories = subcategories.filter(
    (sub) => extractId(sub.category) === selectedCategory
  );

  const filteredServices = services.filter((serv) => {
    const servCatId = extractId(serv.category);
    const servSubId = extractId(serv.subcategory);
    if (!selectedCategory) return false;
    if (selectedSubcategory) return servSubId === selectedSubcategory;
    return servCatId === selectedCategory;
  });

  /* ---------------- Options ---------------- */
  const moduleOptions = modules.map((mod) => ({
    value: extractId(mod._id ?? mod),
    label: mod.name,
  }));

  const categoryOptions = filteredCategories.map((cat) => ({
    value: extractId(cat._id ?? cat),
    label: cat.name,
  }));

  const subcategoryOptions = filteredSubcategories.map((sub) => ({
    value: extractId(sub._id ?? sub),
    label: sub.name,
  }));

  const serviceOptions = filteredServices.map((serv) => ({
    value: extractId(serv._id ?? serv),
    label: serv.serviceName ?? 'Unnamed Service',
  }));

  const fetchOffer = useCallback(async () => {
    if (!offerIdToEdit) {
      resetForm();
      setIsFormLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ success: boolean; data: OfferResponse }>(
        `${API_BASE}/${offerIdToEdit}`
      );
      const data = res.data.data;

      setExistingBannerUrl(data.bannerImage || null);
      setExistingThumbnailUrl(data.thumbnailImage || null);
      setOfferStartTime(toDatetimeLocalValue(data.offerStartTime));
      setOfferEndTime(toDatetimeLocalValue(data.offerEndTime));
      setExistingGalleryUrls(data.galleryImages || []);
      setEligibilityCriteria(data.eligibilityCriteria || '');
      setHowToParticipate(data.howToParticipate || '');
      setFaqList(parseFaq(data.faq));
      setTermsAndConditions(data.termsAndConditions || '');

      const servId = extractId(data.service);
      console.log("Service ID from offer:", servId);

      if (servId) {
        // Wait for services and categories to be loaded from context
        if (services.length > 0 && categories.length > 0) {
          const servDoc = services.find((s) => extractId(s._id) === servId);
          console.log("Found service document:", servDoc);

          if (servDoc) {
            setSelectedService(servId);

            const catId = extractId(servDoc.category);
            const subId = extractId(servDoc.subcategory);
            console.log("Category ID:", catId, "Subcategory ID:", subId);

            if (catId) {
              setSelectedCategory(catId);

              const catDoc = categories.find((c) => extractId(c._id) === catId);
              console.log("Found category document:", catDoc);

              if (catDoc) {
                const moduleId = extractId(catDoc.module);
                console.log("Module ID:", moduleId);
                setSelectedModule(moduleId);
              }
            }

            if (subId) {
              setSelectedSubcategory(subId);
            }
          }
        } else {
          // If context data isn't loaded yet, we'll set the service ID and let the useEffect handle the rest
          setSelectedService(servId);
          console.log("Context data not loaded yet, will set dropdowns in useEffect");
        }
      }
    } catch (err) {
      console.error('Error fetching offer:', err);
      setError('Failed to fetch offer.');
    } finally {
      setLoading(false);
      setIsFormLoading(false);
    }
  }, [offerIdToEdit, services, categories]);

  useEffect(() => {
    // Wait for context data to be available before fetching
    if ((offerIdToEdit && services.length > 0 && categories.length > 0) || !offerIdToEdit) {
      fetchOffer();
    }
  }, [offerIdToEdit, services, categories, fetchOffer]);

  useEffect(() => {
    if (selectedService && services.length > 0 && categories.length > 0) {
      const servDoc = services.find((s) => extractId(s._id) === selectedService);
      if (servDoc) {
        const catId = extractId(servDoc.category);
        const subId = extractId(servDoc.subcategory);

        if (catId && !selectedCategory) {
          setSelectedCategory(catId);

          const catDoc = categories.find((c) => extractId(c._id) === catId);
          if (catDoc) {
            const moduleId = extractId(catDoc.module);
            if (moduleId && !selectedModule) {
              setSelectedModule(moduleId);
            }
          }
        }

        if (subId && !selectedSubcategory) {
          setSelectedSubcategory(subId);
        }
      }
    }
  }, [selectedService, services, categories, selectedCategory, selectedModule, selectedSubcategory]);

  /* ---------------- Reset ---------------- */
  const resetForm = () => {
    setBannerImageFile(null);
    setExistingBannerUrl(null);
    setBannerImageError(null);
    setThumbnailImageFile(null);
    setExistingThumbnailUrl(null);
    setThumbnailImageError(null);
    setOfferStartTime('');
    setOfferEndTime('');
    setGalleryFiles([]);
    setExistingGalleryUrls([]);
    setGalleryImagesError(null);
    setEligibilityCriteria('');
    setHowToParticipate('');
    setFaqList([{ question: '', answer: '' }]);
    setTermsAndConditions('');
    setSelectedModule('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedService('');
  };

  /* ---------------- Image Validation Handlers ---------------- */
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setBannerImageError(validationError);
        setBannerImageFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      setBannerImageError(null);
      setBannerImageFile(file);
      setExistingBannerUrl(null);
    } else {
      setBannerImageFile(null);
      setBannerImageError(null);
    }
  };

  const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const validationError = validateImage(file, 1);
      if (validationError) {
        setThumbnailImageError(validationError);
        setThumbnailImageFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      setThumbnailImageError(null);
      setThumbnailImageFile(file);
      setExistingThumbnailUrl(null);
    } else {
      setThumbnailImageFile(null);
      setThumbnailImageError(null);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      const validationErrors: string[] = [];
      const validFiles: File[] = [];
      
      files.forEach((file, index) => {
        const validationError = validateImage(file, 1);
        if (validationError) {
          validationErrors.push(`Image ${index + 1}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      });

      if (validationErrors.length > 0) {
        setGalleryImagesError(validationErrors.join(' | '));
        setGalleryFiles(validFiles); // Only set valid files
        // Note: We can't easily clear the file input for multiple files
        // The user will see which files were rejected and can re-upload
      } else {
        setGalleryImagesError(null);
        setGalleryFiles(files);
      }
    } else {
      setGalleryFiles([]);
      setGalleryImagesError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Final validation before submit
    if (bannerImageError || thumbnailImageError || galleryImagesError) {
      alert('Please fix image validation errors before submitting.');
      setLoading(false);
      return;
    }

    const startVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerStartTime.trim()));
    const endVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerEndTime.trim()));

    if (!startVal || !endVal) {
      alert('Start and End times are required.');
      setLoading(false);
      return;
    }

    const fd = new FormData();
    if (bannerImageFile) fd.append('bannerImage', bannerImageFile);
    if (thumbnailImageFile) fd.append('thumbnailImage', thumbnailImageFile);
    fd.append('offerStartTime', startVal);
    fd.append('offerEndTime', endVal);
    galleryFiles.forEach((f) => fd.append('galleryImages', f));
    fd.append('eligibilityCriteria', eligibilityCriteria);
    fd.append('howToParticipate', howToParticipate);
    fd.append('faq', JSON.stringify(faqList));
    fd.append('termsAndConditions', termsAndConditions);

    if (selectedService) fd.append('service', selectedService);
    else {
      alert('Please select a Service.');
      setLoading(false);
      return;
    }

    try {
      if (offerIdToEdit) {
        await axios.put(`${API_BASE}/${offerIdToEdit}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Offer updated successfully!');
      } else {
        await axios.post(API_BASE, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Offer created successfully!');
        resetForm();
        document
          .querySelectorAll<HTMLInputElement>('input[type="file"]')
          .forEach((el) => (el.value = ''));
      }
    } catch (err) {
      console.error('Offer submit error:', err);
      let msg = 'Error saving offer.';

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
      }

      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isFormLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-blue-500">Loading offer data...</p>
      </div>
    );
  }

  return (
    <div>
      <ComponentCard title={offerIdToEdit ? 'Edit Offer' : 'Add New Offer'}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
          {/* --- MODULE, CATEGORY, SUBCATEGORY, SERVICE --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module */}
            <div>
              <Label>Select Module</Label>
              <div className="relative">
                <Select
                  options={moduleOptions}
                  value={selectedModule}
                  placeholder="Select Module"
                  onChange={(value: string) => {
                    setSelectedModule(value);
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setSelectedService('');
                  }}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Select Category</Label>
              <Select
                options={categoryOptions}
                value={selectedCategory}
                placeholder="Select Category"
                onChange={(value: string) => {
                  setSelectedCategory(value);
                  setSelectedSubcategory('');
                  setSelectedService('');
                }}
              />
            </div>

            {/* Subcategory */}
            <div>
              <Label>Select Subcategory</Label>
              <Select
                options={subcategoryOptions}
                value={selectedSubcategory}
                placeholder="Select Subcategory"
                onChange={(value: string) => {
                  setSelectedSubcategory(value);
                  setSelectedService('');
                }}
              />
              {subcategoryOptions.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No subcategories available.</p>
              )}
            </div>

            {/* Service */}
            <div>
              <Label>Select Service</Label>
              <Select
                options={serviceOptions}
                value={selectedService}
                placeholder="Select Service"
                onChange={(value: string) => setSelectedService(value)}
              />
            </div>
          </div>

          {/* Banner + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="bannerImage">Banner Image</Label>
              <FileInput 
                id="bannerImage" 
                accept="image/*" 
                onChange={handleBannerImageChange} 
              />
              {bannerImageError && (
                <p className="text-red-500 text-xs mt-1">{bannerImageError}</p>
              )}
              {bannerImageFile && !bannerImageError && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Valid: {bannerImageFile.name} ({(bannerImageFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
              {existingBannerUrl && !bannerImageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Current:&nbsp;
                  <a
                    href={existingBannerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    View Banner
                  </a>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
            </div>

            <div>
              <Label htmlFor="thumbnailImage">Thumbnail Image</Label>
              <FileInput 
                id="thumbnailImage" 
                accept="image/*" 
                onChange={handleThumbnailImageChange} 
              />
              {thumbnailImageError && (
                <p className="text-red-500 text-xs mt-1">{thumbnailImageError}</p>
              )}
              {thumbnailImageFile && !thumbnailImageError && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Valid: {thumbnailImageFile.name} ({(thumbnailImageFile.size / (1024 * 1024)).toFixed(2)}MB)
                </p>
              )}
              {existingThumbnailUrl && !thumbnailImageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Current:&nbsp;
                  <a
                    href={existingThumbnailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    View Thumbnail
                  </a>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Max size: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
            </div>

            <div>
              <Label htmlFor="offerStart">Offer Start</Label>
              <Input
                id="offerStart"
                type="datetime-local"
                value={offerStartTime}
                onChange={(e) => setOfferStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="offerEnd">Offer End</Label>
              <Input
                id="offerEnd"
                type="datetime-local"
                value={offerEndTime}
                onChange={(e) => setOfferEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Gallery */}
          <div>
            <Label htmlFor="galleryImages">Gallery Images (multiple)</Label>
            <FileInput
              id="galleryImages"
              multiple
              accept="image/*"
              onChange={handleGalleryChange}
            />
            {galleryImagesError && (
              <p className="text-red-500 text-xs mt-1">{galleryImagesError}</p>
            )}
            {galleryFiles.length > 0 && !galleryImagesError && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {galleryFiles.length} valid image(s) selected
                {galleryFiles.length > 0 && ` | Total size: ${(galleryFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)}MB`}
              </p>
            )}
            {existingGalleryUrls.length > 0 && galleryFiles.length === 0 && (
              <div className="mt-2 space-y-1">
                <Label className="text-xs text-gray-600">Current Gallery:</Label>
                <ul className="text-xs space-y-1">
                  {existingGalleryUrls.map((u, i) => (
                    <li key={i}>
                      <a
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        Image {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Max size per image: 1MB | Supported: JPEG, JPG, PNG, WEBP, GIF</p>
          </div>

          {/* Rich Text Sections */}
          <div className="space-y-10">
            <div>
              <Label>Eligibility Criteria</Label>
              <ClientSideCustomEditor
                value={eligibilityCriteria}
                onChange={setEligibilityCriteria}
              />
            </div>

            <div>
              <Label>How to Participate</Label>
              <ClientSideCustomEditor
                value={howToParticipate}
                onChange={setHowToParticipate}
              />
            </div>

            {/* FAQ */}
            <div>
              <Label>Frequently Asked Questions</Label>
              {faqList.map((item, index) => (
                <div key={item._id || index} className="border rounded-md p-4 mb-4">
                  <Input
                    type="text"
                    placeholder="Enter question"
                    value={item.question}
                    onChange={(e) => {
                      setFaqList(prev =>
                        prev.map((faq, i) =>
                          i === index ? { ...faq, question: e.target.value } : faq
                        )
                      );
                    }}
                    className="mb-3"
                  />
                  <ClientSideCustomEditor
                    value={item.answer}
                    onChange={(value) => {
                      setFaqList(prev =>
                        prev.map((faq, i) =>
                          i === index ? { ...faq, answer: value } : faq
                        )
                      );
                    }}
                  />
                  {faqList.length > 1 && (
                    <button
                      type="button"
                      className="mt-2 text-red-600 text-sm"
                      onClick={() => {
                        setFaqList(prev =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 mt-2 text-sm"
                onClick={() => setFaqList([...faqList, { question: '', answer: '' }])}
              >
                + Add FAQ
              </button>
            </div>

            <div>
              <Label>Terms & Conditions</Label>
              <ClientSideCustomEditor
                value={termsAndConditions}
                onChange={setTermsAndConditions}
              />
            </div>
          </div>

          <div className="pt-6">
            <Button 
              size="sm" 
              variant="primary" 
              type="submit" 
              disabled={loading || !!bannerImageError || !!thumbnailImageError || !!galleryImagesError}
            >
              {offerIdToEdit ? 'Update Offer' : 'Add Offer'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddOffer;