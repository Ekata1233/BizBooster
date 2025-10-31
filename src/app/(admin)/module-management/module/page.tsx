'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import AddModule from '@/components/module-component/AddModule';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useModule } from '@/context/ModuleContext';
import { useModal } from '@/hooks/useModal';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashBinIcon } from '@/icons';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ModuleType {
  _id: string;
  name: string;
  image: string;
  categoryCount: number;
  isDeleted: boolean;
  sortOrder?: number;
}

interface TableData {
  id: string;
  name: string;
  image: string;
  categoryCount: number;
  status: string;
  sortOrder?: number;
}

const Module = () => {
  const { modules, setModules, deleteModule } = useModule();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredModules, setFilteredModules] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();


  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const updated = [...filteredModules];
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    const sorted = updated.map((m, i) => ({ ...m, sortOrder: i }));
    setFilteredModules(sorted);

    await axios.post("/api/modules/reorder", {
      modules: sorted.map((m) => ({ _id: m.id, sortOrder: m.sortOrder })),
    });

    setModules((prev) =>
      prev.map((mod) => {
        const found = sorted.find((s) => s.id === mod._id);
        return found ? { ...mod, sortOrder: found.sortOrder } : mod;
      })
    );
  };

  const fetchFilteredModules = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const res = await axios.get('/api/modules', { params });
      const data = res.data.data;

      const tableData = data.map((m: ModuleType) => ({
        id: m._id,
        name: m.name,
        image: m.image,
        categoryCount: m.categoryCount,
        status: m.isDeleted ? 'Deleted' : 'Active',
        sortOrder: m.sortOrder || 0,
      }));

      setFilteredModules(tableData.sort((a, b) => a.sortOrder! - b.sortOrder!));
    } catch (e) {
      setFilteredModules([]);
    }
  };

  useEffect(() => {
    fetchFilteredModules();
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    await deleteModule(id);
    setFilteredModules((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEdit = (id: string) => {
    router.push(`/module-management/module/modals/${id}`);
  };

  const getFilteredByStatus = () => {
    if (activeTab === 'active') return filteredModules.filter(m => m.status === 'Active');
    if (activeTab === 'inactive') return filteredModules.filter(m => m.status === 'Deleted');
    return filteredModules;
  };
  

  const columns = [
    { header: 'Module Name', accessor: 'name' },
    {
      header: 'Image',
      accessor: 'image',
      render: (row: TableData) => (
        <Image width={70} height={70} src={row.image} alt={row.name} className="rounded h-16 w-16 object-cover" />
      ),
    },
    {
      header: 'Category Count',
      accessor: 'categoryCount',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          row.status === 'Deleted' ? 'text-red-500 bg-red-100' : 'text-green-600 bg-green-100'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row.id)} className="text-yellow-500 p-2 border rounded-md">
            <PencilIcon />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-500 p-2 border rounded-md">
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

  if (!modules) return <RouteLoader />;

  return (
    <div>
      <PageBreadcrumb pageTitle="Module" />
      <div className="my-5"><AddModule /></div>
      <ModuleStatCard />

      <ComponentCard title="All Modules">

        <Input placeholder="Search by module name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="border-b border-gray-200 mt-2">
          <ul className="flex space-x-6 text-sm font-medium text-gray-500">
            {['all','active','inactive'].map((tab) => (
              <li key={tab}
                className={`cursor-pointer px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </li>
            ))}
          </ul>
        </div>

       <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="modules">
    {(provided) => (
      <table className="min-w-full divide-y divide-gray-200" ref={provided.innerRef} {...provided.droppableProps}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {getFilteredByStatus().map((row, index) => (
            <Draggable key={row.id} draggableId={row.id} index={index}>
              {(provided) => (
                <tr
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="cursor-move hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{row.name}</td>

                  <td className="px-4 py-2">
                    <Image src={row.image} width={60} height={60} alt="" className="rounded object-cover h-12 w-12"/>
                  </td>

                  <td className="px-4 py-2">{row.categoryCount}</td>

                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleEdit(row.id)} className="text-yellow-500 p-2 border rounded-md">
                      <PencilIcon />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 p-2 border rounded-md">
                      <TrashBinIcon />
                    </button>
                  </td>
                </tr>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </tbody>
      </table>
    )}
  </Droppable>
</DragDropContext>


      </ComponentCard>
    </div>
  );
};

export default Module;
