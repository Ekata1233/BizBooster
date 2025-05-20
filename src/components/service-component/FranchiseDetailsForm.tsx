import React, { useState } from 'react'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Button from '../ui/button/Button';
import { TrashBinIcon } from '@/icons';

interface RowData {
  title: string;
  description: string;
}

const FranchiseDetailsForm = () => {
  const [overview, setOverview] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [terms, setTerms] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);

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


  return (
    <div>
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Basic Details</h4>
      <div className="space-y-4">
        <div>
          <Label>Commission</Label>
          <Input
            type="number"
            placeholder="Commission"
          />
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
    </div>
  )
}

export default FranchiseDetailsForm