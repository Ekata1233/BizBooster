"use client";

import React, { useCallback, useEffect, useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import Switch from "../form/switch/Switch";
import { TrashBinIcon } from "@/icons";
import { useCategory } from "@/context/CategoryContext";
import { useSubcategory } from "@/context/SubcategoryContext";
import Image from "next/image";
import { moduleFieldConfig } from "@/utils/moduleFieldConfig";
interface KeyValue {
  key: string;
  value: string;
  icon?: File | null; // ✅ store file instead of string
}

interface BasicUpdateFormProps {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  //  onModuleSelect?: (moduleName: string) => void;
  fieldsConfig?: typeof moduleFieldConfig["Franchise"]["basicDetails"];
}
// Add these constants after your imports, before the interface definitions
const IMAGE_MAX_SIZE_MB = 1;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Add this validation function
const validateImage = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Image must be ${IMAGE_MAX_SIZE_MB}MB or less. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  return { isValid: true };
};
const BasicUpdateForm: React.FC<BasicUpdateFormProps> = ({ data, setData ,fieldsConfig }) => {
  if (!data) return null;
  

    const { categories } = useCategory();
    const { subcategories } = useSubcategory();

const categoryOptions = categories.map(cat => ({
  value: cat._id,
  label: cat.name,
  image: cat.image || "",
}));

  const filteredSubcategories = data.category ? subcategories.filter(s => s.category?._id === data.category) : [];
  const subcategoryOptions = filteredSubcategories.map(subcat => ({ value: subcat._id, label: subcat.name, image: subcat.image || "" }));

  const [rows, setRows] = useState(data.keyValues || []);
// Inside the BasicUpdateForm component, add this state:
const [imageErrors, setImageErrors] = useState<{
  thumbnail?: string;
  banner?: string;
  keyValueIcons?: { [key: number]: string };
}>({});
    console.log("rows of key value : ", rows);


    useEffect(() => {
      if (data.keyValues && JSON.stringify(data.keyValues) !== JSON.stringify(rows)) {
        setRows(data.keyValues);
      }
    }, [data.keyValues]);

    useEffect(() => {
  setData((prev: any) => ({
    ...prev,
    keyValues: rows,
  }));
}, [rows]);
// Add this useEffect for cleanup when component unmounts
useEffect(() => {
  return () => {
    // Cleanup blob URLs
    if (data.thumbnailImage?.startsWith('blob:')) {
      URL.revokeObjectURL(data.thumbnailImage);
    }
    
    data.bannerImages?.forEach((img: string) => {
      if (img?.startsWith('blob:')) {
        URL.revokeObjectURL(img);
      }
    });
    
    rows.forEach(row => {
      if (row.icon && typeof row.icon === 'string') {
        URL.revokeObjectURL(row.icon);
      }
    });
  };
}, [data.thumbnailImage, data.bannerImages, rows]);
    // const handleThumbnailUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    //   const file = e.target.files?.[0];
    //   if (!file) return;
  
    //   // Create blob URL for preview
    //   const url = URL.createObjectURL(file);
      
    //   // Update parent data with blob URL
    //   setData((prev: any) => ({
    //     ...prev,
    //     thumbnailImage: url,
    //     thumbnailFile: file // Optionally store the file object for later upload
    //   }));
    // }, [setData]);

const handleThumbnailUpload = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const { isValid, error } = validateImage(file);
    if (!isValid) {
      setImageErrors(prev => ({ ...prev, thumbnail: error }));
      e.target.value = ''; // Clear the input
      return;
    }

    // Clear error if valid
    setImageErrors(prev => ({ ...prev, thumbnail: undefined }));

    const previewUrl = URL.createObjectURL(file);

    setData((prev: any) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailImage: previewUrl,
    }));
  },
  [setData]
);

  
    // Handle banner images upload
