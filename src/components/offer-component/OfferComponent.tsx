// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import dynamic from 'next/dynamic';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import ComponentCard from '@/components/common/ComponentCard';
// import Select from '@/components/form/Select';
// import { ChevronDownIcon } from '@/icons';

// import { useModule } from '@/context/ModuleContext';
// import { useCategory } from '@/context/CategoryContext';
// import { useSubcategory } from '@/context/SubcategoryContext';
// import { useService } from '@/context/ServiceContext';

// const ClientSideCustomEditor = dynamic(
//   () => import('@/components/custom-editor/CustomEditor'),
//   { ssr: false, loading: () => <p>Loading rich text editor...</p> }
// );

// interface AddOfferProps {
//   offerIdToEdit?: string;
// }

// interface FAQItem {
//   question: string;
//   answer: string;
//   _id?: string;
// }

// interface OfferResponse {
//   _id: string;
//   bannerImage: string;
//   thumbnailImage: string;
//   offerStartTime: string;
//   offerEndTime: string;
//   galleryImages: string[];
//   eligibilityCriteria: string;
//   howToParticipate: string;
//   faq: string | FAQItem[];
//   termsAndConditions: string;
//   service?: string | { _id: string }; // may be populated or just id
// }

// function toDatetimeLocalValue(dateStr?: string | null): string {
//   if (!dateStr) return '';
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return '';
//   const pad = (n: number) => String(n).padStart(2, '0');
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }

// function normalizeDateForSubmit(v: string): string {
//   if (!v) return '';
//   if (v.includes('T')) return v;
//   return `${v}T00:00`;
// }

// function tryFormatDMYtoISO(v: string): string {
//   const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
//   if (!m) return v;
//   const [, dd, mm, yyyy] = m;
//   return `${yyyy}-${mm}-${dd}T00:00`;
// }

// // Parse FAQ from API
// function parseFaq(raw: string | FAQItem[] | undefined | null): FAQItem[] {
//   if (!raw) return [];
//   if (Array.isArray(raw)) {
//     return raw
//       .map((r: FAQItem) => ({
//         question: r.question ?? '',
//         answer: r.answer ?? '',
//         _id: r._id,
//       }))
//       .filter((r) => r.question || r.answer);
//   }
//   if (typeof raw === 'string') {
//     try {
//       const parsed = JSON.parse(raw);
//       return parseFaq(parsed);
//     } catch {
//       return [{ question: raw, answer: raw }];
//     }
//   }
//   return [];
// }


// function extractId(v: unknown): string {
//   if (!v) return '';
//   if (typeof v === 'string') return v;
//   if (typeof v === 'object' && v !== null) {
//     // @ts-expect-error dynamic access
//     return v._id ?? v.id ?? '';
//   }
//   return '';
// }

// const AddOffer: React.FC<AddOfferProps> = ({ offerIdToEdit }) => {
//   const API_BASE = '/api/offer';

//   /* ---------------- Context Data ---------------- */
//   const { modules } = useModule();
//   const { categories } = useCategory();
//   const { subcategories } = useSubcategory();
//   const { services } = useService();

//   /* ---------------- Dropdown State ---------------- */
//   const [selectedModule, setSelectedModule] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedSubcategory, setSelectedSubcategory] = useState('');
//   const [selectedService, setSelectedService] = useState('');

//   /* ---------------- Offer Form State ---------------- */
//   const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
//   const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);

//   const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
//   const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

//   const [offerStartTime, setOfferStartTime] = useState('');
//   const [offerEndTime, setOfferEndTime] = useState('');

//   const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
//   const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

//   const [eligibilityCriteria, setEligibilityCriteria] = useState('');
//   const [howToParticipate, setHowToParticipate] = useState('');
//   const [faqList, setFaqList] = useState<FAQItem[]>([{ question: '', answer: '' }]);
//   const [termsAndConditions, setTermsAndConditions] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   /* ---------------- Filtering Chains ---------------- */
//   const filteredCategories = categories.filter(
//     (cat) => extractId(cat.module) === selectedModule
//   );

//   const filteredSubcategories = subcategories.filter(
//     (sub) => extractId(sub.category) === selectedCategory
//   );

//   // If subcategory picked: require match on subcategory
//   // Else: show all services under the selectedCategory
//   const filteredServices = services.filter((serv) => {
//     const servCatId = extractId(serv.category);
//     const servSubId = extractId(serv.subcategory);
//     if (!selectedCategory) return false;
//     if (selectedSubcategory) return servSubId === selectedSubcategory;
//     return servCatId === selectedCategory;
//   });

//   /* ---------------- Options ---------------- */
//   const moduleOptions = modules.map((mod) => ({
//     value: extractId(mod._id ?? mod),
//     label: mod.name,
//   }));

