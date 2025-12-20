
// import React, { useState } from "react";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";

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

// function FranchiseExtraDetails({ serviceId ,onSave,}: { serviceId: string , onSave?: () => void; }) {
//   const [franchises, setFranchises] = useState<FranchiseData[]>([getEmptyFranchise()]);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const handleChange = (index: number, e: any) => {
//     const { name, value, type, checked } = e.target;
//     const newFranchises = [...franchises];
//     newFranchises[index] = {
//       ...newFranchises[index],
//       [name]: type === "checkbox" ? checked : value,
//     };
//     setFranchises(newFranchises);
//   };

//   const addFranchise = () => {
//     setFranchises([...franchises, getEmptyFranchise()]);
//     setActiveIndex(franchises.length); // switch to the new tab
//   };

//   const handleSubmit = async () => {
//   try {
//     // Filter out tabs that have meaningful data
//     const model = franchises
//       .filter(f => f.franchiseSize || f.areaRequired || f.marketing || f.returnOfInvestment)
//       .map(item => ({
//         franchiseSize: item.franchiseSize,
//         areaRequired: item.areaRequired,
//         marketing: item.marketing,
//         returnOfInvestment: item.returnOfInvestment,
//         manPower: Number(item.manPower) || 0,
//         staffManagement: item.staffManagement,
//         royaltyPercent: item.royaltyPercent,
//         grossMargin: item.grossMargin,
//         radiusArea: item.radiusArea,
//       }));

//     const investment = franchises
//       .filter(f => f.investmentFranchiseSize || f.franchiseType || f.city || f.franchiseFee)
//       .map(item => ({
//         franchiseSize: item.investmentFranchiseSize,
//         franchiseType: item.franchiseType,
//         city: item.city,
//         franchiseFee: Number(item.franchiseFee) || 0,
//         businessLicenses: Number(item.businessLicenses) || 0,
//         insurance: Number(item.insurance) || 0,
//         legalAndAccountingFee: Number(item.legalAndAccountingFee) || 0,
//         inventoryFee: Number(item.inventoryFee) || 0,
//         officeSetup: Number(item.officeSetup) || 0,
//         initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing) || 0,
//         staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense) || 0,
//         otherExpense: Number(item.otherExpense) || 0,
//         totalInvestment: Number(item.totalInvestment) || 0,
//         gstIncluded: item.gstIncluded,
//         gst: Number(item.gst) || 0,
//         tokenAmount: Number(item.tokenAmount) || 0,
//       }));

//     // Call APIs only if arrays have data
//     if (model.length > 0) {
//       const modelResponse = await fetch("/api/service/franchise/model", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, model }),
//       });
//       const modelResult = await modelResponse.json();
//       if (!modelResult.success) throw new Error("Model API failed");
//     }

//     if (investment.length > 0) {
//       const investmentResponse = await fetch("/api/service/franchise/investment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, investment }),
//       });
//       const investmentResult = await investmentResponse.json();
//       if (!investmentResult.success) throw new Error("Investment API failed");
//     }

//     alert("Franchise details saved successfully!");
//     setFranchises([getEmptyFranchise()]);
//     setActiveIndex(0);
//     if (onSave) onSave();
//   } catch (error) {
//     console.error(error);
//     alert("Something went wrong!");
//   }
// };

//   // const handleSubmit = async () => {
//   //   try {
//   //     // Prepare model and investment arrays
//   //     const model = franchises.map((item) => ({
//   //       franchiseSize: item.franchiseSize,
//   //       areaRequired: item.areaRequired,
//   //       marketing: item.marketing,
//   //       returnOfInvestment: item.returnOfInvestment,
//   //       manPower: Number(item.manPower),
//   //       staffManagement: item.staffManagement,
//   //       royaltyPercent: item.royaltyPercent,
//   //       grossMargin: item.grossMargin,
//   //       radiusArea: item.radiusArea,
//   //     }));

//   //     const investment = franchises.map((item) => ({
//   //       franchiseSize: item.investmentFranchiseSize,
//   //       franchiseType: item.franchiseType,
//   //       city: item.city,
//   //       franchiseFee: Number(item.franchiseFee),
//   //       businessLicenses: Number(item.businessLicenses),
//   //       insurance: Number(item.insurance),
//   //       legalAndAccountingFee: Number(item.legalAndAccountingFee),
//   //       inventoryFee: Number(item.inventoryFee),
//   //       officeSetup: Number(item.officeSetup),
//   //       initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing),
//   //       staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense),
//   //       otherExpense: Number(item.otherExpense),
//   //       totalInvestment: Number(item.totalInvestment),
//   //       gstIncluded: item.gstIncluded,
//   //       gst: Number(item.gst),
//   //       tokenAmount: Number(item.tokenAmount),
//   //     }));

