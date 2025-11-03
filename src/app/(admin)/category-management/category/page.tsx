"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AddCategory from "@/components/category-component/AddCategory";
import Input from "@/components/form/input/InputField";
import { PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";
import { useCategory } from "@/context/CategoryContext";
import { useModule } from "@/context/ModuleContext";
import ModuleStatCard from "@/components/module-component/ModuleStatCard";

/* ✅ DND Imports */
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CategoryType {
  _id: string;
  name: string;
  image: string;
  subcategoryCount: number;
  isDeleted: boolean;
  sortOrder?: number;
  module: { name: string } | null;
}

interface TableData {
  id: string;
  name: string;
  image: string;
  subcategoryCount: number;
  moduleName: string;
  status: string;
  sortOrder?: number;
}

/* ✅ Sortable Card */
const SortableItem = ({ item, handleEdit, handleDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
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
      className={`w-full sm:w-[48%] lg:w-[23%] p-4 rounded-lg border shadow-sm bg-white flex flex-col gap-3 ${
        isDragging ? "ring-2 ring-blue-400 bg-blue-50 shadow-lg" : ""
      } transition-all duration-150`}
    >
      <div className="flex justify-between items-center cursor-grab">
        <h3 className="font-semibold truncate">{item.name}</h3>
        <span className="text-xl select-none">⠿</span>
      </div>

      <div className="flex justify-center">
        <Image
          src={item.image}
          alt={item.name}
          width={90}
          height={90}
          className="rounded-md object-cover h-20 w-20"
        />
      </div>

      <p className="text-sm text-gray-600">Module: {item.moduleName}</p>
      <p className="text-sm text-gray-600">Subcategories: {item.subcategoryCount}</p>

      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          item.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {item.status}
      </span>

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => handleEdit(item.id)}
          className="text-yellow-600 p-2 border rounded hover:bg-yellow-50"
        >
          <PencilIcon />
        </button>
        <button
          onClick={() => handleDelete(item.id)}
          className="text-red-600 p-2 border rounded hover:bg-red-50"
        >
          <TrashBinIcon />
        </button>
        <Link href={`/category-management/category/${item.id}`}>
          <button className="text-blue-600 p-2 border rounded hover:bg-blue-50">
            <EyeIcon />
          </button>
        </Link>
      </div>
    </div>
  );
};

/* ✅ MAIN COMPONENT */
const CategoryPage = () => {
  const { deleteCategory } = useCategory();
  const { modules } = useModule();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [filteredCategories, setFilteredCategories] = useState<TableData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayItem, setOverlayItem] = useState<TableData | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  /* ✅ Fetch Category List */
  const fetchCategories = async () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedModule) params.selectedModule = selectedModule;

    const res = await axios.get("/api/category", { params });
    const data: CategoryType[] = res.data.data || [];

    const formatted = data.map((c) => ({
      id: c._id,
      name: c.name,
      image: c.image,
      subcategoryCount: c.subcategoryCount ?? 0,
      moduleName: c.module?.name || "N/A",
      status: c.isDeleted ? "Deleted" : "Active",
      sortOrder: c.sortOrder ?? 0,
    }));

    formatted.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setFilteredCategories(formatted);
  };

  useEffect(() => {
    fetchCategories();
  }, [searchQuery, selectedModule]);

  /* ✅ Edit Navigate */
  const handleEdit = (id: string) => {
    router.push(`/category-management/category/modals/${id}`);
  };

  /* ✅ Delete Category */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await deleteCategory(id);
    fetchCategories();
  };

  const displayed = filteredCategories.filter((c) =>
    activeTab === "active"
      ? c.status === "Active"
      : activeTab === "inactive"
      ? c.status === "Deleted"
      : true
  );

  const findIndex = (id: string | null) =>
    id ? displayed.findIndex((d) => d.id === id) : -1;

  /* ✅ Drag End */
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverlayItem(null);
    if (!over || active.id === over.id) return;

    const from = findIndex(active.id as string);
    const to = findIndex(over.id as string);
    if (from === -1 || to === -1) return;

    const newDisplayed = arrayMove(displayed, from, to);
    const others = filteredCategories.filter((f) => !displayed.some((d) => d.id === f.id));
    const merged = [...newDisplayed, ...others].map((c, i) => ({ ...c, sortOrder: i }));

    setFilteredCategories(merged);

    try {
      await axios.post("/api/category/reorder", {
        categories: merged.map((c) => ({ _id: c.id, sortOrder: c.sortOrder })),
      });
    } catch (err) {
      fetchCategories();
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Category" />
      <div className="my-5">
        <AddCategory />
      </div>

      <ModuleStatCard />

      <ComponentCard title="All Categories">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input placeholder="Search category or module" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

          <select
            className="border rounded px-3 py-2"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="">Filter by module</option>
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          {["all", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ✅ Drag Sort View */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={displayed.map((d) => d.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-5 mt-5">
              {displayed.map((c) => (
                <SortableItem key={c.id} item={c} handleEdit={handleEdit} handleDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && overlayItem && (
              <div className="p-4 border rounded bg-white shadow w-[250px]">
                {overlayItem.name}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </ComponentCard>
    </div>
  );
};

export default CategoryPage;
