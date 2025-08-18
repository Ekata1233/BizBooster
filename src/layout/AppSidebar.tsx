// "use client";
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useSidebar } from "../context/SidebarContext";
// import {
//   BoxCubeIcon,

//   ChevronDownIcon,
//   GridIcon,
//   HorizontaLDots,
//   PieChartIcon,

//   FolderIcon,
//   BoxIcon
// } from "../icons/index";
// import SidebarWidget from "./SidebarWidget";

// type NavItem = {
//   name: string;
//   icon: React.ReactNode;
//   path?: string;
//   subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
// };

// // type SubNavItem = {
// //   name: string;
// //   path?: string;
// //   pro?: boolean;
// //   new?: boolean;
// //   subItems?: SubNavItem[];
// // };

// // type NavItem = {
// //   name: string;
// //   icon: React.ReactNode;
// //   path?: string;
// //   subItems?: SubNavItem[];
// // };




// const navItems: NavItem[] = [
//   {
//     icon: <GridIcon />,
//     name: "Dashboard",
//     path: "/",
//   },
// ];

// const moduleItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Module",
//     path: "/module-management/module"
//   },
//   {
//     icon: <FolderIcon />,
//     name: "Category",
//     path: "/category-management/category"
//   },
//   {
//     icon: <BoxIcon />,
//     name: "SubCategory",
//     path: "/subCategory-management/subCategory"
//   },
//   {
//     icon: <FolderIcon />,
//     name: "Banner",
//     subItems: [
//       { name: "Add Banner", path: "/banner-management/add-banner", pro: false },
//       { name: "Banner-list", path: "/banner-management/banners", pro: false },
//     ],
//   },
// ];

// const customerItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Users",
//     path: "/customer-management/user/user-list",
//   },
//   // {
//   //   icon: <BoxCubeIcon />,
//   //   name: "Franchise",
//   //   path: "/customer-management/franchise/franchise-list",
//   // },
// ];





// const providerItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Provider",
//     subItems: [
//       { name: "Add Provider", path: "/provider-management/add-provider", pro: false },
//       { name: "Provider Request", path: "/provider-management/provider-request", pro: false },
//       { name: "Provider List", path: "/provider-management/provider-list", pro: false },
//       { name: "Provider Gallery", path: "/provider-management/provider-gallery", pro: false },
//     ],
//   },
//   {
//     icon: <BoxCubeIcon />,
//     name: "Zone Setup",
//     subItems: [
//       { name: "Add Zone", path: "/zone-management/add-zone", pro: false },
//       { name: "Zone List", path: "/zone-management/zone-list", pro: false },
//     ],
//   },
// ];

// const serviceItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Service",
//     subItems: [
//       { name: "Add New Service", path: "/service-management/add-service", pro: false },
//       { name: "Service List", path: "/service-management/service-list", pro: false },
//       { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose", pro: false },
//     ],
//   },
// ];
// const packageItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Package",
//     subItems: [
//       { name: "Add New package", path: "/package-management/add-package", pro: false },
//       // { name: "package List", path: "/service-management/service-list", pro: false },
//       // { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose", pro: false },
//     ],
//   },
// ];
// const subscribeItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Subscribe",
//     subItems: [
//       { name: "Subscribe Request", path: "/subscribe-management/subscribe-request", pro: false },
//       { name: "Subscribe List", path: "/subscribe-management/subscribe-list", pro: false },
//     ],
//   },
// ];


// const promotionItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Coupons",
//     subItems: [
//       { name: "Add Coupons", path: "/coupons-management/add-coupon", pro: false },
//       { name: "Coupons List", path: "/coupons-management/coupons-list", pro: false },
//     ],
//   },
//   {
//     icon: <PieChartIcon />,
//     name: "Advertisements",
//     subItems: [
//       { name: "Adds List", path: "/adds-management/adds-list", pro: false },
//       { name: "New Add Request", path: "/adds-management/add-request", pro: false },
//     ],
//   },
// ];