//   const categoryOptions = filteredCategories.map((cat) => ({
//     value: extractId(cat._id ?? cat),
//     label: cat.name,
//   }));

//   const subcategoryOptions = filteredSubcategories.map((sub) => ({
//     value: extractId(sub._id ?? sub),
//     label: sub.name,
//   }));

//   const serviceOptions = filteredServices.map((serv) => ({
//     value: extractId(serv._id ?? serv),
//     label: serv.serviceName ?? 'Unnamed Service',
//   }));

//   /* ---------------- Debug Logs (remove in prod) ---------------- */
//   useEffect(() => {
//     console.log('Selected -> module:', selectedModule, 'category:', selectedCategory, 'subcategory:', selectedSubcategory);
//     console.log('Services (all):', services);
//     console.log('Filtered Services:', filteredServices);
//     console.log('Service Options:', serviceOptions);
//   }, [services, filteredServices, serviceOptions, selectedModule, selectedCategory, selectedSubcategory]);

//   /* ---------------- Fetch Offer for Edit ---------------- */
//   const fetchOffer = useCallback(async () => {
//     if (!offerIdToEdit) {
//       resetForm();
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get<{ success: boolean; data: OfferResponse }>(
//         `${API_BASE}/${offerIdToEdit}`
//       );
//       const data = res.data.data;

//       // Basic fields
//       setExistingBannerUrl(data.bannerImage || null);
//       setExistingThumbnailUrl(data.thumbnailImage || null);
//       setOfferStartTime(toDatetimeLocalValue(data.offerStartTime));
//       setOfferEndTime(toDatetimeLocalValue(data.offerEndTime));
//       setExistingGalleryUrls(data.galleryImages || []);
//       setEligibilityCriteria(data.eligibilityCriteria || '');
//       setHowToParticipate(data.howToParticipate || '');
//       setFaqList(parseFaq(data.faq));
//       setTermsAndConditions(data.termsAndConditions || '');

//       // Service is the only relational field in Offer.
//       const servId = extractId(data.service);
//       if (servId) {
//         setSelectedService(servId);
//         // Try to "auto-walk" back up to subcategory / category / module if we can find this service in context
//         const servDoc = services.find((s) => extractId(s._id) === servId);
//         if (servDoc) {
//           const catId = extractId(servDoc.category);
//           const subId = extractId(servDoc.subcategory);
//           setSelectedCategory(catId);
//           setSelectedSubcategory(subId);
//           // find which module owns that category
//           const catDoc = categories.find((c) => extractId(c._id) === catId);
//           if (catDoc) setSelectedModule(extractId(catDoc.module));
//         }
//       }
//     } catch (err: unknown) {
//       console.error('Error fetching offer:', err);
//       setError('Failed to fetch offer.');
//     } finally {
//       setLoading(false);
//     }
//   }, [offerIdToEdit, services, categories]);

//   useEffect(() => {
//     fetchOffer();
//   }, [fetchOffer]);

//   /* ---------------- Reset ---------------- */
//   const resetForm = () => {
//     setBannerImageFile(null);
//     setExistingBannerUrl(null);
//     setExistingThumbnailUrl(null);
//     setOfferStartTime('');
//     setOfferEndTime('');
//     setGalleryFiles([]);
//     setExistingGalleryUrls([]);
//     setEligibilityCriteria('');
//     setHowToParticipate('');
//     setFaqList([{ question: '', answer: '' }]);
//     setTermsAndConditions('');
//     setSelectedModule('');
//     setSelectedCategory('');
//     setSelectedSubcategory('');
//     setSelectedService('');
//   };

//   /* ---------------- Handlers ---------------- */
//   const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setBannerImageFile(file);
//     if (file) setExistingBannerUrl(null);
//   };

//   const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setThumbnailImageFile(file);
//     if (file) setExistingThumbnailUrl(null);
//   };

//   const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     setGalleryFiles(files);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const startVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerStartTime.trim()));
//     const endVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerEndTime.trim()));

//     if (!startVal || !endVal) {
//       alert('Start and End times are required.');
//       setLoading(false);
//       return;
//     }

//     const fd = new FormData();
//     if (bannerImageFile) fd.append('bannerImage', bannerImageFile);
//     if (thumbnailImageFile) fd.append('thumbnailImage', thumbnailImageFile);

//     fd.append('offerStartTime', startVal);
//     fd.append('offerEndTime', endVal);
//     galleryFiles.forEach((f) => fd.append('galleryImages', f));
//     fd.append('eligibilityCriteria', eligibilityCriteria);
//     fd.append('howToParticipate', howToParticipate);
//     fd.append('faq', JSON.stringify(faqList));
//     fd.append('termsAndConditions', termsAndConditions);

//     // Required field in Offer model
//     if (selectedService) {
//       fd.append('service', selectedService);
//     } else {
//       alert('Please select a Service.');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (offerIdToEdit) {
//         await axios.put(`${API_BASE}/${offerIdToEdit}`, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         alert('Offer updated successfully!');
//       } else {
//         await axios.post(API_BASE, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         alert('Offer created successfully!');
//         resetForm();
//         document
//           .querySelectorAll<HTMLInputElement>('input[type="file"]')
//           .forEach((el) => (el.value = ''));
//       }
//     } catch (err: unknown) {
//       console.error('Offer submit error:', err);
//       let msg = 'Error saving offer.';
//       if (axios.isAxiosError(err)) {
//         msg = err.response?.data?.message || msg;
//       }
//       setError(msg);
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- Render ---------------- */
//   return (
//     <div>
//       <ComponentCard title={offerIdToEdit ? 'Edit Offer' : 'Add New Offer'}>
//         {loading && <p className="text-blue-500 text-sm mb-4">Loading...</p>}
//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//         <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">

          // {/* --- MODULE, CATEGORY, SUBCATEGORY, SERVICE --- */}
          // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          //   {/* Module */}
          //   <div>
          //     <Label>Select Module</Label>
          //     <div className="relative">
          //       <Select
          //         options={moduleOptions}
          //         value={selectedModule}
          //         placeholder="Select Module"
          //         onChange={(value: string) => {
          //           setSelectedModule(value);
          //           setSelectedCategory('');
          //           setSelectedSubcategory('');
          //           setSelectedService('');
          //         }}
          //         className="dark:bg-dark-900"
          //       />
          //       <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          //         <ChevronDownIcon />
          //       </span>
          //     </div>
          //   </div>

          //   {/* Category */}
          //   <div>
          //     <Label>Select Category</Label>
          //     <Select
          //       options={categoryOptions}
          //       value={selectedCategory}
          //       placeholder="Select Category"
          //       onChange={(value: string) => {
          //         setSelectedCategory(value);
          //         setSelectedSubcategory('');
          //         setSelectedService('');
          //       }}
          //     />
          //   </div>

          //   {/* Subcategory */}
          //   <div>
          //     <Label>Select Subcategory</Label>
          //     <Select
          //       options={subcategoryOptions}
          //       value={selectedSubcategory}
          //       placeholder="Select Subcategory"
          //       onChange={(value: string) => {
          //         setSelectedSubcategory(value);
          //         setSelectedService('');
          //       }}
          //     />
          //     {subcategoryOptions.length === 0 && (
          //       <p className="text-xs text-gray-400 mt-1">No subcategories available.</p>
          //     )}
          //   </div>


          //   {/* Service */}
          //   <div>
          //     <Label>Select Service</Label>
          //     <Select
          //       options={serviceOptions}
          //       value={selectedService}
          //       placeholder="Select Service"
          //       onChange={(value: string) => setSelectedService(value)}
          //     />
          //   </div>
          // </div>

          // {/* Banner + Dates */}
          // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          //   <div>
          //     <Label htmlFor="bannerImage">Banner Image</Label>
          //     <FileInput id="bannerImage" accept="image/*" onChange={handleBannerImageChange} />
          //     {bannerImageFile && (
          //       <p className="text-xs text-gray-500 mt-1">New: {bannerImageFile.name}</p>
          //     )}
          //     {existingBannerUrl && !bannerImageFile && (
          //       <p className="text-xs text-gray-500 mt-1">
          //         Current:&nbsp;
          //         <a
          //           href={existingBannerUrl}
          //           target="_blank"
          //           rel="noopener noreferrer"
          //           className="underline text-blue-600"
          //         >
          //           View Banner
          //         </a>
          //       </p>
          //     )}
          //   </div>

          //   <div>
          //     <Label htmlFor="thumbnailImage">Thumbnail Image</Label>
          //     <FileInput id="thumbnailImage" accept="image/*" onChange={handleThumbnailImageChange} />
          //     {thumbnailImageFile && (
          //       <p className="text-xs text-gray-500 mt-1">New: {thumbnailImageFile.name}</p>
          //     )}
          //     {existingThumbnailUrl && !thumbnailImageFile && (
          //       <p className="text-xs text-gray-500 mt-1">
          //         Current:&nbsp;
          //         <a
          //           href={existingThumbnailUrl}
          //           target="_blank"
          //           rel="noopener noreferrer"
          //           className="underline text-blue-600"
          //         >
          //           View Thumbnail
          //         </a>
          //       </p>
          //     )}
          //   </div>

          //   <div>
          //     <Label htmlFor="offerStart">Offer Start</Label>
          //     <Input
          //       id="offerStart"
          //       type="datetime-local"
          //       value={offerStartTime}
          //       onChange={(e) => setOfferStartTime(e.target.value)}
          //     />
          //   </div>

          //   <div>
          //     <Label htmlFor="offerEnd">Offer End</Label>
          //     <Input
          //       id="offerEnd"
          //       type="datetime-local"
          //       value={offerEndTime}
          //       onChange={(e) => setOfferEndTime(e.target.value)}
          //     />
          //   </div>
          // </div>

          // {/* Gallery */}
          // <div>
          //   <Label htmlFor="galleryImages">Gallery Images (multiple)</Label>
          //   <FileInput
          //     id="galleryImages"
          //     multiple
          //     accept="image/*"
          //     onChange={handleGalleryChange}
          //   />
          //   {galleryFiles.length > 0 && (
          //     <p className="text-xs text-gray-500 mt-1">
          //       Selected: {galleryFiles.map((f) => f.name).join(', ')}
          //     </p>
          //   )}
          //   {existingGalleryUrls.length > 0 && galleryFiles.length === 0 && (
          //     <div className="mt-2 space-y-1">
          //       <Label className="text-xs text-gray-600">Current Gallery:</Label>
          //       <ul className="text-xs space-y-1">
          //         {existingGalleryUrls.map((u, i) => (
          //           <li key={i}>
          //             <a
          //               href={u}
          //               target="_blank"
          //               rel="noopener noreferrer"
          //               className="underline text-blue-600"
          //             >
          //               Image {i + 1}
          //             </a>
          //           </li>
          //         ))}
          //       </ul>
          //     </div>
          //   )}
          // </div>

          // {/* Rich Text Sections */}
          // <div className="space-y-10">
          //   <div>
          //     <Label>Eligibility Criteria</Label>
          //     <ClientSideCustomEditor
          //       value={eligibilityCriteria}
          //       onChange={setEligibilityCriteria}
          //     />
          //   </div>

          //   <div>
          //     <Label>How to Participate</Label>
          //     <ClientSideCustomEditor
          //       value={howToParticipate}
          //       onChange={setHowToParticipate}
          //     />
          //   </div>

          //   {/* FAQ */}
          //   <div>
          //     <Label>Frequently Asked Questions</Label>
          //     {faqList.map((item, index) => (
          //       <div key={item._id || index} className="border rounded-md p-4 mb-4">
          //         <Input
          //           type="text"
          //           placeholder="Enter question"
          //           value={item.question}
          //           onChange={(e) => {
          //             // **FIXED:** Use the functional update form of `setFaqList`
          //             setFaqList(prevFaqList => {
          //               const newFaq = [...prevFaqList];
          //               newFaq[index].question = e.target.value;
          //               return newFaq;
          //             });
          //           }}
          //           className="mb-3"
          //         />
          //         <ClientSideCustomEditor
          //           value={item.answer}
          //           onChange={(value) => {
          //             // **FIXED:** Use the functional update form of `setFaqList`
          //             setFaqList(prevFaqList => {
          //               const newFaq = [...prevFaqList];
          //               newFaq[index].answer = value;
          //               return newFaq;
          //             });
          //           }}
          //         />
          //         {faqList.length > 1 && (
          //           <button
          //             type="button"
          //             className="mt-2 text-red-600 text-sm"
          //             onClick={() => {
          //               // **FIXED:** Use the functional update form of `setFaqList`
          //               setFaqList(prevFaqList => {
          //                 const newFaq = prevFaqList.filter((_, i) => i !== index);
          //                 return newFaq.length ? newFaq : [{ question: '', answer: '' }];
          //               });
          //             }}
          //           >
          //             Remove
          //           </button>
          //         )}
          //       </div>
          //     ))}
          //     <button
          //       type="button"
          //       className="text-blue-600 mt-2 text-sm"
          //       onClick={() => setFaqList([...faqList, { question: '', answer: '' }])}
          //     >
          //       + Add FAQ
          //     </button>
          //   </div>

          //   <div>
          //     <Label>Terms & Conditions</Label>
          //     <ClientSideCustomEditor
          //       value={termsAndConditions}
          //       onChange={setTermsAndConditions}
          //     />
          //   </div>
          // </div>

          // <div className="pt-6">
          //   <Button size="sm" variant="primary" type="submit" disabled={loading}>
          //     {offerIdToEdit ? 'Update Offer' : 'Add Offer'}
          //   </Button>
          // </div>
//         </form>
//       </ComponentCard>
//     </div>
//   );
// };

// export default AddOffer;
















// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import dynamic from 'next/dynamic';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import ComponentCard from '@/components/common/ComponentCard';
// import Select from '@/components/form/Select';
// import { ChevronDownIcon } from '@/icons';

// import { useModule } from '@/context/ModuleContext';
// import { useCategory } from '@/context/CategoryContext';
// import { useSubcategory } from '@/context/SubcategoryContext';
// import { useService } from '@/context/ServiceContext';

// const ClientSideCustomEditor = dynamic(
//   () => import('@/components/custom-editor/CustomEditor'),
//   { ssr: false, loading: () => <p>Loading rich text editor...</p> }
// );

// interface AddOfferProps {
//   offerIdToEdit?: string;
// }

// interface FAQItem {
//   question: string;
//   answer: string;
//   _id?: string;
// }

// interface OfferResponse {
//   _id: string;
//   bannerImage: string;
//   thumbnailImage: string;
//   offerStartTime: string;
//   offerEndTime: string;
//   galleryImages: string[];
//   eligibilityCriteria: string;
//   howToParticipate: string;
//   faq: string | FAQItem[];
//   termsAndConditions: string;
//   service?: string | { _id: string };
// }

// function toDatetimeLocalValue(dateStr?: string | null): string {
//   if (!dateStr) return '';
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return '';
//   const pad = (n: number) => String(n).padStart(2, '0');
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }

