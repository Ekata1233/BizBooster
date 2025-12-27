"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import Select from "@/components/form/Select";
import { ChevronDownIcon, TrashBinIcon, PlusIcon } from "@/icons";
import { useModule } from "@/context/ModuleContext";
import { useWhyJustOurService } from "@/context/WhyJustOurServiceContext";
import ComponentCard from "@/components/common/ComponentCard";

/* ───────── TYPES ───────── */
interface ModuleType {
  _id: string;
  name: string;
}

interface ServiceItem {
  title: string;
  description: string;
  iconFile: File | null;
   list?: string;  
  key: number;
}

/* ───────── COMPONENT ───────── */
const AddWhyJustOurService = () => {
  const { modules } = useModule();
  const { createService, fetchServices } = useWhyJustOurService();

  const [selectedModule, setSelectedModule] = useState("");
 const [items, setItems] = useState<ServiceItem[]>([
  { title: "", description: "", iconFile: null, list: "", key: Date.now() },
]);


  /* ───────── HANDLERS ───────── */
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { title: "", description: "", iconFile: null, key: Date.now() },
    ]);
  };

  const handleRemoveItem = (key: number) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleItemChange = (
    key: number,
    field: "title" | "description" | "iconFile" | "list",
    value: string | File | null
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedModule || items.some((i) => !i.title || !i.description || !i.iconFile)) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("module", selectedModule);

    items.forEach((item, index) => {
    formData.append(`items[${index}][title]`, item.title);
    formData.append(`items[${index}][description]`, item.description);
    if (item.iconFile) {
      formData.append(`items[${index}][icon]`, item.iconFile);
    }

    // ✅ ADD list RIGHT HERE
    if (item.list?.trim()) {
      formData.append(`items[${index}][list]`, item.list);
    }
  });

    const result = await createService(formData);
    if (result) {
      alert("Service added successfully");
      setSelectedModule("");
      setItems([{ title: "", description: "", iconFile: null, key: Date.now() }]);
      fetchServices();
    }
  };

  /* ───────── MODULE OPTIONS ───────── */
  const moduleOptions = modules.map((mod: ModuleType) => ({
    value: mod._id,
    label: mod.name,
  }));

  return (
    <ComponentCard title="Add Why Just Our Service">
      {/* MODULE SELECT */}
      <div className="mb-4">
        <Label>Select Module</Label>
        <div className="relative">
          <Select
            options={moduleOptions}
            value={selectedModule}
            onChange={(value) => setSelectedModule(value)}
            placeholder="Select module"
            className="dark:bg-dark-900"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* SERVICE ITEMS */}
      {/* SERVICE ITEMS */}
{items.map((item, index) => (
  <div
    key={item.key}
    className="border p-4 mb-4 rounded flex flex-col sm:flex-row gap-4 items-end relative"
  >
    {/* TITLE */}
    <div className="flex-1">
      <Label>Title</Label>
      <Input
        type="text"
        placeholder="Enter title"
        value={item.title}
        onChange={(e) => handleItemChange(item.key, "title", e.target.value)}
      />
    </div>

    {/* DESCRIPTION */}
    <div className="flex-1">
      <Label>Description</Label>
      <Input
        type="text"
        placeholder="Enter description"
        value={item.description}
        onChange={(e) =>
          handleItemChange(item.key, "description", e.target.value)
        }
      />
    </div>
{/* LIST (OPTIONAL) */}
<div className="flex-1">
  <Label>
  List <span className="text-red-500 text-xs">(Only For Legal)</span>
</Label>

  <Input
    type="text"
    placeholder="Enter list text"
    value={item.list || ""}
    onChange={(e) =>
      handleItemChange(item.key, "list", e.target.value)
    }
  />
</div>

    {/* ICON */}
    <div className="flex-1">
      <Label>Icon</Label>
      <FileInput
        key={item.key}
        onChange={(e) =>
          handleItemChange(item.key, "iconFile", e.target.files?.[0] || null)
        }
      />
    </div>

    {/* ICON BUTTONS (Delete & Add More) */}
    <div className="flex flex-col gap-2 absolute top-2 right-2">
      {/* Delete */}
      {items.length > 1 && (
        <button
          onClick={() => handleRemoveItem(item.key)}
          className="text-red-500 hover:text-red-700"
          title="Delete"
        >
          <TrashBinIcon className="w-5 h-5" />
        </button>
      )}
      {/* Add More */}
      {index === items.length - 1 && (
        <button
          onClick={handleAddItem}
          className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full"
          title="Add More"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
))}


      {/* ADD MORE & SUBMIT BUTTONS */}
      <div className="flex justify-end gap-2 mt-2">
        
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Service
        </button>
      </div>
    </ComponentCard>
  );
};

export default AddWhyJustOurService;
