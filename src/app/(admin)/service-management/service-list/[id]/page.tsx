'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";

import {  useService } from '@/context/ServiceContext';
import ComponentCard from '@/components/common/ComponentCard';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
import FranchiseExtraDetails from '@/components/service-component/FranchiseExtraDetails';
import BasicUpdateForm from '@/components/service-update/BasicUpdateForm';
import ServiceUpdateForm from '@/components/service-update/ServiceUpdateForm';
import FranchiseUpdateForm from '@/components/service-update/FranchiseUpdateForm';

const modules = [
  { name: "Franchise", icon: <FaStore size={36} /> },
  { name: "Business", icon: <FaBusinessTime size={36} /> },
  { name: "Marketing", icon: <FaBullhorn size={36} /> },
  { name: "LegalServices", icon: <FaBalanceScale size={36} /> },
  { name: "Finance", icon: <FaMoneyBillWave size={36} /> },
  { name: "ItServices", icon: <FaLaptopCode size={36} /> },
  { name: "Education", icon: <FaBook size={36} /> },
  { name: "OnDemand", icon: <FaTruck size={36} /> },
  { name: "AIHub", icon: <FaRobot size={36} /> },
];

const initialFormData = {
  serviceName: "",
  category: "",
  subcategory: "",
  price: 0,
  discount: 0,
  discountedPrice: 0,
  includeGst: false,
  gst: 0,
  tags: [],
  recommendedServices: false,
  keyValues: [],
  thumbnailImage: "",
  bannerImages: [],
  serviceDetails: {},
  franchiseDetails: {}
};

const EditService: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { fetchSingleService, singleService: service, updateService } = useService();
  const [newService, setNewService] = useState<any>(null);
    const [selectedModule, setSelectedModule] = useState(modules[0].name);
  const [createdServiceId, setCreatedServiceId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [franchiseStep, setFranchiseStep] = useState<number>(1);
const [formData, setFormData] = useState(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);


  // 1) Fetch single service on load
  useEffect(() => {
    if (!id) return;
    fetchSingleService(id as string);
    // console.log("fetched service for the update : ", service)

  }, [id]);


  // ---------- Build FormData and send update ----------
  const handleUpdate = async () => {
    if (!service) {
      alert('Service not loaded yet.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // --- BASIC fields ---
     console.log("fd : ", fd)

      // finally call updateService (your context function)
      const response = await updateService(service._id, fd);

      if (response?.success) {
        alert('Service updated successfully!');
        router.push('/service-management/service-list');
      } else {
        console.error('Update failed', response);
        alert('Update failed — check console for details.');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      alert('An error occurred while updating. See console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = moduleFieldConfig[selectedModule] || {};
  const isFranchiseSelected = selectedModule === 'Franchise';
  useEffect(() => {
    if (!service) return;

    setFormData({
      serviceName: service.serviceName || "",
      category: service.category?._id || "",
      subcategory: service.subcategory?._id || "",
      price: service.price || 0,
      discount: service.discount || 0,
      discountedPrice: service.discountedPrice || 0,
      includeGst: service.includeGst || false,
      gst: service.gst || 0,
      tags: service.tags || [],
      recommendedServices: service.recommendedServices || false,
      keyValues: service.keyValues || [],
      thumbnailImage: service.thumbnailImage || "",
      bannerImages: service.bannerImages || [],
      serviceDetails: service.serviceDetails || {},
      franchiseDetails: service.franchiseDetails || {}
    });
  }, [service]);

  console.log("formdata for the update : ", formData);

  if (!service) return <p>Loading...</p>;

  return (
    <div className="no-scrollbar w-full max-w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 mx-auto mt-8">
      <ComponentCard title="Edit Service">
        <div>
      {/* Sticky Module Selection */}
      <div className="sticky top-16 z-20 bg-white py-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-4">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border transition-all duration-200 
              ${selectedModule === mod.name 
                ? "bg-blue-500 text-white border-blue-600" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
              onClick={() => {
                setSelectedModule(mod.name);
                // reset stepper to step 1 whenever Franchise module is selected
                if (mod.name === 'Franchise') setFranchiseStep(1);
              }}
            >
              <div className="text-2xl">{mod.icon}</div>
              <p className="text-xs font-medium mt-1 text-center">{mod.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Franchise Stepper Header - Moved to top of BasicDetailsForm */}
      {isFranchiseSelected && (
       <div className="mb-6 border rounded-xl p-6 bg-white shadow-sm">
 

  {/* Stepper */}
 <div className="">
  <div className="flex items-center justify-center gap-6">

    {/* STEP 1 */}
    <div
      onClick={() => setFranchiseStep(1)}
      className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all 
        ${franchiseStep === 1 ? "bg-blue-600 text-white shadow-md border-blue-600" :
        "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
      `}
    >
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
        {franchiseStep > 1 ? "✓" : "1"}
      </div>
      <span className="font-medium">Franchise Basic Details</span>
    </div>

    {/* LINE */}
    <div className="w-12 h-1 bg-gray-300"></div>

    {/* STEP 2 */}
    <div
      onClick={() => {
    if (!createdServiceId) {
      alert("Please complete Step-1 and submit before going to Step-2.");
      return;
    }
    setFranchiseStep(2);
  }}
      className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all
        ${franchiseStep === 2 ? "bg-blue-600 text-white shadow-md border-blue-600" :
        "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
      `}
    >
      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
        2
      </div>
      <span className="font-medium">Franchise Extra Details</span>
    </div>

  </div>
</div>


</div>
      )}
    </div>
        <div className="space-y-6">
  {isFranchiseSelected ? (
        franchiseStep === 1 ? (
          <>
          
          <BasicUpdateForm data={formData} setData={setFormData} />
 <hr className="border-gray-300" />
         
          <ServiceUpdateForm data={formData} setData={setFormData} />
 <hr className="border-gray-300" />
          
          <FranchiseUpdateForm data={formData} setData={setFormData}  fieldsConfig={config.franchiseDetails} />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
            </>
        ) : (
          
          <FranchiseExtraDetails serviceId={createdServiceId}  onSave={() => setFranchiseStep(1)} />
        )
      ) : (
        <>
         <BasicUpdateForm data={formData} setData={setFormData} />
 <hr className="border-gray-300" />
         
          <ServiceUpdateForm data={formData} setData={setFormData} />
 <hr className="border-gray-300" />
          
          <FranchiseUpdateForm data={formData} setData={setFormData}  fieldsConfig={config.franchiseDetails} />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
          </>
      )}</div>
      </ComponentCard>
    </div>
  );
};

export default EditService;