// function normalizeDateForSubmit(v: string): string {
//   if (!v) return '';
//   if (v.includes('T')) return v;
//   return `${v}T00:00`;
// }

// function tryFormatDMYtoISO(v: string): string {
//   const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
//   if (!m) return v;
//   const [, dd, mm, yyyy] = m;
//   return `${yyyy}-${mm}-${dd}T00:00`;
// }

// function parseFaq(raw: string | FAQItem[] | undefined | null): FAQItem[] {
//   if (!raw) return [];
//   if (Array.isArray(raw)) {
//     return raw
//       .map((r: FAQItem) => ({
//         question: r.question ?? '',
//         answer: r.answer ?? '',
//         _id: r._id,
//       }))
//       .filter((r) => r.question || r.answer);
//   }
//   if (typeof raw === 'string') {
//     try {
//       const parsed = JSON.parse(raw);
//       return parseFaq(parsed);
//     } catch {
//       return [{ question: raw, answer: raw }];
//     }
//   }
//   return [];
// }

// function extractId(v: unknown): string {
//   if (!v) return '';
//   if (typeof v === 'string') return v;
//   if (typeof v === 'object' && v !== null) {
//     // @ts-expect-error dynamic access
//     return v._id ?? v.id ?? '';
//   }
//   return '';
// }

