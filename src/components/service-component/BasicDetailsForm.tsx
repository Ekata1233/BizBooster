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
import { moduleFieldConfig } from "@/utils/moduleFieldConfig";
interface KeyValue {
  key: string;
  value: string;
  icon?: File | null; // ✅ store file instead of string
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
  selectedModuleId: string;
   fieldsConfig?: typeof moduleFieldConfig["Franchise"]["basicDetails"];
}

const IMAGE_MAX_SIZE_MB = 1;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const isBrowser = typeof window !== "undefined" && typeof File !== "undefined";

// Add this validation function
const validateImage = (file: any): { isValid: boolean; error?: string } => {
  if (!isBrowser ) {
    return { isValid: true };
  }


  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Image must be ${IMAGE_MAX_SIZE_MB}MB or less. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  return { isValid: true };
};

const BasicDetailsForm = ({ data, setData, selectedModuleId ,fieldsConfig }: BasicDetailsFormProps) => {
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const [rows, setRows] = useState<KeyValue[]>(data.keyValues || []);
  const [tagInput, setTagInput] = useState("");
const [errors, setErrors] = useState<{ serviceName?: string; category?: string }>({});
const [imageErrors, setImageErrors] = useState<{
  thumbnail?: string;
  banner?: string;
  keyValueIcons?: { [key: number]: string };
}>({});


 useEffect(() => {
  if (
    data.keyValues &&
    (data.keyValues.length !== rows.length ||
      data.keyValues.some(
        (row, i) =>
          row.key !== rows[i]?.key ||
          row.value !== rows[i]?.value
      ))
  ) {
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
const handleAddRow = () => {
  const updated = [...rows, { key: "", value: "", icon: null }];
  setRows(updated);
  setData({ keyValues: updated });
};

// REPLACE the existing handleRemoveRow function with this:
const handleRemoveRow = (index: number) => {
  const updated = rows.filter((_, i) => i !== index);
  setRows(updated);
  setData({ keyValues: updated });
  
  // Clear the error for this row if it exists
  if (imageErrors.keyValueIcons?.[index]) {
    setImageErrors(prev => {
      const newKeyValueIcons = { ...prev.keyValueIcons };
      delete newKeyValueIcons[index];
      // Re-index the errors after deletion
      const reindexed: { [key: number]: string } = {};
      Object.keys(newKeyValueIcons).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newKeyValueIcons[key]!;
        } else {
          reindexed[numKey] = newKeyValueIcons[key]!;
        }
      });
      return { ...prev, keyValueIcons: reindexed };
    });
  }
};
// REPLACE the existing handleRowChange function with this:
const handleRowChange = (
  index: number,
  field: keyof KeyValue,
  value: string | File | null
) => {
  // Special handling for icon file validation
  if (field === 'icon' && isBrowser) {

    const { isValid, error } = validateImage(value);
    if (!isValid) {
      setImageErrors(prev => ({
        ...prev,
        keyValueIcons: {
          ...prev.keyValueIcons,
          [index]: error
        }
      }));
      // Don't update the row if invalid
      return;
    } else {
      // Clear error if valid
      setImageErrors(prev => {
        const newKeyValueIcons = { ...prev.keyValueIcons };
        delete newKeyValueIcons[index];
        return { ...prev, keyValueIcons: newKeyValueIcons };
      });
    }
  }

  // Update the row
  const updated = [...rows];
  updated[index][field] = value;
  setRows(updated);
  setData({ keyValues: updated });
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
const filteredCategories = categories.filter(
  (cat) => cat.module?._id === selectedModuleId
);
  const categoryOptions = filteredCategories.map(cat => ({ value: cat._id, label: cat.name, image: cat.image || "" }));
  const filteredSubcategories = data.category ? subcategories.filter(s => s.category?._id === data.category) : [];
  const subcategoryOptions = filteredSubcategories.map(subcat => ({ value: subcat._id, label: subcat.name, image: subcat.image || "" }));

  // File handling
  // REPLACE the existing handleThumbnailChange function with this:
const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  
  if (isBrowser ) {

    const { isValid, error } = validateImage(file);
    if (!isValid) {
      setImageErrors(prev => ({ ...prev, thumbnail: error }));
      setData({ thumbnailImage: null });
      // Clear the file input
      e.target.value = '';
      return;
    }
    setImageErrors(prev => ({ ...prev, thumbnail: undefined }));
    setData({ thumbnailImage: file });
  } else {
    setImageErrors(prev => ({ ...prev, thumbnail: undefined }));
    setData({ thumbnailImage: null });
  }
};

// REPLACE the existing handleBannerChange function with this:
const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  
  if (files && files.length > 0) {
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    // Validate each file
    Array.from(files).forEach((file,index) => {
  if (!isBrowser ) return;
  const { isValid, error } = validateImage(file);

      if (!isValid) {
        errors.push(`File ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setImageErrors(prev => ({ 
        ...prev, 
        banner: errors.join(' | ') 
      }));
    } else {
      setImageErrors(prev => ({ ...prev, banner: undefined }));
    }

    // Only set valid files
    if (validFiles.length > 0) {
      setData({ bannerImages: validFiles });
    } else {
      setData({ bannerImages: null });
    }
  } else {
    setImageErrors(prev => ({ ...prev, banner: undefined }));
    setData({ bannerImages: null });
  }
};

  return (
    <div>
      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 text-center my-4">Basic Details</h4>

        
       
        
           {fieldsConfig?.serviceName && (
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
)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
<div className="space-y-4">
  {fieldsConfig?.category && (
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
          )}

{fieldsConfig?.thumbnail && (
  <div>
    <Label>Thumbnail</Label>
    <FileInput 
      onChange={handleThumbnailChange} 
      accept="image/*"
    />
    {imageErrors.thumbnail && (
      <p className="text-red-500 text-sm mt-1 p-2 bg-red-50 rounded border border-red-200">{imageErrors.thumbnail}</p>
    )}
    {/* {data.thumbnailImage && !imageErrors.thumbnail && (
      <p className="text-green-600 text-xs mt-1">
        ✓ Valid: {(data.thumbnailImage.size / (1024 * 1024)).toFixed(2)}MB
      </p>
    )} */}
    <p className="text-xs text-gray-500 mt-1">
      Max size: {IMAGE_MAX_SIZE_MB}MB | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
    </p>
  </div>
)}

 {fieldsConfig?.tags && (
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
           )}

             {fieldsConfig?.recomnded && (
          <div>
            <Label>Recommended Service</Label>
            <Switch
              checked={!!data.recommendedServices}
              onChange={(val) => setData({ recommendedServices: val })}
              label="Recommended Service"
            />
          </div>
           )}

 {fieldsConfig?.price && (
            <div className="border p-3 rounded-md">
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
          </div></div>
 )}


        </div>


        {/* RIGHT SIDE */}
        <div className="space-y-4">
          

 {fieldsConfig?.subcategory && (
          <div>
            <Label>Select Subcategory</Label>
            <Select
              options={subcategoryOptions}
              value={data.subcategory || ""}
              onChange={(val) => setData({ subcategory: val || null })}
            />
          </div>
 )}



{fieldsConfig?.bannerImage && (
  <div>
    <Label>Banner Images</Label>
    <FileInput 
      multiple 
      onChange={handleBannerChange} 
      accept="image/*"
    />
    {imageErrors.banner && (
      <p className="text-red-500 text-sm mt-1 p-2 bg-red-50 rounded border border-red-200">{imageErrors.banner}</p>
    )}
    {/* {data.bannerImages && !imageErrors.banner && (
      <p className="text-green-600 text-xs mt-1">
        ✓ {data.bannerImages.length} valid image(s) selected
      </p>
    )} */}
    <p className="text-xs text-gray-500 mt-1">
      Max {IMAGE_MAX_SIZE_MB}MB per image | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
    </p>
  </div>
)}

          

{fieldsConfig?.keyValue && (
  <div>
    <Label>Key - Value</Label>
    
    {rows.map((row, index) => (
      <div key={index} className="border rounded p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Row {index + 1}</h3>
          <button 
            type="button" 
            onClick={() => handleRemoveRow(index)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashBinIcon />
          </button>
        </div>
        
        {/* First Row: Key and Value Inputs */}
        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Key"
              value={row.key}
              onChange={(e) => handleRowChange(index, "key", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Value"
              value={row.value}
              onChange={(e) => handleRowChange(index, "value", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Second Row: Icon File Input */}
        <div className="mt-3">
          <Label htmlFor={`icon-${index}`} className="text-sm mb-2 block">
            Icon Image
          </Label>
          
          {/* Using the same FileInput component */}
          <FileInput
            id={`icon-${index}`}
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              handleRowChange(index, "icon", file);
            }}
            className="w-full"
          />
          
          <p className="text-xs text-gray-500 mb-3 mt-1">
            Max icon size: {IMAGE_MAX_SIZE_MB}MB | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
          </p>
          
          {/* Error Message */}
          {imageErrors.keyValueIcons?.[index] && (
             <p className="text-red-500 text-sm mt-1 p-2 bg-red-50 rounded border border-red-200">
              {imageErrors.keyValueIcons[index]}
            </p>
          )}
          
          {/* Success Message */}
          {/* {row.icon && !imageErrors.keyValueIcons?.[index] && (
            <div className="mt-2">
              <p className="text-green-600 text-xs">
                ✓ Valid: {row.icon ? 
                  `${row.icon.name} (${(row.icon.size / (1024 * 1024)).toFixed(2)}MB)` : 
                  'File uploaded'}
              </p>
            </div>
          )} */}
        </div>
      </div>
    ))}
    
    <button 
      type="button" 
      onClick={handleAddRow} 
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      + Add New Row
    </button>
  </div>
)}

 {fieldsConfig?.gst && (
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
           )}

        </div>
      </div>
    </div>
  );
};

export default BasicDetailsForm;
