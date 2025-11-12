"use client";

import React, { useEffect, useState } from "react";
import { useReward } from "@/context/RewardContext";

const RewardPage = () => {
  const { rewards, saveReward, deleteReward, loading } = useReward();

  const [selectedTab, setSelectedTab] = useState<"SGP" | "PGP">("SGP");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  // 🟢 Load reward data for selected packageType
  useEffect(() => {
    const existingReward = rewards.find(
      (r) => r.packageType === selectedTab
    );
    if (existingReward) {
      setName(existingReward.name || "");
      setDescription(existingReward.description || "");
      setPreview(existingReward.photo || null);
    } else {
      setName("");
      setDescription("");
      setPreview(null);
    }
    setPhoto(null);
  }, [selectedTab, rewards]);

  // 🟠 Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Please enter a reward name");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("packageType", selectedTab);
    if (photo) formData.append("photo", photo);

    await saveReward(formData);
    alert(`${selectedTab} reward saved successfully!`);
  };

  // 🔴 Handle Delete
  const handleDelete = async () => {
    const existingReward = rewards.find((r) => r.packageType === selectedTab);
    if (!existingReward?._id) {
      alert(`No ${selectedTab} reward to delete`);
      return;
    }

    if (confirm(`Delete ${selectedTab} reward?`)) {
      await deleteReward(existingReward._id);
      alert(`${selectedTab} reward deleted`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🎁 Reward Management
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {(["SGP", "PGP"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`px-5 py-2 rounded-lg font-semibold border transition ${
              selectedTab === tab
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="border rounded-lg p-6 shadow-sm bg-white space-y-5"
      >
        <h2 className="text-xl font-bold text-gray-700">
          {selectedTab} Reward
        </h2>

        {/* Reward Name */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Reward Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter reward name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reward Photo */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Reward Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setPhoto(file);
              setPreview(file ? URL.createObjectURL(file) : preview);
            }}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
          />
          {preview && (
            <img
              src={preview}
              alt="Reward Preview"
              className="w-full h-48 object-cover rounded-lg mt-3"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Reward Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Enter ${selectedTab} reward description`}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : "Save Reward"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
          >
            Delete Reward
          </button>
        </div>
      </form>
    </div>
  );
};

export default RewardPage;
