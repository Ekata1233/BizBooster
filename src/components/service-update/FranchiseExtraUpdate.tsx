// import React, { useEffect, useState } from "react";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";

// /* ---------------- TYPES ---------------- */

// interface FranchiseData {
//   franchiseSize: string;
//   investmentFranchiseSize: string;

//   areaRequired: string;
//   marketing: string;
//   returnOfInvestment: string;
//   manPower: string;
//   staffManagement: string;
//   royaltyPercent: string;
//   grossMargin: string;
//   radiusArea: string;

//   franchiseType: string;
//   city: string;
//   franchiseFee: string;
//   businessLicenses: string;
//   insurance: string;
//   legalAndAccountingFee: string;
//   inventoryFee: string;
//   officeSetup: string;
//   initialStartupEquipmentAndMarketing: string;
//   staffAndManagementTrainingExpense: string;
//   otherExpense: string;
//   totalInvestment: string;
//   gstIncluded: boolean;
//   gst: string;
//   tokenAmount: string;
// }

// /* ---------------- HELPERS ---------------- */

// const getEmptyFranchise = (): FranchiseData => ({
//   franchiseSize: "",
//   investmentFranchiseSize: "",

//   areaRequired: "",
//   marketing: "",
//   returnOfInvestment: "",
//   manPower: "",
//   staffManagement: "",
//   royaltyPercent: "",
//   grossMargin: "",
//   radiusArea: "",

//   franchiseType: "",
//   city: "",
//   franchiseFee: "",
//   businessLicenses: "",
//   insurance: "",
//   legalAndAccountingFee: "",
//   inventoryFee: "",
//   officeSetup: "",
//   initialStartupEquipmentAndMarketing: "",
//   staffAndManagementTrainingExpense: "",
//   otherExpense: "",
//   totalInvestment: "",
//   gstIncluded: false,
//   gst: "",
//   tokenAmount: "",
// });

// /* ---------------- COMPONENT ---------------- */

// function FranchiseExtraUpdate({
// //   serviceId,
//   onSave,
// }: {
// //   serviceId: string;
//   onSave?: () => void;
// }) {
//   const [franchises, setFranchises] = useState<FranchiseData[]>([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const serviceId = "694647700bf8b17c997a9e8c";
//   /* ---------------- FETCH & PREFILL ---------------- */

//   useEffect(() => {
//     if (!serviceId) return;

