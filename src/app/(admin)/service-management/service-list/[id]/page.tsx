// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";

// import {  useService } from '@/context/ServiceContext';
// import ComponentCard from '@/components/common/ComponentCard';
// import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
// import FranchiseExtraDetails from '@/components/service-component/FranchiseExtraDetails';
// import BasicUpdateForm from '@/components/service-update/BasicUpdateForm';
// import ServiceUpdateForm from '@/components/service-update/ServiceUpdateForm';
// import FranchiseUpdateForm from '@/components/service-update/FranchiseUpdateForm';

// const modules = [
//   { name: "Franchise", icon: <FaStore size={36} /> },
//   { name: "Business", icon: <FaBusinessTime size={36} /> },
//   { name: "Marketing", icon: <FaBullhorn size={36} /> },
//   { name: "LegalServices", icon: <FaBalanceScale size={36} /> },
//   { name: "Finance", icon: <FaMoneyBillWave size={36} /> },
//   { name: "ItServices", icon: <FaLaptopCode size={36} /> },
//   { name: "Education", icon: <FaBook size={36} /> },
//   { name: "OnDemand", icon: <FaTruck size={36} /> },
//   { name: "AIHub", icon: <FaRobot size={36} /> },
// ];

// const initialFormData = {
//   basic: {
//     serviceName: "",
//     category: "",
//     subcategory: "",
//     price: 0,
//     discount: 0,
//     discountedPrice: 0,
//     includeGst: false,
//     gst: 0,
//     recommendedServices: false,
//     tags: [],
//     keyValues: [],
//     thumbnailImage: "",
//     bannerImages: [],
//   },
//   service: {
//     benefits: [],
//     aboutUs: [],
//     document: [],
//     termsAndConditions: [],
//     highlight: [],
//     assuredByFetchTrue: [],
//     howItWorks: [],
//     whyChooseUs: [],
//     weRequired: [],
//     weDeliver: [],
//     packages: [],
//     moreInfo: [],
//     faq: [],
//     connectWith: [],
//     timeRequired: [],
//     extraImages: [],
//     extraSections: [],
//   },
//   franchise: {
//     commission: "",
//     termsAndConditions: "",
//     investmentRange: [],
//     monthlyEarnPotential: [],
//     franchiseModel: [],
//     extraSections: [],
//     extraImages: [],
//   },
// }
// const EditService: React.FC = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const { fetchSingleService, singleService: service, updateService } = useService();
//   const [newService, setNewService] = useState<any>(null);
//     const [selectedModule, setSelectedModule] = useState(modules[0].name);
//   const [initialized, setInitialized] = useState(false);
//   const [franchiseStep, setFranchiseStep] = useState<number>(1);
// const [formData, setFormData] = useState(initialFormData);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const createdServiceId = service?._id;


//   // 1) Fetch single service on load
//   useEffect(() => {
//     if (!id) return;
//     fetchSingleService(id as string);
//     // console.log("fetched service for the update : ", service)

//   }, [id]);


//   const handleUpdate = async () => {
//     if (!service) {
//       alert("Service not loaded yet.");
//       return;
//     }
  
//     setIsSubmitting(true);
  
//     try {
//       const fd = new FormData();
  
//       /* ================= BASIC ================= */
//       fd.append("serviceName", formData.basic.serviceName || "");
//       fd.append("category", formData.basic.category || "");
  
//       if (formData.basic.subcategory?.trim()) {
//         fd.append("subcategory", formData.basic.subcategory);
//       }
  
//       fd.append("price", String(formData.basic.price || 0));
//       fd.append("discount", String(formData.basic.discount || 0));
//       fd.append("discountedPrice", String(formData.basic.discountedPrice || 0));
//       fd.append("gst", String(formData.basic.gst || 0));
//       fd.append("includeGst", formData.basic.includeGst ? "true" : "false");
//       fd.append(
//         "recommendedServices",
//         formData.basic.recommendedServices ? "true" : "false"
//       );
  
//       /* ================= TAGS ================= */
//       formData.basic.tags?.forEach((tag, i) =>
//         fd.append(`tags[${i}]`, tag)
//       );
  
//       /* ================= KEY VALUES ================= */
//       formData.basic.keyValues?.forEach((kv, i) => {
//         fd.append(`keyValues[${i}][key]`, kv.key || "");
//         fd.append(`keyValues[${i}][value]`, kv.value || "");
//       });
  
//       /* ================= THUMBNAIL ================= */
//       if (formData.basic.thumbnailImage instanceof File) {
//         fd.append("thumbnail", formData.basic.thumbnailImage);
//       }
  
//       /* ================= BANNER ================= */
//       const existingBannerUrls: string[] = [];
  
//       formData.basic.bannerImages?.forEach((img, i) => {
//         if (img instanceof File) {
//           fd.append(`bannerImages[${i}]`, img);
//         } else if (typeof img === "string") {
//           existingBannerUrls.push(img);
//         }
//       });
  
//       fd.append("existingBannerImages", JSON.stringify(existingBannerUrls));
  