// const AddOffer: React.FC<AddOfferProps> = ({ offerIdToEdit }) => {
//   const API_BASE = '/api/offer';

//   /* ---------------- Context Data ---------------- */
//   const { modules } = useModule();
//   const { categories } = useCategory();
//   const { subcategories } = useSubcategory();
//   const { services } = useService();

//   /* ---------------- Dropdown State ---------------- */
//   const [selectedModule, setSelectedModule] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedSubcategory, setSelectedSubcategory] = useState('');
//   const [selectedService, setSelectedService] = useState('');

//   /* ---------------- Offer Form State ---------------- */
//   const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
//   const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);

//   const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
//   const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

//   const [offerStartTime, setOfferStartTime] = useState('');
//   const [offerEndTime, setOfferEndTime] = useState('');

//   const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
//   const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

//   const [eligibilityCriteria, setEligibilityCriteria] = useState('');
//   const [howToParticipate, setHowToParticipate] = useState('');
//   const [faqList, setFaqList] = useState<FAQItem[]>([{ question: '', answer: '' }]);
//   const [termsAndConditions, setTermsAndConditions] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoaded, setIsLoaded] = useState(false); // ✅ only render form when ready

//   /* ---------------- Filtering Chains ---------------- */
//   const filteredCategories = categories.filter(
//     (cat) => extractId(cat.module) === selectedModule
//   );

