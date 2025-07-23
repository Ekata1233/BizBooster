// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import dynamic from 'next/dynamic';
// import FileInput from '@/components/form/input/FileInput';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import ComponentCard from '@/components/common/ComponentCard';


// const ClientSideCustomEditor = dynamic(
//     () => import('@/components/custom-editor/CustomEditor'),
//     {
//         ssr: false,
//         loading: () => <p>Loading rich text editor...</p>,
//     }
// );

// interface AddOfferProps {
//     offerIdToEdit?: string;
// }


// interface OfferResponse {
//     _id: string;
//     bannerImage: string;
//     offerStartTime: string; // ISO string from backend
//     offerEndTime: string;
//     galleryImages: string[];
//     eligibilityCriteria: string;
//     howToParticipate: string;
//     faq: string;
//     termsAndConditions: string;
// }

// interface FAQItem {
//     question: string;
//     answer: string;
// }

// function toDatetimeLocalValue(dateStr?: string | null): string {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return '';
//     // Format YYYY-MM-DDTHH:MM (drop seconds)
//     const pad = (n: number) => String(n).padStart(2, '0');
//     const yyyy = d.getFullYear();
//     const mm = pad(d.getMonth() + 1);
//     const dd = pad(d.getDate());
//     const HH = pad(d.getHours());
//     const MM = pad(d.getMinutes());
//     return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
// }



// function normalizeDateForSubmit(v: string): string {
//     if (!v) return '';
//     // If already has 'T' assume complete
//     if (v.includes('T')) return v;
//     return `${v}T00:00`;
// }


// function tryFormatDMYtoISO(v: string): string {
//     const dmy = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
//     if (!dmy) return v;
//     const [, dd, mm, yyyy] = dmy;
//     return `${yyyy}-${mm}-${dd}T00:00`;
// }

// const AddOffer: React.FC<AddOfferProps> = ({ offerIdToEdit }) => {
//     const API_BASE = '/api/offer';

//     // Basic fields
//     const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
//     const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);

//     const [offerStartTime, setOfferStartTime] = useState<string>(''); // datetime-local value
//     const [offerEndTime, setOfferEndTime] = useState<string>('');

//     const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
//     const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

//     // Rich text HTML
//     const [eligibilityCriteria, setEligibilityCriteria] = useState<string>('');
//     const [howToParticipate, setHowToParticipate] = useState<string>('');

//     const [faqList, setFaqList] = useState<FAQItem[]>([{ question: '', answer: '' }]);

//     const [termsAndConditions, setTermsAndConditions] = useState<string>('');

