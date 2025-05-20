import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import Radio from '../form/input/Radio'
import Select from '../form/Select'
import { Category, useCategory } from '@/context/CategoryContext'
import { ChevronDownIcon } from '@/icons'
import { useSubcategory } from '@/context/SubcategoryContext'
import { useBanner } from '@/context/BannerContext'
import { useModule } from '@/context/ModuleContext'

export type PageType = 'home' | 'category';

interface ModuleType {
  _id: string;
  name: string;
}

const AddBanner = () => {
  const { createBanner } = useBanner();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("subcategory");
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [pageType, setPageType] = useState<PageType>('home');
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { modules } = useModule();

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
    setSelectedCategory('');
    setReferralUrl('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleSubmit = async () => {
    if (!pageType || !selectedFile) {
      alert('Please enter module name and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('page', pageType);
    formData.append('file', selectedFile);

    formData.append('selectionType', selectedValue);
    formData.append('module', selectedModule);

    if (selectedValue === 'category') {
      formData.append('category', selectedCategory);
    } else if (selectedValue === 'subcategory') {
      formData.append('subcategory', selectedCategory);
    } else if (selectedValue === 'service') {
      formData.append('service', selectedCategory);
    } else if (selectedValue === 'referralUrl') {
      formData.append('referralUrl', referralUrl);
    }

    try {
      await createBanner(formData);
      alert('Banner added successfully!');
      setPageType(pageType);
      setSelectedFile(null);
      setSelectedModule('');
      setSelectedValue('category');
      setReferralUrl('');
      setSelectedCategory('');
      console.log("page reset");
    } catch (error) {
      alert('Error adding module.');
      console.error(error);
    }
  };

  const categoryOptions = categories.map((cat: Category) => ({
    value: cat._id ?? '',
    label: cat.name,
  }));

  const subcategoryOptions = subcategories.map((cat) => ({
    value: cat._id ?? '',
    label: cat.name,
  }));

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
    setSelectedCategory(value);
  };

  const handleSelectModule = (value: string) => {
    console.log("Selected value:", value);
    setSelectedModule(value);
  };

  const pageTypeOptions = [
    { value: 'home', label: 'Home' },
    { value: 'category', label: 'Category' }
  ];

  const options = modules.map((mod: ModuleType) => ({
    value: mod._id,
    label: mod.name,
  }));

  return (
    <div>
      <ComponentCard title="Add New Banner">
        {/* Row 1: Page Type + Radios */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-1">
            <Label>Select Page</Label>
            <div className="relative">
              <Select
                options={pageTypeOptions}
                placeholder="Select Page Type"
                onChange={(value: string) => setPageType(value as PageType)}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div className='col-span-2 flex flex-wrap items-center gap-4 mt-4'>
            {/* <Label>Select navigation option</Label> */}
            {/* <Radio
              id="category"
              name="linkType"
              value="category"
              checked={selectedValue === "category"}
              onChange={handleRadioChange}
              label="Category"
            /> */}
            <Radio
              id="subcategory"
              name="linkType"
              value="subcategory"
              checked={selectedValue === "subcategory"}
              onChange={handleRadioChange}
              label="Subcategory"
            />
            <Radio
              id="service"
              name="linkType"
              value="service"
              checked={selectedValue === "service"}
              onChange={handleRadioChange}
              label="Service"
            />
            <Radio
              id="referralUrl"
              name="linkType"
              value="referralUrl"
              checked={selectedValue === "referralUrl"}
              onChange={handleRadioChange}
              label="Referral URL"
            />
          </div>
        </div>

        {/* Row 2: Dropdown (conditional) + File input */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">

          <div>
            <Label>Select Module</Label>
            <div className="relative">
              <Select
                options={options}
                placeholder="Select an option"
                onChange={handleSelectModule}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {(selectedValue === 'category' || selectedValue === 'subcategory' || selectedValue === 'service') && (
            <div>
              <Label>
                {selectedValue === 'category'
                  ? 'Select Category'
                  : selectedValue === 'subcategory'
                    ? 'Select Subcategory'
                    : 'Select Service'}
              </Label>
              <div className="relative">
                <Select
                  options={
                    selectedValue === 'category'
                      ? categoryOptions
                      : subcategoryOptions
                  }
                  placeholder={`Select ${selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}`}
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          )}

          {selectedValue === 'referralUrl' && (
            <div>
              <Label>Enter Referral URL</Label>
              <Input
                type="text"
                placeholder="https://example.com"
                value={referralUrl}
                onChange={(e) => setReferralUrl(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label>Select Image</Label>
            <FileInput onChange={handleFileChange} className="custom-class" />
          </div>
        </div>

        {/* Row 3: Add Button */}
        <div className="flex justify-start">
          <Button size="sm" variant="primary" onClick={handleSubmit}>
            Add Banner
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
};

export default AddBanner;