//       /* ================= SIMPLE ARRAYS ================= */
//       fd.append("benefits", JSON.stringify(formData.service.benefits || []));
//       fd.append("aboutUs", JSON.stringify(formData.service.aboutUs || []));
//       fd.append("document", JSON.stringify(formData.service.document || []));
//       fd.append(
//         "termsAndConditions",
//         JSON.stringify(formData.service.termsAndConditions || [])
//       );
  
//       /* ================= HIGHLIGHT ================= */
//       await Promise.all(
//         formData.service.highlight?.map(async (item, i) => {
//           if (item instanceof File) {
//             fd.append(`serviceDetails[highlight][${i}]`, item);
//           } else if (typeof item === "string" && item.startsWith("blob:")) {
//             const blob = await fetch(item).then(res => res.blob());
//             const file = new File([blob], `highlight-${i}.png`, { type: blob.type });
//             fd.append(`serviceDetails[highlight][${i}]`, file);
//           } else if (typeof item === "string") {
//             fd.append(`serviceDetails[highlight][${i}]`, item);
//           }
//         }) || []
//       );
  
//       /* ================= ICON SECTIONS ================= */
//       const iconSection = async (arr: any[], key: string) => {
//         await Promise.all(
//           arr.map(async (item, i) => {
//             fd.append(`serviceDetails[${key}][${i}][title]`, item.title || "");
//             fd.append(
//               `serviceDetails[${key}][${i}][description]`,
//               item.description || ""
//             );
  
//             if (item.icon instanceof File) {
//               fd.append(`serviceDetails[${key}][${i}][icon]`, item.icon);
//             } else if (
//               typeof item.icon === "string" &&
//               item.icon.startsWith("blob:")
//             ) {
//               const blob = await fetch(item.icon).then(res => res.blob());
//               const file = new File([blob], `${key}-${i}.png`, {
//                 type: blob.type,
//               });
//               fd.append(`serviceDetails[${key}][${i}][icon]`, file);
//             } else if (typeof item.icon === "string") {
//               fd.append(`serviceDetails[${key}][${i}][icon]`, item.icon);
//             }
//           })
//         );
//       };
  
//       await iconSection(formData.service.assuredByFetchTrue || [], "assuredByFetchTrue");
//       await iconSection(formData.service.howItWorks || [], "howItWorks");
//       await iconSection(formData.service.whyChooseUs || [], "whyChooseUs");
//       await iconSection(formData.service.weRequired || [], "weRequired");
//       await iconSection(formData.service.weDeliver || [], "weDeliver");
  
//       /* ================= FAQ ================= */
//       formData.service.faq?.forEach((f, i) => {
//         fd.append(`serviceDetails[faq][${i}][question]`, f.question || "");
//         fd.append(`serviceDetails[faq][${i}][answer]`, f.answer || "");
//       });
  
//       /* ================= PACKAGES ================= */
//       formData.service.packages?.forEach((p, i) => {
//         fd.append(`serviceDetails[packages][${i}][name]`, p.name || "");
//         fd.append(`serviceDetails[packages][${i}][price]`, String(p.price || 0));
//         fd.append(`serviceDetails[packages][${i}][discount]`, String(p.discount || 0));
//         fd.append(
//           `serviceDetails[packages][${i}][discountedPrice]`,
//           String(p.discountedPrice || 0)
//         );
//         p.whatYouGet?.forEach((v: string, j: number) =>
//           fd.append(`serviceDetails[packages][${i}][whatYouGet][${j}]`, v)
//         );
//       });
  
//       /* ================= TIME REQUIRED ================= */
//       formData.service.timeRequired?.forEach((t, i) => {
//         fd.append(
//           `serviceDetails[timeRequired][${i}][minDays]`,
//           String(t.minDays || 0)
//         );
//         fd.append(
//           `serviceDetails[timeRequired][${i}][maxDays]`,
//           String(t.maxDays || 0)
//         );
//       });
  
//       /* ================= MORE INFO ================= */
//       await Promise.all(
//         formData.service.moreInfo?.map(async (m, i) => {
//           fd.append(`serviceDetails[moreInfo][${i}][title]`, m.title || "");
//           fd.append(
//             `serviceDetails[moreInfo][${i}][description]`,
//             m.description || ""
//           );
  
//           if (m.image instanceof File) {
//             fd.append(`serviceDetails[moreInfo][${i}][image]`, m.image);
//           } else if (
//             typeof m.image === "string" &&
//             m.image.startsWith("blob:")
//           ) {
//             const blob = await fetch(m.image).then(res => res.blob());
//             const file = new File([blob], `moreInfo-${i}.png`, {
//               type: blob.type,
//             });
//             fd.append(`serviceDetails[moreInfo][${i}][image]`, file);
//           } else if (typeof m.image === "string") {
//             fd.append(`serviceDetails[moreInfo][${i}][image]`, m.image);
//           }
//         }) || []
//       );
  
//       /* ================= CONNECT WITH ================= */
//       formData.service.connectWith?.forEach((c, i) => {
//         fd.append(`serviceDetails[connectWith][${i}][name]`, c.name || "");
//         fd.append(`serviceDetails[connectWith][${i}][mobileNo]`, c.mobileNo || "");
//         fd.append(`serviceDetails[connectWith][${i}][email]`, c.email || "");
//       });
  