// const bookingItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Bookings",
//     subItems: [
//       { name: "All Bookings", path: "/booking-management/all-booking", pro: false },
//     ],
//   },
//   {
//     icon: <PieChartIcon />,
//     name: "Leads",
//     subItems: [
//       { name: "Lead Requests", path: "/booking-management/lead-request", pro: false },
//     ],
//   },
// ];

// const privacyItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Preferences",
//     subItems: [
//       { name: "Privacy & Policy", path: "/preferences/privacy-policy" },
//       { name: "Refund Policy", path: "/preferences/refund-policy" },
//       { name: "Terms and Conditions", path: "/preferences/terms-conditions" },
//       { name: "Cancellation Policy", path: "/preferences/cancellation-policy" },
//       { name: "About Us", path: "/preferences/aboutus" },
//       { name: "Partner Review", path: "/preferences/partner-review" },
//     ],
//   },
// ];


// const offerItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Offer Management",
//     subItems: [
//       { name: "Add Offer", path: "/offer-management/Add-Offer" },
//       { name: "Offer List", path: "/offer-management/Offer-List" },

//     ],
//   },
// ];

// const providerpreferenceItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Provider Preferences",
//     subItems: [
//       { name: "Provider Privacy & Policy", path: "/providerpreferences/provider-privacypolicy" },
//       { name: "Provider Refund Policy", path: "/providerpreferences/provider-refundpolicy" },
//       { name: "Provider Terms and Conditions", path: "/providerpreferences/provider-termsandconditions" },
//       { name: "Provider Cancellation Policy", path: "/providerpreferences/provider-cancellationpolicy" },
//       { name: "Provider About Us", path: "/providerpreferences/provider-aboutus" },
//       { name: "Provider Help and Support", path: "/providerpreferences/provider-helpandsupport" },

//     ],
//   },
// ];

// const academyItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Academy",
//     subItems: [

//       { name: "Training Tutorials", path: "/academy/certifications" },
//       { name: "Live Webinars", path: "/academy/livewebinars" },
//       { name: "Recorded Webinars", path: "/academy/webinars" },
//       { name: "Understanding Fetch True", path: "/academy/understandingfetchtrue" },
//     ],
//   },
// ];

// // const academyItems: NavItem[] = [
// //   {
// //     icon: <PieChartIcon />,
// //     name: "Academy",
// //     subItems: [
// //       {
// //         name: "Training Tutorials",
// //         subItems: [
// //           { 
// //             name: "Certifications", 
// //             path: "/academy/certifications",
// //             subItems: [
// //               { name: "Add Certification", path: "/academy/certifications/add" },
// //               { name: "Certification List", path: "/academy/certifications/list" }
// //             ]
// //           },
// //           { 
// //             name: "Tutorials",
// //             path: "/academy/tutorials",
// //             subItems: [
// //               { name: "Add Tutorial", path: "/academy/tutorials/add" },
// //               { name: "Tutorial List", path: "/academy/tutorials/list" }
// //             ]
// //           }
// //         ]
// //       },
// //       // ... rest of your academy items
// //     ]
// //   }
// // ];

// const reportItems: NavItem[] = [
//   { icon: <GridIcon />, name: "Transaction Reports", path: "/report-management/transaction-reports" },
//   { icon: <GridIcon />, name: "Business Reports", path: "/report-management/business-reports" },
// ];

// const systemItems: NavItem[] = [
//   {
//     icon: <PieChartIcon />,
//     name: "Settings Management",
//     subItems: [
//       { name: "Business Settings", path: "/system-management/business-settings", pro: false },
//     ],
//   },
// ];

// const AppSidebar: React.FC = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const pathname = usePathname();


//   const [openSubmenu, setOpenSubmenu] = useState<{
//     type: "main" | "customer" | "module" | "provider" | "service" | "package" | "subscribe" | "coupon" | "booking" | "system" | "preferences" | "academy" | "providerpreferences" | "report" | "offer";
//     index: number;
//   } | null>(null);
//   const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
//   const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const isActive = useCallback((path: string) => path === pathname, [pathname]);

