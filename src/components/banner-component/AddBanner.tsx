
import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import { useModule } from '@/context/ModuleContext'
import Radio from '../form/input/Radio'
import Select from '../form/Select'
import { Category, useCategory } from '@/context/CategoryContext'
import { ChevronDownIcon } from '@/icons'

const AddBanner = () => {
  const { addModule } = useModule(); // Access the context
  const [moduleName, setModuleName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("option2");
  const [selectedCategory, setSelectedCategory] = useState('');
  const { categories } = useCategory();
  
    const handleRadioChange = (value: string) => {
      setSelectedValue(value);
    };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleSubmit = async () => {
    if (!moduleName || !selectedFile) {
      alert('Please enter module name and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('name', moduleName);
    formData.append('image', selectedFile);

    try {
      await addModule(formData);
      alert('Module added successfully!');
      setModuleName('');
      setSelectedFile(null);
      console.log("page reset")
    } catch (error) {
      alert('Error adding module.');
      console.error(error);
    }
  };

  const options = categories.map((cat: Category) => ({
          value: cat._id ?? '',
          label: cat.name,
      }));

       const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
        setSelectedCategory(value); // required to set the selected module
    };

  return (
    <div><ComponentCard title="Add New Banner">
      <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <div>
          <Label>Module Name</Label>
          <Input
            type="text"
            placeholder="Enter Module"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />

        </div>
       
        <div className='flex flex-wrap items-center gap-8'> <Radio
          id="category"
          name="category"
          value="category"
          checked={selectedValue === "category"}
          onChange={handleRadioChange}
          label="Category"
        />
        <Radio
          id="subcategory"
          name="subcategory"
          value="subcategory"
          checked={selectedValue === "subcategory"}
          onChange={handleRadioChange}
          label="Subcategory"
        />
        <Radio
          id="service"
          name="service"
          value="service"
          checked={selectedValue === "service"}
          onChange={handleRadioChange}
          label="Service"
        />
        <Radio
          id="referralUrl"
          name="referralUrl"
          value="referralUrl"
          checked={selectedValue === "referralUrl"}
          onChange={handleRadioChange}
          label="Referral URL"
        /></div>

        <div>
                    <Label>Select Category</Label>
                    <div className="relative">
                        <Select
                            options={options}
                            placeholder="Select an option"
                            onChange={handleSelectChange}
                            className="dark:bg-dark-900"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon />
                        </span>
                    </div>
                </div>
        
      
        <div>
          <Label>Select Image</Label>
          <FileInput onChange={handleFileChange} className="custom-class" />
        </div>




        <div className='mt-6 '>
          <Button size="sm" variant="primary" onClick={handleSubmit}>
            Add Banner
          </Button>
        </div>
      </div>
    </ComponentCard></div>
  )
}

export default AddBanner