const handleBannerImagesUpload = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const previewUrls: string[] = [];
    const errors: string[] = [];

    // Validate each file
    Array.from(files).forEach((file, index) => {
      const { isValid, error } = validateImage(file);
      if (!isValid) {
        errors.push(`File ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
        previewUrls.push(URL.createObjectURL(file));
      }
    });

    // Set error message if any
    if (errors.length > 0) {
      setImageErrors(prev => ({
        ...prev,
        banner: errors.join(' | ')
      }));
    } else {
      setImageErrors(prev => ({ ...prev, banner: undefined }));
    }

    // Only add valid files
    if (validFiles.length > 0) {
      setData((prev: any) => ({
        ...prev,
        bannerFiles: [...(prev.bannerFiles || []), ...validFiles],
        bannerImages: [...(prev.bannerImages || []), ...previewUrls],
      }));
    }

    // Clear the input to allow re-uploading
    e.target.value = '';
  },
  [setData]
);


    const removeBannerImage = useCallback((index: number) => {
      setData((prev: any) => {
        const currentImages = prev.bannerImages || [];
        const currentFiles = prev.bannerFiles || [];
        
        // Revoke blob URL to prevent memory leak
        if (currentImages[index]?.startsWith('blob:')) {
          URL.revokeObjectURL(currentImages[index]);
        }
        
        return {
          ...prev,
          bannerImages: currentImages.filter((_: string, i: number) => i !== index),
          bannerFiles: currentFiles.filter((_: File, i: number) => i !== index)
        };
      });
    }, [setData]);
  
    // Remove thumbnail image
    const removeThumbnailImage = useCallback(() => {
      setData((prev: any) => {
        // Revoke blob URL to prevent memory leak
        if (prev.thumbnailImage?.startsWith('blob:')) {
          URL.revokeObjectURL(prev.thumbnailImage);
        }
        
        return {
          ...prev,
          thumbnailImage: null,
          thumbnailFile: null
        };
      });
    }, [setData]);


  const handleAddRow = () => setRows([...rows, { key: "", value: "" }]);
const handleRemoveRow = (index: number) => {
  // If there's an icon with preview URL, revoke it
  if (rows[index]?.icon && typeof rows[index].icon === 'string') {
    URL.revokeObjectURL(rows[index].icon);
  }
  
  const updatedRows = rows.filter((_, i) => i !== index);
  setRows(updatedRows);
  
  // Clear error for this row if exists
  if (imageErrors.keyValueIcons?.[index]) {
    setImageErrors(prev => {
      const newKeyValueIcons = { ...prev.keyValueIcons };
      delete newKeyValueIcons[index];
      
      // Re-index errors
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
const handleRowChange = (index: number, field: keyof KeyValue, value: string | File | null) => {
  // Special handling for icon file validation
  if (field === 'icon' && value instanceof File) {
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

  const updated = [...rows];
  updated[index][field] = value;
  setRows(updated);
};


  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (!value) return;

      setData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), value],
      }));

      e.currentTarget.value = "";
    }
  };

  const removeTag = (index: number) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_: string, i: number) => i !== index),
    }));
  };

  /* ---------------- GST CALC ---------------- */

  const gstAmount =
    data.includeGst && data.gst
      ? (data.discountedPrice * data.gst) / 100
      : 0;

  const totalWithGst = data.discountedPrice > 0 ?data.discountedPrice + gstAmount : 0;
  

  /* ---------------- RENDER ---------------- */

  return (
    <div>
      <h4 className="text-xl font-bold text-center my-4">Basic Details</h4>

      {/* Service Name */}
        {fieldsConfig?.serviceName && (
      <div className="mb-4">
        <Label>Service Name</Label>
        <Input
          value={data.serviceName || ""}
          onChange={(e) =>
            setData((prev) => ({ ...prev, serviceName: e.target.value }))
          }
          placeholder="Service name"
        />
      </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Category */}
          {fieldsConfig?.category && (
          <div>
            <Label>Select Category</Label>
           <Select
  options={categoryOptions}
  value={data.category || ""}
  onChange={(val) => {
    setData((prev) => ({
      ...prev,
      category: val || null,
      subcategory: null, // reset subcategory when category changes
    }));
  }}
/>
          </div>
          )}

          {/* Thumbnail */}
        
{fieldsConfig?.thumbnail && (
  <div>
    <Label>Thumbnail</Label>
    <FileInput onChange={handleThumbnailUpload} accept="image/*" />
    
    {/* Error Message */}
    {imageErrors.thumbnail && (
      <p className="text-red-500 text-xs mt-1">{imageErrors.thumbnail}</p>
    )}
    
    {/* Success Message */}
    {data.thumbnailImage && !imageErrors.thumbnail && (
      <p className="text-green-600 text-xs mt-1">
        ✓ Valid: {(data.thumbnailFile?.size / (1024 * 1024)).toFixed(2)}MB
      </p>
    )}
    
    <p className="text-xs text-gray-500 mt-1">
      Max size: {IMAGE_MAX_SIZE_MB}MB | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
    </p>
    
    {data.thumbnailImage && (
      <div className="mt-3 relative w-40 h-40">
        <Image
          src={data.thumbnailImage}
          alt="Thumbnail Preview"
          fill
          className="object-cover rounded border"
          sizes="160px"
          priority={false}
        />
        <button
          type="button"
          onClick={removeThumbnailImage}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      </div>
    )}
  </div>
)} 

          {/* Tags */}
          {fieldsConfig?.tags && (
          <div>
            <Label>Tags</Label>
            <div className="border rounded px-3 py-2 flex flex-wrap gap-2">
              {(data.tags || []).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeTag(i)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="flex-grow outline-none"
                placeholder="Press Enter to add"
                onKeyDown={handleTagAdd}
              />
            </div>
          </div>
          )}

          {/* Recommended */}
          {fieldsConfig?.recomnded && (
          <div>
            <Label>Recommended Service</Label>
            <Switch
              checked={Boolean(data.recommendedServices)}
              onChange={(checked) =>
                setData((prev) => ({ ...prev, recommendedServices: checked }))
              }
              label="Recommended"
            />
          </div>
          )}

          {/* Price Section */}
          {fieldsConfig?.price && (
          <div className="border p-3 rounded space-y-3">
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={data.price || 0}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setData((prev) => ({
                    ...prev,
                    price,
                    discountedPrice: price - (price * prev.discount) / 100,
                  }));
                }}
              />
            </div>

            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                value={data.discount || 0}
                onChange={(e) => {
                  const discount = Number(e.target.value);
                  setData((prev) => ({
                    ...prev,
                    discount,
                    discountedPrice: prev.price - (prev.price * discount) / 100,
                  }));
                }}
              />
            </div>

            <div>
              <Label>After Discount Price</Label>
              <Input value={data.discountedPrice || 0} readOnly />
            </div>
          </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Subcategory */}
          {fieldsConfig?.subcategory && (
          <div>
            <Label>Select Subcategory</Label>
            <Select
              options={subcategoryOptions}
              value={data.subcategory || ""}
              onChange={(val) =>
                setData((prev) => ({
                  ...prev,
                  subcategory: val || null,
                }))
              }
            />
          </div>
          )}

          {/* Banner Images */}
{fieldsConfig?.bannerImage && (
  <div>
    <Label>Banner Images</Label>
    <FileInput multiple onChange={handleBannerImagesUpload} accept="image/*" />
    
    {/* Error Message */}
    {imageErrors.banner && (
      <p className="text-red-500 text-xs mt-1">{imageErrors.banner}</p>
    )}
    
    {/* Success Message */}
    {data.bannerImages?.length > 0 && !imageErrors.banner && (
      <p className="text-green-600 text-xs mt-1">
        ✓ {data.bannerImages.length} valid image(s) selected
      </p>
    )}
    
    <p className="text-xs text-gray-500 mt-1">
      Max {IMAGE_MAX_SIZE_MB}MB per image | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
    </p>
    
    {data.bannerImages?.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {data.bannerImages.map((img: string, index: number) => (
          <div key={index} className="relative w-full h-32 group">
            <Image
              src={img}
              alt={`Banner Image ${index + 1}`}
              fill
              className="object-cover rounded border"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={false}
            />
            <button
              type="button"
              onClick={() => removeBannerImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}

          {/* Key Values */}
{fieldsConfig?.keyValue && (
  <div>
    <Label>Key - Value</Label>
    <p className="text-xs text-gray-500 mb-3">
      Max icon size: {IMAGE_MAX_SIZE_MB}MB | Supported: {ALLOWED_IMAGE_TYPES.join(', ')}
    </p>
    
    {rows.map((row, index) => (
      <div key={index} className="border rounded p-3 mb-3">
        <div className="flex justify-between">
          <h3 className="font-medium">Row {index + 1}</h3>
          <button type="button" onClick={() => handleRemoveRow(index)}>
            <TrashBinIcon />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-3">
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
          
          <div className="col-span-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0] || null;
                handleRowChange(index, "icon", file);
                e.target.value = ''; // Clear input
              }}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Error Message */}
            {imageErrors.keyValueIcons?.[index] && (
              <p className="text-red-500 text-xs mt-1">
                {imageErrors.keyValueIcons[index]}
              </p>
            )}
            
            {/* Success Message */}
            {row.icon && !imageErrors.keyValueIcons?.[index] && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Valid: {row.icon instanceof File ? 
                  `${(row.icon.size / (1024 * 1024)).toFixed(2)}MB` : 
                  'File uploaded'}
              </p>
            )}
            
            {row.icon && (
              <div className="flex gap-3 mt-3 flex-wrap">
                <div className="w-24 h-24 relative group">
                  <Image
                    src={typeof row.icon === 'string' ? row.icon : URL.createObjectURL(row.icon)}
                    alt="icon"
                    fill
                    className="rounded-lg object-cover"
                    sizes="96px"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    onClick={() => {
                      if (typeof row.icon === 'string') {
                        URL.revokeObjectURL(row.icon);
                      }
                      handleRowChange(index, "icon", null);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
    
    <button type="button" onClick={handleAddRow} className="bg-blue-500 text-white px-4 py-2 rounded">
      + Add New Row
    </button>
  </div>
)}

          {/* GST */}
          {fieldsConfig?.gst && (
          <div className="border p-3 rounded space-y-3">
            <div className="flex justify-between">
              <Label>Include GST</Label>
              <Switch
                checked={Boolean(data.includeGst)}
                onChange={(checked) =>
                  setData((prev) => ({ ...prev, includeGst: checked }))
                }
                label="Enable GST"
              />
            </div>

            <div>
              <Label>GST (%)</Label>
              <Input
                type="number"
                value={data.gst || 0}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, gst: Number(e.target.value) }))
                }
              />
            </div>

            <div>
              <Label>GST in Rupees</Label>
              <Input value={gstAmount} readOnly />
            </div>

            <div>
              <Label>Total with GST</Label>
              <Input value={totalWithGst} readOnly />
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicUpdateForm;
