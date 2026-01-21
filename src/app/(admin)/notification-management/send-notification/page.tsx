


"use client"
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useCategory } from "@/context/CategoryContext";
import { useService } from "@/context/ServiceContext";
import { useSubcategory } from "@/context/SubcategoryContext";
import { useUserContext } from "@/context/UserContext";
import React, { useState } from "react";

const Page = () => {
    const { users = [], error } = useUserContext();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [mode, setMode] = useState<"single" | "multiple" | "all">("single");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const { categories } = useCategory();
    const { subcategories } = useSubcategory();
    const { services } = useService();

    // new states
    const [targetType, setTargetType] = useState<"category" | "subcategory" | "service">("category");
    const [selectedTarget, setSelectedTarget] = useState<string>("");

    // filters
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterSubcategory, setFilterSubcategory] = useState<string>("");

    // file input
    const [file, setFile] = useState<File | null>(null);

    if (error) return <p className="text-red-500">{error}</p>;
    if (!users) return;

    // const sendNotification = async () => {
    //     setLoading(true);
    //     setResponse(null);

    //     try {
    //         let url = "";
    //         let payload: any = { title, body };

    //         if (mode === "single") {
    //             const user = users.find((u: any) => u._id === selectedUser);
    //             payload.tokens = user?.fcmTokens || [];
    //             url = "/api/notifications/single-user";
    //         } else if (mode === "multiple") {
    //             const selected = users.filter((u: any) => selectedUsers.includes(u._id));
    //             payload.tokens = selected.flatMap((u: any) => u.fcmTokens || []);
    //             url = "/api/notifications";
    //         } else {
    //             url = "/api/notifications/all-users";
    //         }

    //         // add target selection
    //         payload.targetType = targetType;
    //         payload.targetId = selectedTarget || null;

    //         // file handling (just logging for now)
    //         if (file) {
    //             console.log("File selected:", file.name);
    //         }

    //         console.log("Mode:", mode);
    //         console.log("Target Type:", targetType);
    //         console.log("Selected Target:", selectedTarget);
    //         console.log("Filter Category:", filterCategory);
    //         console.log("Filter Subcategory:", filterSubcategory);

    //         const res = await fetch(url, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(payload),
    //         });
    //         const data = await res.json();
    //         setResponse(data);
    //     } catch (error: any) {
    //         setResponse({ error: error.message });
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const sendNotification = async () => {
        setLoading(true);
        setResponse(null);

        try {
            let url = "";
            let formData = new FormData();

            // Common fields
            formData.append("title", title);
            formData.append("body", body);

            if (mode === "single") {
                const user = users.find((u: any) => u._id === selectedUser);
                formData.append("tokens", JSON.stringify(user?.fcmTokens || []));
                url = "/api/notifications/single-user";
            } else if (mode === "multiple") {
                const selected = users.filter((u: any) => selectedUsers.includes(u._id));
                formData.append("tokens", JSON.stringify(selected.flatMap((u: any) => u.fcmTokens || [])));
                url = "/api/notifications";
            } else {
                url = "/api/notifications/all-users";
            }

            // add target selection
            formData.append("targetType", targetType);
            formData.append("targetId", selectedTarget || "");

            // file handling
            if (file) {
                formData.append("file", file); // 👈 send actual file
            }

            const res = await fetch(url, {
                method: "POST",
                body: formData, // 👈 send FormData, no headers
            });

            const data = await res.json();
            setResponse(data);
        } catch (error: any) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    // filtered lists
    const filteredSubcategories =
        targetType === "subcategory" && filterCategory
            ? subcategories.filter(
                (sub: any) => sub.category?._id === filterCategory
            )
            : subcategories;


    const filteredServices =
        targetType === "service"
            ? services.filter((srv: any) => {
                if (filterSubcategory) {
                    return srv.subcategory?._id === filterSubcategory;
                } else if (filterCategory) {
                    return srv.category?._id === filterCategory;
                }
                return true;
            })
            : services;


    return (
        <div>
            <PageBreadcrumb pageTitle="Send Notification" />
            <div className="space-y-6">
                <ComponentCard title="Send Notification">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter notification title"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-sm font-medium">Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter notification body"
                            />
                        </div>

                        {/* File Input */}
                        <div>
                            <label className="block text-sm font-medium">Attach File</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Dropdown Mode */}
                        <div>
                            <label className="block text-sm font-medium">Send To</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as "single" | "multiple" | "all")}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="single">Single User</option>
                                <option value="multiple">Multiple Users</option>
                                <option value="all">All Users</option>
                            </select>
                        </div>

                        {/* Conditional Inputs */}
                        {mode === "single" && (
                            <div>
                                <label className="block text-sm font-medium">Select User</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2"
                                >
                                    <option value="">--Select User--</option>
                                    {users?.map((user: any) => (
                                        <option key={user._id} value={user._id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {mode === "multiple" && (
                            <div>
                                <label className="block text-sm font-medium">Select Users</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                    {users?.map((user: any) => (
                                        <div key={user._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={user._id}
                                                value={user._id}
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (e.target.checked) {
                                                        setSelectedUsers([...selectedUsers, value]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter((id) => id !== value));
                                                    }
                                                }}
                                                className="h-4 w-4"
                                            />
                                            <label htmlFor={user._id} className="text-sm">
                                                {user.fullName} ({user.email})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NEW SECTION: Target Type */}
                        <div>
                            <label className="block text-sm font-medium">Navigate To</label>
                            <div className="flex items-center space-x-4 mt-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="category"
                                        checked={targetType === "category"}
                                        onChange={() => {
                                            setTargetType("category");
                                            setFilterCategory("");
                                            setFilterSubcategory("");
                                            setSelectedTarget("");
                                        }}
                                    />
                                    <span className="text-sm">Category</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="subcategory"
                                        checked={targetType === "subcategory"}
                                        onChange={() => {
                                            setTargetType("subcategory");
                                            setFilterCategory("");
                                            setFilterSubcategory("");
                                            setSelectedTarget("");
                                        }}
                                    />
                                    <span className="text-sm">Subcategory</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="service"
                                        checked={targetType === "service"}
                                        onChange={() => {
                                            setTargetType("service");
                                            setFilterCategory("");
                                            setFilterSubcategory("");
                                            setSelectedTarget("");
                                        }}
                                    />
                                    <span className="text-sm">Service</span>
                                </label>
                            </div>
                        </div>

                        {/* Filters + Dropdown */}
                        {targetType === "category" && (
                            <div>
                                <label className="block text-sm font-medium">Select Category</label>
                                <select
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {targetType === "subcategory" && (
                            <>
                                {/* Category filter */}
                                <div>
                                    <label className="block text-sm font-medium">Filter by Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => {
                                            setFilterCategory(e.target.value);
                                            setSelectedTarget("");
                                        }}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">All Categories</option>
                                        {categories?.map((cat: any) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory dropdown */}
                                <div>
                                    <label className="block text-sm font-medium">Select Subcategory</label>
                                    <select
                                        value={selectedTarget}
                                        onChange={(e) => setSelectedTarget(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">Select Subcategory</option>
                                        {filteredSubcategories?.map((sub: any) => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {targetType === "service" && (
                            <>
                                {/* Category filter */}
                                <div>
                                    <label className="block text-sm font-medium">Filter by Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => {
                                            setFilterCategory(e.target.value);
                                            setFilterSubcategory("");
                                            setSelectedTarget("");
                                        }}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">All Categories</option>
                                        {categories?.map((cat: any) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory filter (optional) */}
                                {filterCategory && (
                                    <div>
                                        <label className="block text-sm font-medium">Filter by Subcategory</label>
                                        <select
                                            value={filterSubcategory}
                                            onChange={(e) => {
                                                setFilterSubcategory(e.target.value);
                                                setSelectedTarget("");
                                            }}
                                            className="w-full border rounded-md px-3 py-2"
                                        >
                                            <option value="">All Subcategories</option>
                                            {subcategories
                                                ?.filter((sub: any) => {
                                                    if (!filterCategory) return true; // show all if no filter
                                                    return sub.category?._id === filterCategory;
                                                })
                                                .map((sub: any) => (
                                                    <option key={sub._id} value={sub._id}>
                                                        {sub.name}
                                                    </option>
                                                ))}

                                        </select>
                                    </div>
                                )}

                                {/* Service dropdown */}
                                <div>
                                    <label className="block text-sm font-medium">Select Service</label>
                                    <select
                                        value={selectedTarget}
                                        onChange={(e) => setSelectedTarget(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">Select Service</option>
                                        {filteredServices?.map((srv: any) => (
                                            <option key={srv._id} value={srv._id}>
                                                {srv.serviceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Button */}
                        <div>
                            <button
                                onClick={sendNotification}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                {loading ? "Sending..." : "Send Notification"}
                            </button>
                        </div>

                    </div>
                </ComponentCard>
            </div>
        </div>
    );
};

export default Page;