//   const filteredSubcategories = subcategories.filter(
//     (sub) => extractId(sub.category) === selectedCategory
//   );

//   const filteredServices = services.filter((serv) => {
//     const servCatId = extractId(serv.category);
//     const servSubId = extractId(serv.subcategory);
//     if (!selectedCategory) return false;
//     if (selectedSubcategory) return servSubId === selectedSubcategory;
//     return servCatId === selectedCategory;
//   });

//   /* ---------------- Options ---------------- */
//   const moduleOptions = modules.map((mod) => ({
//     value: extractId(mod._id ?? mod),
//     label: mod.name,
//   }));

//   const categoryOptions = filteredCategories.map((cat) => ({
//     value: extractId(cat._id ?? cat),
//     label: cat.name,
//   }));

//   const subcategoryOptions = filteredSubcategories.map((sub) => ({
//     value: extractId(sub._id ?? sub),
//     label: sub.name,
//   }));

//   const serviceOptions = filteredServices.map((serv) => ({
//     value: extractId(serv._id ?? serv),
//     label: serv.serviceName ?? 'Unnamed Service',
//   }));

//   /* ---------------- Fetch Offer for Edit ---------------- */
//   const fetchOffer = useCallback(async () => {
//     if (!offerIdToEdit) {
//       resetForm();
//       setIsLoaded(true);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get<{ success: boolean; data: OfferResponse }>(
//         `${API_BASE}/${offerIdToEdit}`
//       );
//       const data = res.data.data;

