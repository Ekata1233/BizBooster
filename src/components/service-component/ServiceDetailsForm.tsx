import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import { TrashBinIcon } from "../../icons/index";
import FileInput from '../form/input/FileInput';
import { useWhyChoose } from '@/context/WhyChooseContext';
// In ServiceDetailsForm.tsx
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
interface RowData {
  title: string;
  description: string;
}

type FAQ = {
  question: string;
  answer: string;
};

type WhyChoose = {
  _id?: string;
};


export type ServiceDetails = {
  benefits: string;
  overview: string;
  highlight: File[] | FileList | null;
  document: string;
  howItWorks: string;
  terms: string;
  faqs: FAQ[];
  rows: RowData[];
  whyChoose: WhyChoose[];
};

const ServiceDetailsForm = ({ data, setData }: {
  data: ServiceDetails;
  setData: (newData: Partial<ServiceDetails>) => void;
}) => {
  const [benefits, setBenefits] = useState('');
  const [overview, setOverview] = useState('');
  const [highlight, setHighlight] = useState<FileList | File[] | null>(null);
  const [document, setDocument] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [terms, setTerms] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [whyChoose, setWhyChoose] = useState<WhyChoose[]>([{
    _id: ''
  }]);

  const [showAll, setShowAll] = useState(false);

  const whyChooseContext = useWhyChoose();

  useEffect(() => {
    console.log("whyChoose : ", whyChoose)
  }, [whyChoose])

  useEffect(() => {
    if (data) {
      setBenefits(data.benefits || '');
      setOverview(data.overview || '');
      setHighlight(
        typeof data.highlight === 'string'
          ? [] // or parse if it's JSON string of file names
          : (data.highlight as File[]) || []
      );
      setDocument(data.document || '');
      setHowItWorks(data.howItWorks || '');
      setTerms(data.terms || '');
      setFaqs(data.faqs?.length ? data.faqs : [{ question: '', answer: '' }]);
      setRows(data.rows?.length ? data.rows : []);
      setWhyChoose(data.whyChoose?.length ? data.whyChoose : []);
    }
  }, []);


  useEffect(() => {

    const newData = {
      benefits,
      overview,
      highlight,
      document,
      whyChoose,
      howItWorks,
      terms,
      faqs,
      rows,
    };

    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData);
    }
  }, [benefits, overview, highlight, document, whyChoose, howItWorks, terms, faqs, rows, setData, data]);

  // Corrected handleCheckboxChange to work with array of WhyChoose objects:
  const handleCheckboxChange = (itemId: string) => {
    setWhyChoose(prev => {
      if (prev.find(item => item._id === itemId)) {
        // Remove the object with this _id
        return prev.filter(item => item._id !== itemId);
      } else {
        // Add new object with _id
        return [...prev, { _id: itemId }];
      }
    });
  };



  const handleAddRow = () => {
    setRows([...rows, { title: '', description: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const handleRowChange = (
    index: number,
    field: keyof RowData,
    value: string
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(updatedFaqs);
  };

  const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setHighlight(fileArray);
    }
  };


  return (
    <div>
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Service Details</h4>

      <div className='my-3'>
        <Label>Benefits</Label>
        <div className="my-editor">
            <CKEditor
      editor={InlineEditor}
      data={benefits}
      onChange={(event, editor) => {
        const data = editor.getData();
        setBenefits(data);
      }}
    />
        </div>
      </div>

      <div className='my-3'>
        <Label>Overview</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor}
            data={overview}
            onChange={(event, editor) => {
              const data = editor.getData();
              setOverview(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>Highlight Images (Select Multiple Images)</Label>
        <FileInput onChange={handleMultipleFileChange} multiple className="custom-class" />
        <div className="mt-2 flex gap-2 flex-wrap">
          {highlight &&
            Array.from(highlight).map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Highlight Preview ${index}`}
                className="w-42 h-24 object-cover rounded border"
              />
            ))}
        </div>
      </div>

      <div className='my-3'>
        <Label>Document</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor}
            data={document}
            onChange={(event, editor) => {
              const data = editor.getData();
              setDocument(data);
            }}
          />
        </div>
      </div>

      <div className="my-3">
        <Label>Why Choose BizBooster</Label>

        {whyChooseContext.items && whyChooseContext.items.length > 0 && (
          <div className="space-y-4 mb-6">
            {(showAll ? whyChooseContext.items : whyChooseContext.items.slice(0, 2)).map(item => (
              <div key={item._id} className="border p-4 rounded shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left column */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="checkbox"
                        id={`select-${item._id}`}
                        checked={whyChoose.some(chosen => chosen._id === item._id)}
                        onChange={() => item._id && handleCheckboxChange(item._id)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Label className="font-bold">Title :</Label>
                      <p className="text-sm text-gray-600">{item.title}</p>
                    </div>

                    <div className="flex gap-2">
                      <Label className="font-bold">Description:</Label>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>

                    {item.extraSections && item.extraSections.length > 0 && (
                      <div className="flex gap-2">
                        <Label className="font-bold">Extra Sections</Label>
                        <div className="space-y-2">
                          {item.extraSections.map((section, idx) => (
                            <p key={idx} className="text-sm text-gray-600">{section.description}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right column - Image */}
                  <div className="flex-1 flex justify-center items-center">
                    {item.image && (
                      <div className="w-full h-28 md:h-44 relative rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {whyChooseContext.items.length > 2 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {showAll ? 'View Less' : 'View All'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      <div className='my-3'>
        <Label>How It&apos;s Work</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor}
            data={howItWorks}
            onChange={(event, editor) => {
              const data = editor.getData();
              setHowItWorks(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>Terms & Conditions</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor}
            data={terms}
            onChange={(event, editor) => {
              const data = editor.getData();
              setTerms(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>FAQ&apos;s</Label>
        {faqs.map((faq, index) => (
          <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-md font-medium text-gray-700">FAQ #{index + 1}</h2>
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveFaq(index)}
                aria-label="Remove FAQ"
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            </div>

            <div>
              <Label>Question</Label>
              <Input
                type="text"
                placeholder="Enter question"
                value={faq.question}
                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label>Answer</Label>
              <textarea
                placeholder="Enter answer"
                value={faq.answer}
                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                className="w-full border rounded p-2 resize-none"
                rows={4}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddFaq}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          + Add New FAQ
        </button>
      </div>

      <div className="my-3">
        {rows.map((row, index) => (
          <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-md font-medium text-gray-700">Row #{index + 1}</h2>
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveRow(index)}
                aria-label="Remove Row"
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Enter Document Name"
                  value={row.title}
                  onChange={(e) => handleRowChange(index, 'title', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-1/2">
                <Label>Description</Label>
                <Input
                  type="text"
                  placeholder="Enter Description"
                  value={row.description}
                  onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddRow}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          + Add New Row
        </button>

      </div>

    </div>
  );
};

export default ServiceDetailsForm;