//   //       // ------------------ CALL MODEL API ------------------
//   //   const modelResponse = await fetch("/api/service/franchise/model", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify({ serviceId, model }),
//   //   });

//   //   const modelResult = await modelResponse.json();

//   //   // ------------------ CALL INVESTMENT API ------------------
//   //   const investmentResponse = await fetch("/api/service/franchise/investment", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify({ serviceId, investment }),
//   //   });

//   //   const investmentResult = await investmentResponse.json();

//   //   // Check both responses
//   //   if (modelResult.success && investmentResult.success) {
//   //     alert("Franchise details saved successfully!");
//   //     setFranchises([getEmptyFranchise()]);
//   //     setActiveIndex(0);
//   //      if (onSave) onSave();
//   //   } else {
//   //     alert("Franchise details not saved. Please check your data.");
//   //     console.error("Model API Response:", modelResult);
//   //     console.error("Investment API Response:", investmentResult);
//   //   }
//   //   } catch (error) {
//   //     console.error(error);
//   //     alert("Something went wrong!");
//   //   }
//   // };

//   const current = franchises[activeIndex];

//   return (
//     <div>
//       <div className="mb-4">
//         <div className="flex gap-2 mb-2">
//           {franchises.map((_, idx) => (
//             <button
//               key={idx}
//               type="button"
//               onClick={() => setActiveIndex(idx)}
//               className={`px-4 py-2 font-semibold ${
//                 activeIndex === idx
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600"
//               }`}
//             >
//               Franchise #{idx + 1}
//             </button>
//           ))}
//           <button
//             type="button"
//             onClick={addFranchise}
//             className="px-4 py-2 mx-3 text-white bg-blue-500 rounded"
//           >
//             + Add Franchise
//           </button>
//         </div>
//       </div>

//        {/* ---------------- Investment Section ---------------- */}
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

//       {/* ---------------- Model Section ---------------- */}
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

// export default FranchiseExtraDetails;


