import React, { useEffect, useState } from 'react'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import Select from '../form/Select'
import { ChevronDownIcon } from '@/icons'
import { useCategory } from '@/context/CategoryContext'
import { useSubcategory } from '@/context/SubcategoryContext'
import FileInput from '../form/input/FileInput'

const BasicDetailsForm = ({ data, setData }: {
    data: any;
    setData: (newData: Partial<any>) => void;
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMultiFiles, setSelectedMultiFiles] = useState<FileList | null>(null);
    const { categories } = useCategory();
    const { subcategories } = useSubcategory();

    useEffect(() => {
        if (data) {
            if (data.category) setSelectedCategory(data.category);
            if (data.subcategory) setSelectedSubcategory(data.subcategory);
            if (data.thumbnail instanceof File) setSelectedFile(data.thumbnail);
            if (data.covers instanceof FileList || data.covers?.length) setSelectedMultiFiles(data.covers);
        }
    }, [data]);


    console.log("data in the basic details : ", data)

    const categoryOptions = categories.map((cat) => ({
        value: cat._id as string,
        label: cat.name,
        image: cat.image || '',
    }));
console.log();

    const filteredSubcategories = data.category
        ? subcategories.filter((subcat) => subcat.category?._id === data.category)
        : [];


    const subcategoryOptions = filteredSubcategories.map((subcat) => ({
        value: subcat._id as string,
        label: subcat.name,
        image: subcat.image || '',
    }));

    useEffect(() => {
        setSelectedCategory(data.category || '');
    }, [data.category]);

    useEffect(() => {
        if (data.category !== selectedCategory) {
            setData({ subcategory: '' });
            setSelectedCategory(data.category || '');
        }
    }, [data.category]);


    useEffect(() => {
        setData({ thumbnail: selectedFile });
    }, [selectedFile]);

    useEffect(() => {
        setData({ covers: selectedMultiFiles });
    }, [selectedMultiFiles]);




    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedMultiFiles(files);
        }
    };

    return (

        <div>
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Basic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Side */}
                <div className="space-y-4">
                    <div>
                        <Label>Service Name</Label>
                        <Input
                            type="text"
                            placeholder="Service name"
                            value={data.name}
                            onChange={(e) => setData({ name: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label>Select Category</Label>
                        <div className="relative">
                            <Select
                                options={categoryOptions}
                                placeholder="Categories"
                                value={selectedCategory}
                                // onChange={(value: string) => setSelectedCategory(value)}
                                onChange={(value: string) => setData({ category: value })}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label>Select Subcategory</Label>
                        <div className="relative">
                            <Select
                                options={subcategoryOptions}
                                placeholder="Subcategories"
                                value={selectedSubcategory}
                                onChange={(value: string) => setData({ subcategory: value })}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label>Price</Label>
                        <Input
                            type="number"
                            placeholder="Price"
                            value={data.price}
                            onChange={(e) => setData({ price: Number(e.target.value) })}
                        />

                    </div>
                </div>

                {/* Right Side */}
                <div className="space-y-3">
                    <div>
                        <Label>Thumbnail Image</Label>

                        <FileInput onChange={handleFileChange} className="custom-class" />
                        {/* <p className="text-xs text-gray-500 mb-1">
                            Image format - <strong>jpg, png, jpeg, gif</strong> | Size - <strong>max 2MB</strong> | Ratio - <strong>1:1</strong>
                        </p> */}
                        {selectedFile && (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Thumbnail Preview"
                                className="mt-2 w-20 h-20 object-cover rounded border"
                            />
                        )}
                    </div>

                    <div>
                        <Label>Cover Images</Label>
                        <FileInput onChange={handleMultipleFileChange} multiple className="custom-class" />
                        {/* <p className="text-xs text-gray-500 mb-1">
                            Image format - <strong>jpg, png, jpeg, gif</strong> | Size - <strong>max 2MB</strong> | Ratio - <strong>3:1</strong>
                        </p> */}
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {selectedMultiFiles &&
                                Array.from(selectedMultiFiles).map((file, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(file)}
                                        alt={`Cover Preview ${index}`}
                                        className="w-42 h-24 object-cover rounded border"
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicDetailsForm;
