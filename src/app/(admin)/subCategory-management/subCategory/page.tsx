"use client";

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useModal } from '@/hooks/useModal';
import { ChevronDownIcon, EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AddSubcategory from '@/components/subcategory-component/AddSubcategory';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';

// Types
interface Category {
    _id: string;
    name: string;
    image: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
}

interface Subcategory {
    _id: string;
    name: string;
    image: string;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
    category: Category | null;
}

interface TableData {
    id: string;
    // _id: string;
    name: string;
    categoryName: string;
    image: string;
    status: string;

}

const Subcategory = () => {
    const { subcategories, updateSubcategory, deleteSubcategory } = useSubcategory();
    const { isOpen, closeModal } = useModal();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [subcategoryName, setSubcategoryName] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredSubcategory, setFilteredSubcategory] = useState<TableData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [activeTab, setActiveTab] = useState('all');
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const router = useRouter();

    console.log("data in categories : ", categories)
    useEffect(() => {
        axios.get("/api/category")
            .then(res => setCategories(res.data.data))
            .catch(err => console.error("Error fetching categories", err));
    }, []);

    const categoryOptions = categories.map((cat) => ({
        value: cat._id, // or value: module if you want full object
        label: cat.name,
        image: cat.image,
    }));

    const fetchFilteredSubcategory = async () => {
        try {
            const params = {
                ...(selectedCategory && { selectedCategory }),
                ...(searchQuery && { search: searchQuery }),
            };

            const response = await axios.get('/api/subcategory', { params });
            const data = response.data.data;

            if (data.length === 0) {
                setFilteredSubcategory([]);
            } else {
                const tableData: TableData[] = data.map((subcat: Subcategory) => ({
                    id: subcat._id,
                    categoryName: subcat.category?.name || 'N/A',
                    name: subcat.name,
                    image: subcat.image || '',
                    status: subcat.isDeleted ? 'Deleted' : 'Active',
                }));
                setFilteredSubcategory(tableData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setFilteredSubcategory([]);
        }
    }

    useEffect(() => {
        fetchFilteredSubcategory()
    }, [selectedCategory, searchQuery])

    // const handleEdit = (id: string) => {
    //     const subcat = subcategories.find(item => item._id === id);

    //     if (subcat) {
    //         setEditingId(id);
    //         setSubcategoryName(subcat.name);
    //         setSelectedCategoryId((subcat.category as Category)?._id || '');
    //         setSelectedFile(null);
    //         setExistingImageUrl(subcat.image || null);
    //         openModal();
    //     }
    // };

    const handleEdit = (id: string) => {
        router.push(`/subCategory-management/subCategory/modals/${id}`);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleUpdateData = async () => {

        if (!editingId || !subcategoryName || !selectedCategoryId) return;
        const formData = new FormData();
        formData.append("name", subcategoryName);
        formData.append("category", selectedCategoryId);
        if (selectedFile) formData.append("image", selectedFile);
        try {
            await updateSubcategory(editingId, formData);
            alert('Subcategory updated successfully');
            closeModal();
            setEditingId(null);
            setSubcategoryName('');
            setSelectedFile(null);
            setExistingImageUrl(null);
            fetchFilteredSubcategory();
        } catch (error) {
            console.error('Error updating subcategory:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this Subcategory?');
        if (!confirmDelete) return;

        try {
            await deleteSubcategory(id);
            alert('Subcategory deleted successfully');
            fetchFilteredSubcategory();
        } catch (error) {
            console.error("Error deleting subcategory:", error);
        }
    };

    if (!subcategories || !Array.isArray(subcategories)) return <div>Loading...</div>;


    const columns = [
        { header: 'Subcategory Name', accessor: 'name' },
        {
            header: 'Category Name',
            accessor: 'categoryName',
            render: (row: TableData) => (
                <span className="font-medium text-blue-600">{row.categoryName}</span>
            ),
        },
        {
            header: 'Image',
            accessor: 'image',
            render: (row: TableData) => (
                <div className="flex items-center gap-3">
                    <div className="w-20 h-20 overflow-hidden">
                        <Image
                            width={130}
                            height={130}
                            src={row.image}
                            alt={row.name || "subcategory image"}
                            className="object-cover object-center w-full h-full rounded"
                        />
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row: TableData) => {
                const status = row.status;
                let colorClass = '';

                switch (status) {
                    case 'Deleted':
                        colorClass = 'text-red-500 bg-red-100 border border-red-300';
                        break;
                    case 'Active':
                        colorClass = 'text-green-600 bg-green-100 border border-green-300';
                        break;
                    default:
                        colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
                }

                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (row: TableData) => {
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(row.id)}
                            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
                        >
                            <PencilIcon />
                        </button>

                        <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500"
                        >
                            <TrashBinIcon />
                        </button>

                        <Link href={`/subCategory-management/subCategory/${row.id}`} passHref>
                            <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                                <EyeIcon />
                            </button>
                        </Link>
                    </div>
                )
            },
        },
    ];

    const getFilteredByStatus = () => {
        if (activeTab === 'active') {
            return filteredSubcategory.filter(subCat => subCat.status === 'Active');
        } else if (activeTab === 'inactive') {
            return filteredSubcategory.filter(subCat => subCat.status === 'Deleted');
        }
        return filteredSubcategory;
    };


    return (
        <div>
            <PageBreadcrumb pageTitle="Module" />
            <div className="my-5">
                <AddSubcategory />
            </div>

            <div>
                <ModuleStatCard />
            </div>

            <div className="my-5">
                <ComponentCard title="All Subcategories">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                        <div>
                            <Label>Filter by Name</Label>
                            <Input
                                type="text"
                                placeholder="Search by Subcategory and Category name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Select Input</Label>
                            <div className="relative">
                                <Select
                                    options={categoryOptions}
                                    placeholder="Categories"
                                    onChange={(value: string) => setSelectedCategory(value)}
                                    className="dark:bg-dark-900"
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                    <ChevronDownIcon />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200">
                        <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('active')}
                            >
                                Active
                            </li>
                            <li
                                className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                                onClick={() => setActiveTab('inactive')}
                            >
                                Inactive
                            </li>
                        </ul>
                    </div>

                    <div>
                        <BasicTableOne columns={columns} data={getFilteredByStatus()} />

                    </div>
                </ComponentCard>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Subcategory
                        </h4>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[300px] overflow-y-auto px-2 pb-3 space-y-4">
                            <div>
                                <Label>Subcategory Name</Label>
                                <input
                                    type="text"
                                    value={subcategoryName}
                                    onChange={(e) => setSubcategoryName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter subcategory name"
                                />
                            </div>

                            <div>
                                <Label>Select Category</Label>
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Upload Image</Label>
                                <FileInput onChange={handleFileChange} />

                                {(selectedFile || existingImageUrl) && (
                                    <div className="mt-2">
                                        <Image
                                            src={
                                                selectedFile
                                                    ? URL.createObjectURL(selectedFile)
                                                    : existingImageUrl ?? ''
                                            }
                                            width={120}
                                            height={120}
                                            alt="Category Image"
                                            className="mt-2 w-20 h-20 object-cover rounded border"
                                        />
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Close
                            </Button>
                            <Button size="sm" onClick={handleUpdateData}>
                                Update Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Subcategory;
