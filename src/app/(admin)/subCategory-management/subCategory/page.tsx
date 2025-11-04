"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AddSubcategory from "@/components/subcategory-component/AddSubcategory";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import ModuleStatCard from "@/components/module-component/ModuleStatCard";
import { PencilIcon, TrashBinIcon, EyeIcon, ChevronDownIcon } from "@/icons";

import axios from "axios";
import { useSubcategory } from "@/context/SubcategoryContext";

// drag n drop
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ item, handleEdit, handleDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`w-full sm:w-[48%] lg:w-[23%] p-4 rounded-lg border shadow-sm bg-white flex flex-col gap-3 ${
        isDragging ? "ring-2 ring-blue-400 bg-blue-50 shadow-lg" : ""
      } transition-all duration-150`}
    >
        <div className="flex items-center gap-2">
    {/* ✅ Sort Order Badge */}
    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded">
      #{item.sortOrder}
    </span>

  </div>
      <div className="flex justify-between items-center cursor-grab">
        <h3 className="font-semibold truncate">{item.name}</h3>
        <span className="text-xl select-none">⠿</span>
      </div>

      <div className="flex justify-center">
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          width={90}
          height={90}
          className="rounded-md object-cover h-20 w-20"
        />
      </div>

      <p className="text-sm text-gray-600">Category: {item.categoryName}</p>
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
        <button onClick={() => handleEdit(item.id)} className="text-yellow-600 p-2 border rounded hover:bg-yellow-50">
          <PencilIcon />
        </button>
        <button onClick={() => handleDelete(item.id)} className="text-red-600 p-2 border rounded hover:bg-red-50">
          <TrashBinIcon />
        </button>
        <Link href={`/subCategory-management/subCategory/${item.id}`}>
          <button className="text-blue-600 p-2 border rounded hover:bg-blue-50">
            <EyeIcon />
          </button>
        </Link>
      </div>
    </div>
  );
};

const Subcategory = () => {
  // NOTE: use the actual function name from your context
  const { subcategories, fetchSubcategories, deleteSubcategory, updateSubcategoryOrder } =
    useSubcategory();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [localSubcats, setLocalSubcats] = useState<any[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    fetchSubcategories();
    axios.get("/api/category").then((res) => setCategories(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    let list = subcategories.map((s: any) => ({
      id: s._id,
      name: s.name,
      image: s.image,
      categoryName: s.category?.name || "N/A",
      status: s.isDeleted ? "Deleted" : "Active",
      sortOrder: s.sortOrder ?? 0,
    }));

    if (searchQuery) list = list.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory) list = list.filter((s: any) => s.category?._id === selectedCategory);
    if (activeTab === "active") list = list.filter((s) => s.status === "Active");
    if (activeTab === "inactive") list = list.filter((s) => s.status === "Deleted");

    list = list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    setLocalSubcats(list);
  }, [subcategories, searchQuery, selectedCategory, activeTab]);

  const handleEdit = (id: string) => router.push(`/subCategory-management/subCategory/modals/${id}`);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete subcategory?")) return;
    await deleteSubcategory(id);
    // fetchSubcategories(); // not needed; deleteSubcategory already refreshes via context
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = localSubcats.findIndex((i) => i.id === active.id);
    const newIndex = localSubcats.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(localSubcats, oldIndex, newIndex).map((c, i) => ({
      ...c,
      // start sortOrder at 1 (optional but conventional)
      sortOrder: i + 1,
    }));

    // update local state immediately for snappy UI
    setLocalSubcats(reordered);

    try {
      // use the function name exported by your context
      await updateSubcategoryOrder(
        reordered.map((c) => ({ _id: c.id, sortOrder: c.sortOrder }))
      );
      // no extra fetch here — updateSubcategoryOrder calls fetchSubcategories internally
    } catch (err) {
      console.error("Drag reorder failed:", err);
      // revert local order on failure (refetch from source)
      fetchSubcategories();
    }
  };

  const categoryOptions = categories.map((cat) => ({ value: cat._id, label: cat.name }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Subcategory" />

      <div className="my-5">
        <AddSubcategory />
      </div>

      <ModuleStatCard />

      <ComponentCard title="All Subcategories">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input placeholder="Search Subcategory" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

          <div className="relative">
            <Select options={categoryOptions} placeholder="Categories" onChange={(value) => setSelectedCategory(value)} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200">
          {["all", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={localSubcats.map((d) => d.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-5 mt-5">
              {localSubcats.map((s) => (
                <SortableItem key={s.id} item={s} handleEdit={handleEdit} handleDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ComponentCard>
    </div>
  );
};

export default Subcategory;