//       /* ================= EXTRA IMAGES ================= */
//       await Promise.all(
//         formData.service.extraImages?.map(async (img, i) => {
//           if (img instanceof File) {
//             fd.append(`serviceDetails[extraImages][${i}]`, img);
//           } else if (typeof img === "string" && img.startsWith("blob:")) {
//             const blob = await fetch(img).then(res => res.blob());
//             const file = new File([blob], `extra-${i}.png`, { type: blob.type });
//             fd.append(`serviceDetails[extraImages][${i}]`, file);
//           } else if (typeof img === "string") {
//             fd.append(`serviceDetails[extraImages][${i}]`, img);
//           }
//         }) || []
//       );
  
//       /* ================= FRANCHISE ================= */
//       fd.append(
//         "franchiseDetails[commission]",
//         formData.franchise.commission || ""
//       );
      
//       // Terms & Conditions
//       fd.append(
//         "franchiseDetails[termsAndConditions]",
//         formData.franchise.termsAndConditions || ""
//       );
      
//       /* -------- Investment Range -------- */
//       formData.franchise.investmentRange?.forEach((item, i) => {
//         fd.append(
//           `franchiseDetails[investmentRange][${i}][minRange]`,
//           String(item.minRange || 0)
//         );
//         fd.append(
//           `franchiseDetails[investmentRange][${i}][maxRange]`,
//           String(item.maxRange || 0)
//         );
//       });
      
//       /* -------- Monthly Earn Potential -------- */
//       formData.franchise.monthlyEarnPotential?.forEach((item, i) => {
//         fd.append(
//           `franchiseDetails[monthlyEarnPotential][${i}][minEarn]`,
//           String(item.minEarn || 0)
//         );
//         fd.append(
//           `franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`,
//           String(item.maxEarn || 0)
//         );
//       });
      
