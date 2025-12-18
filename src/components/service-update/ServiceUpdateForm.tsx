'use client';

import React, { useEffect, useState } from 'react';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput';
import { TrashBinIcon } from '../../icons';
import Image from 'next/image';
import dynamic from 'next/dynamic';

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
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
}
// ---------------- COMPONENT ----------------
const ServiceUpdateFrom: React.FC<ServiceUpdateFromProps> = ({ data, setData }) => {

  // console.log("service details form  : ", data)

  // ---------- BASIC STATES ----------
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

  useEffect(() => {
  if (!data?.serviceDetails) return;

  const sd = data.serviceDetails;

  // Editors (HTML string inside array)
  setBenefits(sd.benefits?.length ? sd.benefits : ['']);
  setAboutUs(sd.aboutUs?.length ? sd.aboutUs : ['']);
  setTerms(sd.termsAndConditions?.length ? sd.termsAndConditions : ['']);
  setDocument(sd.document?.length ? sd.document : ['']);

  // Simple arrays
  setHighlightImages(sd.highlight || []);
  setExtraImages(sd.extraImages || []);
  setExtraSections(sd.extraSections || []);

  // Object arrays
  setWhyChooseUs(sd.whyChooseUs || []);
  setHowItWorks(sd.howItWorks || []);
  setAssuredByFetchTrue(sd.assuredByFetchTrue || []);
  setWeRequired(sd.weRequired || []);
  setWeDeliver(sd.weDeliver || []);
  setPackages(sd.packages || []);
  setMoreInfo(sd.moreInfo || []);
  setFaqs(sd.faq || []);
  setConnectWith(sd.connectWith || []);
  setTimeRequired(sd.timeRequired || []);
setExtraImages(
    Array.isArray(sd.extraImages) && sd.extraImages.length
      ? sd.extraImages.map((img: string) => ({ icon: img }))
      : [{ icon: '' }]
  );
   setExtraSections(
    Array.isArray(sd.extraSections) && sd.extraSections.length
      ? sd.extraSections
      : []
  );

  // Auto open extra sections UI if data exists
  setShowExtraSections(!!sd.extraSections?.length);

}, [data]);


  useEffect(() => setEditorReady(true), []);

    // const benefitsValue = data?.serviceDetails?.benefits?.[0] || "";
    // const aboutUsValue = data?.serviceDetails?.aboutUs?.[0] || "";
    // const termsAndConditionValue = data?.serviceDetails?.termsAndConditions?.[0] || "";
    // const documentValue = data?.serviceDetails?.document?.[0] || "";

    const benefitsValue = benefits[0] || "";
const aboutUsValue = aboutUs[0] || "";
const termsAndConditionValue = terms[0] || "";
const documentValue = document[0] || "";

    

  // ---------------- HELPERS ----------------
  const handleEditorChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => setter([value]);

  function renderArrayField<T>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    renderItem: (item: T, idx: number, update: (v: T) => void) => React.ReactNode,
    defaultItem: T
  ) {
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="border p-3 rounded relative">
            {renderItem(item, idx, updated =>
              setItems(prev => prev.map((v, i) => (i === idx ? updated : v)))
            )}

            {items.length > 1 && (
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500"
                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => setItems(prev => [...prev, defaultItem])}
        >
          + Add More
        </button>
      </div>
    );
  }

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-center"> Service Details</h4>

      {/* Benefits */}
      <div>
        <Label>Benefits</Label>
        {editorReady && (
          <ClientSideCustomEditor
           value={benefitsValue} // ✅ STRING
          onChange={(value: string) =>
            setData((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                benefits: [value], // ✅ ARRAY
              },
            }))
          }
          />
        )}
      </div>

      {/* About Us */}
      <div>
        <Label>About Us</Label>
        {editorReady && (
          <ClientSideCustomEditor
             value={aboutUsValue} // ✅ STRING
          onChange={(value: string) =>
            setData((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                aboutUs: [value], // ✅ ARRAY
              },
            }))
          }
          />
        )}
      </div>

      {/* Highlight Images */}
      <div>
        <Label>Highlight Images</Label>
        <FileInput
          multiple
          onChange={e => {
            if (e.target.files) {
              const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
              setHighlightImages(prev => [...prev, ...urls]);
            }
          }}
        />
        <div className="flex gap-3 mt-2">
          {highlightImages.map((src, idx) => (
            <div key={idx} className="w-24 h-24 relative">
              <Image src={src} alt="highlight" fill className="rounded object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div>
        <Label>Why Choose Us</Label>
        {renderArrayField(
          whyChooseUs,
          setWhyChooseUs,
          (item, _, update) => (
            <>
              <Input value={item.title} placeholder="Title" onChange={e => update({ ...item, title: e.target.value })} />
              <Input value={item.description} placeholder="Description" onChange={e => update({ ...item, description: e.target.value })} />
            </>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>

      {/* How It Works */}
      <div>
        <Label>How It Works</Label>
        {renderArrayField(
          howItWorks,
          setHowItWorks,
          (item, _, update) => (
            <>
              <Input value={item.title} placeholder="Title" onChange={e => update({ ...item, title: e.target.value })} />
              <Input value={item.description} placeholder="Description" onChange={e => update({ ...item, description: e.target.value })} />
            </>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>

      {/* Assured By */}
      <div>
        <Label>Assured By FetchTrue</Label>
        {renderArrayField(
          assuredByFetchTrue,
          setAssuredByFetchTrue,
          (item, _, update) => (
            <>
              <Input value={item.title} placeholder="Title" onChange={e => update({ ...item, title: e.target.value })} />
              <Input value={item.description} placeholder="Description" onChange={e => update({ ...item, description: e.target.value })} />
            </>
          ),
          { title: '', description: '', icon: '' }
        )}
      </div>


      <div>
  <Label>We Required</Label>
  {renderArrayField(
    weRequired,
    setWeRequired,
    (item, _, update) => (
      <>
        <Input
          value={item.title}
          placeholder="Title"
          onChange={e => update({ ...item, title: e.target.value })}
        />
        <Input
          value={item.description}
          placeholder="Description"
          onChange={e => update({ ...item, description: e.target.value })}
        />
      </>
    ),
    { title: '', description: '' }
  )}
</div>


<div>
  <Label>We Deliver</Label>
  {renderArrayField(
    weDeliver,
    setWeDeliver,
    (item, _, update) => (
      <>
        <Input
          value={item.title}
          placeholder="Title"
          onChange={e => update({ ...item, title: e.target.value })}
        />
        <Input
          value={item.description}
          placeholder="Description"
          onChange={e => update({ ...item, description: e.target.value })}
        />
      </>
    ),
    { title: '', description: '' }
  )}
</div>

<div>
  <Label>
    Packages <span className="text-red-500 text-sm">(All Services)</span>
  </Label>

  {renderArrayField(
    packages,
    setPackages,
    (pkg, _, updatePkg) => (
      <div className="space-y-3">
        <Input
          value={pkg.name}
          placeholder="Package Name"
          onChange={e => updatePkg({ ...pkg, name: e.target.value })}
        />

        <Input
          type="number"
          value={pkg.price ?? ''}
          placeholder="Price"
          onChange={e => {
            const price = e.target.value ? Number(e.target.value) : null;
            const discount = pkg.discount ?? 0;
            const discountedPrice =
              price && discount ? price - (price * discount) / 100 : price;
            updatePkg({ ...pkg, price, discountedPrice });
          }}
        />

        <Input
          type="number"
          value={pkg.discount ?? ''}
          placeholder="Discount %"
          onChange={e => {
            const discount = e.target.value ? Number(e.target.value) : null;
            const price = pkg.price ?? 0;
            const discountedPrice =
              price && discount ? price - (price * discount) / 100 : price;
            updatePkg({ ...pkg, discount, discountedPrice });
          }}
        />

        <Input
          value={pkg.discountedPrice ?? ''}
          placeholder="Discounted Price"
          readOnly
          className="bg-gray-100"
        />

        {/* What You Get */}
        <div>
          <Label>What You Get</Label>
          {renderArrayField(
            pkg.whatYouGet,
            newArr =>
              updatePkg({
                ...pkg,
                whatYouGet:
                  typeof newArr === 'function' ? newArr(pkg.whatYouGet) : newArr
              }),
            (val, _, updateVal) => (
              <Input
                value={val}
                placeholder="Feature"
                onChange={e => updateVal(e.target.value)}
              />
            ),
            ''
          )}
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


<div>
  <Label>More Info</Label>

  {renderArrayField(
    moreInfo,
    setMoreInfo,
    (item, _, update) => (
      <>
        <Input
          value={item.title}
          placeholder="Title"
          onChange={e => update({ ...item, title: e.target.value })}
        />

        <FileInput
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              update({ ...item, image: URL.createObjectURL(file) });
            }
          }}
        />

        <Input
          value={item.description}
          placeholder="Description"
          onChange={e => update({ ...item, description: e.target.value })}
        />

        {item.image && (
          <div className="w-24 h-24 relative mt-2">
            <Image src={item.image} alt="info" fill className="rounded object-cover" />
          </div>
        )}
      </>
    ),
    { title: '', image: '', description: '' }
  )}
</div>


      {/* Terms */}
      <div>
        <Label>Terms & Conditions</Label>
        {editorReady && (
          <ClientSideCustomEditor
            value={termsAndConditionValue} // ✅ STRING
          onChange={(value: string) =>
            setData((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                terms: [value], // ✅ ARRAY
              },
            }))
          }
          />
        )}
      </div>

            {/* FAQs */}
      <div>
        <Label>FAQs</Label>
        {renderArrayField(
          faqs,
          setFaqs,
          (item, _, update) => (
            <>
              <Input
                value={item.question}
                placeholder="Question"
                onChange={e => update({ ...item, question: e.target.value })}
              />
              <textarea
                value={item.answer}
                placeholder="Answer"
                onChange={e => update({ ...item, answer: e.target.value })}
                className="w-full border rounded p-2 resize-none"
                rows={3}
              />
            </>
          ),
          { question: '', answer: '' }
        )}
      </div>

      {/* Connect With */}
      <div>
        <Label>Connect With</Label>
        {renderArrayField(
          connectWith,
          setConnectWith,
          (item, _, update) => (
            <>
              <Input value={item.name} placeholder="Name" onChange={e => update({ ...item, name: e.target.value })} />
              <Input value={item.mobileNo} placeholder="Mobile No" onChange={e => update({ ...item, mobileNo: e.target.value })} />
              <Input value={item.email} placeholder="Email" onChange={e => update({ ...item, email: e.target.value })} />
            </>
          ),
          { name: '', mobileNo: '', email: '' }
        )}
      </div>

      {/* Document */}
      <div>
        <Label>Document</Label>
        {editorReady && (
          <ClientSideCustomEditor
            value={documentValue} // ✅ STRING
          onChange={(value: string) =>
            setData((prev) => ({
              ...prev,
              serviceDetails: {
                ...prev.serviceDetails,
                document: [value], // ✅ ARRAY
              },
            }))
          }
          />
        )}
      </div>

      {/* Time Required */}
      <div>
        <Label>Time Required</Label>
        {renderArrayField(
          timeRequired,
          setTimeRequired,
          (item, _, update) => (
            <>
              <Input
                type="number"
                placeholder="Min Days"
                value={item.minDays ?? ''}
                onChange={e =>
                  update({ ...item, minDays: e.target.value ? Number(e.target.value) : null })
                }
              />
              <Input
                type="number"
                placeholder="Max Days"
                value={item.maxDays ?? ''}
                onChange={e =>
                  update({ ...item, maxDays: e.target.value ? Number(e.target.value) : null })
                }
              />
            </>
          ),
          { minDays: null, maxDays: null }
        )}
      </div>

      {/* Extra Images */}
      <div>
        <Label>Extra Images</Label>
        {renderArrayField(
          extraImages,
          setExtraImages,
          (item, _, update) => (
            <FileInput
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  update({ icon: URL.createObjectURL(file) });
                }
              }}
            />
          ),
          { icon: '' }
        )}

        <div className="flex gap-3 mt-3">
          {extraImages.map((img, idx) =>
            img.icon ? (
              <div key={idx} className="w-20 h-20 relative">
                <Image src={img.icon} alt="extra" fill className="rounded object-cover" />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* EXTRA SECTIONS */}
      <div>
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
            {renderArrayField(
              extraSections,
              setExtraSections,
              (section, _, updateSection) => (
                <div className="space-y-3">
                  <Input
                    value={section.title}
                    placeholder="Title"
                    onChange={e => updateSection({ ...section, title: e.target.value })}
                  />

                  {(['subtitle', 'description', 'subDescription', 'lists', 'tags'] as const).map(field => (
                    <div key={field}>
                      <Label className="capitalize">{field}</Label>
                      {renderArrayField(
                        section[field],
                        newArr =>
                          updateSection({
                            ...section,
                            [field]: typeof newArr === 'function' ? newArr(section[field]) : newArr
                          }),
                        (val, _, updateVal) => (
                          <Input value={val} placeholder={field} onChange={e => updateVal(e.target.value)} />
                        ),
                        ''
                      )}
                    </div>
                  ))}

                  {/* Section Images */}
                  <div>
                    <Label>Images</Label>
                    <FileInput
                      multiple
                      onChange={e => {
                        if (e.target.files) {
                          const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                          updateSection({ ...section, image: [...section.image, ...urls] });
                        }
                      }}
                    />

                    <div className="flex gap-3 mt-2">
                      {section.image.map((img, i) => (
                        <div key={i} className="w-20 h-20 relative">
                          <Image src={img} alt="section" fill className="rounded object-cover" />
                        </div>
                      ))}
                    </div>
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
              onClick={() => setShowExtraSections(false)}
              className="bg-yellow-500 text-white px-4 py-2 rounded mt-3"
            >
              Hide Sections
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default ServiceUpdateFrom;
