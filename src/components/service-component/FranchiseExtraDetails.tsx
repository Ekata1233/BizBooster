import React, { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";

function FranchiseExtraDetails({serviceId}) {
  const tabs = ["Small", "Medium", "Large"];
  const [activeTab, setActiveTab] = useState("Small");

  console.log("serviceId in extra details : ", serviceId);

  const initialFormState = {
  Small: {
    franchiseSize: "Small",
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
  },
  Medium: {
    franchiseSize: "Medium",
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
  },
  Large: {
    franchiseSize: "Large",
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
  }
};

  // ---------------- FORM DATA ----------------
const [formData, setFormData] = useState(initialFormState);


  console.log("formdata of the extra service : ", formData)
  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [activeTab]: {
        ...formData[activeTab],
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const current = formData[activeTab];

  const handleSubmit = async () => {
  try {
    // -------- MODEL DATA --------
    const model = [
      formData.Small,
      formData.Medium,
      formData.Large,
    ].map((item) => ({
      franchiseSize: item.franchiseSize,
      areaRequired: item.areaRequired,
      marketing: item.marketing,
      returnOfInvestment: item.returnOfInvestment,
      manPower: Number(item.manPower),
      staffManagement: item.staffManagement,
      royaltyPercent: item.royaltyPercent,
      grossMargin: item.grossMargin,
      radiusArea: item.radiusArea,
    }));

    // -------- INVESTMENT DATA --------
    const investment = [
      formData.Small,
      formData.Medium,
      formData.Large,
    ].map((item) => ({
      franchiseSize: item.franchiseSize,
      franchiseType: item.franchiseType,
      city: item.city,
      franchiseFee: Number(item.franchiseFee),
      businessLicenses: Number(item.businessLicenses),
      insurance: Number(item.insurance),
      legalAndAccountingFee: Number(item.legalAndAccountingFee),
      inventoryFee: Number(item.inventoryFee),
      officeSetup: Number(item.officeSetup),
      initialStartupEquipmentAndMarketing: Number(item.initialStartupEquipmentAndMarketing),
      staffAndManagementTrainingExpense: Number(item.staffAndManagementTrainingExpense),
      otherExpense: Number(item.otherExpense),
      totalInvestment: Number(item.totalInvestment),
      gstIncluded: item.gstIncluded,
      gst: Number(item.gst),
      tokenAmount: Number(item.tokenAmount),
    }));

    // ------------------ CALL MODEL API ------------------
    await fetch("/api/service/franchise/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        model,
      }),
    });

    // ------------------ CALL INVESTMENT API ------------------
    await fetch("/api/service/franchise/investment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        investment,
      }),
    });

    alert("Franchise details saved successfully!");
     setFormData(initialFormState);
    setActiveTab("Small");
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Something went wrong!");
  }
};


  return (
    <div>
      {/* ---------------- SECTION 2 : INVESTMENT RANGE ---------------- */}
      <div className="my-6">
        <div className="items-center gap-2 mb-2">
          <Label>Franchise Investment Range</Label>
        </div>

        <div className="border p-4 rounded">
          <div className="flex gap-4 border-b pb-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-green-500 text-green-600"
                    : "text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="franchiseType" placeholder="Franchise Type" value={current.franchiseType} onChange={handleChange} />
            <Input name="city" placeholder="City" value={current.city} onChange={handleChange} />
            <Input name="franchiseFee" placeholder="Franchise Fee" value={current.franchiseFee} onChange={handleChange} />
            <Input name="businessLicenses" placeholder="Business Licenses" value={current.businessLicenses} onChange={handleChange} />
            <Input name="insurance" placeholder="Insurance" value={current.insurance} onChange={handleChange} />
            <Input name="legalAndAccountingFee" placeholder="Legal & Accounting Fee" value={current.legalAndAccountingFee} onChange={handleChange} />
            <Input name="inventoryFee" placeholder="Inventory Fee" value={current.inventoryFee} onChange={handleChange} />
            <Input name="officeSetup" placeholder="Office Setup" value={current.officeSetup} onChange={handleChange} />
            <Input name="initialStartupEquipmentAndMarketing" placeholder="Equipment & Marketing" value={current.initialStartupEquipmentAndMarketing} onChange={handleChange} />
            <Input name="staffAndManagementTrainingExpense" placeholder="Staff & Training Expense" value={current.staffAndManagementTrainingExpense} onChange={handleChange} />
            <Input name="otherExpense" placeholder="Other Expense" value={current.otherExpense} onChange={handleChange} />
            <Input name="totalInvestment" placeholder="Total Investment" value={current.totalInvestment} onChange={handleChange} />
            <Input name="gst" placeholder="GST" value={current.gst} onChange={handleChange} />
            <Input name="tokenAmount" placeholder="Token Amount" value={current.tokenAmount} onChange={handleChange} />

            {/* GST Included Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="gstIncluded"
                checked={current.gstIncluded}
                onChange={handleChange}
              />
              <label>GST Included</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* ---------------- SECTION 1 ---------------- */}
      <div className="my-4">
        <div className="items-center gap-2 mb-2">
          <Label>Franchise Model Details</Label>
        </div>

        <div className="border p-4 rounded">
          <div className="flex gap-4 border-b pb-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="areaRequired" placeholder="Area Required" value={current.areaRequired} onChange={handleChange} />
            <Input name="marketing" placeholder="Marketing" value={current.marketing} onChange={handleChange} />
            <Input name="returnOfInvestment" placeholder="Return of Investment" value={current.returnOfInvestment} onChange={handleChange} />
            <Input name="manPower" placeholder="Man Power" value={current.manPower} onChange={handleChange} />
            <Input name="staffManagement" placeholder="Staff Management" value={current.staffManagement} onChange={handleChange} />
            <Input name="royaltyPercent" placeholder="Royalty Percent" value={current.royaltyPercent} onChange={handleChange} />
            <Input name="grossMargin" placeholder="Gross Margin" value={current.grossMargin} onChange={handleChange} />
            <Input name="radiusArea" placeholder="Radius Area" value={current.radiusArea} onChange={handleChange} />
          </div>
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
