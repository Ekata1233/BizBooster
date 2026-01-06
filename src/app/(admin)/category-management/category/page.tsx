"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AddCategory from "@/components/category-component/AddCategory";
import Input from "@/components/form/input/InputField";
import { PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";
import { useCategory } from "@/context/CategoryContext";
import { useModule } from "@/context/ModuleContext";
import ModuleStatCard from "@/components/module-component/ModuleStatCard";

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

const SortableItem = ({ item, handleEdit, handleDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
          src={item.image}
          alt={item.name}
          width={90}
          height={90}
          className="rounded-md object-cover h-20 w-20"
        />
      </div>

      <p className="text-sm text-gray-600">Module: {item.moduleName}</p>
      <p className="text-sm text-gray-600">
        Subcategories: {item.subcategoryCount}
      </p>

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

const CategoryPage = () => {
  const { categories, fetchCategories, deleteCategory, reorderCategories } =
    useCategory();
  const { modules } = useModule();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [localCats, setLocalCats] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    fetchCategories();
  }, []);
console.log("category : ",categories);

  // ✅ Proper filtering logic (fixed module filter)
  useEffect(() => {
    let list = categories.map((c) => ({
      id: c._id,
      name: c.name,
      image: c.image,
      subcategoryCount: c.subcategoryCount ?? 0,

      moduleId: c.module?._id || "", // ✅ Added moduleId
      moduleName: c.module?.name || "N/A",
      status: c.isDeleted ? "Deleted" : "Active",
      sortOrder: c.sortOrder ?? 0,
    }));

    if (searchQuery)
      list = list.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedModule)
      list = list.filter((c) => c.moduleId === selectedModule); // ✅ Fixed filtering by module

    if (activeTab === "active") list = list.filter((c) => c.status === "Active");
    if (activeTab === "inactive")
      list = list.filter((c) => c.status === "Deleted");

    list = list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    setLocalCats(list);
  }, [categories, searchQuery, selectedModule, activeTab]);

  const handleEdit = (id: string) =>
    router.push(`/category-management/category/modals/${id}`);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await deleteCategory(id);
    fetchCategories();
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = localCats.findIndex((i) => i.id === active.id);
    const newIndex = localCats.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localCats, oldIndex, newIndex).map((c, i) => ({
      ...c,
      sortOrder: i,
    }));

    setLocalCats(reordered);

    await reorderCategories(
      reordered.map((c) => ({ _id: c.id, sortOrder: c.sortOrder }))
    );

    fetchCategories();
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
          <Input
            placeholder="Search category or module"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

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

        <div className="border-b border-gray-200">
          {["all", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : ""
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={localCats.map((d) => d.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-5 mt-5">
              {localCats.map((c) => (
                <SortableItem
                  key={c.id}
                  item={c}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay />
        </DndContext>
      </ComponentCard>
    </div>
  );
};

export default CategoryPage;