//     console.log("--------")
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const [investmentRes, modelRes] = await Promise.all([
//           fetch(`/api/service/franchise/investment?serviceId=${serviceId}`),
//           fetch(`/api/service/franchise/model?serviceId=${serviceId}`),
//         ]);

//         const investmentJson = await investmentRes.json();
//         const modelJson = await modelRes.json();

//         const investmentArr = investmentJson?.data?.investment || [];
//         const modelArr = modelJson?.data?.model || [];

//         console.log("investment arra : ", investmentArr)
//         console.log("modelArr arra : ", modelArr)


//         /* ---- MERGE BY franchiseSize ---- */

//         const mergedMap: Record<string, FranchiseData> = {};

//         investmentArr.forEach((inv: any) => {
//           mergedMap[inv.franchiseSize] = {
//             ...getEmptyFranchise(),
//             investmentFranchiseSize: inv.franchiseSize,
//             franchiseType: inv.franchiseType || "",
//             city: inv.city || "",
//             franchiseFee: String(inv.franchiseFee || ""),
//             businessLicenses: String(inv.businessLicenses || ""),
//             insurance: String(inv.insurance || ""),
//             legalAndAccountingFee: String(inv.legalAndAccountingFee || ""),
//             inventoryFee: String(inv.inventoryFee || ""),
//             officeSetup: String(inv.officeSetup || ""),
//             initialStartupEquipmentAndMarketing: String(
//               inv.initialStartupEquipmentAndMarketing || ""
//             ),
//             staffAndManagementTrainingExpense: String(
//               inv.staffAndManagementTrainingExpense || ""
//             ),
//             otherExpense: String(inv.otherExpense || ""),
//             totalInvestment: String(inv.totalInvestment || ""),
//             gstIncluded: Boolean(inv.gstIncluded),
//             gst: String(inv.gst || ""),
//             tokenAmount: String(inv.tokenAmount || ""),
//           };
//         });

//         modelArr.forEach((mod: any) => {
//           const key = mod.franchiseSize;

//           if (!mergedMap[key]) {
//             mergedMap[key] = getEmptyFranchise();
//           }

//           mergedMap[key] = {
//             ...mergedMap[key],
//             franchiseSize: mod.franchiseSize,
//             areaRequired: mod.areaRequired || "",
//             marketing: mod.marketing || "",
//             returnOfInvestment: mod.returnOfInvestment || "",
//             manPower: String(mod.manPower || ""),
//             staffManagement: mod.staffManagement || "",
//             royaltyPercent: mod.royaltyPercent || "",
//             grossMargin: mod.grossMargin || "",
//             radiusArea: mod.radiusArea || "",
//           };
//         });

//         const finalData = Object.values(mergedMap);

//         setFranchises(finalData.length ? finalData : [getEmptyFranchise()]);
//         setActiveIndex(0);
//       } catch (err) {
//         console.error("Failed to load franchise data", err);
//         setFranchises([getEmptyFranchise()]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [serviceId]);

//   /* ---------------- HANDLERS ---------------- */

//   const handleChange = (index: number, e: any) => {
//     const { name, value, type, checked } = e.target;

//     setFranchises(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         [name]: type === "checkbox" ? checked : value,
//       };
//       return updated;
//     });
//   };

//   const addFranchise = () => {
//     setFranchises(prev => [...prev, getEmptyFranchise()]);
//     setActiveIndex(franchises.length);
//   };

//   /* ---------------- SUBMIT (UNCHANGED LOGIC) ---------------- */

//   const handleSubmit = async () => {
//     try {
//       const model = franchises
//         .filter(f => f.franchiseSize)
//         .map(item => ({
//           franchiseSize: item.franchiseSize,
//           areaRequired: item.areaRequired,
//           marketing: item.marketing,
//           returnOfInvestment: item.returnOfInvestment,
//           manPower: Number(item.manPower) || 0,
//           staffManagement: item.staffManagement,
//           royaltyPercent: item.royaltyPercent,
//           grossMargin: item.grossMargin,
//           radiusArea: item.radiusArea,
//         }));

//       const investment = franchises
//         .filter(f => f.investmentFranchiseSize)
//         .map(item => ({
//           franchiseSize: item.investmentFranchiseSize,
//           franchiseType: item.franchiseType,
//           city: item.city,
//           franchiseFee: Number(item.franchiseFee) || 0,
//           businessLicenses: Number(item.businessLicenses) || 0,
//           insurance: Number(item.insurance) || 0,
//           legalAndAccountingFee: Number(item.legalAndAccountingFee) || 0,
//           inventoryFee: Number(item.inventoryFee) || 0,
//           officeSetup: Number(item.officeSetup) || 0,
//           initialStartupEquipmentAndMarketing:
//             Number(item.initialStartupEquipmentAndMarketing) || 0,
//           staffAndManagementTrainingExpense:
//             Number(item.staffAndManagementTrainingExpense) || 0,
//           otherExpense: Number(item.otherExpense) || 0,
//           totalInvestment: Number(item.totalInvestment) || 0,
//           gstIncluded: item.gstIncluded,
//           gst: Number(item.gst) || 0,
//           tokenAmount: Number(item.tokenAmount) || 0,
//         }));

//       if (model.length) {
//         await fetch("/api/service/franchise/model", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ serviceId, model }),
//         });
//       }

//       if (investment.length) {
//         await fetch("/api/service/franchise/investment", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ serviceId, investment }),
//         });
//       }

//       alert("Franchise details saved successfully!");
//       if (onSave) onSave();
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong");
//     }
//   };

//   /* ---------------- UI ---------------- */

//   if (loading) return <p>Loading franchise details...</p>;

//   const current = franchises[activeIndex];

//   return (
//     <div>
//       {/* ---------- TABS ---------- */}
//       <div className="flex gap-2 mb-4">
//         {franchises.map((_, idx) => (
//           <button
//             key={idx}
//             onClick={() => setActiveIndex(idx)}
//             className={`px-4 py-2 ${
//               activeIndex === idx
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-500"
//             }`}
//           >
//             Franchise #{idx + 1}
//           </button>
//         ))}
//         <button
//           type="button"
//           onClick={addFranchise}
//           className="px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           + Add Franchise
//         </button>
//       </div>

//       <div className="border p-4 rounded mb-6">
//         <Label>Investment Details</Label>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//                     <Input name="investmentFranchiseSize" placeholder="Franchise Size" value={current.investmentFranchiseSize} onChange={(e) => handleChange(activeIndex, e)} />

//           <Input name="franchiseType" placeholder="Franchise Type" value={current.franchiseType} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="city" placeholder="City" value={current.city} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="franchiseFee" placeholder="Franchise Fee" value={current.franchiseFee} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="businessLicenses" placeholder="Business Licenses" value={current.businessLicenses} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="insurance" placeholder="Insurance" value={current.insurance} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="legalAndAccountingFee" placeholder="Legal & Accounting Fee" value={current.legalAndAccountingFee} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="inventoryFee" placeholder="Inventory Fee" value={current.inventoryFee} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="officeSetup" placeholder="Office Setup" value={current.officeSetup} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="initialStartupEquipmentAndMarketing" placeholder="Equipment & Marketing" value={current.initialStartupEquipmentAndMarketing} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="staffAndManagementTrainingExpense" placeholder="Staff & Training Expense" value={current.staffAndManagementTrainingExpense} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="otherExpense" placeholder="Other Expense" value={current.otherExpense} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="totalInvestment" placeholder="Total Investment" value={current.totalInvestment} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="gst" placeholder="GST" value={current.gst} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="tokenAmount" placeholder="Token Amount" value={current.tokenAmount} onChange={(e) => handleChange(activeIndex, e)} />
//           <div className="flex items-center gap-2">
//             <input type="checkbox" name="gstIncluded" checked={current.gstIncluded} onChange={(e) => handleChange(activeIndex, e)} />
//             <label>GST Included</label>
//           </div>
//         </div>
//       </div>

//       <div className="border p-4 rounded mb-6">
//         <Label>Model Details</Label>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <Input name="franchiseSize" placeholder="Franchise Size" value={current.franchiseSize} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="areaRequired" placeholder="Area Required" value={current.areaRequired} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="marketing" placeholder="Marketing" value={current.marketing} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="returnOfInvestment" placeholder="Return of Investment" value={current.returnOfInvestment} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="manPower" placeholder="Man Power" value={current.manPower} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="staffManagement" placeholder="Staff Management" value={current.staffManagement} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="royaltyPercent" placeholder="Royalty Percent" value={current.royaltyPercent} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="grossMargin" placeholder="Gross Margin" value={current.grossMargin} onChange={(e) => handleChange(activeIndex, e)} />
//           <Input name="radiusArea" placeholder="Radius Area" value={current.radiusArea} onChange={(e) => handleChange(activeIndex, e)} />
//         </div>
//       </div>

     

//       <button
//         type="button"
//         onClick={handleSubmit}
//         className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
//       >
//         Save Franchise Details
//       </button>
//     </div>
//   );
// }

// export default FranchiseExtraUpdate;



import React, { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useRouter } from "next/navigation";

interface InvestmentData {
  franchiseSize: string;
  franchiseType: string;
  city: string;
  franchiseFee: number;
  businessLicenses: number;
  insurance: number;
  legalAndAccountingFee: number;
  inventoryFee: number;
  officeSetup: number;
  initialStartupEquipmentAndMarketing: number;
  staffAndManagementTrainingExpense: number;
  otherExpense: number;
  totalInvestment: number;
  gstIncluded: boolean;
  gst: number;
  tokenAmount: number;
  _id?: string;
}

interface ModelData {
  franchiseSize: string;
  areaRequired: string;
  marketing: string;
  returnOfInvestment: string;
  manPower: number;
  staffManagement: string;
  royaltyPercent: string;
  grossMargin: string;
  radiusArea: string;
  _id?: string;
}

interface FranchiseData {
  franchiseSize: string;
  areaRequired: string;
  marketing: string;
  returnOfInvestment: string;
  manPower: string;
  staffManagement: string;
  royaltyPercent: string;
  grossMargin: string;
  radiusArea: string;
  franchiseType: string;
  city: string;
  franchiseFee: string;
  businessLicenses: string;
  insurance: string;
  legalAndAccountingFee: string;
  inventoryFee: string;
  officeSetup: string;
  initialStartupEquipmentAndMarketing: string;
  staffAndManagementTrainingExpense: string;
  otherExpense: string;
  totalInvestment: string;
  gstIncluded: boolean;
  gst: string;
  tokenAmount: string;
}

const getEmptyFranchise = (): FranchiseData => ({
  franchiseSize: "",
  areaRequired: "",
  marketing: "",
  returnOfInvestment: "",
  manPower: "",
  staffManagement: "",
  royaltyPercent: "",
  grossMargin: "",
  radiusArea: "",
  franchiseType: "",
  city: "",
  franchiseFee: "",
  businessLicenses: "",
  insurance: "",
  legalAndAccountingFee: "",
  inventoryFee: "",
  officeSetup: "",
  initialStartupEquipmentAndMarketing: "",
  staffAndManagementTrainingExpense: "",
  otherExpense: "",
  totalInvestment: "",
  gstIncluded: false,
  gst: "",
  tokenAmount: "",
});

function FranchiseExtraUpdate({ serviceId, onSave }: { serviceId: string; onSave?: () => void }) {
  const [franchises, setFranchises] = useState<FranchiseData[]>([getEmptyFranchise()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const router = useRouter();

  useEffect(() => {
    if (serviceId) {
      fetchFranchiseData();
    }
  }, [serviceId]);

  const fetchFranchiseData = async () => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both APIs in parallel
      const [investmentRes, modelRes] = await Promise.all([
        fetch(`/api/service/franchise/investment?serviceId=${serviceId}`),
        fetch(`/api/service/franchise/model?serviceId=${serviceId}`)
      ]);

      const investmentData = await investmentRes.json();
      const modelData = await modelRes.json();
      

      // Handle case where APIs return empty or error
      const investmentList = investmentData.success ? investmentData.data?.investment || [] : [];
      const modelList = modelData.success ? modelData.data?.model || [] : [];
      

      // Create a map to merge data by franchiseSize
      const franchiseMap = new Map<string, FranchiseData>();

      // First, add all franchises from investment data
      investmentList.forEach((item: InvestmentData) => {
        const key = item.franchiseSize.toLowerCase();
        franchiseMap.set(key, {
          ...getEmptyFranchise(),
          franchiseSize: item.franchiseSize,
          franchiseType: item.franchiseType || "",
          city: item.city || "",
          franchiseFee: item.franchiseFee?.toString() || "",
          businessLicenses: item.businessLicenses?.toString() || "",
          insurance: item.insurance?.toString() || "",
          legalAndAccountingFee: item.legalAndAccountingFee?.toString() || "",
          inventoryFee: item.inventoryFee?.toString() || "",
          officeSetup: item.officeSetup?.toString() || "",
          initialStartupEquipmentAndMarketing: item.initialStartupEquipmentAndMarketing?.toString() || "",
          staffAndManagementTrainingExpense: item.staffAndManagementTrainingExpense?.toString() || "",
          otherExpense: item.otherExpense?.toString() || "",
          totalInvestment: item.totalInvestment?.toString() || "",
          gstIncluded: item.gstIncluded || false,
          gst: item.gst?.toString() || "",
          tokenAmount: item.tokenAmount?.toString() || "",
        });
      });

      // Then, merge model data with investment data
      modelList.forEach((item: ModelData) => {
        const key = item.franchiseSize.toLowerCase();
        
        if (franchiseMap.has(key)) {
          // Merge with existing investment data
          const existing = franchiseMap.get(key)!;
          franchiseMap.set(key, {
            ...existing,
            franchiseSize: item.franchiseSize,
            areaRequired: item.areaRequired || "",
            marketing: item.marketing || "",
            returnOfInvestment: item.returnOfInvestment || "",
            manPower: item.manPower?.toString() || "",
            staffManagement: item.staffManagement || "",
            royaltyPercent: item.royaltyPercent || "",
            grossMargin: item.grossMargin || "",
            radiusArea: item.radiusArea || "",
          });
        } else {
          // Create new entry with only model data
          franchiseMap.set(key, {
            ...getEmptyFranchise(),
            franchiseSize: item.franchiseSize,
            areaRequired: item.areaRequired || "",
            marketing: item.marketing || "",
            returnOfInvestment: item.returnOfInvestment || "",
            manPower: item.manPower?.toString() || "",
            staffManagement: item.staffManagement || "",
            royaltyPercent: item.royaltyPercent || "",
            grossMargin: item.grossMargin || "",
            radiusArea: item.radiusArea || "",
          });
        }
      });

      // Convert map to array
      const mergedFranchises = Array.from(franchiseMap.values());
      

      if (mergedFranchises.length > 0) {
        setFranchises(mergedFranchises);
        if (mergedFranchises.length > 1) {
          setActiveIndex(0);
        }
      } else {
        // No data found, start with empty form
        setFranchises([getEmptyFranchise()]);
      }
    } catch (error) {
      console.error("Error fetching franchise data:", error);
      setError("Failed to load franchise data. Please try again.");
      setFranchises([getEmptyFranchise()]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newFranchises = [...franchises];
    newFranchises[index] = {
      ...newFranchises[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setFranchises(newFranchises);
  };

  const addFranchise = () => {
    setFranchises([...franchises, getEmptyFranchise()]);
    setActiveIndex(franchises.length);
  };

  const removeFranchise = (index: number) => {
    if (franchises.length <= 1) {
      // If removing the last franchise, reset to empty
      setFranchises([getEmptyFranchise()]);
      setActiveIndex(0);
      return;
    }
    
    const newFranchises = franchises.filter((_, i) => i !== index);
    setFranchises(newFranchises);
    
    // Adjust active index if needed
    if (activeIndex >= newFranchises.length) {
      setActiveIndex(newFranchises.length - 1);
    }
  };

  const handleSubmit = async () => {
    if (!serviceId) {
      alert("Service ID is required!");
      return;
    }

    try {
      // Prepare model data
      const modelData = franchises
        .filter(f => f.franchiseSize.trim() !== "") // Only include franchises with a size
        .map(item => ({
          franchiseSize: item.franchiseSize,
          areaRequired: item.areaRequired || "",
          marketing: item.marketing || "",
          returnOfInvestment: item.returnOfInvestment || "",
          manPower: Number(item.manPower) || 0,
          staffManagement: item.staffManagement || "",
          royaltyPercent: item.royaltyPercent || "",
          grossMargin: item.grossMargin || "",
          radiusArea: item.radiusArea || "",
        }));

      // Prepare investment data
      const investmentData = franchises
        .filter(f => f.franchiseSize.trim() !== "") // Only include franchises with a size
        .map(item => ({
          franchiseSize: item.franchiseSize,
          franchiseType: item.franchiseType || "",
          city: item.city || "",
          franchiseFee: Number(item.franchiseFee) || 0,
          businessLicenses: Number(item.businessLicenses) || 0,
          insurance: Number(item.insurance) || 0,
          legalAndAccountingFee: Number(item.legalAndAccountingFee) || 0,
          inventoryFee: Number(item.inventoryFee) || 0,
          officeSetup: Number(item.officeSetup) || 0,
          initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing) || 0,
          staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense) || 0,
          otherExpense: Number(item.otherExpense) || 0,
          totalInvestment: Number(item.totalInvestment) || 0,
          gstIncluded: Boolean(item.gstIncluded),
          gst: Number(item.gst) || 0,
          tokenAmount: Number(item.tokenAmount) || 0,
        }));
        

      // Send data to both APIs
      const requests = [];

      if (modelData.length > 0) {
        requests.push(
          fetch("/api/service/franchise/model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              serviceId, 
              model: modelData 
            }),
          }).then(res => res.json())
        );
      }

      if (investmentData.length > 0) {
        requests.push(
          fetch("/api/service/franchise/investment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              serviceId, 
              investment: investmentData 
            }),
          }).then(res => res.json())
        );
      }

      if (requests.length === 0) {
        alert("No franchise data to save!");
        return;
      }

      const responses = await Promise.all(requests);
      

      const allSuccessful = responses.every(res => res.success);
      
      if (allSuccessful) {
        alert("Franchise details saved successfully!");
        // Refresh data after saving
        await fetchFranchiseData();
        // if (onSave) onSave();
         router.push("/service-management/service-list");
      } else {
        throw new Error("Some API calls failed");
      }
    } catch (error) {
      console.error("Error saving franchise data:", error);
      alert("Failed to save franchise details. Please try again.");
    }
  };

  const current = franchises[activeIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading franchise data...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Franchise Details</h2>
        <button
          type="button"
          onClick={fetchFranchiseData}
          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
          <button
            onClick={fetchFranchiseData}
            className="ml-2 text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Franchise Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {franchises.map((franchise, idx) => (
            <div key={idx} className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2 rounded-t-lg font-medium ${
                  activeIndex === idx
                    ? "bg-white border-t border-l border-r border-gray-300 text-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {franchise.franchiseSize 
                  ? `${franchise.franchiseSize.charAt(0).toUpperCase() + franchise.franchiseSize.slice(1)} Franchise`
                  : `Franchise #${idx + 1}`}
              </button>
              {franchises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFranchise(idx)}
                  className="px-2 py-1 ml-1 text-red-600 hover:text-red-800"
                  title="Remove this franchise"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFranchise}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            + Add New Franchise
          </button>
        </div>

        {/* Model Details Section */}
        <div className="p-4 mb-6 bg-white border border-gray-300 rounded">
          <h3 className="mb-4 text-lg font-semibold">Model Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="franchiseSize">Franchise Size *</Label>
              <Input
                id="franchiseSize"
                name="franchiseSize"
                placeholder="e.g., small, medium, large"
                value={current.franchiseSize}
                onChange={(e) => handleChange(activeIndex, e)}
                required
              />
            </div>
            <div>
              <Label htmlFor="areaRequired">Area Required</Label>
              <Input
                id="areaRequired"
                name="areaRequired"
                placeholder="e.g., 2000 sq ft"
                value={current.areaRequired}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="marketing">Marketing Budget</Label>
              <Input
                id="marketing"
                name="marketing"
                placeholder="Marketing budget"
                value={current.marketing}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="returnOfInvestment">Return of Investment</Label>
              <Input
                id="returnOfInvestment"
                name="returnOfInvestment"
                placeholder="ROI percentage or amount"
                value={current.returnOfInvestment}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="manPower">Man Power Required</Label>
              <Input
                id="manPower"
                name="manPower"
                placeholder="Number of staff"
                value={current.manPower}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="staffManagement">Staff Management</Label>
              <Input
                id="staffManagement"
                name="staffManagement"
                placeholder="Staff management details"
                value={current.staffManagement}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="royaltyPercent">Royalty Percentage</Label>
              <Input
                id="royaltyPercent"
                name="royaltyPercent"
                placeholder="Royalty percentage"
                value={current.royaltyPercent}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="grossMargin">Gross Margin</Label>
              <Input
                id="grossMargin"
                name="grossMargin"
                placeholder="Gross margin"
                value={current.grossMargin}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="radiusArea">Radius Area</Label>
              <Input
                id="radiusArea"
                name="radiusArea"
                placeholder="Radius area coverage"
                value={current.radiusArea}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
          </div>
        </div>

        {/* Investment Details Section */}
        <div className="p-4 mb-6 bg-white border border-gray-300 rounded">
          <h3 className="mb-4 text-lg font-semibold">Investment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="franchiseType">Franchise Type</Label>
              <Input
                id="franchiseType"
                name="franchiseType"
                placeholder="Type of franchise"
                value={current.franchiseType}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="City location"
                value={current.city}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="franchiseFee">Franchise Fee</Label>
              <Input
                id="franchiseFee"
                name="franchiseFee"
                placeholder="Franchise fee amount"
                value={current.franchiseFee}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="businessLicenses">Business Licenses</Label>
              <Input
                id="businessLicenses"
                name="businessLicenses"
                placeholder="License costs"
                value={current.businessLicenses}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance</Label>
              <Input
                id="insurance"
                name="insurance"
                placeholder="Insurance costs"
                value={current.insurance}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="legalAndAccountingFee">Legal & Accounting Fee</Label>
              <Input
                id="legalAndAccountingFee"
                name="legalAndAccountingFee"
                placeholder="Legal and accounting fees"
                value={current.legalAndAccountingFee}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="inventoryFee">Inventory Fee</Label>
              <Input
                id="inventoryFee"
                name="inventoryFee"
                placeholder="Inventory costs"
                value={current.inventoryFee}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="officeSetup">Office Setup</Label>
              <Input
                id="officeSetup"
                name="officeSetup"
                placeholder="Office setup costs"
                value={current.officeSetup}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="initialStartupEquipmentAndMarketing">Equipment & Marketing</Label>
              <Input
                id="initialStartupEquipmentAndMarketing"
                name="initialStartupEquipmentAndMarketing"
                placeholder="Startup equipment and marketing"
                value={current.initialStartupEquipmentAndMarketing}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="staffAndManagementTrainingExpense">Staff & Training Expense</Label>
              <Input
                id="staffAndManagementTrainingExpense"
                name="staffAndManagementTrainingExpense"
                placeholder="Training expenses"
                value={current.staffAndManagementTrainingExpense}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="otherExpense">Other Expense</Label>
              <Input
                id="otherExpense"
                name="otherExpense"
                placeholder="Other miscellaneous expenses"
                value={current.otherExpense}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="totalInvestment">Total Investment</Label>
              <Input
                id="totalInvestment"
                name="totalInvestment"
                placeholder="Total investment amount"
                value={current.totalInvestment}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="gst">GST Percentage</Label>
              <Input
                id="gst"
                name="gst"
                placeholder="GST percentage"
                value={current.gst}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div>
              <Label htmlFor="tokenAmount">Token Amount</Label>
              <Input
                id="tokenAmount"
                name="tokenAmount"
                placeholder="Token amount"
                value={current.tokenAmount}
                onChange={(e) => handleChange(activeIndex, e)}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gstIncluded"
                name="gstIncluded"
                checked={current.gstIncluded}
                onChange={(e) => handleChange(activeIndex, e)}
                className="w-4 h-4 mr-2"
              />
              <Label htmlFor="gstIncluded" className="mb-0">GST Included</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Save All Franchise Details
          </button>
          <button
            type="button"
            onClick={() => {
              setFranchises([getEmptyFranchise()]);
              setActiveIndex(0);
            }}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default FranchiseExtraUpdate;