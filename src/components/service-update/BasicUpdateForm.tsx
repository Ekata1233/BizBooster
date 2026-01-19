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

    const previewUrl = URL.createObjectURL(file);

    setData((prev: any) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailImage: previewUrl, // 👈 always use this for preview
    }));
  },
  [setData]
);

  
    // Handle banner images upload
const handleBannerImagesUpload = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previewUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    setData((prev: any) => ({
      ...prev,
      bannerFiles: [...(prev.bannerFiles || []), ...Array.from(files)],
      bannerImages: [...(prev.bannerImages || []), ...previewUrls], // 👈 preview source
    }));
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
  const handleRemoveRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
  const handleRowChange = (index: number, field: keyof KeyValue, value: string | File | null) => {
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
            <FileInput  onChange={handleThumbnailUpload} />
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
            <FileInput multiple  onChange={handleBannerImagesUpload} />
            {data.bannerImages?.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
    {data.bannerImages.map((img: string, index: number) => (
      <div
        key={index}
        className="relative w-full h-32"
      >
        <Image
          src={img}
          alt={`Banner Image ${index + 1}`}
          fill
          className="object-cover rounded border"
          sizes="(max-width: 768px) 50vw, 33vw"
          priority={false}
        />

        {/* Optional remove button */}
        <button
                      type="button"
                      onClick={() => removeBannerImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                    }}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                   {row.icon && (
    <div className="flex gap-3 mt-3 flex-wrap">
      <div className="w-24 h-24 relative group">
        <Image
          src={row.icon}
          alt="icon"
          fill
          className="rounded-lg object-cover"
          sizes="96px"
        />

        <button
          type="button"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            URL.revokeObjectURL(row.icon!.preview);
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