//       /* -------- Franchise Model -------- */
//       formData.franchise.franchiseModel?.forEach((model, i) => {
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][title]`,
//           model.title || ""
//         );
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][agreement]`,
//           model.agreement || ""
//         );
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][price]`,
//           String(model.price || 0)
//         );
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][discount]`,
//           String(model.discount || 0)
//         );
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][gst]`,
//           String(model.gst || 0)
//         );
//         fd.append(
//           `franchiseDetails[franchiseModel][${i}][fees]`,
//           String(model.fees || 0)
//         );
//       });
      
//       /* -------- Extra Sections (Franchise) -------- */
//       await Promise.all(
//         formData.franchise.extraSections?.map(async (section, i) => {
//           fd.append(
//             `franchiseDetails[extraSections][${i}][title]`,
//             section.title || ""
//           );
      
//           section.subtitle?.forEach((v, j) =>
//             fd.append(
//               `franchiseDetails[extraSections][${i}][subtitle][${j}]`,
//               v || ""
//             )
//           );
      
//           section.description?.forEach((v, j) =>
//             fd.append(
//               `franchiseDetails[extraSections][${i}][description][${j}]`,
//               v || ""
//             )
//           );
      
//           section.subDescription?.forEach((v, j) =>
//             fd.append(
//               `franchiseDetails[extraSections][${i}][subDescription][${j}]`,
//               v || ""
//             )
//           );
      
//           section.lists?.forEach((v, j) =>
//             fd.append(
//               `franchiseDetails[extraSections][${i}][lists][${j}]`,
//               v || ""
//             )
//           );
      
//           section.tags?.forEach((v, j) =>
//             fd.append(
//               `franchiseDetails[extraSections][${i}][tags][${j}]`,
//               v || ""
//             )
//           );
      
//           // Images
//           if (Array.isArray(section.image)) {
//             for (let j = 0; j < section.image.length; j++) {
//               const img = section.image[j];
      
//               if (img instanceof File) {
//                 fd.append(
//                   `franchiseDetails[extraSections][${i}][image][${j}]`,
//                   img
//                 );
//               } else if (typeof img === "string" && img.startsWith("blob:")) {
//                 const blob = await fetch(img).then(res => res.blob());
//                 const file = new File(
//                   [blob],
//                   `franchise-section-${i}-${j}.png`,
//                   { type: blob.type }
//                 );
//                 fd.append(
//                   `franchiseDetails[extraSections][${i}][image][${j}]`,
//                   file
//                 );
//               } else if (typeof img === "string") {
//                 fd.append(
//                   `franchiseDetails[extraSections][${i}][image][${j}]`,
//                   img
//                 );
//               }
//             }
//           }
//         }) || []
//       );
      
//       /* -------- Extra Images -------- */
//       await Promise.all(
//         formData.franchise.extraImages?.map(async (img, i) => {
//           if (img instanceof File) {
//             fd.append(`franchiseDetails[extraImages][${i}]`, img);
//           } else if (typeof img === "string" && img.startsWith("blob:")) {
//             const blob = await fetch(img).then(res => res.blob());
//             const file = new File([blob], `franchise-extra-${i}.png`, {
//               type: blob.type,
//             });
//             fd.append(`franchiseDetails[extraImages][${i}]`, file);
//           } else if (typeof img === "string") {
//             fd.append(`franchiseDetails[extraImages][${i}]`, img);
//           }
//         }) || []);
  
//       /* ================= API ================= */
//       const res = await updateService(service._id, fd);
  
//       if (res?.success) {
//         alert("Service updated successfully");
//         router.push("/service-management/service-list");
//       } else {
//         alert(res?.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       alert("Something went wrong");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  

//   const config = moduleFieldConfig[selectedModule] || {};
//   const isFranchiseSelected = selectedModule === 'Franchise';
//   useEffect(() => {
//     if (!service) return;
  
//     setFormData((prev) => ({
//       ...prev,
  
//       // ---------------- BASIC ----------------
//       basic: {
//         serviceName: service.serviceName || "",
//         category: service.category?._id || "",
//         subcategory: service.subcategory?._id || "",
//         price: service.price || 0,
//         discount: service.discount || 0,
//         gst: service.gst || 0,
//         includeGst: service.includeGst || false,
//         recommendedServices: service.recommendedServices || false,
//         tags: service.tags || [],
//         keyValues: service.keyValues || [],
//         thumbnailImage: service.thumbnailImage || "",
//         bannerImages: service.bannerImages || [],
//       },
  
//       // ---------------- SERVICE DETAILS ----------------
//       service: {
//         benefits: service.serviceDetails?.benefits || [],
//         aboutUs: service.serviceDetails?.aboutUs || [],
//         document: service.serviceDetails?.document || [],
//         termsAndConditions: service.serviceDetails?.termsAndConditions || [],
//         highlight: service.serviceDetails?.highlight || [],
//         assuredByFetchTrue: service.serviceDetails?.assuredByFetchTrue || [],
//         howItWorks: service.serviceDetails?.howItWorks || [],
//         whyChooseUs: service.serviceDetails?.whyChooseUs || [],
//         weRequired: service.serviceDetails?.weRequired || [],
//         weDeliver: service.serviceDetails?.weDeliver || [],
//         packages: service.serviceDetails?.packages || [],
//         faq: service.serviceDetails?.faq || [],
//         moreInfo: service.serviceDetails?.moreInfo || [],
//         connectWith: service.serviceDetails?.connectWith || [],
//         timeRequired: service.serviceDetails?.timeRequired || [],
//         extraImages: service.serviceDetails?.extraImages || [],
//         extraSections: service.serviceDetails?.extraSections || [],
//       },
  
//       // ---------------- FRANCHISE DETAILS ----------------
//       franchise: {
//         commission: service.franchiseDetails?.commission || "",
//         termsAndConditions: service.franchiseDetails?.termsAndConditions || "",
//         investmentRange: service.franchiseDetails?.investmentRange || [],
//         monthlyEarnPotential: service.franchiseDetails?.monthlyEarnPotential || [],
//         franchiseModel: service.franchiseDetails?.franchiseModel || [],
//         extraSections: service.franchiseDetails?.extraSections || [],
//         extraImages: service.franchiseDetails?.extraImages || [],
//       },
//     }));
//   }, [service]);
  

//   console.log("formdata for the update : ", formData);

//   if (!service) return <p>Loading...</p>;

//   return (
//     <div className="no-scrollbar w-full max-w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 mx-auto mt-8">
//       <ComponentCard title="Edit Service">
//         <div>
//       {/* Sticky Module Selection */}
//       <div className="sticky top-16 z-20 bg-white py-2">
//         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-4">
//           {modules.map((mod) => (
//             <div
//               key={mod.name}
//               className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border transition-all duration-200 
//               ${selectedModule === mod.name 
//                 ? "bg-blue-500 text-white border-blue-600" 
//                 : "bg-white text-gray-700 hover:bg-gray-100"}`}
//               onClick={() => {
//                 setSelectedModule(mod.name);
//                 // reset stepper to step 1 whenever Franchise module is selected
//                 if (mod.name === 'Franchise') setFranchiseStep(1);
//               }}
//             >
//               <div className="text-2xl">{mod.icon}</div>
//               <p className="text-xs font-medium mt-1 text-center">{mod.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Franchise Stepper Header - Moved to top of BasicDetailsForm */}
//       {isFranchiseSelected && (
//        <div className="mb-6 border rounded-xl p-6 bg-white shadow-sm">
 

//   {/* Stepper */}
//  <div className="">
//   <div className="flex items-center justify-center gap-6">

//     {/* STEP 1 */}
//     <div
//       onClick={() => setFranchiseStep(1)}
//       className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all 
//         ${franchiseStep === 1 ? "bg-blue-600 text-white shadow-md border-blue-600" :
//         "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
//       `}
//     >
//       <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
//         {franchiseStep > 1 ? "✓" : "1"}
//       </div>
//       <span className="font-medium">Franchise Basic Details</span>
//     </div>

//     {/* LINE */}
//     <div className="w-12 h-1 bg-gray-300"></div>