import React, { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

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

interface ApiResponse {
  success: boolean;
  data: {
    _id: string;
    serviceId: string;
    investment?: InvestmentData[];
    model?: ModelData[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
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

  useEffect(() => {
    fetchFranchiseData();
  }, [serviceId]);

  const fetchFranchiseData = async () => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both investment and model data in parallel
      const [investmentResponse, modelResponse] = await Promise.all([
        fetch(`/api/service/franchise/investment?serviceId=${serviceId}`),
        fetch(`/api/service/franchise/model?serviceId=${serviceId}`)
      ]);

      const investmentResult: ApiResponse = await investmentResponse.json();
      const modelResult: ApiResponse = await modelResponse.json();

      // Merge the data from both APIs
      const mergedFranchises: FranchiseData[] = [];

      // Get investment data
      const investmentData = investmentResult.success ? investmentResult.data.investment || [] : [];
      // Get model data (handle the typo in franchise size)
      const modelData = modelResult.success ? modelResult.data.model || [] : [];

      // Create a map of franchise sizes to merge data
      const franchiseMap = new Map<string, FranchiseData>();

      // Process investment data first
      investmentData.forEach((item: InvestmentData) => {
        const franchiseSize = item.franchiseSize;
        franchiseMap.set(franchiseSize, {
          ...getEmptyFranchise(),
          franchiseSize: franchiseSize,
          investmentFranchiseSize: franchiseSize,
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

      // Process model data and merge with investment data
      modelData.forEach((item: ModelData) => {
        const franchiseSize = item.franchiseSize;
        if (franchiseMap.has(franchiseSize)) {
          // Merge with existing investment data
          const existing = franchiseMap.get(franchiseSize)!;
          franchiseMap.set(franchiseSize, {
            ...existing,
            franchiseSize: franchiseSize,
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
          // Create new entry if no investment data exists
          franchiseMap.set(franchiseSize, {
            ...getEmptyFranchise(),
            franchiseSize: franchiseSize,
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
      const mergedArray = Array.from(franchiseMap.values());

      if (mergedArray.length > 0) {
        setFranchises(mergedArray);
      } else {
        setFranchises([getEmptyFranchise()]);
      }
    } catch (error) {
      console.error("Error fetching franchise data:", error);
      setError("Failed to load franchise data");
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
    if (franchises.length <= 1) return;
    const newFranchises = franchises.filter((_, i) => i !== index);
    setFranchises(newFranchises);
    if (activeIndex >= newFranchises.length) {
      setActiveIndex(newFranchises.length - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Filter out tabs that have meaningful data
      const model = franchises
        .filter(f => f.franchiseSize || f.areaRequired || f.marketing || f.returnOfInvestment)
        .map(item => ({
          franchiseSize: item.franchiseSize,
          areaRequired: item.areaRequired,
          marketing: item.marketing,
          returnOfInvestment: item.returnOfInvestment,
          manPower: Number(item.manPower) || 0,
          staffManagement: item.staffManagement,
          royaltyPercent: item.royaltyPercent,
          grossMargin: item.grossMargin,
          radiusArea: item.radiusArea,
        }));

      const investment = franchises
        .filter(f => f.franchiseSize || f.franchiseType || f.city || f.franchiseFee)
        .map(item => ({
          franchiseSize: item.franchiseSize,
          franchiseType: item.franchiseType,
          city: item.city,
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
          gstIncluded: item.gstIncluded,
          gst: Number(item.gst) || 0,
          tokenAmount: Number(item.tokenAmount) || 0,
        }));

      // Call APIs only if arrays have data
      const promises = [];
      
      if (model.length > 0) {
        promises.push(
          fetch("/api/service/franchise/model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId, model }),
          }).then(response => response.json())
        );
      }

      if (investment.length > 0) {
        promises.push(
          fetch("/api/service/franchise/investment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId, investment }),
          }).then(response => response.json())
        );
      }

      const results = await Promise.all(promises);
      const allSuccess = results.every(result => result.success);

      if (!allSuccess) throw new Error("Some API calls failed");

      alert("Franchise details saved successfully!");
      await fetchFranchiseData(); // Refresh data after save
      if (onSave) onSave();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving!");
    }
  };

  const current = franchises[activeIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading franchise data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <div className="text-red-600">{error}</div>
        <button
          onClick={fetchFranchiseData}
          className="px-4 py-2 mt-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Franchise Details</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFranchiseData}
            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {franchises.map((_, idx) => (
            <div key={idx} className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2 font-semibold ${
                  activeIndex === idx
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {current.franchiseSize ? `${current.franchiseSize} Franchise` : `Franchise #${idx + 1}`}
              </button>
              {franchises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFranchise(idx)}
                  className="px-2 py-1 ml-2 text-sm text-red-600 hover:text-red-800"
                  title="Remove franchise"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFranchise}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            + Add Franchise
          </button>
        </div>
      </div>

      {/* ---------------- Model Section ---------------- */}
      <div className="p-4 mb-6 border rounded">
        <Label>Model Details</Label>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            name="franchiseSize"
            placeholder="Franchise Size (e.g., small, medium)"
            value={current.franchiseSize}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="areaRequired"
            placeholder="Area Required"
            value={current.areaRequired}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="marketing"
            placeholder="Marketing Budget"
            value={current.marketing}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="returnOfInvestment"
            placeholder="Return of Investment"
            value={current.returnOfInvestment}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="manPower"
            placeholder="Man Power"
            value={current.manPower}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="staffManagement"
            placeholder="Staff Management"
            value={current.staffManagement}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="royaltyPercent"
            placeholder="Royalty Percent"
            value={current.royaltyPercent}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="grossMargin"
            placeholder="Gross Margin"
            value={current.grossMargin}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="radiusArea"
            placeholder="Radius Area"
            value={current.radiusArea}
            onChange={(e) => handleChange(activeIndex, e)}
          />
        </div>
      </div>

      {/* ---------------- Investment Section ---------------- */}
      <div className="p-4 mb-6 border rounded">
        <Label>Investment Details</Label>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            name="franchiseType"
            placeholder="Franchise Type"
            value={current.franchiseType}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="city"
            placeholder="City"
            value={current.city}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="franchiseFee"
            placeholder="Franchise Fee"
            value={current.franchiseFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="businessLicenses"
            placeholder="Business Licenses"
            value={current.businessLicenses}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="insurance"
            placeholder="Insurance"
            value={current.insurance}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="legalAndAccountingFee"
            placeholder="Legal & Accounting Fee"
            value={current.legalAndAccountingFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="inventoryFee"
            placeholder="Inventory Fee"
            value={current.inventoryFee}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="officeSetup"
            placeholder="Office Setup"
            value={current.officeSetup}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="initialStartupEquipmentAndMarketing"
            placeholder="Equipment & Marketing"
            value={current.initialStartupEquipmentAndMarketing}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="staffAndManagementTrainingExpense"
            placeholder="Staff & Training Expense"
            value={current.staffAndManagementTrainingExpense}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="otherExpense"
            placeholder="Other Expense"
            value={current.otherExpense}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="totalInvestment"
            placeholder="Total Investment"
            value={current.totalInvestment}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="gst"
            placeholder="GST Percentage"
            value={current.gst}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <Input
            name="tokenAmount"
            placeholder="Token Amount"
            value={current.tokenAmount}
            onChange={(e) => handleChange(activeIndex, e)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="gstIncluded"
              name="gstIncluded"
              checked={current.gstIncluded}
              onChange={(e) => handleChange(activeIndex, e)}
              className="w-4 h-4"
            />
            <label htmlFor="gstIncluded" className="text-sm text-gray-700">
              GST Included
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Save Franchise Details
        </button>
        <button
          type="button"
          onClick={fetchFranchiseData}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FranchiseExtraUpdate;