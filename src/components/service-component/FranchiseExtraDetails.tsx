// import React, { useState } from "react";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";

// function FranchiseExtraDetails({serviceId}) {
//   const [activeTab, setActiveTab] = useState("");

//   console.log("serviceId in extra details : ", serviceId);

//   const initialFormState = {
//   Small: {
//     franchiseSize: "",
//     areaRequired: "",
//     marketing: "",
//     returnOfInvestment: "",
//     manPower: "",
//     staffManagement: "",
//     royaltyPercent: "",
//     grossMargin: "",
//     radiusArea: "",
//     franchiseType: "",
//     city: "",
//     franchiseFee: "",
//     businessLicenses: "",
//     insurance: "",
//     legalAndAccountingFee: "",
//     inventoryFee: "",
//     officeSetup: "",
//     initialStartupEquipmentAndMarketing: "",
//     staffAndManagementTrainingExpense: "",
//     otherExpense: "",
//     totalInvestment: "",
//     gstIncluded: false,
//     gst: "",
//     tokenAmount: "",
//   },
//   Medium: {
//     franchiseSize: "Medium",
//     areaRequired: "",
//     marketing: "",
//     returnOfInvestment: "",
//     manPower: "",
//     staffManagement: "",
//     royaltyPercent: "",
//     grossMargin: "",
//     radiusArea: "",
//     franchiseType: "",
//     city: "",
//     franchiseFee: "",
//     businessLicenses: "",
//     insurance: "",
//     legalAndAccountingFee: "",
//     inventoryFee: "",
//     officeSetup: "",
//     initialStartupEquipmentAndMarketing: "",
//     staffAndManagementTrainingExpense: "",
//     otherExpense: "",
//     totalInvestment: "",
//     gstIncluded: false,
//     gst: "",
//     tokenAmount: "",
//   },
//   Large: {
//     franchiseSize: "Large",
//     areaRequired: "",
//     marketing: "",
//     returnOfInvestment: "",
//     manPower: "",
//     staffManagement: "",
//     royaltyPercent: "",
//     grossMargin: "",
//     radiusArea: "",
//     franchiseType: "",
//     city: "",
//     franchiseFee: "",
//     businessLicenses: "",
//     insurance: "",
//     legalAndAccountingFee: "",
//     inventoryFee: "",
//     officeSetup: "",
//     initialStartupEquipmentAndMarketing: "",
//     staffAndManagementTrainingExpense: "",
//     otherExpense: "",
//     totalInvestment: "",
//     gstIncluded: false,
//     gst: "",
//     tokenAmount: "",
//   }
// };

//   // ---------------- FORM DATA ----------------
// const [formData, setFormData] = useState(initialFormState);


//   console.log("formdata of the extra service : ", formData)
//   // ---------------- HANDLE INPUT ----------------
//   const handleChange = (e: any) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [activeTab]: {
//         ...formData[activeTab],
//         [name]: type === "checkbox" ? checked : value,
//       },
//     });
//   };

//   const current = formData[activeTab];

//   const handleSubmit = async () => {
//   try {
//     // -------- MODEL DATA --------
//     const model = [
//       formData.Small,
//       formData.Medium,
//       formData.Large,
//     ].map((item) => ({
//       franchiseSize: item.franchiseSize,
//       areaRequired: item.areaRequired,
//       marketing: item.marketing,
//       returnOfInvestment: item.returnOfInvestment,
//       manPower: Number(item.manPower),
//       staffManagement: item.staffManagement,
//       royaltyPercent: item.royaltyPercent,
//       grossMargin: item.grossMargin,
//       radiusArea: item.radiusArea,
//     }));

