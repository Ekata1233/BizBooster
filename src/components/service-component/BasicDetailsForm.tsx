import React, { useEffect, useState, KeyboardEvent } from 'react'
import Label from '../form/Label'
import Input from '../form/input/InputField'
import Select from '../form/Select'
import { ChevronDownIcon, TrashBinIcon } from '@/icons'
import { useCategory } from '@/context/CategoryContext'
import { useSubcategory } from '@/context/SubcategoryContext'
import FileInput from '../form/input/FileInput'
import Switch from '../form/switch/Switch'

interface BasicDetailsData {
    name?: string;
    category?: string;
    subcategory?: string;
    price?: number;
    discount?: number;
    discountedPrice?: number;
    gst?: number;
    includeGst?: boolean;
    gstInRupees?: number;        // ✅ added
    totalWithGst?: number;
    thumbnail?: File | null;
    covers?: FileList | File[] | null;
    tags?: string[];
    keyValues?: KeyValue[];
    recommendedServices?: boolean;
    thumbnailPreview?: string;
    bannerPreviews?: string[];
}

interface KeyValue {
    key: string;
    value: string;
}

interface BasicDetailsFormProps {
    data: BasicDetailsData;
    setData: (newData: Partial<BasicDetailsData>) => void;
}

const BasicDetailsForm = ({ data, setData }: BasicDetailsFormProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMultiFiles, setSelectedMultiFiles] = useState<FileList | File[] | null>(null);
    const [rows, setRows] = useState<KeyValue[]>([]);
    const { categories } = useCategory();
    const { subcategories } = useSubcategory();
    const [gstdata, setGstData] = useState({ gst: 0, includeGst: false });
    console.log("data of basic details form : ", data)

    useEffect(() => {
        if (data) {
            if (data.category) setSelectedCategory(data.category);
            if (data.subcategory) setSelectedSubcategory(data.subcategory);
            if (data.thumbnail instanceof File) setSelectedFile(data.thumbnail);
            if (data.covers instanceof FileList || (Array.isArray(data.covers) && data.covers.length)) {
                setSelectedMultiFiles(data.covers);
            }
            if (Array.isArray(data.keyValues) && rows.length === 0) {
                const keyValueWithId = data.keyValues.map(item => ({
                    key: item.key || '',
                    value: item.value || '',
                }));
                setRows(keyValueWithId);
            }
        }
    }, [data]);
    // 🧮 Auto calculate GST values
    useEffect(() => {
        const discountedPrice = data.discountedPrice || 0;

        console.log("discounted price for the gst : ", discountedPrice);
        const gst = data.gst || 0;

        console.log("gst for th gst : ", gst)

        const gstInRupees = (discountedPrice * gst) / 100;
        console.log("gst for th gst : ", gst)
        const totalWithGst = discountedPrice + gstInRupees;
        console.log("gst for th gst : ", gst)

        setData({
            gstInRupees,
            totalWithGst,
        });
    }, [data.discountedPrice, data.gst]);

    const categoryOptions = categories.map((cat) => ({
        value: cat._id as string,
        label: cat.name,
        image: cat.image || '',
    }));

    const filteredSubcategories = data.category
        ? subcategories.filter((subcat) => subcat.category?._id === data.category)
        : [];

    const subcategoryOptions = filteredSubcategories.map((subcat) => ({
        value: subcat._id as string,
        label: subcat.name,
        image: subcat.image || '',
    }));

    useEffect(() => {
        setSelectedCategory(data.category || '');
    }, [data.category]);

    useEffect(() => {
        setSelectedSubcategory(data.subcategory || '');
    }, [data.subcategory]);

    useEffect(() => {
        if (data.category !== selectedCategory) {
            // setData({ subcategory: '' });
            setSelectedCategory(data.category || '');
        }
    }, [data.category]);


    useEffect(() => {
        setData({ thumbnail: selectedFile });
    }, [selectedFile]);

    useEffect(() => {
        setData({ covers: selectedMultiFiles });
    }, [selectedMultiFiles]);

    useEffect(() => {
        setData({ keyValues: rows });
    }, [rows]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedMultiFiles(files);
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { key: '', value: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        const updatedRows = [...rows];
        updatedRows.splice(index, 1);
        setRows(updatedRows);
    };

    const handleRowChange = (
        index: number,
        field: keyof KeyValue,
        value: string
    ) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const [tagInput, setTagInput] = useState("");

    // Use empty array if undefined
    const tags = data.tags || [];

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault();
            const newTag = tagInput.trim();

            if (!tags.includes(newTag)) {
                setData({ tags: [...tags, newTag] }); // Update the tags array correctly
            }

            setTagInput(""); // Clear input
        }
    };

    const handleRemoveTag = (indexToRemove: number) => {
        const newTags = tags.filter((_, i) => i !== indexToRemove);
        setData({ tags: newTags }); // Update tags array after removal
    };

    const handleSwitchChange = (checked: boolean) => {
        setData({ recommendedServices: checked });
    };

    useEffect(() => {
        const price = data.price ?? 0;
        const discount = data.discount ?? 0;

        // Only calculate if both are present
        if (price && discount >= 0) {
            const discountedPrice = Math.floor(price - (price * discount) / 100);
            setData({
                ...data,
                discountedPrice,
            });
        }
    }, [data.price, data.discount]);


    return (
        <div>
            <h4 className="text-base font-medium text-gray-800 dark:text-white/90 text-center my-4">Basic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Side */}
                <div className="space-y-4">
                    <div>
                        <Label>Service Name</Label>
                        <Input
                            type="text"
                            placeholder="Service name"
                            value={data.name}
                            onChange={(e) => setData({ name: e.target.value })}
                        />
                    </div>

                    

                    <div>
                        <Label>Price</Label>
                        <Input
                            type="number"
                            placeholder="Price"
                            value={data.price}
                            onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                        />
                    </div>

                    <div>
                        <Label>Discount (%)</Label>
                        <Input
                            type="number"
                            placeholder="Discount (%)"
                            value={data.discount || ""}
                            onChange={(e) => setData({ ...data, discount: Number(e.target.value) })}
                        />
                    </div>


                    <div>
                        <Label>After Discount Price</Label>
                        <Input
                            type="number"
                            placeholder="After Discount Price"
                            value={
                                data.price && data.discount
                                    ? Math.floor(data.price - (data.price * data.discount) / 100)
                                    : ""
                            }
                            {...{ readOnly: true }}
                        />
                    </div>
                    {/* GST Section */}
                    <div className="border p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <Label>Include GST</Label>
                            <Switch
                                label="Enable GST"
                                checked={!!data.includeGst}
                                onChange={(val: boolean) => setData({ includeGst: val })}
                            />
                        </div>

                        <p className={`font-medium mb-2 ${data.includeGst ? "text-green-600" : "text-red-600"}`}>
                            {data.includeGst
                                ? "GST Included in Price (Provider Pays GST)"
                                : "GST Not Included (Customer Pays GST)"}
                        </p>

                        <div>
                            <Label>GST (%)</Label>
                            <Input
                                type="number"
                                placeholder="Enter GST %"
                                value={data.gst ?? ""}
                                onChange={(e) => setData({ gst: Number(e.target.value) })}
                            />
                        </div>
                        <div className="mt-3">
                            <Label>GST in Rupees</Label>
                            <Input
                                type="number"
                                value={data.gstInRupees || 0}
                                disabled
                            />
                        </div>

                        {/* <div className="mt-3">
                            <Label>Total with GST</Label>
                            <Input
                                type="number"
                                value={data.totalWithGst || 0}
                                disabled
                            />
                        </div> */}

                    </div>