//       setExistingBannerUrl(data.bannerImage || null);
//       setExistingThumbnailUrl(data.thumbnailImage || null);
//       setOfferStartTime(toDatetimeLocalValue(data.offerStartTime));
//       setOfferEndTime(toDatetimeLocalValue(data.offerEndTime));
//       setExistingGalleryUrls(data.galleryImages || []);
//       setEligibilityCriteria(data.eligibilityCriteria || '');
//       setHowToParticipate(data.howToParticipate || '');
//       setFaqList(parseFaq(data.faq));
//       setTermsAndConditions(data.termsAndConditions || '');

//       const servId = extractId(data.service);
//       if (servId) {
//         setSelectedService(servId);
//         const servDoc = services.find((s) => extractId(s._id) === servId);
//         if (servDoc) {
//           const catId = extractId(servDoc.category);
//           const subId = extractId(servDoc.subcategory);
//           setSelectedCategory(catId);
//           setSelectedSubcategory(subId);
//           const catDoc = categories.find((c) => extractId(c._id) === catId);
//           if (catDoc) setSelectedModule(extractId(catDoc.module));
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching offer:', err);
//       setError('Failed to fetch offer.');
//     } finally {
//       setLoading(false);
//       setIsLoaded(true); // ✅ render after data ready
//     }
//   }, [offerIdToEdit, services, categories]);

//   useEffect(() => {
//     fetchOffer();
//   }, [fetchOffer]);

//   /* ---------------- Reset ---------------- */
//   const resetForm = () => {
//     setBannerImageFile(null);
//     setExistingBannerUrl(null);
//     setThumbnailImageFile(null);
//     setExistingThumbnailUrl(null);
//     setOfferStartTime('');
//     setOfferEndTime('');
//     setGalleryFiles([]);
//     setExistingGalleryUrls([]);
//     setEligibilityCriteria('');
//     setHowToParticipate('');
//     setFaqList([{ question: '', answer: '' }]);
//     setTermsAndConditions('');
//     setSelectedModule('');
//     setSelectedCategory('');
//     setSelectedSubcategory('');
//     setSelectedService('');
//   };

//   /* ---------------- Handlers ---------------- */
//   const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setBannerImageFile(file);
//     if (file) setExistingBannerUrl(null);
//   };

//   const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setThumbnailImageFile(file);
//     if (file) setExistingThumbnailUrl(null);
//   };

//   const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     setGalleryFiles(files);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const startVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerStartTime.trim()));
//     const endVal = tryFormatDMYtoISO(normalizeDateForSubmit(offerEndTime.trim()));

//     if (!startVal || !endVal) {
//       alert('Start and End times are required.');
//       setLoading(false);
//       return;
//     }

//     const fd = new FormData();
//     if (bannerImageFile) fd.append('bannerImage', bannerImageFile);
//     if (thumbnailImageFile) fd.append('thumbnailImage', thumbnailImageFile);
//     fd.append('offerStartTime', startVal);
//     fd.append('offerEndTime', endVal);
//     galleryFiles.forEach((f) => fd.append('galleryImages', f));
//     fd.append('eligibilityCriteria', eligibilityCriteria);
//     fd.append('howToParticipate', howToParticipate);
//     fd.append('faq', JSON.stringify(faqList));
//     fd.append('termsAndConditions', termsAndConditions);

//     if (selectedService) fd.append('service', selectedService);
//     else {
//       alert('Please select a Service.');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (offerIdToEdit) {
//         await axios.put(`${API_BASE}/${offerIdToEdit}`, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         alert('Offer updated successfully!');
//       } else {
//         await axios.post(API_BASE, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         alert('Offer created successfully!');
//         resetForm();
//         document
//           .querySelectorAll<HTMLInputElement>('input[type="file"]')
//           .forEach((el) => (el.value = ''));
//       }
//     } catch (err) {
//       console.error('Offer submit error:', err);
//       let msg = 'Error saving offer.';
//       if (axios.isAxiosError(err)) msg = err.response?.data?.message || msg;
//       setError(msg);
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isLoaded) return <p className="text-blue-500">Loading offer data...</p>;