//     // -------- INVESTMENT DATA --------
//     const investment = [
//       formData.Small,
//       formData.Medium,
//       formData.Large,
//     ].map((item) => ({
//       franchiseSize: item.franchiseSize,
//       franchiseType: item.franchiseType,
//       city: item.city,
//       franchiseFee: Number(item.franchiseFee),
//       businessLicenses: Number(item.businessLicenses),
//       insurance: Number(item.insurance),
//       legalAndAccountingFee: Number(item.legalAndAccountingFee),
//       inventoryFee: Number(item.inventoryFee),
//       officeSetup: Number(item.officeSetup),
//       initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing),
//       staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense),
//       otherExpense: Number(item.otherExpense),
//       totalInvestment: Number(item.totalInvestment),
//       gstIncluded: item.gstIncluded,
//       gst: Number(item.gst),
//       tokenAmount: Number(item.tokenAmount),
//     }));

//     // ------------------ CALL MODEL API ------------------
//     await fetch("/api/service/franchise/model", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         serviceId,
//         model,
//       }),
//     });

//     // ------------------ CALL INVESTMENT API ------------------
//     await fetch("/api/service/franchise/investment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         serviceId,
//         investment,
//       }),
//     });

//     alert("Franchise details saved successfully!");
//      setFormData(initialFormState);
//     setActiveTab("Small");
//   } catch (error) {
//     console.error("Error saving data:", error);
//     alert("Something went wrong!");
//   }
// };


//   return (
//     <div>
//       {/* ---------------- SECTION 2 : INVESTMENT RANGE ---------------- */}
//       <div className="my-6">
//         <div className="items-center gap-2 mb-2">
//           <Label>Franchise Investment Range</Label>
//         </div>

