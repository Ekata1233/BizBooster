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



import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

/* ---------------- TYPES ---------------- */

interface FranchiseData {
  franchiseSize: string;
  investmentFranchiseSize: string;
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

/* ---------------- CONSTANTS ---------------- */

const EMPTY_FRANCHISE: FranchiseData = {
  franchiseSize: "",
  investmentFranchiseSize: "",
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
};

/* ---------------- HELPERS ---------------- */

const getEmptyFranchise = (): FranchiseData => ({ ...EMPTY_FRANCHISE });

// Normalize franchise size to handle typos like "meduim" vs "medium"
const normalizeFranchiseSize = (size: string): string => {
  if (!size) return "";
  return size.toLowerCase().trim();
};

/* ---------------- COMPONENT ---------------- */

interface FranchiseExtraUpdateProps {
  onSave?: () => void;
  serviceId?: string;
}

function FranchiseExtraUpdate({ 
  onSave, 
  serviceId: propServiceId 
}: FranchiseExtraUpdateProps) {
  const serviceId = propServiceId || "694647700bf8b17c997a9e8c";
  
  const [franchises, setFranchises] = useState<FranchiseData[]>([getEmptyFranchise()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH & PREFILL ---------------- */

  useEffect(() => {
    if (!serviceId) {
      setFranchises([getEmptyFranchise()]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching franchise data for serviceId:", serviceId);

        const [investmentRes, modelRes] = await Promise.all([
          fetch(`/api/service/franchise/investment?serviceId=${serviceId}`),
          fetch(`/api/service/franchise/model?serviceId=${serviceId}`),
        ]);

        if (!investmentRes.ok || !modelRes.ok) {
          throw new Error(`Failed to fetch franchise data: ${investmentRes.status} ${modelRes.status}`);
        }

        const investmentJson = await investmentRes.json();
        const modelJson = await modelRes.json();

        console.log("API Response - investment:", investmentJson);
        console.log("API Response - model:", modelJson);

        const investmentArr = investmentJson?.data?.investment || [];
        const modelArr = modelJson?.data?.model || [];

        console.log("investment array:", investmentArr);
        console.log("model array:", modelArr);

        /* ---- MERGE BY franchiseSize (with normalization) ---- */
        const mergedMap: Map<string, FranchiseData> = new Map();

        // First pass: Add investment data
        investmentArr.forEach((inv: any) => {
          if (!inv || !inv.franchiseSize) return;
          
          const key = normalizeFranchiseSize(inv.franchiseSize);
          console.log(`Processing investment data for key: "${key}"`);
          
          mergedMap.set(key, {
            ...getEmptyFranchise(),
            investmentFranchiseSize: inv.franchiseSize,
            franchiseType: inv.franchiseType || "",
            city: inv.city || "",
            franchiseFee: String(inv.franchiseFee || ""),
            businessLicenses: String(inv.businessLicenses || ""),
            insurance: String(inv.insurance || ""),
            legalAndAccountingFee: String(inv.legalAndAccountingFee || ""),
            inventoryFee: String(inv.inventoryFee || ""),
            officeSetup: String(inv.officeSetup || ""),
            initialStartupEquipmentAndMarketing: String(
              inv.initialStartupEquipmentAndMarketing || ""
            ),
            staffAndManagementTrainingExpense: String(
              inv.staffAndManagementTrainingExpense || ""
            ),
            otherExpense: String(inv.otherExpense || ""),
            totalInvestment: String(inv.totalInvestment || ""),
            gstIncluded: Boolean(inv.gstIncluded),
            gst: String(inv.gst || ""),
            tokenAmount: String(inv.tokenAmount || ""),
          });
        });

        // Second pass: Merge model data
        modelArr.forEach((mod: any) => {
          if (!mod || !mod.franchiseSize) return;
          
          const key = normalizeFranchiseSize(mod.franchiseSize);
          console.log(`Processing model data for key: "${key}"`);
          
          const existing = mergedMap.get(key) || getEmptyFranchise();
          
          mergedMap.set(key, {
            ...existing,
            franchiseSize: mod.franchiseSize, // Keep original casing
            areaRequired: mod.areaRequired || "",
            marketing: mod.marketing || "",
            returnOfInvestment: mod.returnOfInvestment || "",
            manPower: String(mod.manPower || ""),
            staffManagement: mod.staffManagement || "",
            royaltyPercent: mod.royaltyPercent || "",
            grossMargin: mod.grossMargin || "",
            radiusArea: mod.radiusArea || "",
            // Ensure investmentFranchiseSize is set if it wasn't from investment data
            investmentFranchiseSize: existing.investmentFranchiseSize || mod.franchiseSize,
          });
        });

        // Debug: Log what's in the map
        console.log("Merged Map contents:");
        mergedMap.forEach((value, key) => {
          console.log(`Key: "${key}"`, value);
        });

        const finalData = Array.from(mergedMap.values());
        
        // Sort by franchise size for consistent ordering
        finalData.sort((a, b) => {
          const sizes = ['small', 'medium', 'large'];
          const aIndex = sizes.indexOf(normalizeFranchiseSize(a.franchiseSize));
          const bIndex = sizes.indexOf(normalizeFranchiseSize(b.franchiseSize));
          return aIndex - bIndex;
        });

        console.log("Final merged data:", finalData);
        
        setFranchises(finalData.length > 0 ? finalData : [getEmptyFranchise()]);
        setActiveIndex(0);
      } catch (err) {
        console.error("Failed to load franchise data", err);
        setError(`Failed to load franchise data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setFranchises([getEmptyFranchise()]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = useCallback((
    index: number, 
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFranchises(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [name]: type === "checkbox" ? checked : value,
      };
      return updated;
    });
  }, []);

  const addFranchise = useCallback(() => {
    setFranchises(prev => [...prev, getEmptyFranchise()]);
    setActiveIndex(franchises.length);
  }, [franchises.length]);

  const removeFranchise = useCallback((index: number) => {
    if (franchises.length <= 1) return;
    
    setFranchises(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(Math.min(index, franchises.length - 2));
  }, [franchises.length]);

  /* ---------------- SUBMIT HANDLER ---------------- */

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate data
      const invalidFranchises = franchises.filter(f => 
        f.franchiseSize.trim() && !f.investmentFranchiseSize.trim()
      );
      
      if (invalidFranchises.length > 0) {
        setError("Please ensure all franchises have both model and investment franchise sizes.");
        return;
      }

      // Prepare model data
      const model = franchises
        .filter(f => f.franchiseSize.trim())
        .map(item => ({
          franchiseSize: item.franchiseSize.trim(),
          areaRequired: item.areaRequired,
          marketing: item.marketing,
          returnOfInvestment: item.returnOfInvestment,
          manPower: Number(item.manPower) || 0,
          staffManagement: item.staffManagement,
          royaltyPercent: item.royaltyPercent,
          grossMargin: item.grossMargin,
          radiusArea: item.radiusArea,
        }));

      // Prepare investment data
      const investment = franchises
        .filter(f => f.investmentFranchiseSize.trim())
        .map(item => ({
          franchiseSize: item.investmentFranchiseSize.trim(),
          franchiseType: item.franchiseType,
          city: item.city,
          franchiseFee: Number(item.franchiseFee) || 0,
          businessLicenses: Number(item.businessLicenses) || 0,
          insurance: Number(item.insurance) || 0,
          legalAndAccountingFee: Number(item.legalAndAccountingFee) || 0,
          inventoryFee: Number(item.inventoryFee) || 0,
          officeSetup: Number(item.officeSetup) || 0,
          initialStartupEquipmentAndMarketing:
            Number(item.initialStartupEquipmentAndMarketing) || 0,
          staffAndManagementTrainingExpense:
            Number(item.staffAndManagementTrainingExpense) || 0,
          otherExpense: Number(item.otherExpense) || 0,
          totalInvestment: Number(item.totalInvestment) || 0,
          gstIncluded: item.gstIncluded,
          gst: Number(item.gst) || 0,
          tokenAmount: Number(item.tokenAmount) || 0,
        }));

      console.log("Submitting model data:", model);
      console.log("Submitting investment data:", investment);

      // Send requests
      const promises = [];
      
      if (model.length > 0) {
        promises.push(
          fetch("/api/service/franchise/model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId, model }),
          }).then(async res => {
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Model API error: ${res.status} - ${errorText}`);
            }
            return res.json();
          })
        );
      }

      if (investment.length > 0) {
        promises.push(
          fetch("/api/service/franchise/investment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId, investment }),
          }).then(async res => {
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Investment API error: ${res.status} - ${errorText}`);
            }
            return res.json();
          })
        );
      }

      if (promises.length === 0) {
        setError("No data to save. Please add franchise details.");
        return;
      }

      await Promise.all(promises);
      
      alert("Franchise details saved successfully!");
      if (onSave) onSave();
    } catch (err) {
      console.error("Failed to save franchise data:", err);
      setError(`Failed to save franchise details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading franchise details...</span>
      </div>
    );
  }

  const current = franchises[activeIndex];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Debug info - remove in production */}
      <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
        <div>Active Franchise: #{activeIndex + 1} of {franchises.length}</div>
        <div>Service ID: {serviceId}</div>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {franchises.map((franchise, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeIndex === idx
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {franchise.franchiseSize || `Franchise #${idx + 1}`}
            {franchises.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFranchise(idx);
                }}
                className="ml-1 text-red-500 hover:text-red-700 text-lg"
                aria-label="Remove franchise"
              >
                ×
              </button>
            )}
          </button>
        ))}
        
        <button
          type="button"
          onClick={addFranchise}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          + Add Franchise
        </button>
      </div>

      {/* Display merge status */}
      {current.franchiseSize !== current.investmentFranchiseSize && 
       current.franchiseSize && current.investmentFranchiseSize && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded">
          Note: Model franchise size "{current.franchiseSize}" and Investment franchise size "{current.investmentFranchiseSize}" don't match. They will be saved as separate entries.
        </div>
      )}

      {/* ---------- INVESTMENT DETAILS ---------- */}
      <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
        <Label className="text-lg font-semibold mb-4">Investment Details</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Franchise Size"
            name="investmentFranchiseSize"
            placeholder="e.g., small, medium, large"
            value={current.investmentFranchiseSize}
            onChange={(e) => handleChange(activeIndex, e)}
            required
          />
          
          <Input
            label="Franchise Type"
            name="franchiseType"
            placeholder="e.g., Master, Unit"
            value={current.franchiseType}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="City"
            name="city"
            placeholder="City name"
            value={current.city}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Franchise Fee"
            name="franchiseFee"
            type="number"
            placeholder="0"
            value={current.franchiseFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Business Licenses"
            name="businessLicenses"
            type="number"
            placeholder="0"
            value={current.businessLicenses}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Insurance"
            name="insurance"
            type="number"
            placeholder="0"
            value={current.insurance}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Legal & Accounting Fee"
            name="legalAndAccountingFee"
            type="number"
            placeholder="0"
            value={current.legalAndAccountingFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Inventory Fee"
            name="inventoryFee"
            type="number"
            placeholder="0"
            value={current.inventoryFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Office Setup"
            name="officeSetup"
            type="number"
            placeholder="0"
            value={current.officeSetup}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Equipment & Marketing"
            name="initialStartupEquipmentAndMarketing"
            type="number"
            placeholder="0"
            value={current.initialStartupEquipmentAndMarketing}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Staff & Training Expense"
            name="staffAndManagementTrainingExpense"
            type="number"
            placeholder="0"
            value={current.staffAndManagementTrainingExpense}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Other Expense"
            name="otherExpense"
            type="number"
            placeholder="0"
            value={current.otherExpense}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Total Investment"
            name="totalInvestment"
            type="number"
            placeholder="0"
            value={current.totalInvestment}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="GST"
            name="gst"
            type="number"
            placeholder="0"
            value={current.gst}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Token Amount"
            name="tokenAmount"
            type="number"
            placeholder="0"
            value={current.tokenAmount}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <input
              type="checkbox"
              id="gstIncluded"
              name="gstIncluded"
              checked={current.gstIncluded}
              onChange={(e) => handleChange(activeIndex, e)}
              className="h-5 w-5 text-blue-500"
            />
            <label htmlFor="gstIncluded" className="text-gray-700">
              GST Included
            </label>
          </div>
        </div>
      </div>

      {/* ---------- MODEL DETAILS ---------- */}
      <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
        <Label className="text-lg font-semibold mb-4">Model Details</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Franchise Size"
            name="franchiseSize"
            placeholder="e.g., small, medium, large"
            value={current.franchiseSize}
            onChange={(e) => handleChange(activeIndex, e)}
            required
          />
          
          <Input
            label="Area Required"
            name="areaRequired"
            placeholder="e.g., 500 sq ft"
            value={current.areaRequired}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Marketing"
            name="marketing"
            placeholder="Marketing details"
            value={current.marketing}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Return of Investment"
            name="returnOfInvestment"
            placeholder="e.g., 24 months"
            value={current.returnOfInvestment}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Man Power"
            name="manPower"
            type="number"
            placeholder="Number of people"
            value={current.manPower}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Staff Management"
            name="staffManagement"
            placeholder="Management details"
            value={current.staffManagement}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Royalty Percent"
            name="royaltyPercent"
            placeholder="e.g., 5%"
            value={current.royaltyPercent}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Gross Margin"
            name="grossMargin"
            placeholder="e.g., 30%"
            value={current.grossMargin}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          
          <Input
            label="Radius Area"
            name="radiusArea"
            placeholder="e.g., 5 km radius"
            value={current.radiusArea}
            onChange={(e) => handleChange(activeIndex, e)}
          />
        </div>
      </div>

      {/* ---------- SUBMIT BUTTON ---------- */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => console.log("Current data:", franchises)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
        >
          Debug Data
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
        >
          Save Franchise Details
        </button>
      </div>
    </div>
  );
}

export default FranchiseExtraUpdate;