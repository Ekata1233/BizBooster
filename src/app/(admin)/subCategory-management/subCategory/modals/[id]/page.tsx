'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, } from 'next/navigation';
import Image from 'next/image';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';
import { useSubcategory } from '@/context/SubcategoryContext';

const EditSubcategoryPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const { subcategories, updateSubcategory } = useSubcategory();

    const [subcategoryName, setSubcategoryName] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (id && subcategories.length > 0) {
            const subcategory = subcategories.find((subcat) => subcat._id === id);
            if (subcategory) {
                setSubcategoryName(subcategory.name);
                setSelectedCategoryId(subcategory.category?._id || '');
                setExistingImageUrl(subcategory.image || null);
            }
        }
    }, [id, subcategories]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
    };

    const handleUpdate = async () => {
        if (!id) return;

        const subcategoryId = Array.isArray(id) ? id[0] : id;

        const formData = new FormData();
        formData.append('name', subcategoryName);
        formData.append('category', selectedCategoryId);
        if (selectedFile) formData.append('image', selectedFile);

        try {
            await updateSubcategory(subcategoryId, formData);
            alert('Subcategory updated successfully');
            router.push('/subCategory-management/subCategory');
        } catch (err) {
            console.error('Error updating subcategory:', err);
        }
    };

    return (
        <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
            <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
                Edit Subcategory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Subcategory Name</Label>
                    <Input
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                    />
                </div>

             

                <div>
                    <Label>Select Category</Label>

                    {(() => {
                        const uniqueCategories = Array.from(
                            new Map(
                                subcategories
                                    .filter((s) => s.category?._id)
                                    .map((s) => [s.category!._id, s.category!])
                            ).values()
                        );

                        return (
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Category</option>
                                {uniqueCategories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        );
                    })()}
                </div>

                <div>
                    <Label>Thumbnail Image</Label>
                    <FileInput onChange={handleFileChange} />

                    {(selectedFile || existingImageUrl) && (
                        <div className="mt-2">
                            <Image
                                src={
                                    selectedFile
                                        ? URL.createObjectURL(selectedFile)
                                        : existingImageUrl ?? ''
                                }
                                width={80}
                                height={80}
                                alt="Subcategory Thumbnail"
                                className="w-20 h-20 object-cover rounded border"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
                <Button
                    variant="outline"
                    onClick={() => router.push('/subCategory-management/subCategory')}
                >
                    Cancel
                </Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
        </div>
    );
};

export default EditSubcategoryPage;