//         <div className="border p-4 rounded">
//           <div className="flex gap-4 border-b pb-2 mb-4">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 type="button"
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 font-semibold ${
//                   activeTab === tab
//                     ? "border-b-2 border-green-500 text-green-600"
//                     : "text-gray-600"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Input name="franchiseType" placeholder="Franchise Type" value={current.franchiseType} onChange={handleChange} />
//             <Input name="city" placeholder="City" value={current.city} onChange={handleChange} />
//             <Input name="franchiseFee" placeholder="Franchise Fee" value={current.franchiseFee} onChange={handleChange} />
//             <Input name="businessLicenses" placeholder="Business Licenses" value={current.businessLicenses} onChange={handleChange} />
//             <Input name="insurance" placeholder="Insurance" value={current.insurance} onChange={handleChange} />
//             <Input name="legalAndAccountingFee" placeholder="Legal & Accounting Fee" value={current.legalAndAccountingFee} onChange={handleChange} />
//             <Input name="inventoryFee" placeholder="Inventory Fee" value={current.inventoryFee} onChange={handleChange} />
//             <Input name="officeSetup" placeholder="Office Setup" value={current.officeSetup} onChange={handleChange} />
//             <Input name="initialStartupEquipmentAndMarketing" placeholder="Equipment & Marketing" value={current.initialStartupEquipmentAndMarketing} onChange={handleChange} />
//             <Input name="staffAndManagementTrainingExpense" placeholder="Staff & Training Expense" value={current.staffAndManagementTrainingExpense} onChange={handleChange} />
//             <Input name="otherExpense" placeholder="Other Expense" value={current.otherExpense} onChange={handleChange} />
//             <Input name="totalInvestment" placeholder="Total Investment" value={current.totalInvestment} onChange={handleChange} />
//             <Input name="gst" placeholder="GST" value={current.gst} onChange={handleChange} />
//             <Input name="tokenAmount" placeholder="Token Amount" value={current.tokenAmount} onChange={handleChange} />

//             {/* GST Included Checkbox */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 name="gstIncluded"
//                 checked={current.gstIncluded}
//                 onChange={handleChange}
//               />
//               <label>GST Included</label>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* ---------------- SECTION 1 ---------------- */}
//       <div className="my-4">
//         <div className="items-center gap-2 mb-2">
//           <Label>Franchise Model Details</Label>
//         </div>

//         <div className="border p-4 rounded">
//           <div className="flex gap-4 border-b pb-2 mb-4">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 type="button"
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 font-semibold ${
//                   activeTab === tab
//                     ? "border-b-2 border-blue-500 text-blue-600"
//                     : "text-gray-600"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Input name="areaRequired" placeholder="Area Required" value={current.areaRequired} onChange={handleChange} />
//             <Input name="marketing" placeholder="Marketing" value={current.marketing} onChange={handleChange} />
//             <Input name="returnOfInvestment" placeholder="Return of Investment" value={current.returnOfInvestment} onChange={handleChange} />
//             <Input name="manPower" placeholder="Man Power" value={current.manPower} onChange={handleChange} />
//             <Input name="staffManagement" placeholder="Staff Management" value={current.staffManagement} onChange={handleChange} />
//             <Input name="royaltyPercent" placeholder="Royalty Percent" value={current.royaltyPercent} onChange={handleChange} />
//             <Input name="grossMargin" placeholder="Gross Margin" value={current.grossMargin} onChange={handleChange} />
//             <Input name="radiusArea" placeholder="Radius Area" value={current.radiusArea} onChange={handleChange} />
//           </div>
//         </div>
//       </div>

//       <button
//   type="button"
//   onClick={handleSubmit}
//   className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
// >
//   Save Franchise Details
// </button>

//     </div>
//   );
// }

// export default FranchiseExtraDetails;


import React, { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

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

const getEmptyFranchise = (): FranchiseData => ({
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
});

function FranchiseExtraDetails({ serviceId ,onSave,}: { serviceId: string , onSave?: () => void; }) {
  const [franchises, setFranchises] = useState<FranchiseData[]>([getEmptyFranchise()]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleChange = (index: number, e: any) => {
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
    setActiveIndex(franchises.length); // switch to the new tab
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
      .filter(f => f.investmentFranchiseSize || f.franchiseType || f.city || f.franchiseFee)
      .map(item => ({
        franchiseSize: item.investmentFranchiseSize,
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
    if (model.length > 0) {
      const modelResponse = await fetch("/api/service/franchise/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, model }),
      });
      const modelResult = await modelResponse.json();
      if (!modelResult.success) throw new Error("Model API failed");
    }

    if (investment.length > 0) {
      const investmentResponse = await fetch("/api/service/franchise/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, investment }),
      });
      const investmentResult = await investmentResponse.json();
      if (!investmentResult.success) throw new Error("Investment API failed");
    }

    alert("Franchise details saved successfully!");
    setFranchises([getEmptyFranchise()]);
    setActiveIndex(0);
    if (onSave) onSave();
  } catch (error) {
    console.error(error);
    alert("Something went wrong!");
  }
};

  // const handleSubmit = async () => {
  //   try {
  //     // Prepare model and investment arrays
  //     const model = franchises.map((item) => ({
  //       franchiseSize: item.franchiseSize,
  //       areaRequired: item.areaRequired,
  //       marketing: item.marketing,
  //       returnOfInvestment: item.returnOfInvestment,
  //       manPower: Number(item.manPower),
  //       staffManagement: item.staffManagement,
  //       royaltyPercent: item.royaltyPercent,
  //       grossMargin: item.grossMargin,
  //       radiusArea: item.radiusArea,
  //     }));

  //     const investment = franchises.map((item) => ({
  //       franchiseSize: item.investmentFranchiseSize,
  //       franchiseType: item.franchiseType,
  //       city: item.city,
  //       franchiseFee: Number(item.franchiseFee),
  //       businessLicenses: Number(item.businessLicenses),
  //       insurance: Number(item.insurance),
  //       legalAndAccountingFee: Number(item.legalAndAccountingFee),
  //       inventoryFee: Number(item.inventoryFee),
  //       officeSetup: Number(item.officeSetup),
  //       initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing),
  //       staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense),
  //       otherExpense: Number(item.otherExpense),
  //       totalInvestment: Number(item.totalInvestment),
  //       gstIncluded: item.gstIncluded,
  //       gst: Number(item.gst),
  //       tokenAmount: Number(item.tokenAmount),
  //     }));

  //       // ------------------ CALL MODEL API ------------------
  //   const modelResponse = await fetch("/api/service/franchise/model", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ serviceId, model }),
  //   });

  //   const modelResult = await modelResponse.json();

  //   // ------------------ CALL INVESTMENT API ------------------
  //   const investmentResponse = await fetch("/api/service/franchise/investment", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ serviceId, investment }),
  //   });

  //   const investmentResult = await investmentResponse.json();

  //   // Check both responses
  //   if (modelResult.success && investmentResult.success) {
  //     alert("Franchise details saved successfully!");
  //     setFranchises([getEmptyFranchise()]);
  //     setActiveIndex(0);
  //      if (onSave) onSave();
  //   } else {
  //     alert("Franchise details not saved. Please check your data.");
  //     console.error("Model API Response:", modelResult);
  //     console.error("Investment API Response:", investmentResult);
  //   }
  //   } catch (error) {
  //     console.error(error);
  //     alert("Something went wrong!");
  //   }
  // };

  const current = franchises[activeIndex];

  return (
    <div>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          {franchises.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-2 font-semibold ${
                activeIndex === idx
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Franchise #{idx + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={addFranchise}
            className="px-4 py-2 mx-3 text-white bg-blue-500 rounded"
          >
            + Add Franchise
          </button>
        </div>
      </div>

       {/* ---------------- Investment Section ---------------- */}
      <div className="border p-4 rounded mb-6">
        <Label>Investment Details</Label>
        <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input name="investmentFranchiseSize" placeholder="Franchise Size" value={current.investmentFranchiseSize} onChange={(e) => handleChange(activeIndex, e)} />

          <Input name="franchiseType" placeholder="Franchise Type" value={current.franchiseType} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="city" placeholder="City" value={current.city} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="franchiseFee" placeholder="Franchise Fee" value={current.franchiseFee} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="businessLicenses" placeholder="Business Licenses" value={current.businessLicenses} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="insurance" placeholder="Insurance" value={current.insurance} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="legalAndAccountingFee" placeholder="Legal & Accounting Fee" value={current.legalAndAccountingFee} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="inventoryFee" placeholder="Inventory Fee" value={current.inventoryFee} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="officeSetup" placeholder="Office Setup" value={current.officeSetup} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="initialStartupEquipmentAndMarketing" placeholder="Equipment & Marketing" value={current.initialStartupEquipmentAndMarketing} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="staffAndManagementTrainingExpense" placeholder="Staff & Training Expense" value={current.staffAndManagementTrainingExpense} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="otherExpense" placeholder="Other Expense" value={current.otherExpense} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="totalInvestment" placeholder="Total Investment" value={current.totalInvestment} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="gst" placeholder="GST" value={current.gst} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="tokenAmount" placeholder="Token Amount" value={current.tokenAmount} onChange={(e) => handleChange(activeIndex, e)} />
          <div className="flex items-center gap-2">
            <input type="checkbox" name="gstIncluded" checked={current.gstIncluded} onChange={(e) => handleChange(activeIndex, e)} />
            <label>GST Included</label>
          </div>
        </div>
      </div>

      {/* ---------------- Model Section ---------------- */}
      <div className="border p-4 rounded mb-6">
        <Label>Model Details</Label>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input name="franchiseSize" placeholder="Franchise Size" value={current.franchiseSize} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="areaRequired" placeholder="Area Required" value={current.areaRequired} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="marketing" placeholder="Marketing" value={current.marketing} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="returnOfInvestment" placeholder="Return of Investment" value={current.returnOfInvestment} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="manPower" placeholder="Man Power" value={current.manPower} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="staffManagement" placeholder="Staff Management" value={current.staffManagement} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="royaltyPercent" placeholder="Royalty Percent" value={current.royaltyPercent} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="grossMargin" placeholder="Gross Margin" value={current.grossMargin} onChange={(e) => handleChange(activeIndex, e)} />
          <Input name="radiusArea" placeholder="Radius Area" value={current.radiusArea} onChange={(e) => handleChange(activeIndex, e)} />
        </div>
      </div>

     

      <button
        type="button"
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
      >
        Save Franchise Details
      </button>
    </div>
  );
}

export default FranchiseExtraDetails;