//     {/* STEP 2 */}
//     <div
//       onClick={() => {
//     if (!createdServiceId) {
//       alert("Please complete Step-1 and submit before going to Step-2.");
//       return;
//     }
//     setFranchiseStep(2);
//   }}
//       className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all
//         ${franchiseStep === 2 ? "bg-blue-600 text-white shadow-md border-blue-600" :
//         "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
//       `}
//     >
//       <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
//         2
//       </div>
//       <span className="font-medium">Franchise Extra Details</span>
//     </div>

//   </div>
// </div>


// </div>
//       )}
//     </div>
//         <div className="space-y-6">
//   {isFranchiseSelected ? (
//         franchiseStep === 1 ? (
//           <>
          
//           <BasicUpdateForm data={formData} setData={setFormData} />
//  <hr className="border-gray-300" />
         
//           <ServiceUpdateForm data={formData} setData={setFormData} />
//  <hr className="border-gray-300" />
          
//           <FranchiseUpdateForm data={formData} setData={setFormData}  fieldsConfig={config.franchiseDetails} />

//           <div className="flex justify-end gap-3 pt-4">
//             <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

//             <button
//               type="button"
//               onClick={handleUpdate}
//               disabled={isSubmitting}
//               className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
//             >
//               {isSubmitting ? 'Updating...' : 'Update'}
//             </button>
//           </div>
//             </>
//         ) : (
          
//           <FranchiseExtraDetails serviceId={createdServiceId}  onSave={() => setFranchiseStep(1)} />
//         )
//       ) : (
//         <>
//          <BasicUpdateForm data={formData} setData={setFormData} />
//  <hr className="border-gray-300" />
         
//           <ServiceUpdateForm data={formData} setData={setFormData} />
//  <hr className="border-gray-300" />
          
//           <FranchiseUpdateForm data={formData} setData={setFormData}  fieldsConfig={config.franchiseDetails} />

//           <div className="flex justify-end gap-3 pt-4">
//             <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

//             <button
//               type="button"
//               onClick={handleUpdate}
//               disabled={isSubmitting}
//               className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
//             >
//               {isSubmitting ? 'Updating...' : 'Update'}
//             </button>
//           </div>
//           </>
//       )}</div>
//       </ComponentCard>
//     </div>
//   );
// };

// export default EditService;


'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";

import { useService } from '@/context/ServiceContext';
import ComponentCard from '@/components/common/ComponentCard';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
import FranchiseExtraDetails from '@/components/service-component/FranchiseExtraDetails';
import BasicUpdateForm from '@/components/service-update/BasicUpdateForm';
import ServiceUpdateForm from '@/components/service-update/ServiceUpdateForm';
import FranchiseUpdateForm from '@/components/service-update/FranchiseUpdateForm';
import FranchiseExtraUpdate from '@/components/service-update/FranchiseExtraUpdate';

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
  basic: {
    serviceName: "",
    category: "",
    subcategory: "",
    price: 0,
    discount: 0,
    discountedPrice: 0,
    includeGst: false,
    gst: 0,
    recommendedServices: false,
    tags: [],
    keyValues: [],
    thumbnailImage: "",
    bannerImages: [],
  },
  serviceDetails: {
    benefits: [],
    aboutUs: [],
    document: [],
    termsAndConditions: [],
    highlight: [],
    assuredByFetchTrue: [],
    howItWorks: [],
    whyChooseUs: [],
    weRequired: [],
    weDeliver: [],
    packages: [],
    moreInfo: [],
    faq: [],
    connectWith: [],
    timeRequired: [],
    extraImages: [],
    extraSections: [],
  },
  franchiseDetails: {
    commission: "",
    termsAndConditions: "",
    investmentRange: [],
    monthlyEarnPotential: [],
    franchiseModel: [],
    extraSections: [],
    extraImages: [],
  },
};

