"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import Switch from "../form/switch/Switch";
import { TrashBinIcon } from "@/icons";
import { useCategory } from "@/context/CategoryContext";
import { useSubcategory } from "@/context/SubcategoryContext";

interface KeyValue {
  key: string;
  value: string;
}

export interface BasicDetailsData {
  serviceName?: string | null;
  category?: string | null;
  subcategory?: string | null;
  price?: number;
  discount?: number;
  includeGst?: boolean;
  gst?: number;
  recommendedServices?: boolean;
  discountedPrice?: number;
  gstInRupees?: number;
  totalWithGst?: number;
  thumbnailImage?: File | null;
  bannerImages?: FileList | File[] | null;
  tags?: string[];
  keyValues?: KeyValue[];
}

interface BasicDetailsFormProps {
  data: BasicDetailsData;
  setData: (newData: Partial<BasicDetailsData>) => void;
}

const BasicDetailsForm = ({ data, setData }: BasicDetailsFormProps) => {
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const [rows, setRows] = useState<KeyValue[]>(data.keyValues || []);
  const [tagInput, setTagInput] = useState("");
const [errors, setErrors] = useState<{ serviceName?: string; category?: string }>({});

  // Sync key-value rows with parent data
  useEffect(() => {
    if (data.keyValues && JSON.stringify(data.keyValues) !== JSON.stringify(rows)) {
      setRows(data.keyValues);
    }
  }, [data.keyValues]);
  

  // Calculate discountedPrice, gstInRupees, totalWithGst
  useEffect(() => {
    const price = data.price || 0;
    const discount = data.discount || 0;
    const gst = data.gst || 0;

    const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
    const gstInRupees = discount ? Math.floor((discountedPrice * gst) / 100) : 0;
    const totalWithGst = discountedPrice + gstInRupees;

    setData({ discountedPrice, gstInRupees, totalWithGst });
  }, [data.price, data.discount, data.gst]);

  // Add / Remove rows
  const handleAddRow = () => setRows([...rows, { key: "", value: "" }]);
  const handleRemoveRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
  const handleRowChange = (index: number, field: keyof KeyValue, value: string) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // Tags handling
  const tags = data.tags || [];
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setData({ tags: [...tags, tagInput.trim()] });
      setTagInput("");
    }
  };
  const handleRemoveTag = (index: number) => setData({ tags: tags.filter((_, i) => i !== index) });

  // Category & Subcategory options
  const categoryOptions = categories.map(cat => ({ value: cat._id, label: cat.name, image: cat.image || "" }));
  const filteredSubcategories = data.category ? subcategories.filter(s => s.category?._id === data.category) : [];
  const subcategoryOptions = filteredSubcategories.map(subcat => ({ value: subcat._id, label: subcat.name, image: subcat.image || "" }));

  // File handling
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData({ thumbnailImage: file });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files || null;
    setData({ bannerImages: files });
  };

  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">Basic Details</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-4">
        <div>
  <Label>Service Name</Label>
  <Input
    type="text"
    placeholder="Service name"
    value={data.serviceName || ""}
    onChange={(e) => {
      const value = e.target.value;

      setData({ serviceName: value || null });

      if (!value.trim()) {
        setErrors(prev => ({ ...prev, serviceName: "Service name is required" }));
      } else {
        setErrors(prev => ({ ...prev, serviceName: "" }));
      }
    }}
  />

  {errors.serviceName && (
    <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>
  )}
</div>


          <div>
            <Label>Price</Label>
            <Input
              type="number"
              placeholder="Price"
              value={data.price || ""}
              onChange={(e) => setData({ price: Number(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Discount (%)</Label>
            <Input
              type="number"
              value={data.discount || ""}
              onChange={(e) => setData({ discount: Number(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>After Discount Price</Label>
            <Input type="number" readOnly value={data.discountedPrice || 0} />
          </div>

          <div className="border p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <Label>Include GST</Label>
              <Switch
                checked={!!data.includeGst}
                onChange={(val) => setData({ includeGst: val })}
                label="Enable feature"
              />
            </div>

            <div>
              <Label>GST (%)</Label>
              <Input
                type="number"
                value={data.gst || 0}
                onChange={(e) => setData({ gst: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="mt-3">
              <Label>GST in Rupees</Label>
              <Input disabled value={data.gstInRupees || 0} />
            </div>

            <div className="mt-3">
              <Label>Total with GST</Label>
              <Input disabled value={data.totalWithGst || 0} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          <div>
            <Label>Select Category</Label>
           <Select
  options={categoryOptions}
  value={data.category || ""}
  onChange={(val) => {
    // remove error when selecting value
    setErrors(prev => ({ ...prev, category: "" }));

    // update data
    setData({ category: val || null });

    // validate here
    if (!val) {
      setErrors(prev => ({ ...prev, category: "Category is required" }));
    }
  }}
/>

{errors.category && (
  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
)}


          </div>

          <div>
            <Label>Select Subcategory</Label>
            <Select
              options={subcategoryOptions}
              value={data.subcategory || ""}
              onChange={(val) => setData({ subcategory: val || null })}
            />
          </div>

          <div>
            <Label>Thumbnail</Label>
            <FileInput onChange={handleThumbnailChange} />
          </div>

          <div>
            <Label>Banner Images</Label>
            <FileInput multiple onChange={handleBannerChange} />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="border rounded px-3 py-1 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <div key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                  {tag}
                  <button type="button" className="text-red-500" onClick={() => handleRemoveTag(i)}>×</button>
                </div>
              ))}
              <input
                className="flex-grow outline-none"
                placeholder="Press Enter to add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          <div>
            <Label>Key - Value</Label>
            {rows.map((row, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">Row {index + 1}</h3>
                  <button type="button" onClick={() => handleRemoveRow(index)}>
                    <TrashBinIcon />
                  </button>
                </div>
                <div className="flex gap-4 mt-3">
                  <Input
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) => handleRowChange(index, "key", e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => handleRowChange(index, "value", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddRow} className="bg-blue-500 text-white px-4 py-2 rounded">
              + Add New Row
            </button>
          </div>

          <div>
            <Label>Recommended Service</Label>
            <Switch
              checked={!!data.recommendedServices}
              onChange={(val) => setData({ recommendedServices: val })}
              label="Recommended Service"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsForm;
