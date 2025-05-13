import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import Select from '../form/Select'
import { ChevronDownIcon } from '@/icons'
import { useCategory } from '@/context/CategoryContext'
import { useModule } from '@/context/ModuleContext'
interface ModuleType {
  _id: string;
  name: string;
}

const AddCategory = () => {
    const { addCategory } = useCategory();
    const { modules } = useModule();
    const [categoryName, setCategoryName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedModule, setSelectedModule] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleSubmit = async () => {
        if (!selectedModule || !categoryName || !selectedFile) {
            alert('Please enter all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('module', selectedModule);
        formData.append('name', categoryName);
        formData.append('image', selectedFile);

        try {
            await addCategory(formData);
            alert('Category added successfully!');
            setSelectedModule('');
            setCategoryName('');
            setSelectedFile(null);
            console.log("page reset")
        } catch (error) {
            alert('Error adding category.');
            console.error(error);
        }
    };

  const options = modules.map((mod: ModuleType) => ({
  value: mod._id,
  label: mod.name,
}));


    const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
        setSelectedModule(value); // required to set the selected module
    };
    return (
        <div><ComponentCard title="Add New Category">
            <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                <div>
                    <Label>Select Module</Label>
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
                    <Label>Category Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter Category"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />

                </div>
                <div>
                    <Label>Select Image</Label>
                    <FileInput onChange={handleFileChange} className="custom-class" />

                </div>
                <div className='mt-6 '>
                    <Button size="sm" variant="primary" onClick={handleSubmit}>
                        Add Category
                    </Button>
                </div>
            </div>
        </ComponentCard></div>
    )
}

export default AddCategory