//     // UI state
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // ----------------------------------------------------------
//     // Fetch existing offer (edit mode)
//     // ----------------------------------------------------------
//     const fetchOffer = useCallback(async () => {
//         if (!offerIdToEdit) {
//             // Reset form when switching from edit -> add mode
//             resetForm();
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         try {
//             const res = await axios.get<{
//                 success: boolean;
//                 data: OfferResponse;
//             }>(`${API_BASE}/${offerIdToEdit}`);

//             const data = res.data.data;
//             setExistingBannerUrl(data.bannerImage || null);
//             setOfferStartTime(toDatetimeLocalValue(data.offerStartTime));
//             setOfferEndTime(toDatetimeLocalValue(data.offerEndTime));
//             setExistingGalleryUrls(data.galleryImages || []);
//             setEligibilityCriteria(data.eligibilityCriteria || '');
//             setHowToParticipate(data.howToParticipate || '');
//             setFaqList(Array.isArray(data.faq) ? data.faq : [{ question: '', answer: '' }]);

//             setTermsAndConditions(data.termsAndConditions || '');
//         } catch (err: unknown) {
//             console.error('Error fetching offer:', err);
//             if (axios.isAxiosError(err)) {
//                 setError(err.response?.data?.message || 'Failed to fetch offer.');
//             } else {
//                 setError('An unexpected error occurred.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [offerIdToEdit]);

//     useEffect(() => {
//         fetchOffer();
//     }, [fetchOffer]);

//     const resetForm = () => {
//         setBannerImageFile(null);
//         setExistingBannerUrl(null);
//         setOfferStartTime('');
//         setOfferEndTime('');
//         setGalleryFiles([]);
//         setExistingGalleryUrls([]);
//         setEligibilityCriteria('');
//         setHowToParticipate('');
//         setFaqList([{ question: '', answer: '' }]);
//         setTermsAndConditions('');
//     };

//     const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0] || null;
//         setBannerImageFile(file);
//         if (file) setExistingBannerUrl(null); // hide existing preview when replacing
//     };

//     const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(e.target.files || []);
//         setGalleryFiles(files);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);

//         // Validate dates
//         let startVal = offerStartTime.trim();
//         let endVal = offerEndTime.trim();
//         startVal = tryFormatDMYtoISO(normalizeDateForSubmit(startVal));
//         endVal = tryFormatDMYtoISO(normalizeDateForSubmit(endVal));

//         if (!startVal || !endVal) {
//             alert('Start and End times are required.');
//             setLoading(false);
//             return;
//         }

//         const fd = new FormData();
//         // Banner
//         if (bannerImageFile) {
//             fd.append('bannerImage', bannerImageFile);
//         }
//         // Dates
//         fd.append('offerStartTime', startVal);
//         fd.append('offerEndTime', endVal);

//         // Gallery images
//         galleryFiles.forEach((f) => fd.append('galleryImages', f));

//         // Rich text sections
//         fd.append('eligibilityCriteria', eligibilityCriteria);
//         fd.append('howToParticipate', howToParticipate);
//        fd.append('faq', JSON.stringify(faqList));

//         fd.append('termsAndConditions', termsAndConditions);

//         try {
//             if (offerIdToEdit) {
//                 await axios.put(`/api/offer/${offerIdToEdit}`, fd, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 alert('Offer updated successfully!');
//             } else {
//                 await axios.post(API_BASE, fd, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 alert('Offer created successfully!');
//                 resetForm();
//                 // Clear file inputs manually
//                 document.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((el) => {
//                     el.value = '';
//                 });
//             }
//         } catch (err: unknown) {
//             console.error('Offer submit error:', err);
//             let msg = 'Error saving offer.';
//             if (axios.isAxiosError(err)) {
//                 const data = err.response?.data as { message?: string };
//                 if (data?.message) msg = data.message;
//             }
//             setError(msg);
//             alert(msg);
//         } finally {
//             setLoading(false);
//         }
//     };

  
//     return (
//         <div>
//             <ComponentCard title={offerIdToEdit ? 'Edit Offer' : 'Add New Offer'}>
//                 {loading && <p className="text-blue-500 text-sm mb-4">Loading...</p>}
//                 {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//                 <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
//                     {/* Banner + Dates */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {/* Banner Image */}
//                         <div>
//                             <Label htmlFor="bannerImage">Banner Image</Label>
//                             <FileInput
//                                 id="bannerImage"
//                                 accept="image/*"
//                                 onChange={handleBannerImageChange}
//                             />
//                             {bannerImageFile && (
//                                 <p className="text-xs text-gray-500 mt-1">New: {bannerImageFile.name}</p>
//                             )}
//                             {existingBannerUrl && !bannerImageFile && (
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Current:{" "}
//                                     <a
//                                         href={existingBannerUrl}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="underline text-blue-600"
//                                     >
//                                         View Banner
//                                     </a>
//                                 </p>
//                             )}
//                         </div>

//                         {/* Offer Start */}
//                         <div>
//                             <Label htmlFor="offerStart">Offer Start</Label>
//                             <Input
//                                 id="offerStart"
//                                 type="datetime-local"
//                                 value={offerStartTime}
//                                 onChange={(e) => setOfferStartTime(e.target.value)}
//                             />
//                         </div>

//                         {/* Offer End */}
//                         <div>
//                             <Label htmlFor="offerEnd">Offer End</Label>
//                             <Input
//                                 id="offerEnd"
//                                 type="datetime-local"
//                                 value={offerEndTime}
//                                 onChange={(e) => setOfferEndTime(e.target.value)}
//                             />
//                         </div>
//                     </div>

//                     {/* Gallery Images */}
//                     <div>
//                         <Label htmlFor="galleryImages">Gallery Images (you can select multiple)</Label>
//                         <FileInput
//                             id="galleryImages"
//                             multiple
//                             accept="image/*"
//                             onChange={handleGalleryChange}
//                         />
//                         {galleryFiles.length > 0 && (
//                             <p className="text-xs text-gray-500 mt-1">
//                                 Selected: {galleryFiles.map((f) => f.name).join(', ')}
//                             </p>
//                         )}
//                         {existingGalleryUrls.length > 0 && galleryFiles.length === 0 && (
//                             <div className="mt-2 space-y-1">
//                                 <Label className="text-xs text-gray-600">Current Gallery:</Label>
//                                 <ul className="text-xs space-y-1">
//                                     {existingGalleryUrls.map((u, i) => (
//                                         <li key={i}>
//                                             <a
//                                                 href={u}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="underline text-blue-600"
//                                             >
//                                                 Image {i + 1}
//                                             </a>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         )}
//                     </div>

//                     {/* Rich Text Sections */}
//                     <div className="space-y-10">
//                         <div>
//                             <Label>Eligibility Criteria</Label>
//                             <ClientSideCustomEditor
//                                 value={eligibilityCriteria}
//                                 onChange={setEligibilityCriteria}
//                             />
//                         </div>

//                         <div>
//                             <Label>How to Participate</Label>
//                             <ClientSideCustomEditor
//                                 value={howToParticipate}
//                                 onChange={setHowToParticipate}
//                             />
//                         </div>

//                         <div>
//                             <Label>Frequently Asked Questions</Label>
//                             {faqList.map((item, index) => (
//                                 <div key={index} className="border rounded-md p-4 mb-4">
//                                     <Input
//                                         type="text"
//                                         placeholder="Enter question"
//                                         value={item.question}
//                                         onChange={(e) => {
//                                             const newFaq = [...faqList];
//                                             newFaq[index].question = e.target.value;
//                                             setFaqList(newFaq);
//                                         }}
//                                         className="mb-3"
//                                     />
//                                     <ClientSideCustomEditor
//                                         value={item.answer}
//                                         onChange={(value) => {
//                                             const newFaq = [...faqList];
//                                             newFaq[index].answer = value;
//                                             setFaqList(newFaq);
//                                         }}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="mt-2 text-red-600"
//                                         onClick={() => {
//                                             const newFaq = faqList.filter((_, i) => i !== index);
//                                             setFaqList(newFaq);
//                                         }}
//                                     >
//                                         Remove
//                                     </button>
//                                 </div>
//                             ))}

//                             <button
//                                 type="button"
//                                 className="text-blue-600 mt-2"
//                                 onClick={() => setFaqList([...faqList, { question: '', answer: '' }])}
//                             >
//                                 + Add FAQ
//                             </button>
//                         </div>


//                         <div>
//                             <Label>Terms & Conditions</Label>
//                             <ClientSideCustomEditor
//                                 value={termsAndConditions}
//                                 onChange={setTermsAndConditions}
//                             />
//                         </div>
//                     </div>

//                     <div className="pt-6">
//                         <Button size="sm" variant="primary" type="submit" disabled={loading}>
//                             {offerIdToEdit ? 'Update Offer' : 'Add Offer'}
//                         </Button>
//                     </div>
//                 </form>
//             </ComponentCard>
//         </div>
//     );
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

const ClientSideCustomEditor = dynamic(
  () => import('@/components/custom-editor/CustomEditor'),
  {
    ssr: false,
    loading: () => <p>Loading rich text editor...</p>,
  }
);

interface AddOfferProps {
  offerIdToEdit?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  // (optional) keep any backend id if you later want to update individual FAQ entries
  _id?: string;
}

interface OfferResponse {
  _id: string;
  bannerImage: string;
  offerStartTime: string;
  offerEndTime: string;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: string | FAQItem[];     // ✅ allow both
  termsAndConditions: string;
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

// ---- FAQ Parsing / Normalization ----
function parseFaq(raw: string | FAQItem[] | undefined | null): FAQItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // Ensure each item has question/answer strings
    return raw
      .map((r: FAQItem) => ({
        question: r.question ?? '',
        answer: r.answer ?? '',
        _id: r._id,
      }))
      .filter((r) => r.question || r.answer);
  }
  if (typeof raw === 'string') {
    // Try JSON parse first
    try {
      const parsed = JSON.parse(raw);
      return parseFaq(parsed);
    } catch {
      // If it's not JSON, treat as a single FAQ answer blob
      return [
        {
          question: 'FAQ',
          answer: raw,
        },
      ];
    }
  }
  return [];
}