//   return (
//     <div>
//       <ComponentCard title={offerIdToEdit ? 'Edit Offer' : 'Add New Offer'}>
//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//         <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
//           {/* DROPDOWNS, IMAGES, DATES, GALLERY, EDITORS same as original but lazy-loaded */}
//           {/* ... keep your existing JSX for form fields ... */}
//                     {/* --- MODULE, CATEGORY, SUBCATEGORY, SERVICE --- */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Module */}
//             <div>
//               <Label>Select Module</Label>
//               <div className="relative">
//                 <Select
//                   options={moduleOptions}
//                   value={selectedModule}
//                   placeholder="Select Module"
//                   onChange={(value: string) => {
//                     setSelectedModule(value);
//                     setSelectedCategory('');
//                     setSelectedSubcategory('');
//                     setSelectedService('');
//                   }}
//                   className="dark:bg-dark-900"
//                 />
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
//                   <ChevronDownIcon />
//                 </span>
//               </div>
//             </div>

//             {/* Category */}
//             <div>
//               <Label>Select Category</Label>
//               <Select
//                 options={categoryOptions}
//                 value={selectedCategory}
//                 placeholder="Select Category"
//                 onChange={(value: string) => {
//                   setSelectedCategory(value);
//                   setSelectedSubcategory('');
//                   setSelectedService('');
//                 }}
//               />
//             </div>

//             {/* Subcategory */}
//             <div>
//               <Label>Select Subcategory</Label>
//               <Select
//                 options={subcategoryOptions}
//                 value={selectedSubcategory}
//                 placeholder="Select Subcategory"
//                 onChange={(value: string) => {
//                   setSelectedSubcategory(value);
//                   setSelectedService('');
//                 }}
//               />
//               {subcategoryOptions.length === 0 && (
//                 <p className="text-xs text-gray-400 mt-1">No subcategories available.</p>
//               )}
//             </div>


//             {/* Service */}
//             <div>
//               <Label>Select Service</Label>
//               <Select
//                 options={serviceOptions}
//                 value={selectedService}
//                 placeholder="Select Service"
//                 onChange={(value: string) => setSelectedService(value)}
//               />
//             </div>
//           </div>

//           {/* Banner + Dates */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div>
//               <Label htmlFor="bannerImage">Banner Image</Label>
//               <FileInput id="bannerImage" accept="image/*" onChange={handleBannerImageChange} />
//               {bannerImageFile && (
//                 <p className="text-xs text-gray-500 mt-1">New: {bannerImageFile.name}</p>
//               )}
//               {existingBannerUrl && !bannerImageFile && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Current:&nbsp;
//                   <a
//                     href={existingBannerUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600"
//                   >
//                     View Banner
//                   </a>
//                 </p>
//               )}
//             </div>

//             <div>
//               <Label htmlFor="thumbnailImage">Thumbnail Image</Label>
//               <FileInput id="thumbnailImage" accept="image/*" onChange={handleThumbnailImageChange} />
//               {thumbnailImageFile && (
//                 <p className="text-xs text-gray-500 mt-1">New: {thumbnailImageFile.name}</p>
//               )}
//               {existingThumbnailUrl && !thumbnailImageFile && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Current:&nbsp;
//                   <a
//                     href={existingThumbnailUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600"
//                   >
//                     View Thumbnail
//                   </a>
//                 </p>
//               )}
//             </div>

//             <div>
//               <Label htmlFor="offerStart">Offer Start</Label>
//               <Input
//                 id="offerStart"
//                 type="datetime-local"
//                 value={offerStartTime}
//                 onChange={(e) => setOfferStartTime(e.target.value)}
//               />
//             </div>

//             <div>
//               <Label htmlFor="offerEnd">Offer End</Label>
//               <Input
//                 id="offerEnd"
//                 type="datetime-local"
//                 value={offerEndTime}
//                 onChange={(e) => setOfferEndTime(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Gallery */}
//           <div>
//             <Label htmlFor="galleryImages">Gallery Images (multiple)</Label>
//             <FileInput
//               id="galleryImages"
//               multiple
//               accept="image/*"
//               onChange={handleGalleryChange}
//             />
//             {galleryFiles.length > 0 && (
//               <p className="text-xs text-gray-500 mt-1">
//                 Selected: {galleryFiles.map((f) => f.name).join(', ')}
//               </p>
//             )}
//             {existingGalleryUrls.length > 0 && galleryFiles.length === 0 && (
//               <div className="mt-2 space-y-1">
//                 <Label className="text-xs text-gray-600">Current Gallery:</Label>
//                 <ul className="text-xs space-y-1">
//                   {existingGalleryUrls.map((u, i) => (
//                     <li key={i}>
//                       <a
//                         href={u}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="underline text-blue-600"
//                       >
//                         Image {i + 1}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Rich Text Sections */}
//           <div className="space-y-10">
//             <div>
//               <Label>Eligibility Criteria</Label>
//               <ClientSideCustomEditor
//                 value={eligibilityCriteria}
//                 onChange={setEligibilityCriteria}
//               />
//             </div>

//             <div>
//               <Label>How to Participate</Label>
//               <ClientSideCustomEditor
//                 value={howToParticipate}
//                 onChange={setHowToParticipate}
//               />
//             </div>

