"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";

import { useCategoryBanner } from "@/context/CategoryBannerContext";
import { useModule } from "@/context/ModuleContext";

const EditCategoryBannerPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { banners, fetchBanners, updateBanner } = useCategoryBanner();
  const { modules } = useModule();

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Banner Data ---------------- */
  useEffect(() => {
    if (id && banners.length > 0) {
      const banner = banners.find((b) => b._id === id);
      if (banner) {
        setSelectedModuleId(banner.module?._id || "");
        setExistingImageUrl(banner.image || null);
      }
    }
  }, [id, banners]);

  /* ---------------- Handle File Change ---------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  /* ---------------- Handle Update ---------------- */
  const handleUpdate = async () => {
    if (!id || !selectedModuleId) {
      alert("Please select a module.");
      return;
    }

    const formData = new FormData();
    formData.append("module", selectedModuleId);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      setLoading(true);
      await updateBanner(id, formData);
      alert("Category banner updated successfully!");
      fetchBanners(); // refresh list
      router.push("/category-management/category/category-banner");
    } catch (err) {
      console.error("Error updating banner:", err);
      alert("Failed to update banner.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Category Banner
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Selection */}
        <div>
          <Label>Select Module</Label>
          <div className="relative">
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Module</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod._id}>
                  {mod.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Banner Image */}
        <div>
          <Label>Banner Image</Label>
          <FileInput onChange={handleFileChange} />
          {(selectedFile || existingImageUrl) && (
            <div className="mt-2">
              <Image
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : existingImageUrl || ""
                }
                width={100}
                height={100}
                alt="Banner Preview"
                className="w-24 h-24 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <Button
          variant="outline"
          onClick={() => router.push("/category-management/category-banner")}
        >
          Cancel
        </Button>
        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditCategoryBannerPage;
