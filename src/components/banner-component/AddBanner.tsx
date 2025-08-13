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
import { useService } from '@/context/ServiceContext'

export type PageType = 'home' | 'category' | 'academy';

interface ModuleType {
  _id: string;
  name: string;
}

const AddBanner = () => {
  const { createBanner } = useBanner();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("subcategory");
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [whichCategory, setWhichCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [pageType, setPageType] = useState<PageType>('home');
  const [selectedService, setSelectedService] = useState('');


  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { modules } = useModule();
  const { services } = useService();

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
    setSelectedCategory('');
    setSelectedCat('');
    setSelectedSubcategory('');
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
    formData.append('whichCategory', whichCategory);
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
      setSelectedCat('');
      setSelectedSubcategory('');
      console.log("page reset");
    } catch (error) {
      alert('Error adding module.');
      console.error(error);
    }
  };

  const filteredCategories = categories.filter(cat => cat.module?._id === selectedModule);

  const filteredSubcategories = subcategories.filter(sub => sub.category?._id === selectedCat);

  const filteredServices =
    selectedValue === 'service'
      ? services.filter(serv => serv.category?._id === selectedCat) // ✅ Filter directly by category
      : services.filter(serv => serv.subcategory?._id === selectedSubcategory);

  const categoryOptions = filteredCategories.map(cat => ({
    value: cat._id ?? '',
    label: cat.name,
  }));

  const subcategoryOptions = filteredSubcategories.map(sub => ({
    value: sub._id ?? '',
    label: sub.name,
  }));

  const serviceOptions = filteredServices.map(serv => ({
    value: serv._id ?? '',
    label: serv.serviceName,
  }));

  const handleSelectCat = (value: string) => {
    setSelectedCat(value);
    setSelectedCategory('');
  };

  const handleSelectChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSelectModule = (value: string) => {
    setSelectedModule(value);
    setSelectedCat('');
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleSelectSubcategory = (value: string) => {
    setSelectedSubcategory(value);
    setSelectedCategory('');
  };

  const pageTypeOptions = [
    { value: 'home', label: 'Home' },
    { value: 'category', label: 'Category' },
    { value: 'academy', label: 'Academy' }
  ];

  const options = modules.map((mod: ModuleType) => ({
    value: mod._id,
    label: mod.name,
  }));

  const onlyCategoryOptions = categories.map((cat: Category) => ({
    value: cat._id ?? '',
    label: cat.name,
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
              <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {pageType === 'category' && (
            <div className="col-span-1">
              <Label>Category Name</Label>
              <div className="relative">
                <Select
                  options={onlyCategoryOptions}
                  placeholder="Select Category Name"
                  onChange={(value: string) => setWhichCategory(value)}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          )}

          <div className="col-span-2 flex flex-wrap items-center gap-4 mt-4">
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

        {/* Dropdowns & Inputs */}
        {(selectedValue !== 'referralUrl') && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            {(selectedValue === 'service' || selectedValue === 'subcategory') && (
              <div>
                <Label>Select Module</Label>
                <div className="relative">
                  <Select
                    options={options}
                    placeholder="Select Module"
                    onChange={handleSelectModule}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}

            {(selectedValue === 'service' || selectedValue === 'subcategory') && (
              <div>
                <Label>Select Category</Label>
                <div className="relative">
                  <Select
                    options={categoryOptions}
                    placeholder="Select Category"
                    onChange={handleSelectCat}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}

            {selectedValue === 'service' && (
              <div>
                <Label>Select Subcategory</Label>
                <div className="relative">
                  <Select
                    options={subcategoryOptions}
                    placeholder="Select Subcategory"
                    onChange={handleSelectSubcategory}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}

            {(selectedValue === 'category' || selectedValue === 'subcategory' || selectedValue === 'service') && (
              <div>
                <Label>
                  {selectedValue === 'category' ? 'Select Category' :
                    selectedValue === 'subcategory' ? 'Select Subcategory' :
                      'Select Service'}
                </Label>
                <div className="relative">
                  <Select
                    options={
                      selectedValue === 'category' ? categoryOptions :
                        selectedValue === 'subcategory' ? subcategoryOptions :
                          serviceOptions
                    }
                    placeholder={`Select ${selectedValue}`}
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedValue === 'referralUrl' && (
          <div className="mb-6">
            <Label>Enter Referral URL</Label>
            <Input
              type="text"
              placeholder="https://example.com"
              value={referralUrl}
              onChange={(e) => setReferralUrl(e.target.value)}
            />
          </div>
        )}

        {/* File Upload */}
        <div className="mb-6">
          <Label>Select Image</Label>
          <FileInput onChange={handleFileChange} className="custom-class" />
        </div>

        {/* Submit Button */}
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
