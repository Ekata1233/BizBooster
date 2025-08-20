"use client";
import React, { useState, useEffect } from "react";

function FiveXGurrentee() {
  const [leadcount, setLeadcount] = useState<number | "">("");
  const [fixearning, setFixearning] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  // Fetch existing data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fivex");
        const data = await res.json();
        if (data && data.leadcount !== undefined) {
          setLeadcount(data.leadcount);
          setFixearning(data.fixearning);
        }
      } catch (err) {
        console.error("Error fetching FiveXGuarantee:", err);
      }
    };
    fetchData();
  }, []);

  // Save (upsert) data
  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/fivex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadcount: Number(leadcount),
          fixearning: Number(fixearning),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      const result = await res.json();
      setLeadcount(result.leadcount);
      setFixearning(result.fixearning);

      // ✅ Show success alert
      alert("Saved successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error saving ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full mx-auto">
      <h2 className="text-xl font-semibold mb-6">FiveX Guarantee Setup</h2>

      {/* Leadcount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Count
        </label>
        <input
          type="number"
          value={leadcount}
          onChange={(e) => setLeadcount(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter lead count"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Fix Earning Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fix Earning
        </label>
        <input
          type="number"
          value={fixearning}
          onChange={(e) => setFixearning(e.target.value ? Number(e.target.value) : "")}
          placeholder="Enter fix earning"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default FiveXGurrentee;
