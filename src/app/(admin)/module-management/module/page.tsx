'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import AddModule from '@/components/module-component/AddModule';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import { useModule } from '@/context/ModuleContext';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashBinIcon } from '@/icons';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModules, setFilteredModules] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();

  const fetchFilteredModules = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const res = await axios.get('/api/modules', { params });
      const data = res.data.data || [];

      const tableData: TableData[] = data.map((m: ModuleType) => ({
        id: m._id,
        name: m.name,
        image: m.image,
        categoryCount: m.categoryCount ?? 0,
        status: m.isDeleted ? 'Deleted' : 'Active',
        sortOrder: typeof m.sortOrder === 'number' ? m.sortOrder : 0,
      }));

      tableData.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      setFilteredModules(tableData);
    } catch {
      setFilteredModules([]);
    }
  };

  useEffect(() => {
    fetchFilteredModules();
  }, [searchQuery]);

  const getFilteredByStatus = () => {
    if (activeTab === 'active') return filteredModules.filter(m => m.status === 'Active');
    if (activeTab === 'inactive') return filteredModules.filter(m => m.status === 'Deleted');
    return filteredModules;
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const visible = getFilteredByStatus();
    const updatedVisible = Array.from(visible);
    const [moved] = updatedVisible.splice(source.index, 1);
    updatedVisible.splice(destination.index, 0, moved);

    const updatedGlobal = [...filteredModules];
    visible.forEach(v => {
      const idx = updatedGlobal.findIndex(g => g.id === v.id);
      if (idx !== -1) updatedGlobal.splice(idx, 1);
    });

    updatedVisible.forEach((v, idx) => {
      updatedGlobal.splice(idx, 0, v);
    });

    const finalList = updatedGlobal.map((it, idx) => ({ ...it, sortOrder: idx }));
    setFilteredModules(finalList);

    try {
      await axios.post("/api/modules/reorder", {
        modules: finalList.map(m => ({ _id: m.id, sortOrder: m.sortOrder }))
      });
      setModules?.(prev => prev?.map(pm => {
        const f = finalList.find(u => u.id === pm._id);
        return f ? { ...pm, sortOrder: f.sortOrder } : pm;
      }));
    } catch (err) {
      console.log(err);
      fetchFilteredModules();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteModule(id);
    } finally {
      fetchFilteredModules();
    }
  };

  const handleEdit = (id: string) => router.push(`/module-management/module/modals/${id}`);

  if (!modules) return <RouteLoader />;

  const displayedModules = getFilteredByStatus();

  return (
    <div>
      <PageBreadcrumb pageTitle="Module" />
      <div className="my-5"><AddModule /></div>
      <ModuleStatCard />

      <ComponentCard title="All Modules">

        <Input placeholder="Search by module name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="border-b border-gray-200 mt-2">
          <ul className="flex space-x-6 text-sm font-medium text-gray-500">
            {['all', 'active', 'inactive'].map(tab => (
              <li key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`cursor-pointer px-4 py-2 ${
                  activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : ''
                }`}
              >
                {tab.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>

        {/** ✅ FULL WORKING GRID DND */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="grid" direction="horizontal">
            {(provided) => (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {displayedModules.map((m, idx) => (
                  <Draggable key={m.id} draggableId={m.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 rounded-lg border shadow bg-white flex flex-col gap-3 ${
                          snapshot.isDragging && 'ring-2 ring-blue-400 bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{m.name}</h3>
                          <span className="cursor-grab text-xl">⠿</span>
                        </div>

                        <div className="flex justify-center">
                          {m.image
                            ? <Image src={m.image} alt={m.name} width={90} height={90} className="rounded-md object-cover h-20 w-20" />
                            : <div className="h-20 w-20 bg-gray-100 rounded" />
                          }
                        </div>

                        <p className="text-sm text-gray-600">Categories: {m.categoryCount}</p>

                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          m.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {m.status}
                        </span>

                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleEdit(m.id)} className="text-yellow-600 p-2 border rounded hover:bg-yellow-50"><PencilIcon /></button>
                          <button onClick={() => handleDelete(m.id)} className="text-red-600 p-2 border rounded hover:bg-red-50"><TrashBinIcon /></button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

      </ComponentCard>
    </div>
  );
};

export default Module;
