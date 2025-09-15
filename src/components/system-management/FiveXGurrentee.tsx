

// "use client";
// import React, { useState, useEffect } from "react";

// function FiveXGurrentee() {
//   const [months, setMonths] = useState("");
//   const [leadcount, setLeadcount] = useState("");
//   const [fixearning, setFixearning] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch("/api/fivex");
//         const data = await res.json();
//         if (data && data.length > 0) {
//           const item = data[0]; // first object in the array
//           setMonths(item.months?.toString() ?? "");
//           setLeadcount(item.leadcount?.toString() ?? "");
//           setFixearning(item.fixearning?.toString() ?? "");
//         }
//       } catch (err) {
//         console.error("Error fetching FiveXGuarantee:", err);
//       }
//     };
//     fetchData();
//   }, []);


//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/fivex", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           months: Number(months) || 0,
//           leadcount: Number(leadcount) || 0,
//           fixearning: Number(fixearning) || 0,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to save");

//       const result = await res.json();
//       setLeadcount(result.leadcount?.toString() ?? "");
//       setFixearning(result.fixearning?.toString() ?? "");

//       alert("Saved successfully ✅");
//     } catch (err) {
//       console.error(err);
//       alert("Error saving ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-4 w-full mx-auto">
//       <h2 className="text-xl font-semibold mb-6">FiveX Guarantee Setup</h2>

//       {/* Fix Months */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Fix Months
//         </label>
//         <input
//           type="number"
//           value={months}
//           onChange={(e) => setMonths(e.target.value)}
//           placeholder="Enter Fix Months"
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//       </div>

//       {/* Lead Count */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Lead Count
//         </label>
//         <input
//           type="number"
//           value={leadcount}
//           onChange={(e) => setLeadcount(e.target.value)}
//           placeholder="Enter lead count"
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//       </div>

//       {/* Fix Earning */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Fix Earning
//         </label>
//         <input
//           type="number"
//           value={fixearning}
//           onChange={(e) => setFixearning(e.target.value)}
//           placeholder="Enter fix earning"
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//       </div>

//       {/* Save Button */}
//       <button
//         onClick={handleSave}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
//       >
//         {loading ? "Saving..." : "Save"}
//       </button>
//     </div>
//   );
// }

// export default FiveXGurrentee;


"use client";
import React, { useState, useEffect } from "react";

function FiveXGurrentee() {
  const [months, setMonths] = useState("");
  const [leadcount, setLeadcount] = useState("");
  const [fixearning, setFixearning] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch data function
  const fetchData = async () => {
    try {
      const res = await fetch("/api/fivex");
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0]; // first object in the array
        setMonths(item.months?.toString() ?? "");
        setLeadcount(item.leadcount?.toString() ?? "");
        setFixearning(item.fixearning?.toString() ?? "");
      }
    } catch (err) {
      console.error("Error fetching FiveXGuarantee:", err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Save data
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fivex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          months: Number(months) || 0,
          leadcount: Number(leadcount) || 0,
          fixearning: Number(fixearning) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      alert("Saved successfully ✅");

      // ✅ Refetch latest data after saving
      await fetchData();
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

      {/* Fix Months */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fix Months
        </label>
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Enter Fix Months"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Lead Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Count
        </label>
        <input
          type="number"
          value={leadcount}
          onChange={(e) => setLeadcount(e.target.value)}
          placeholder="Enter lead count"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Fix Earning */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fix Earning
        </label>
        <input
          type="number"
          value={fixearning}
          onChange={(e) => setFixearning(e.target.value)}
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