//             {/* FAQ */}
//             <div>
//               <Label>Frequently Asked Questions</Label>
//               {faqList.map((item, index) => (
//                 <div key={item._id || index} className="border rounded-md p-4 mb-4">
//                   <Input
//                     type="text"
//                     placeholder="Enter question"
//                     value={item.question}
//                     onChange={(e) => {
//                       // **FIXED:** Use the functional update form of `setFaqList`
//                       setFaqList(prevFaqList => {
//                         const newFaq = [...prevFaqList];
//                         newFaq[index].question = e.target.value;
//                         return newFaq;
//                       });
//                     }}
//                     className="mb-3"
//                   />
//                   <ClientSideCustomEditor
//                     value={item.answer}
//                     onChange={(value) => {
//                       // **FIXED:** Use the functional update form of `setFaqList`
//                       setFaqList(prevFaqList => {
//                         const newFaq = [...prevFaqList];
//                         newFaq[index].answer = value;
//                         return newFaq;
//                       });
//                     }}
//                   />
//                   {faqList.length > 1 && (
//                     <button
//                       type="button"
//                       className="mt-2 text-red-600 text-sm"
//                       onClick={() => {
//                         // **FIXED:** Use the functional update form of `setFaqList`
//                         setFaqList(prevFaqList => {
//                           const newFaq = prevFaqList.filter((_, i) => i !== index);
//                           return newFaq.length ? newFaq : [{ question: '', answer: '' }];
//                         });
//                       }}
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="text-blue-600 mt-2 text-sm"
//                 onClick={() => setFaqList([...faqList, { question: '', answer: '' }])}
//               >
//                 + Add FAQ
//               </button>
//             </div>

//             <div>
//               <Label>Terms & Conditions</Label>
//               <ClientSideCustomEditor
//                 value={termsAndConditions}
//                 onChange={setTermsAndConditions}
//               />
//             </div>
//           </div>

//           <div className="pt-6">
//             <Button size="sm" variant="primary" type="submit" disabled={loading}>
//               {offerIdToEdit ? 'Update Offer' : 'Add Offer'}
//             </Button>
//           </div>
//         </form>
//       </ComponentCard>
//     </div>
//   );
// };

// export default AddOffer;










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

  const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

  const [offerStartTime, setOfferStartTime] = useState('');
  const [offerEndTime, setOfferEndTime] = useState('');

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

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

  /* ---------------- Fetch Offer for Edit ---------------- */
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
      if (servId) {
        setSelectedService(servId);
        const servDoc = services.find((s) => extractId(s._id) === servId);
        if (servDoc) {
          const catId = extractId(servDoc.category);
          const subId = extractId(servDoc.subcategory);
          setSelectedCategory(catId);
          setSelectedSubcategory(subId);
          const catDoc = categories.find((c) => extractId(c._id) === catId);
          if (catDoc) setSelectedModule(extractId(catDoc.module));
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

  /* ---------------- Reset ---------------- */
  const resetForm = () => {
    setBannerImageFile(null);
    setExistingBannerUrl(null);
    setThumbnailImageFile(null);
    setExistingThumbnailUrl(null);
    setOfferStartTime('');
    setOfferEndTime('');
    setGalleryFiles([]);
    setExistingGalleryUrls([]);
    setEligibilityCriteria('');
    setHowToParticipate('');
    setFaqList([{ question: '', answer: '' }]);
    setTermsAndConditions('');
    setSelectedModule('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedService('');
  };

  /* ---------------- Handlers ---------------- */
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBannerImageFile(file);
    if (file) setExistingBannerUrl(null);
  };

  const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailImageFile(file);
    if (file) setExistingThumbnailUrl(null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      if (axios.isAxiosError(err)) msg = err.response?.data?.message || msg;
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
          {/* DROPDOWNS, IMAGES, DATES, GALLERY, EDITORS same as original but lazy-loaded */}
          {/* ... keep your existing JSX for form fields ... */}
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
              <FileInput id="bannerImage" accept="image/*" onChange={handleBannerImageChange} />
              {bannerImageFile && (
                <p className="text-xs text-gray-500 mt-1">New: {bannerImageFile.name}</p>
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
            </div>

            <div>
              <Label htmlFor="thumbnailImage">Thumbnail Image</Label>
              <FileInput id="thumbnailImage" accept="image/*" onChange={handleThumbnailImageChange} />
              {thumbnailImageFile && (
                <p className="text-xs text-gray-500 mt-1">New: {thumbnailImageFile.name}</p>
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
            {galleryFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {galleryFiles.map((f) => f.name).join(', ')}
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
            <Button size="sm" variant="primary" type="submit" disabled={loading}>
              {offerIdToEdit ? 'Update Offer' : 'Add Offer'}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddOffer;