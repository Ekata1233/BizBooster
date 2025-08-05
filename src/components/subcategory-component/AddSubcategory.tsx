import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import Select from '../form/Select'
import { ChevronDownIcon } from '@/icons'
import { Category, useCategory } from '@/context/CategoryContext'
import { useSubcategory } from '@/context/SubcategoryContext'

const AddSubcategory = () => {
    const { addSubcategory ,fetchSubcategories } = useSubcategory();
    const { categories } = useCategory();
    const [subcategoryName, setSubcategoryName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCategory || !subcategoryName || !selectedFile) {
            alert('Please enter all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('name', subcategoryName);
        formData.append('image', selectedFile);

        try {
            await addSubcategory(formData);
            alert('Subcategory added successfully!');
            setSelectedCategory('');
            setSubcategoryName('');
            setFileInputKey(Date.now());
            setSelectedFile(null);
            fetchSubcategories()
            console.log("page reset")
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message);
                console.error(error);
            } else {
                alert("An unknown error occurred.");
                console.error("Unknown error:", error);
            }
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
        <div><ComponentCard title="Add New Subcategory">
            <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                <div>
                    <Label>Select Category</Label>
                    <div className="relative">
                        <Select
                            options={options}
                            placeholder="Select an option"
                            onChange={handleSelectChange}
                            className="dark:bg-dark-900"
                            value={selectedCategory}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon />
                        </span>
                    </div>
                </div>
                <div>
                    <Label>Subcategory Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter Subcategory"
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                    />

                </div>
                <div>
                    <Label>Select Image</Label>
                    <FileInput 
                     key={fileInputKey} 
                     onChange={handleFileChange} className="custom-class" />

                </div>
                <div className='mt-6 '>
                    <Button size="sm" variant="primary" onClick={handleSubmit}>
                        Add Subcategory
                    </Button>
                </div>
            </div>
        </ComponentCard></div>
    )
}

export default AddSubcategory