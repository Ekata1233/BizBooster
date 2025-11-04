'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useModule } from '@/context/ModuleContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import AddModule from '@/components/module-component/AddModule';
import ModuleStatCard from '@/components/module-component/ModuleStatCard';
import RouteLoader from '@/components/RouteLoader';
import { PencilIcon, TrashBinIcon } from '@/icons';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ModuleType {
  _id: string;
  name: string;
  image?: string;
  categoryCount?: number;
  isDeleted?: boolean;
  sortOrder?: number;
}

interface TableData {
  id: string;
  name: string;
  image?: string;
  categoryCount: number;
  status: string;
  sortOrder?: number;
}

/* ✅ Sortable Card */
const SortableItem: React.FC<{
  item: TableData;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}> = ({ item, handleEdit, handleDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-full sm:w-[48%] lg:w-[23%] p-4 rounded-lg border shadow-sm bg-white flex flex-col gap-3
        ${isDragging ? 'ring-2 ring-blue-400 bg-blue-50 shadow-lg' : ''} transition-all duration-150`}
    >
      <div className="flex justify-between items-center cursor-grab">
        <h3 className="font-semibold truncate">{item.name}</h3>
        <span className="text-xl select-none">⠿</span>
      </div>

      <div className="flex justify-center">
        {item.image ? (
          <Image src={item.image} alt={item.name} width={90} height={90} className="rounded-md object-cover h-20 w-20" />
        ) : (
          <div className="h-20 w-20 bg-gray-100 rounded" />
        )}
      </div>

      <p className="text-sm text-gray-600">Categories: {item.categoryCount}</p>

      <span className={`px-2 py-1 rounded text-xs font-bold ${
        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {item.status}
      </span>

      <div className="flex gap-2 mt-2">
        {/* ✅ EDIT */}
        <button onClick={() => handleEdit(item.id)} className="text-yellow-600 p-2 border rounded hover:bg-yellow-50">
          <PencilIcon />
        </button>

        {/* ✅ DELETE */}
        <button onClick={() => handleDelete(item.id)} className="text-red-600 p-2 border rounded hover:bg-red-50">
          <TrashBinIcon />
        </button>
      </div>
    </div>
  );
};

/* ✅ MAIN PAGE */
const ModulePage: React.FC = () => {
  const { modules, setModules } = useModule();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModules, setFilteredModules] = useState<TableData[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayItem, setOverlayItem] = useState<TableData | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  /* ✅ Fetch Modules */
  const fetchFilteredModules = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const res = await axios.get('/api/modules', { params });
      const data: ModuleType[] = res.data.data || [];

      const tableData: TableData[] = data.map((m) => ({
        id: m._id,
        name: m.name,
        image: m.image,
        categoryCount: m.categoryCount ?? 0,
        status: m.isDeleted ? 'Deleted' : 'Active',
        sortOrder: m.sortOrder ?? 0,
      }));

      tableData.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setFilteredModules(tableData);
    } catch (e) {
      console.error(e);
      setFilteredModules([]);
    }
  };

  useEffect(() => {
    fetchFilteredModules();
  }, [searchQuery]);

  /* ✅ EDIT MODULE */
  const handleEdit = (id: string) => {
    router.push(`/module-management/module/modals/${id}`);
  };

  /* ✅ DELETE MODULE (Soft Delete) */
 /* ✅ DELETE MODULE (Soft Delete) with Confirm Alert */
const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this module?");
  if (!confirmDelete) return; // ❌ cancel delete

  try {
    await axios.delete(`https://api.fetchtrue.com/api/modules/${id}`);
    await fetchFilteredModules();
  } catch (e) {
    console.error("Delete failed", e);
    alert("Failed to delete module. Please try again.");
  }
};



  const getFilteredByStatus = () => {
    if (activeTab === 'active') return filteredModules.filter((m) => m.status === 'Active');
    if (activeTab === 'inactive') return filteredModules.filter((m) => m.status === 'Deleted');
    return filteredModules;
  };

  const displayedModules = getFilteredByStatus();

  const findIndexById = (id: string | null) => {
    if (!id) return -1;
    return displayedModules.findIndex((d) => d.id === id);
  };

  /* ✅ Drag End */
  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverlayItem(null);
    if (!over || active.id === over.id) return;

    const oldIndex = findIndexById(active.id as string);
    const newIndex = findIndexById(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newDisplayed = arrayMove(displayedModules, oldIndex, newIndex);
    const other = filteredModules.filter((f) => !displayedModules.some((d) => d.id === f.id));
    const merged = [...newDisplayed, ...other].map((it, idx) => ({ ...it, sortOrder: idx }));

    setFilteredModules(merged);

    try {
      await axios.post('/api/modules/reorder', {
        modules: merged.map((m) => ({ _id: m.id, sortOrder: m.sortOrder })),
      });

      setModules?.((prev) =>
        prev?.map((pm) => {
          const found = merged.find((u) => u.id === pm._id);
          return found ? { ...pm, sortOrder: found.sortOrder } : pm;
        })
      );
    } catch {
      fetchFilteredModules();
    }
  };

  if (!modules) return <RouteLoader />;

  return (
    <div>
      <PageBreadcrumb pageTitle="Module" />
      <div className="my-5">
        <AddModule />
      </div>
      <ModuleStatCard />

      <ComponentCard title="All Modules">
        <Input placeholder="Search by module name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="border-b border-gray-200 mt-2">
          <ul className="flex space-x-6 text-sm font-medium text-gray-500">
            {['all', 'active', 'inactive'].map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`cursor-pointer px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              >
                {tab.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={displayedModules.map((d) => d.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-5 mt-5">
              {displayedModules.map((m) => (
                <SortableItem key={m.id} item={m} handleEdit={handleEdit} handleDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && overlayItem && (
              <div className="w-full sm:w-[48%] lg:w-[23%] p-4 rounded-lg border shadow bg-white flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{overlayItem.name}</h3>
                  <span className="text-xl select-none">⠿</span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </ComponentCard>
    </div>
  );
};

export default ModulePage;
