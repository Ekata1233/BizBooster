import React, { useEffect, useState } from 'react'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TrashBinIcon } from '@/icons';


interface RowData {
  title: string;
  description: string;
}

interface FranchiseDetailsData {
  commission?: string | number;
  overview?: string;
  howItWorks?: string;
  terms?: string;
  rows?: RowData[];
}

// 1. Define the RowData type
interface RowData {
  title: string;
  description: string;
}

// 2. Define the main form data type
interface FranchiseDetailsData {
  commission?: string | number;
  overview?: string;
  howItWorks?: string;
  terms?: string;
  rows?: RowData[];
}

// 3. Use it in your props
interface FranchiseDetailsFormProps {
  data: FranchiseDetailsData;
  setData: (newData: Partial<FranchiseDetailsData>) => void;
}


const FranchiseDetailsForm = ({ data, setData }: FranchiseDetailsFormProps) => {
  const [overview, setOverview] = useState('');
  const [howItWorks, setHowItWorks] = useState('');
  const [terms, setTerms] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);

  useEffect(() => {
    if (data) {
      setOverview(data.overview || '');
      setHowItWorks(data.howItWorks || '');
      setTerms(data.terms || '');
      setRows(data.rows?.length ? data.rows : []);
    }
  }, []);

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ commission: e.target.value });
  };

  const handleOverviewChange = ( editor: any) => {
    const dataOverview = editor.getData();
    setData({ overview: dataOverview });
  };

  const handleHowItWorkChange = ( editor: any) => {
    const dataHowItWork = editor.getData();
    setData({ howItWorks: dataHowItWork });
  };

  const handleTermsChange = ( editor: any) => {
    const dataTerms = editor.getData();
    setData({ terms: dataTerms });
  };

  const handleAddRow = () => {
    const newRows = [...rows, { title: '', description: '' }];
    setRows(newRows);
    setData({ rows: newRows });
  };

  const handleRemoveRow = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
    setData({ rows: updatedRows }); // <-- Update parent data
  };

  const handleRowChange = (
    index: number,
    field: keyof RowData,
    value: string
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
    setData({ rows: updatedRows });
  };


  return (
    <div>
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Franchise Details</h4>
      <div className="space-y-4">
        <div>
          <Label>Commission</Label>
          <Input
            type="number"
            placeholder="Commission"
            value={data.commission || ''}
            onChange={handleCommissionChange}
          />
        </div>

        <div className='my-3'>
          <Label>Overview</Label>
          <div className="my-editor">
            <CKEditor
              editor={ClassicEditor as any}
              data={overview}
              onChange={handleOverviewChange}
            />
          </div>
        </div>

        <div className='my-3'>
          <Label>How It's Works</Label>
          <div className="my-editor">
            <CKEditor
              editor={ClassicEditor as any}
              data={howItWorks}
              onChange={handleHowItWorkChange}
            />
          </div>
        </div>

        <div className='my-3'>
          <Label>Terms & Conditions</Label>
          <div className="my-editor">
            <CKEditor
              editor={ClassicEditor as any}
              data={terms}
              onChange={handleTermsChange}
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

          {/* <Button
          size="sm"
          variant="primary"
          onClick={handleAddRow}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add New Row
        </Button> */}
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            + Add New Row
          </button>

        </div>

      </div>
    </div>
  )
}

export default FranchiseDetailsForm