const EditService: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { fetchSingleService, singleService: service, updateService } = useService();
  const [selectedModule, setSelectedModule] = useState(modules[0].name);
  const [initialized, setInitialized] = useState(false);
  const [franchiseStep, setFranchiseStep] = useState<number>(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [franchiseExtraKey, setFranchiseExtraKey] = useState(0);
  const [createdServiceId, setCreatedServiceId] = useState(null);
const [loading, setLoading] = useState(true);
  // Fetch single service on load
  useEffect(() => {
    if (!id) return;
    fetchSingleService(id as string);
  }, [id]);

  // Initialize form data when service is loaded
  useEffect(() => {
    if (!service) return;
    // setCreatedServiceId(service._id);
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
  }, [service , initialized]);

    console.log("service  : ", service)

  console.log("formdata : ", formData)

  const handleUpdate = async () => {
    if (!service) {
      alert("Service not loaded yet.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      console.log("ff : ", fd)

      /* ================= BASIC ================= */
      fd.append("serviceName", formData.serviceName || "");
      fd.append("category", formData.category || "");

      if (formData.subcategory?.trim()) {
        fd.append("subcategory", formData.subcategory);
      }

      fd.append("price", String(formData.price || 0));
      fd.append("discount", String(formData.discount || 0));
      fd.append("discountedPrice", String(formData.discountedPrice || 0));
      fd.append("gst", String(formData.gst || 0));
      fd.append("includeGst", formData.includeGst ? "true" : "false");
      fd.append(
        "recommendedServices",
        formData.recommendedServices ? "true" : "false"
      );

      /* ================= TAGS ================= */
      formData.tags?.forEach((tag, i) =>
        fd.append(`tags[${i}]`, tag)
      );

      /* ================= KEY VALUES ================= */
      formData.keyValues?.forEach((kv, i) => {
        fd.append(`keyValues[${i}][key]`, kv.key || "");
        fd.append(`keyValues[${i}][value]`, kv.value || "");
      });

      /* ================= THUMBNAIL ================= */
      if (formData.thumbnailImage instanceof File) {
        fd.append("thumbnail", formData.thumbnailImage);
      } else if (formData.thumbnailImage) {
        fd.append("thumbnail", formData.thumbnailImage);
      }

      /* ================= BANNER ================= */
      const existingBannerUrls: string[] = [];

      formData.bannerImages?.forEach((img, i) => {
        if (img instanceof File) {
          fd.append(`bannerImages[${i}]`, img);
        } else if (typeof img === "string") {
          existingBannerUrls.push(img);
        }
      });

      if (existingBannerUrls.length > 0) {
        fd.append("existingBannerImages", JSON.stringify(existingBannerUrls));
      }

      /* ================= SERVICE DETAILS ================= */
      fd.append("benefits", JSON.stringify(formData.serviceDetails.benefits || []));
      fd.append("aboutUs", JSON.stringify(formData.serviceDetails.aboutUs || []));
      fd.append("document", JSON.stringify(formData.serviceDetails.document || []));
      fd.append(
        "termsAndConditions",
        JSON.stringify(formData.serviceDetails.termsAndConditions || [])
      );

      /* ================= HIGHLIGHT ================= */
      await Promise.all(
        (formData.serviceDetails.highlight || []).map(async (item, i) => {
          if (item instanceof File) {
            fd.append(`serviceDetails[highlight][${i}]`, item);
          } else if (typeof item === "string" && item.startsWith("blob:")) {
            const blob = await fetch(item).then(res => res.blob());
            const file = new File([blob], `highlight-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[highlight][${i}]`, file);
          } else if (typeof item === "string") {
            fd.append(`serviceDetails[highlight][${i}]`, item);
          }
        })
      );

      /* ================= ICON SECTIONS ================= */
      const iconSection = async (arr: any[], key: string) => {
        await Promise.all(
          (arr || []).map(async (item, i) => {
            fd.append(`serviceDetails[${key}][${i}][title]`, item.title || "");
            fd.append(
              `serviceDetails[${key}][${i}][description]`,
              item.description || ""
            );

            if (item.icon instanceof File) {
              fd.append(`serviceDetails[${key}][${i}][icon]`, item.icon);
            } else if (
              typeof item.icon === "string" &&
              item.icon.startsWith("blob:")
            ) {
              const blob = await fetch(item.icon).then(res => res.blob());
              const file = new File([blob], `${key}-${i}.png`, {
                type: blob.type,
              });
              fd.append(`serviceDetails[${key}][${i}][icon]`, file);
            } else if (typeof item.icon === "string") {
              fd.append(`serviceDetails[${key}][${i}][icon]`, item.icon);
            }
          })
        );
      };

      await iconSection(formData.serviceDetails.assuredByFetchTrue || [], "assuredByFetchTrue");
      await iconSection(formData.serviceDetails.howItWorks || [], "howItWorks");
      await iconSection(formData.serviceDetails.whyChooseUs || [], "whyChooseUs");
      await iconSection(formData.serviceDetails.weRequired || [], "weRequired");
      await iconSection(formData.serviceDetails.weDeliver || [], "weDeliver");

      /* ================= FAQ ================= */
      (formData.serviceDetails.faq || []).forEach((f, i) => {
        fd.append(`serviceDetails[faq][${i}][question]`, f.question || "");
        fd.append(`serviceDetails[faq][${i}][answer]`, f.answer || "");
      });

      /* ================= PACKAGES ================= */
      (formData.serviceDetails.packages || []).forEach((p, i) => {
        fd.append(`serviceDetails[packages][${i}][name]`, p.name || "");
        fd.append(`serviceDetails[packages][${i}][price]`, String(p.price || 0));
        fd.append(`serviceDetails[packages][${i}][discount]`, String(p.discount || 0));
        fd.append(
          `serviceDetails[packages][${i}][discountedPrice]`,
          String(p.discountedPrice || 0)
        );
        (p.whatYouGet || []).forEach((v: string, j: number) =>
          fd.append(`serviceDetails[packages][${i}][whatYouGet][${j}]`, v)
        );
      });

      /* ================= TIME REQUIRED ================= */
      (formData.serviceDetails.timeRequired || []).forEach((t, i) => {
        fd.append(
          `serviceDetails[timeRequired][${i}][minDays]`,
          String(t.minDays || 0)
        );
        fd.append(
          `serviceDetails[timeRequired][${i}][maxDays]`,
          String(t.maxDays || 0)
        );
      });

      /* ================= MORE INFO ================= */
      await Promise.all(
        (formData.serviceDetails.moreInfo || []).map(async (m, i) => {
          fd.append(`serviceDetails[moreInfo][${i}][title]`, m.title || "");
          fd.append(
            `serviceDetails[moreInfo][${i}][description]`,
            m.description || ""
          );

          if (m.image instanceof File) {
            fd.append(`serviceDetails[moreInfo][${i}][image]`, m.image);
          } else if (
            typeof m.image === "string" &&
            m.image.startsWith("blob:")
          ) {
            const blob = await fetch(m.image).then(res => res.blob());
            const file = new File([blob], `moreInfo-${i}.png`, {
              type: blob.type,
            });
            fd.append(`serviceDetails[moreInfo][${i}][image]`, file);
          } else if (typeof m.image === "string") {
            fd.append(`serviceDetails[moreInfo][${i}][image]`, m.image);
          }
        })
      );

      /* ================= CONNECT WITH ================= */
      (formData.serviceDetails.connectWith || []).forEach((c, i) => {
        fd.append(`serviceDetails[connectWith][${i}][name]`, c.name || "");
        fd.append(`serviceDetails[connectWith][${i}][mobileNo]`, c.mobileNo || "");
        fd.append(`serviceDetails[connectWith][${i}][email]`, c.email || "");
      });

      /* ================= EXTRA IMAGES ================= */
      await Promise.all(
        (formData.serviceDetails
          .extraImages || []).map(async (img, i) => {
          if (img instanceof File) {
            fd.append(`serviceDetails[extraImages][${i}]`, img);
          } else if (typeof img === "string" && img.startsWith("blob:")) {
            const blob = await fetch(img).then(res => res.blob());
            const file = new File([blob], `extra-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[extraImages][${i}]`, file);
          } else if (typeof img === "string") {
            fd.append(`serviceDetails[extraImages][${i}]`, img);
          }
        })
      );


      /* ================= SERVICE DETAILS : EXTRA SECTIONS ================= */
await Promise.all(
  (formData.serviceDetails.extraSections || []).map(async (section, i) => {
    // Title
    fd.append(
      `serviceDetails[extraSections][${i}][title]`,
      section.title || ""
    );

    // Subtitle
    (section.subtitle || []).forEach((v: string, j: number) =>
      fd.append(
        `serviceDetails[extraSections][${i}][subtitle][${j}]`,
        v || ""
      )
    );

    // Description
    (section.description || []).forEach((v: string, j: number) =>
      fd.append(
        `serviceDetails[extraSections][${i}][description][${j}]`,
        v || ""
      )
    );

    // Sub Description
    (section.subDescription || []).forEach((v: string, j: number) =>
      fd.append(
        `serviceDetails[extraSections][${i}][subDescription][${j}]`,
        v || ""
      )
    );

    // Lists
    (section.lists || []).forEach((v: string, j: number) =>
      fd.append(
        `serviceDetails[extraSections][${i}][lists][${j}]`,
        v || ""
      )
    );

    // Tags
    (section.tags || []).forEach((v: string, j: number) =>
      fd.append(
        `serviceDetails[extraSections][${i}][tags][${j}]`,
        v || ""
      )
    );

    // Images
    if (Array.isArray(section.image)) {
      for (let j = 0; j < section.image.length; j++) {
        const img = section.image[j];

        if (img instanceof File) {
          fd.append(
            `serviceDetails[extraSections][${i}][image][${j}]`,
            img
          );
        } 
        else if (typeof img === "string" && img.startsWith("blob:")) {
          const blob = await fetch(img).then(res => res.blob());
          const file = new File(
            [blob],
            `service-extra-section-${i}-${j}.png`,
            { type: blob.type }
          );
          fd.append(
            `serviceDetails[extraSections][${i}][image][${j}]`,
            file
          );
        } 
        else if (typeof img === "string") {
          // existing image URL
          fd.append(
            `serviceDetails[extraSections][${i}][image][${j}]`,
            img
          );
        }
      }
    }
  })
);


        fd.append(
          "franchiseDetails[commission]",
          formData.commission || ""
        );
        
        fd.append(
          "franchiseDetails[termsAndConditions]",
          formData.franchiseDetails.termsAndConditions || ""
        );
        
        /* -------- Investment Range -------- */
        (formData.franchiseDetails.investmentRange || []).forEach((item, i) => {
          fd.append(
            `franchiseDetails[investmentRange][${i}][minRange]`,
            String(item.minRange || 0)
          );
          fd.append(
            `franchiseDetails[investmentRange][${i}][maxRange]`,
            String(item.maxRange || 0)
          );
        });
        
        /* -------- Monthly Earn Potential -------- */
        (formData.franchiseDetails.monthlyEarnPotential || []).forEach((item, i) => {
          fd.append(
            `franchiseDetails[monthlyEarnPotential][${i}][minEarn]`,
            String(item.minEarn || 0)
          );
          fd.append(
            `franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`,
            String(item.maxEarn || 0)
          );
        });
        
        /* -------- Franchise Model -------- */
        (formData.franchiseDetails.franchiseModel || []).forEach((model, i) => {
          fd.append(
            `franchiseDetails[franchiseModel][${i}][title]`,
            model.title || ""
          );
          fd.append(
            `franchiseDetails[franchiseModel][${i}][agreement]`,
            model.agreement || ""
          );
          fd.append(
            `franchiseDetails[franchiseModel][${i}][price]`,
            String(model.price || 0)
          );
          fd.append(
            `franchiseDetails[franchiseModel][${i}][discount]`,
            String(model.discount || 0)
          );
          fd.append(
            `franchiseDetails[franchiseModel][${i}][gst]`,
            String(model.gst || 0)
          );
          fd.append(
            `franchiseDetails[franchiseModel][${i}][fees]`,
            String(model.fees || 0)
          );
        });
        
        /* -------- Extra Sections (Franchise) -------- */
        await Promise.all(
          (formData.franchiseDetails.extraSections || []).map(async (section, i) => {
            fd.append(
              `franchiseDetails[extraSections][${i}][title]`,
              section.title || ""
            );
        
            (section.subtitle || []).forEach((v, j) =>
              fd.append(
                `franchiseDetails[extraSections][${i}][subtitle][${j}]`,
                v || ""
              )
            );
        
            (section.description || []).forEach((v, j) =>
              fd.append(
                `franchiseDetails[extraSections][${i}][description][${j}]`,
                v || ""
              )
            );
        
            (section.subDescription || []).forEach((v, j) =>
              fd.append(
                `franchiseDetails[extraSections][${i}][subDescription][${j}]`,
                v || ""
              )
            );
        
            (section.lists || []).forEach((v, j) =>
              fd.append(
                `franchiseDetails[extraSections][${i}][lists][${j}]`,
                v || ""
              )
            );
        
            (section.tags || []).forEach((v, j) =>
              fd.append(
                `franchiseDetails[extraSections][${i}][tags][${j}]`,
                v || ""
              )
            );
        
            // Images
            if (Array.isArray(section.image)) {
              for (let j = 0; j < section.image.length; j++) {
                const img = section.image[j];
        
                if (img instanceof File) {
                  fd.append(
                    `franchiseDetails[extraSections][${i}][image][${j}]`,
                    img
                  );
                } else if (typeof img === "string" && img.startsWith("blob:")) {
                  const blob = await fetch(img).then(res => res.blob());
                  const file = new File(
                    [blob],
                    `franchise-section-${i}-${j}.png`,
                    { type: blob.type }
                  );
                  fd.append(
                    `franchiseDetails[extraSections][${i}][image][${j}]`,
                    file
                  );
                } else if (typeof img === "string") {
                  fd.append(
                    `franchiseDetails[extraSections][${i}][image][${j}]`,
                    img
                  );
                }
              }
            }
          })
        );
        
        /* -------- Extra Images -------- */
        await Promise.all(
          (formData.franchiseDetails.extraImages || []).map(async (img, i) => {
            if (img instanceof File) {
              fd.append(`franchiseDetails[extraImages][${i}]`, img);
            } else if (typeof img === "string" && img.startsWith("blob:")) {
              const blob = await fetch(img).then(res => res.blob());
              const file = new File([blob], `franchise-extra-${i}.png`, {
                type: blob.type,
              });
              fd.append(`franchiseDetails[extraImages][${i}]`, file);
            } else if (typeof img === "string") {
              fd.append(`franchiseDetails[extraImages][${i}]`, img);
            }
          }));
      

      console.log("ff : ", fd)
      /* ================= API ================= */
      const res = await updateService(service._id, fd);
      setCreatedServiceId(res?.data?._id);
      if (res?.success) {
        if (isFranchiseSelected && franchiseStep === 1) {
          alert("Step-1 Update Successfully...");
          setFranchiseStep(2);
        } else {
         alert("Service Update Successfully...");
  // resetForm();
  setFormKey(prev => prev + 1);
  
        }
      } else {
        alert(res?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = moduleFieldConfig[selectedModule] || {};
  const isFranchiseSelected = selectedModule === 'Franchise';

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

          {/* Franchise Stepper Header */}
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
                <ServiceUpdateForm datas={formData} setData={setFormData} />
                <hr className="border-gray-300" />
                <FranchiseUpdateForm datas={formData} setData={setFormData} fieldsConfig={config.franchiseDetails} />

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => router.back()} 
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>

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
              <FranchiseExtraUpdate 
              key={franchiseExtraKey}
              serviceId={createdServiceId}
              onSave={() => {
                alert("Service Saved Successfully...");
                // resetForm(); 
              }}
              />
            )
          ) : (
            <>
              <BasicUpdateForm data={formData} setData={setFormData} />
              <hr className="border-gray-300" />
              <ServiceUpdateForm datas={formData} setData={setFormData} />
              <hr className="border-gray-300" />
              <FranchiseUpdateForm datas={formData} setData={setFormData} fieldsConfig={config.franchiseDetails} />

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>

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
          )}
        </div>
      </ComponentCard>
    </div>
  );
};

export default EditService;