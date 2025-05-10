'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

import AddModule from '@/components/module-component/AddModule';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useModule } from '@/context/ModuleContext';
import { EyeIcon, PencilIcon, TrashBinIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Define types
interface Module {
    _id: string;
    name: string;
    image: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
}




interface TableData {
    id: string;
    name: string;
    image: string;
    status: string;
}

const columns = [
    {
        header: 'Module Name',
        accessor: 'name',
    },
    {
        header: 'Image',
        accessor: 'image',
        render: (row: TableData) => (
            <div className="flex items-center gap-3">
                <div className="w-30 h-30 overflow-hidden">
                    <Image
                        width={130}
                        height={130}
                        src={row.image}
                        alt={row.name || "module image"}
                        className="object-cover rounded"
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
                <span className={`px-3 py-1 rounded-full text-sm  ${colorClass}`}>
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
                <button className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                    <PencilIcon />
                </button>
                <button className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <TrashBinIcon />
                </button>
                <Link href={`/customer-management/user/user-list/${row.id}`} passHref>
                    <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500">
                        <EyeIcon />
                    </button>
                </Link>
            </div>
        ),
    },
];

const Module = () => {
    const { modules } = useModule();  // Get modules from context

    console.log("modules : ", modules)

    if (!modules || !Array.isArray(modules)) {
        return <div>Loading...</div>;  // Optionally, show a loading state if modules isn't an array yet
    }

    const tableData: TableData[] = modules.map((mod) => ({
        id: mod._id,
        name: mod.name,
        image: mod.image,
        status: mod.isDeleted ? 'Deleted' : 'Active',
    }));

    // You can now safely use tableData
    console.log(tableData);


   

    return (
        <div>
            <PageBreadcrumb pageTitle="Module" />
            <div className="my-5">
                <AddModule />
            </div>

            <div className="my-5">
                <ComponentCard title="All Modules">
                    <div>
                        <BasicTableOne columns={columns} data={tableData} />
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
};

export default Module;