const AddOffer: React.FC<AddOfferProps> = ({ offerIdToEdit }) => {
  const API_BASE = '/api/offer';

  // Basic fields
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);

  const [offerStartTime, setOfferStartTime] = useState<string>('');
  const [offerEndTime, setOfferEndTime] = useState<string>('');

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

  // Rich text
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string>('');
  const [howToParticipate, setHowToParticipate] = useState<string>('');
  const [faqList, setFaqList] = useState<FAQItem[]>([{ question: '', answer: '' }]);
  const [termsAndConditions, setTermsAndConditions] = useState<string>('');

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBannerImageFile(null);
    setExistingBannerUrl(null);
    setOfferStartTime('');
    setOfferEndTime('');
    setGalleryFiles([]);
    setExistingGalleryUrls([]);
    setEligibilityCriteria('');
    setHowToParticipate('');
    setFaqList([{ question: '', answer: '' }]);
    setTermsAndConditions('');
  };

  const fetchOffer = useCallback(async () => {
    if (!offerIdToEdit) {
      resetForm();
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
      setOfferStartTime(toDatetimeLocalValue(data.offerStartTime));
      setOfferEndTime(toDatetimeLocalValue(data.offerEndTime));
      setExistingGalleryUrls(data.galleryImages || []);
      setEligibilityCriteria(data.eligibilityCriteria || '');
      setHowToParticipate(data.howToParticipate || '');

      const parsedFaq = parseFaq(data.faq);
      setFaqList(parsedFaq.length ? parsedFaq : [{ question: '', answer: '' }]);

      setTermsAndConditions(data.termsAndConditions || '');
    } catch (err: unknown) {
      console.error('Error fetching offer:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch offer.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [offerIdToEdit]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBannerImageFile(file);
    if (file) setExistingBannerUrl(null);
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
    fd.append('offerStartTime', startVal);
    fd.append('offerEndTime', endVal);
    galleryFiles.forEach((f) => fd.append('galleryImages', f));
    fd.append('eligibilityCriteria', eligibilityCriteria);
    fd.append('howToParticipate', howToParticipate);
    fd.append('faq', JSON.stringify(faqList)); // always send array
    fd.append('termsAndConditions', termsAndConditions);

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
    } catch (err: unknown) {
      console.error('Offer submit error:', err);
      let msg = 'Error saving offer.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ComponentCard title={offerIdToEdit ? 'Edit Offer' : 'Add New Offer'}>
        {loading && <p className="text-blue-500 text-sm mb-4">Loading...</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
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
                    Current:{' '}
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
            <Label htmlFor="galleryImages">Gallery Images (you can select multiple)</Label>
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

          {/* Rich Text Areas */}
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

            {/* FAQ List */}
            <div>
              <Label>Frequently Asked Questions</Label>
              {faqList.map((item, index) => (
                <div key={index} className="border rounded-md p-4 mb-4">
                  <Input
                    type="text"
                    placeholder="Enter question"
                    value={item.question}
                    onChange={(e) => {
                      const newFaq = [...faqList];
                      newFaq[index].question = e.target.value;
                      setFaqList(newFaq);
                    }}
                    className="mb-3"
                  />
                  <ClientSideCustomEditor
                    value={item.answer}
                    onChange={(value) => {
                      const newFaq = [...faqList];
                      newFaq[index].answer = value;
                      setFaqList(newFaq);
                    }}
                  />
                  {faqList.length > 1 && (
                    <button
                      type="button"
                      className="mt-2 text-red-600 text-sm"
                      onClick={() => {
                        const newFaq = faqList.filter((_, i) => i !== index);
                        setFaqList(newFaq.length ? newFaq : [{ question: '', answer: '' }]);
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
