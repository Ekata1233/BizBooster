import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import {
  TrashBinIcon
} from "../../icons/index";
import Button from '../ui/button/Button';

interface RowData {
  title: string;
  description: string;
}

type FAQ = {
  question: string;
  answer: string;
};

type WhyChoose = {
  title: string;
  description: string;
  image: string;
};


const ServiceDetailsForm = () => {
  const [benefits, setBenefits] = useState('');
  const [overview, setOverview] = useState('');
  const [highlight, setHighlight] = useState('');
  const [document, setDocument] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [terms, setTerms] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [whyChoose, setWhyChoose] = useState<WhyChoose[]>([
    { title: '', description: '', image: '' }
  ]);


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

  const handleWhyChooseChange = (
    index: number,
    field: keyof WhyChoose,
    value: string
  ) => {
    const updated = [...whyChoose];
    updated[index][field] = value;
    setWhyChoose(updated);
  };

  const handleAddWhyChoose = () => {
    setWhyChoose([
      ...whyChoose,
      { title: '', description: '', image: '' }
    ]);
  };

  const handleRemoveWhyChoose = (index: number) => {
    const updated = [...whyChoose];
    updated.splice(index, 1);
    setWhyChoose(updated);
  };

  return (
    <div>
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Service Details</h4>

      <div className='my-3'>
        <Label>Benefits</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor as any}
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
            editor={ClassicEditor as any}
            data={overview}
            onChange={(event, editor) => {
              const data = editor.getData();
              setOverview(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>Highlight</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor as any}
            data={highlight}
            onChange={(event, editor) => {
              const data = editor.getData();
              setHighlight(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>Document</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor as any}
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
        {whyChoose.map((item, index) => (
          <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
            {/* Top Row: Title + Delete Button */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-md font-medium text-gray-700">Why Choose #{index + 1}</h2>
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveWhyChoose(index)}
                aria-label="Remove Reason"
              >
                <TrashBinIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Title Field */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              {/* Title Input */}
              <div className="flex-1">
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Enter title"
                  value={item.title}
                  onChange={(e) => handleWhyChooseChange(index, 'title', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Image URL Input */}
              <div className="flex-1">
                <Label>Image URL</Label>
                <Input
                  type="text"
                  placeholder="Enter image URL"
                  value={item.image}
                  onChange={(e) => handleWhyChooseChange(index, 'image', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>


            {/* Description Field */}
            <div>
              <Label>Description</Label>
              <textarea
                placeholder="Enter description"
                value={item.description}
                onChange={(e) => handleWhyChooseChange(index, 'description', e.target.value)}
                className="w-full border rounded p-2 resize-none"
                rows={4}
              />
            </div>

            {/* Image Field */}

          </div>
        ))}

        <Button
          size="sm"
          variant="primary"
          onClick={handleAddWhyChoose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add New
        </Button>
      </div>


      <div className='my-3'>
        <Label>How It's Work</Label>
        <div className="my-editor">
          <CKEditor
            editor={ClassicEditor as any}
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
            editor={ClassicEditor as any}
            data={terms}
            onChange={(event, editor) => {
              const data = editor.getData();
              setTerms(data);
            }}
          />
        </div>
      </div>

      <div className='my-3'>
        <Label>FAQ's</Label>
        {faqs.map((faq, index) => (
          <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
            {/* Top Row: Title + Delete Button */}
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

            {/* Question Field */}
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

            {/* Answer Field */}
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

        <Button
          size="sm" variant="primary"
          onClick={handleAddFaq}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add New FAQ
        </Button>

      </div>

      <div className="my-3">
        {rows.map((row, index) => (
          <div key={index} className="my-3 border p-4 rounded shadow-sm space-y-3">
            {/* Header Row */}
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

            {/* Fields Row: Title + Description */}
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

        <Button
          size="sm"
          variant="primary"
          onClick={handleAddRow}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add New Row
        </Button>
      </div>

    </div>
  );
};

export default ServiceDetailsForm;