//   useEffect(() => {
//     let submenuMatched = false;
//     ["main", "customer", "module", "provider", "service", "package", "booking", "subscribe", "coupon", "system", "preferences", "academy", "providerpreferences", "report", "offer"].forEach((menuType) => {
//       const items =
//         menuType === "main" ? navItems :
//           menuType === "module" ? moduleItems :
//             menuType === "provider" ? providerItems :
//               menuType === "service" ? serviceItems :
//                 menuType === "package" ? packageItems :
//                   menuType === "booking" ? bookingItems :
//                     menuType === "subscribe" ? subscribeItems :
//                       menuType === "coupon" ? promotionItems :
//                         menuType === "system" ? systemItems :
//                           menuType === "preferences" ? privacyItems :
//                             menuType === "offer" ? offerItems :
//                             menuType === "academy" ? academyItems :
//                               menuType === "providerpreferences" ? providerpreferenceItems :
//                                 menuType === "report" ? reportItems :
//                                   customerItems;

//       items.forEach((nav, index) => {
//         if (nav.subItems) {
//           nav.subItems.forEach((subItem) => {
//             if (isActive(subItem.path)) {
//               setOpenSubmenu({
//                 type: menuType as (
//                   | "main"
//                   | "customer"
//                   | "module"
//                   | "provider"
//                   | "service"
//                   | "package"
//                   | "booking"
//                   | "subscribe"
//                   | "coupon"
//                   | "system"
//                   | "preferences"
//                   | "academy"
//                   | "providerpreferences"
//                   | "report"
//                   | "offer"
//                 ),
//                 index,
//               });
//               submenuMatched = true;
//             }
//           });
//         }
//       });
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [pathname, isActive]);

//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `${openSubmenu.type}-${openSubmenu.index}`;
//       if (subMenuRefs.current[key]) {
//         setSubMenuHeight((prevHeights) => ({
//           ...prevHeights,
//           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (
//     index: number,
//     menuType: "main" | "customer" | "module" | "provider" | "service" | "package" | "booking" | "subscribe" | "coupon" | "system" | "preferences" | "academy" | "providerpreferences" | "report" | "offer"
//   ) => {
//     setOpenSubmenu((prevOpenSubmenu) => {
//       if (
//         prevOpenSubmenu &&
//         prevOpenSubmenu.type === menuType &&
//         prevOpenSubmenu.index === index
//       ) {
//         return null;
//       }
//       return { type: menuType, index };
//     });
//   };

//   const renderMenuItems = (
//     navItems: NavItem[],
//     menuType: "main" | "customer" | "module" | "provider" | "service" | "package" | "booking" | "subscribe" | "coupon" | "system" | "preferences" | "academy" | "providerpreferences" | "report" | "offer"
//   ) => (
//     <ul className="flex flex-col gap-4">
//       {navItems.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index, menuType)}
//               className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
//                 ? "menu-item-active"
//                 : "menu-item-inactive"
//                 } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
//                 }`}
//             >
//               <span
//                 className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
//                   ? "menu-item-icon-active"
//                   : "menu-item-icon-inactive"
//                   }`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <span className="menu-item-text">{nav.name}</span>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <ChevronDownIcon
//                   className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? "rotate-180 text-brand-500"
//                     : ""
//                     }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 href={nav.path}
//                 className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                   }`}
//               >
//                 <span
//                   className={`${isActive(nav.path)
//                     ? "menu-item-icon-active"
//                     : "menu-item-icon-inactive"
//                     }`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <span className="menu-item-text">{nav.name}</span>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`${menuType}-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 space-y-1 ml-9">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       href={subItem.path}
//                       className={`menu-dropdown-item ${isActive(subItem.path)
//                         ? "menu-dropdown-item-active"
//                         : "menu-dropdown-item-inactive"
//                         }`}
//                     >
//                       {subItem.name}
//                       <span className="flex items-center gap-1 ml-auto">
//                         {subItem.new && (
//                           <span
//                             className={`ml-auto ${isActive(subItem.path)
//                               ? "menu-dropdown-badge-active"
//                               : "menu-dropdown-badge-inactive"
//                               } menu-dropdown-badge`}
//                           >
//                             new
//                           </span>
//                         )}
//                         {subItem.pro && (
//                           <span
//                             className={`ml-auto ${isActive(subItem.path)
//                               ? "menu-dropdown-badge-active"
//                               : "menu-dropdown-badge-inactive"
//                               } menu-dropdown-badge`}
//                           >
//                             pro
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );


//   return (
//     <aside
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
//         ${isExpanded || isMobileOpen
//           ? "w-[290px]"
//           : isHovered
//             ? "w-[290px]"
//             : "w-[90px]"
//         }
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`pb-8 pt-3 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//           }`}
//       >
//         <Link href="/">
//           {isExpanded || isHovered || isMobileOpen ? (
//             <>
//               <Image
//                 className="dark:hidden"
//                 src="/images/logo/final-logo.png"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//               <Image
//                 className="hidden dark:block"
//                 src="/images/logo/final-logo.png"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//             </>
//           ) : (
//             <Image
//               src="/images/logo/logo-icon.svg"
//               alt="Logo"
//               width={32}
//               height={32}
//             />
//           )}
//         </Link>
//       </div>
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "CUSTOMER MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(customerItems, "customer")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "MODULE MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(moduleItems, "module")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "SERVICE MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(serviceItems, "service")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "PACKAGE MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(packageItems, "package")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "BOOKING MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(bookingItems, "booking")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "SUBSCRIBE MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(subscribeItems, "subscribe")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "PROVIDER MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(providerItems, "provider")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "PROMOTION MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(promotionItems, "coupon")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "PREFERENCES"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(privacyItems, "preferences")}
//             </div>

//               <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "OFFER MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(offerItems, "offer")}
//             </div>


//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "PROVIDER PREFERENCES"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(providerpreferenceItems, "providerpreferences")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "ACADEMY"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(academyItems, "academy")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "REPORT MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(reportItems, "report")}
//             </div>

//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//                   }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "SYSTEM MANAGEMENT"
//                 ) : (
//                   <HorizontaLDots />
//                 )}
//               </h2>
//               {renderMenuItems(systemItems, "system")}
//             </div>
//           </div>
//         </nav>
//         {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;







'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  FolderIcon,
  BoxIcon
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

// Define the new type for nested sub-items
type SubNavItem = {
  name: string;
  path?: string; // path is optional if it has further subItems
  pro?: boolean;
  new?: boolean;
  subItems?: SubNavItem[]; // Sub-items can now also have sub-items recursively
};

// Define the main navigation item type
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[]; // Main nav items use the new SubNavItem type
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
];

const moduleItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Module",
    path: "/module-management/module"
  },
  {
    icon: <FolderIcon />,
    name: "Category",
    path: "/category-management/category"
  },
  {
    icon: <BoxIcon />,
    name: "SubCategory",
    path: "/subCategory-management/subCategory"
  },
  {
    icon: <FolderIcon />,
    name: "Banner",
    subItems: [
      { name: "Add Banner", path: "/banner-management/add-banner", pro: false },
      { name: "Banner-list", path: "/banner-management/banners", pro: false },
    ],
  },
];

const customerItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Users",
    path: "/customer-management/user/user-list",
  },
];

const providerItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Provider",
    subItems: [
      { name: "Add Provider", path: "/provider-management/add-provider", pro: false },
      { name: "Provider Request", path: "/provider-management/provider-request", pro: false },
      { name: "Provider List", path: "/provider-management/provider-list", pro: false },
      { name: "Provider Gallery", path: "/provider-management/provider-gallery", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Zone Setup",
    subItems: [
      { name: "Add Zone", path: "/zone-management/add-zone", pro: false },
      { name: "Zone List", path: "/zone-management/zone-list", pro: false },
    ],
  },
];

const serviceItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Service",
    subItems: [
      { name: "Add New Service", path: "/service-management/add-service", pro: false },
      { name: "Service List", path: "/service-management/service-list", pro: false },
      { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose", pro: false },
    ],
  },
];
const packageItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Package",
    subItems: [
      { name: "Add New package", path: "/package-management/add-package", pro: false },
    ],
  },
];
const subscribeItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Subscribe",
    subItems: [
      { name: "Subscribe Request", path: "/subscribe-management/subscribe-request", pro: false },
      { name: "Subscribe List", path: "/subscribe-management/subscribe-list", pro: false },
    ],
  },
];

const promotionItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Coupons",
    subItems: [
      { name: "Add Coupons", path: "/coupons-management/add-coupon", pro: false },
      { name: "Coupons List", path: "/coupons-management/coupons-list", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Advertisements",
    subItems: [
      { name: "Adds List", path: "/adds-management/adds-list", pro: false },
      { name: "New Add Request", path: "/adds-management/add-request", pro: false },
    ],
  },
];

const bookingItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Bookings",
    subItems: [
      { name: "All Bookings", path: "/booking-management/all-booking", pro: false },
      { name: "Customized Requests", path: "/booking-management/customized-requests", pro: false },
      { name: "Booking Requests", path: "/booking-management/booking-requests", pro: false },
      { name: "Accepted Bookings", path: "/booking-management/accepted-bookings", pro: false },
      { name: "Completed Bookings", path: "/booking-management/completed-bookings", pro: false },
      { name: "Cancelled Bookings", path: "/booking-management/cancelled-bookings", pro: false },
      { name: "Refunded Bookings", path: "/booking-management/refunded-bookings", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Leads",
    subItems: [
      { name: "Lead Requests", path: "/booking-management/lead-request", pro: false },
    ],
  },
];

const privacyItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Preferences",
    subItems: [
      { name: "Privacy & Policy", path: "/preferences/privacy-policy" },
      { name: "Refund Policy", path: "/preferences/refund-policy" },
      { name: "Terms and Conditions", path: "/preferences/terms-conditions" },
      { name: "Cancellation Policy", path: "/preferences/cancellation-policy" },
      { name: "About Us", path: "/preferences/aboutus" },
    ],
  },
];

const offerItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Offer Management",
    subItems: [
      { name: "Add Offer", path: "/offer-management/Add-Offer" },
      { name: "Offer List", path: "/offer-management/Offer-List" },
    ],
  },
];

const providerpreferenceItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Provider Preferences",
    subItems: [
      { name: "Provider Privacy & Policy", path: "/providerpreferences/provider-privacypolicy" },
      { name: "Provider Refund Policy", path: "/providerpreferences/provider-refundpolicy" },
      { name: "Provider Terms and Conditions", path: "/providerpreferences/provider-termsandconditions" },
      { name: "Provider Cancellation Policy", path: "/providerpreferences/provider-cancellationpolicy" },
      { name: "Provider About Us", path: "/providerpreferences/provider-aboutus" },
      { name: "Provider Help and Support", path: "/providerpreferences/provider-helpandsupport" },
    ],
  },
];

// ACADEMY ITEMS STRUCTURE WITH NESTED PARTNER REVIEW
const academyItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Academy",
    subItems: [
      {
        name: "Training Tutorials",
        subItems: [
          { name: "Add Tutorials", path: "/academy/certifications-management/add-tutorial" },
          { name: "Tutorial List", path: "/academy/certifications-management/Tutorial-List" },
        ],
      },
      {
        name: "Live Webinars",
        subItems: [
          { name: "Add Live Webinars", path: "/academy/livewebinars-management/add-webinar" },
          { name: "Live Webinars List", path: "/academy/livewebinars-management/livewebinars-list", },
        ],
      },
      {
        name: "Recorded Webinars",
        subItems: [
          { name: "Add Recorded Webinars", path: "/academy/webinars-management/add-webinars" },
          { name: "Recorded Webinars List", path: "/academy/webinars-management/webinars-list" },
        ],
      },
      {
        name: "Understanding FetchTrue",
        subItems: [
          { name: "Add Understanding Fetch True", path: "/academy/understandingfetchtrue/add" },
          { name: "Understanding Fetch True List", path: "/academy/understandingfetchtrue" },
        ],
      },
      {
        name: "Partner Review",
        subItems: [
          { name: "Add Entry", path: "/preferences/partner-review/add-entry" },
          { name: "Entry List", path: "/preferences/partner-review/entry-list" },
        ],
      },
    ],
  },
];

const advisorItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Advisor Management",
    subItems: [
      { name: "Add Advisor", path: "/advisor-management/add-advisor" },
      { name: "Advisor List", path: "/advisor-management/advisor-list" },
    ],
  },
];

const reportItems: NavItem[] = [
  { icon: <GridIcon />, name: "Transaction Reports", path: "/report-management/transaction-reports" },
  { icon: <GridIcon />, name: "Business Reports", path: "/report-management/business-reports" },
  { icon: <GridIcon />, name: "Admin Earnings", path: "/report-management/admin-earnings" },
];

const systemItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Settings Management",
    subItems: [
      { name: "Business Settings", path: "/system-management/business-settings", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string[]>([]);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Helper function to recursively check if any descendant is active
  // This needs to be defined here or outside, but not inside useCallback that depends on it
  const isDescendantOfActivePath = useCallback((
    item: NavItem | SubNavItem,
    checkPathname: string
  ): boolean => {
    if (item.path && item.path === checkPathname) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) =>
        isDescendantOfActivePath(subItem, checkPathname)
      );
    }
    return false;
  }, []);

  // Function to calculate and set height for a specific submenu key
  const updateSubmenuHeight = useCallback((key: string) => {
    const element = subMenuRefs.current[key];
    if (element) {
      requestAnimationFrame(() => {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: element.scrollHeight,
        }));
      });
    }
  }, []);

  // Recursive function to find active path and determine all necessary open submenu keys
  const findActiveAndSetOpenSubmenus = useCallback((
    items: (NavItem | SubNavItem)[],
    currentKeyPath: string,
    activeKeys: string[] // Accumulates the keys that should be open
  ): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemFullKey = `${currentKeyPath}-${i}`;

      if (item.path && isActive(item.path)) {
        // If this item's path is active, ensure all its parents are opened
        let pathSegments: string[] = [];
        if (currentKeyPath !== '') { // If not a top-level item itself
          pathSegments = currentKeyPath.split('-');
          let accKey = '';
          for (let j = 0; j < pathSegments.length; j++) {
            accKey = j === 0 ? pathSegments[j] : `${accKey}-${pathSegments[j]}`;
            if (!activeKeys.includes(accKey)) {
              activeKeys.push(accKey);
            }
          }
        }
        return true; // Active path found
      }
      if (item.subItems) {
        if (findActiveAndSetOpenSubmenus(item.subItems, itemFullKey, activeKeys)) {
          // If a child is active, this current item (itemFullKey) needs to be opened
          if (!activeKeys.includes(itemFullKey)) {
            activeKeys.push(itemFullKey);
          }
          return true; // Active path found through a child
        }
      }
    }
    return false;
  }, [isActive]);

  // Effect to handle initial active submenu and dynamic height updates
  useEffect(() => {
    const menuGroups: Record<string, NavItem[]> = {
      main: navItems,
      customer: customerItems,
      module: moduleItems,
      provider: providerItems,
      service: serviceItems,
      package: packageItems,
      booking: bookingItems,
      subscribe: subscribeItems,
      coupon: promotionItems,
      system: systemItems,
      preferences: privacyItems,
      academy: academyItems,
      advisor: advisorItems,
      providerpreferences: providerpreferenceItems,
      report: reportItems,
      offer: offerItems,
    };

    const newOpenSubmenus: string[] = [];
    let activePathFound = false;

    for (const menuType in menuGroups) {
      if (menuGroups.hasOwnProperty(menuType)) {
        const items = menuGroups[menuType];
        for (let i = 0; i < items.length; i++) {
          const nav = items[i];
          const topLevelKey = `${menuType}-${i}`;

          if (nav.subItems) {
            const tempActiveKeys: string[] = [];
            if (findActiveAndSetOpenSubmenus(nav.subItems, topLevelKey, tempActiveKeys)) {
              newOpenSubmenus.push(...tempActiveKeys);
              // Ensure the top-level parent itself is included if a child is active
              if (!newOpenSubmenus.includes(topLevelKey)) {
                newOpenSubmenus.push(topLevelKey);
              }
              activePathFound = true;
              break;
            }
          } else if (nav.path && isActive(nav.path)) {
            activePathFound = true;
            break;
          }
        }
        if (activePathFound) break;
      }
    }

    const uniqueOpenSubmenus = Array.from(new Set(newOpenSubmenus));
    setOpenSubmenu(uniqueOpenSubmenus);

    requestAnimationFrame(() => {
      uniqueOpenSubmenus.forEach(key => {
        updateSubmenuHeight(key);
      });
    });

  }, [pathname, isActive, findActiveAndSetOpenSubmenus, updateSubmenuHeight]);


  const handleSubmenuToggle = useCallback((key: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      const isCurrentlyOpen = prevOpenSubmenu.includes(key);
      let newOpen: string[] = [];

      const keyParts = key.split('-');
      const topLevelMenuType = keyParts[0];
      const topLevelMenuIndex = keyParts[1];
      const topLevelParentKey = `${topLevelMenuType}-${topLevelMenuIndex}`;

      if (isCurrentlyOpen) {
        // CLOSE LOGIC
        // Filter out the clicked key and all its descendants
        newOpen = prevOpenSubmenu.filter(openKey => !openKey.startsWith(key));

        const keysToCloseImmediately = prevOpenSubmenu.filter(openKey => openKey.startsWith(key));
        requestAnimationFrame(() => {
          keysToCloseImmediately.forEach(closedKey => {
            setSubMenuHeight((prev) => ({ ...prev, [closedKey]: 0 }));
          });
        });

        setTimeout(() => {
          setSubMenuHeight((prev) => {
            const newState = { ...prev };
            keysToCloseImmediately.forEach(closedKey => {
              delete newState[closedKey];
            });
            return newState;
          });
        }, 300);
      } else {

        if (topLevelMenuType === 'academy' && keyParts.length <= 3) { // Only applies to immediate children of 'Academy' main item
          newOpen = prevOpenSubmenu.filter(openKey =>
            !(openKey.startsWith(topLevelParentKey) && openKey.split('-').length === keyParts.length)
          );
        } else {
          newOpen = [...prevOpenSubmenu];
        }

        // Add the newly clicked key to the open list
        newOpen.push(key);

        // Add all parent keys up to the top-level to ensure the path is open
        const segments = key.split('-');
        let currentPathAccumulator = '';
        for (let i = 0; i < segments.length - 1; i++) {
          currentPathAccumulator = i === 0 ? segments[i] : `${currentPathAccumulator}-${segments[i]}`;
          if (currentPathAccumulator && !newOpen.includes(currentPathAccumulator)) {
            newOpen.push(currentPathAccumulator);
          }
        }

        newOpen = Array.from(new Set(newOpen));

        requestAnimationFrame(() => {
          newOpen.forEach(openKey => {
            updateSubmenuHeight(openKey);
          });
          // Explicitly set height to 0 for any submenus that were just closed by the "only one open" logic within academy
          prevOpenSubmenu.filter(openKey =>
            openKey.startsWith(topLevelParentKey) &&
            openKey.split('-').length === keyParts.length &&
            !newOpen.includes(openKey)
          ).forEach(closedKey => {
            setSubMenuHeight((prev) => ({ ...prev, [closedKey]: 0 }));
          });
        });
      }
      return newOpen;
    });
  }, [updateSubmenuHeight]);







  const renderSubMenuItems = useCallback((
    subItems: SubNavItem[],
    parentKey: string,
    level: number = 0
  ) => {
    return (
      <ul className={`space-y-1 ${level === 0 ? 'ml-8' : 'ml-4'}`}>
        {subItems.map((subItem, index) => {
          const currentKey = `${parentKey}-${index}`;
          const isOpen = openSubmenu.includes(currentKey);
          const isActiveLink = subItem.path && isActive(subItem.path);
          const shouldBeActiveSubParent = isActiveLink || isOpen || isDescendantOfActivePath(subItem, pathname);

          return (
            <li key={subItem.name}>
              {subItem.subItems ? (
                <>
                  <button
                    onClick={() => handleSubmenuToggle(currentKey)}
                    className={`menu-dropdown-item group flex justify-between items-center w-full ${shouldBeActiveSubParent ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                  >
                    <span className="menu-item-text">{subItem.name}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
                    />
                  </button>
                  <div
                    ref={(el) => {
                      subMenuRefs.current[currentKey] = el;
                      if (isOpen && el) {
                        updateSubmenuHeight(currentKey);
                      }
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height: isOpen ? `${subMenuHeight[currentKey] || 0}px` : "0px",
                      minHeight: "0px",
                    }}
                  >
                    {renderSubMenuItems(subItem.subItems, currentKey, level + 1)}
                  </div>
                </>
              ) : (
                subItem.path && (
                  <Link
                    href={subItem.path}
                    className={`menu-dropdown-item flex justify-between items-center w-full ${isActiveLink ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                  >
                    <span className="flex-grow">{subItem.name}</span>
                    <span className="flex items-center gap-1">
                      {subItem.new && (
                        <span className={`menu-dropdown-badge ${isActiveLink ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"}`}>
                          new
                        </span>
                      )}
                      {subItem.pro && (
                        <span className={`menu-dropdown-badge ${isActiveLink ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"}`}>
                          pro
                        </span>
                      )}
                    </span>
                  </Link>
                )
              )}
            </li>
          );
        })}
      </ul>
    );
  }, [openSubmenu, subMenuHeight, updateSubmenuHeight, isActive, isDescendantOfActivePath, handleSubmenuToggle, pathname]);





  const renderMenuItems = useCallback((
    items: NavItem[],
    menuType: string
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const topLevelKey = `${menuType}-${index}`;
        const isOpen = openSubmenu.includes(topLevelKey);
        const isActiveLink = nav.path && isActive(nav.path);


        const shouldBeActiveParent = isActiveLink || isOpen || isDescendantOfActivePath(nav, pathname);

        return (
          <li key={nav.name || index}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(topLevelKey)}
                className={`menu-item group ${shouldBeActiveParent ? "menu-item-active" : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
              >
                <span
                  className={`${shouldBeActiveParent ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""
                      }`}
                  />
                )}
              </button>


            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${isActiveLink ? "menu-item-active" : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`${isActiveLink
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[topLevelKey] = el;
                  if (isOpen && el) {
                    updateSubmenuHeight(topLevelKey);
                  }
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen ? `${subMenuHeight[topLevelKey] || 0}px` : "0px",
                  minHeight: "0px", // Crucial for clean collapse
                }}
              >
                {renderSubMenuItems(nav.subItems, topLevelKey)}
              </div>


            )}
          </li>
        );
      })}
    </ul>
  ), [openSubmenu, subMenuHeight, updateSubmenuHeight, isActive, isExpanded, isHovered, isMobileOpen, handleSubmenuToggle, renderSubMenuItems, pathname, isDescendantOfActivePath]); // Added pathname and isDescendantOfActivePath to dependencies








  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`pb-8 pt-3 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/final-logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/final-logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "CUSTOMER MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(customerItems, "customer")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "MODULE MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(moduleItems, "module")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "SERVICE MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(serviceItems, "service")}
            </div>



            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "BOOKING MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(bookingItems, "booking")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "SUBSCRIBE MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(subscribeItems, "subscribe")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PROVIDER MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(providerItems, "provider")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PROMOTION MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(promotionItems, "coupon")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PACKAGE MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(packageItems, "package")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PREFERENCES"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(privacyItems, "preferences")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "OFFER MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(offerItems, "offer")}
            </div>


            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PROVIDER PREFERENCES"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(providerpreferenceItems, "providerpreferences")}
            </div>

            {/* ACADEMY SECTION - NOW SUPPORTING NESTED STRUCTURE */}

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "ACADEMY"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(academyItems, "academy")}
            </div>



            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "ADVISOR MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(advisorItems, "advisor")}
            </div>


            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "REPORT MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(reportItems, "report")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "SYSTEM MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(systemItems, "system")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;


