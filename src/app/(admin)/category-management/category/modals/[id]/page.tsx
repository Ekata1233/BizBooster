'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';
import { useCategory } from '@/context/CategoryContext';
import { useModule } from '@/context/ModuleContext';

const EditCategoryPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const { categories, updateCategory } = useCategory();
    const { modules } = useModule();

    const [categoryName, setCategoryName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    useEffect(() => {
                 console.log('Editing category:');
        if (id && categories.length > 0) {
            const category = categories.find((cat) => cat._id === id);
            console.log('Editing category:', category);
            if (category) {
                setCategoryName(category.name);
                setSelectedModuleId(category.module?._id || '');
                setExistingImageUrl(category.image || null);
            }
        }
    }, [id, categories]);

    const handleUpdate = async () => {
        if (!id) return;

        const formData = new FormData();
        formData.append('name', categoryName);
        formData.append('module', selectedModuleId);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            await updateCategory(id as string, formData);
            alert('Category updated successfully');
            router.push('/category-management/category');
        } catch (err) {
            console.error('Error updating category:', err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
    };


    

    return (
        <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
            <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
                Edit Category Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Category Name</Label>
                    <Input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Select Module</Label>
                    <div className="relative">

                        <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Module</option>
                            {modules.map((mod) => (
                                <option key={mod._id} value={mod._id}>
                                    {mod.name}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                <div>
                    <Label>Thumbnail Image</Label>
                    <FileInput onChange={handleFileChange} className="custom-class" />
                    {(selectedFile || existingImageUrl) && (
                        <div className="mt-2">
                            <Image
                                src={
                                    selectedFile
                                        ? URL.createObjectURL(selectedFile)
                                        : existingImageUrl || ''
                                }
                                width={80}
                                height={80}
                                alt="Category Thumbnail"
                                className="w-20 h-20 object-cover rounded border"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
                <Button variant="outline" onClick={() => router.push('/category-management/category')}>
                    Cancel
                </Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
        </div>
    );
};

export default EditCategoryPage;
