"use client";

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';

// import AddSubcategory from '@/components/module-component/AddSubcategory';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useModal } from '@/hooks/useModal';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

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
    id: string;
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
    name: string;
    categoryName: string;
    image: string;
    status: string;
}

const Subcategory = () => {
    const { subcategories, updateSubcategory, deleteSubcategory } = useSubcategory();
    const { isOpen, openModal, closeModal } = useModal();

    console.log("subcate :", subcategories);


    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    if (!subcategories || !Array.isArray(subcategories)) {
        return <div>Loading...</div>;
    }

    const tableData: TableData[] = subcategories.map((subcat) => ({
        id: subcat.id,
        categoryName: subcat.category?.name || 'N/A',
        name: subcat.name,
        image: (subcat as any).image || '', // handle optional image
        status: subcat.isDeleted ? 'Deleted' : 'Active',
    }));

    const columns = [
        {
            header: 'Category Name',
            accessor: 'categoryName',
            render: (row: TableData) => (
                <span className="font-medium text-blue-600">{row.categoryName}</span>
            ),
        },
        {
            header: 'Subcategory Name',
            accessor: 'name',
        },
        {
            header: 'Image',
            accessor: 'image',
            render: (row: TableData) => (
                <div className="flex items-center gap-3">
                    <div className="w-[130px] h-[130px] overflow-hidden">
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
            render: (row: TableData) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingId(row.id);
                            setSelectedFile(null);
                            openModal();
                        }}
                        className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
                    >
                        <PencilIcon />
                    </button>

                    <button
                        onClick={() => deleteSubcategory(row.id)}
                        className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500"
                    >
                        <TrashBinIcon />
                    </button>

                    <Link href={`/subcategory/${row.id}`} passHref>
                        <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                            <EyeIcon />
                        </button>
                    </Link>
                </div>
            ),
        },
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSave = async () => {
        if (!editingId || !selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            await updateSubcategory(editingId, formData);
            closeModal();
            setEditingId(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error updating subcategory:', error);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Subcategory" />

            <div className="my-5">
                {/* <AddSubcategory /> */}
            </div>

            <div className="my-5">
                <ComponentCard title="All Subcategories">
                    <BasicTableOne columns={columns} data={tableData} />
                </ComponentCard>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Subcategory Image
                        </h4>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[200px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                                <div>
                                    <Label>Select Image</Label>
                                    <FileInput onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Close
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Subcategory;
