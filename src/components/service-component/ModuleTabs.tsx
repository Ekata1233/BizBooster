import React, { useState } from "react";
import BasicDetailsForm from "./BasicDetailsForm";
import ServiceDetailsForm from "./ServiceDetailsForm";
import FranchiseDetailsForm from "./FranchiseDetailsForm";
import { moduleFieldConfig } from "@/utils/moduleFieldConfig";

interface ModuleTabsProps {
  selectedModule: string;
  data: any;
  setData: (newData: any) => void;
  price?: number;
}

const ModuleTabs: React.FC<ModuleTabsProps> = ({ selectedModule, data, setData, price }) => {

  const config = moduleFieldConfig[selectedModule] || {};

  console.log("data in moduel form : ", data)

  return (
    <div>
      {/* Tabs */}

      {/* Forms */}
      <div>
        {/* {activeTab === "basic" && ( */}
          <BasicDetailsForm
            data={data.basicDetails || {}}
            setData={(d) => setData({ ...data, basicDetails: d })}
            fieldsConfig={config.basicDetails}
          />
        {/* )}
        {activeTab === "service" && ( */}
          <ServiceDetailsForm
            data={data.serviceDetails || {}}
            setData={(d) => setData({ ...data, serviceDetails: d })}
            fieldsConfig={config.serviceDetails}
          />
        {/* )}
        {activeTab === "franchise" && ( */}
          <FranchiseDetailsForm
            data={data.franchiseDetails || {}}
            setData={(d) => setData({ ...data, franchiseDetails: d })}
            price={price}
            fieldsConfig={config.franchiseDetails}
          />
        {/* )} */}
      </div>
    </div>
  );
};

export default ModuleTabs;