<div className="mt-4">
  <div className="relative">
    <input
      type="text"
      value="Total with GST"
      disabled
      className="w-full pl-4 pr-28 py-2 bg-green-50 text-green-800 border border-green-300 rounded-xl shadow-sm font-semibold disabled:cursor-not-allowed"
    />
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-800 font-bold">
      ₹ {data.totalWithGst || 0}
    </span>
  </div>
</div>


                </div>

                {/* Right Side */}
                <div className="space-y-3">
                    <div>
                        <Label>Select Category</Label>
                        <div className="relative">
                            <Select
                                options={categoryOptions}
                                placeholder="Categories"
                                value={selectedCategory}
                                onChange={(value: string) => setData({ category: value })}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label>Select Subcategory</Label>
                        <div className="relative">
                            <Select
                                options={subcategoryOptions}
                                placeholder="Subcategories"
                                value={selectedSubcategory}
                                onChange={(value: string) => setData({ subcategory: value })}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label>Thumbnail Image</Label>
                        <FileInput onChange={handleFileChange} className="custom-class" />
                        {selectedFile ? (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Thumbnail Preview"
                                className="mt-2 w-20 h-20 object-cover rounded border"
                            />
                        ) : data.thumbnailPreview ? (
                            <img
                                src={data.thumbnailPreview}
                                alt="Thumbnail Preview"
                                className="mt-2 w-20 h-20 object-cover rounded border"
                            />
                        ) : null}


                    </div>

                    <div>
                        <Label>Cover Images</Label>
                        <FileInput onChange={handleMultipleFileChange} multiple className="custom-class" />
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {selectedMultiFiles &&
                                Array.from(selectedMultiFiles).map((file, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(file)}
                                        alt={`Cover Preview ${index}`}
                                        className="w-42 h-24 object-cover rounded border"
                                    />
                                ))}

                            {!selectedMultiFiles && (data.bannerPreviews ?? []).map((url: string, index: number) => (
                                <img
                                    key={`existing-${index}`}
                                    src={url}
                                    alt={`Existing Cover ${index}`}
                                    className="w-42 h-24 object-cover rounded border"
                                />
                            ))}

                        </div>
                    </div>

                    {/* Tags Input Section */}
                    <div>
                        <Label>Tags</Label>
                        <div className="border rounded rounded-lg px-3 py-1 flex flex-wrap items-center gap-2">
                            {tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(index)}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                        aria-label={`Remove tag ${tag}`}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                className="flex-grow outline-none py-1"
                                placeholder="Type a tag and press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)} // update tagInput string here
                                onKeyDown={handleTagKeyDown}
                            />
                        </div>
                    </div>




                    <div className="my-3">
                        <Label>Enter Key Value</Label>
                        {rows.map((row, index) => (
                            <div key={index} className="mb-3 border pt-3 pb-4 px-4 rounded-lg space-y-3">
                                {/* Header Row */}
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-md font-medium text-gray-700">Key-Value #{index + 1}</h2>
                                    <button
                                        type="button"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleRemoveRow(index)}
                                        aria-label="Remove Key-Value"
                                    >
                                        <TrashBinIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Fields Row: Title + Description */}
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <Label>Key</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter Key"
                                            value={row.key}
                                            onChange={(e) => handleRowChange(index, 'key', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <Label>Value</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter Value"
                                            value={row.value}
                                            onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                        >
                            + Add New Key-Value
                        </button>

                    </div>

                    <div className='py-3'>
                        <Label>Recommended Service</Label>
                        <div className="px-3 py-1 flex flex-wrap items-center gap-2">
                            <Switch
                                label="Recommended"
                                checked={!!data.recommendedServices} // Fallback to false if undefined
                                onChange={handleSwitchChange}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicDetailsForm;