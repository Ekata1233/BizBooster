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















// "use client";
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
  BoxIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

// --- MODIFIED TYPE DEFINITION TO BE RECURSIVE ---
type NavItem = {
  name: string;
  icon?: React.ReactNode; // Icon is optional for nested sub-items
  path?: string;
  subItems?: NavItem[]; // Now recursive: a NavItem can contain other NavItems
  pro?: boolean; // For sub-sub-items
  new?: boolean; // For sub-sub-items
};

// --- NAVIGATION DATA ARRAYS ---
// IMPORTANT: Ensure these arrays are populated with your actual menu data.
// If they are empty, your sidebar will appear empty.
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
    path: "/module-management/module",
  },
  {
    icon: <FolderIcon />,
    name: "Category",
    path: "/category-management/category",
  },
  {
    icon: <BoxIcon />,
    name: "SubCategory",
    path: "/subCategory-management/subCategory",
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
    subItems: [{ name: "Add New package", path: "/package-management/add-package", pro: false }],
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
    subItems: [{ name: "All Bookings", path: "/booking-management/all-booking", pro: false }],
  },
  {
    icon: <PieChartIcon />,
    name: "Leads",
    subItems: [{ name: "Lead Requests", path: "/booking-management/lead-request", pro: false }],
  },
  {
    icon: <PieChartIcon />,
    name: "Assign Provider",
    path: "/booking-management/assign-provider",
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
      // { name: "Partner Review", path: "/preferences/partner-review" },
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
      {
        name: "Provider Terms and Conditions",
        path: "/providerpreferences/provider-termsandconditions",
      },
      {
        name: "Provider Cancellation Policy",
        path: "/providerpreferences/provider-cancellationpolicy",
      },
      { name: "Provider About Us", path: "/providerpreferences/provider-aboutus" },
      { name: "Provider Help and Support", path: "/providerpreferences/provider-helpandsupport" },
    ],
  },
];

// --- MODIFIED ACADEMY ITEMS WITH NESTED DATA ---
const academyItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Academy",
    subItems: [
      {
        name: "Tutorials",
        subItems: [
          { name: "Add Tutorials", path: "/academy/certifications-management/add-tutorial" },
          { name: "Tutorial List", path: "/academy/certifications-management/Tutorial-List" },
        ],
      },
      {
        name: "Live Webinars",
        subItems: [
          { name: "Add Live Webinars", path: "/academy/livewebinars-management/add-webinar" },
          {
            name: "Live Webinars List",
            path: "/academy/livewebinars-management/livewebinars-list",
          },
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
        name: "Understanding Fetch True",
        subItems: [
          { name: "Add Understanding Fetch True", path: "/academy/understandingfetchtrue/add" },
          { name: "Understanding Fetch True List", path: "/academy/understandingfetchtrue" },
        ],
      },
      { name: "Partner Review", path: "/preferences/partner-review" }, // This seems out of place for Academy, if it's correct, keep it. Otherwise, consider moving it.
    ],
  },
];

const reportItems: NavItem[] = [
  { icon: <GridIcon />, name: "Transaction Reports", path: "/report-management/transaction-reports" },
  { icon: <GridIcon />, name: "Business Reports", path: "/report-management/business-reports" },
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

  // State to manage which submenus are open
  // Keys will be like "main-0", "module-1-0", "academy-0-0" for nested items
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Effect to automatically open submenus based on the current pathname
  useEffect(() => {
    const newOpenSubmenus: Record<string, boolean> = {};

    const findAndMarkActiveParents = (
      items: NavItem[],
      menuTypePrefix: string,
      currentPathSegments: number[] = [] // Tracks indices for nested levels
    ): boolean => {
      let anyChildOrCurrentItemIsActive = false;

      items.forEach((item, index) => {
        const itemKey = `${menuTypePrefix}-${[...currentPathSegments, index].join("-")}`;

        if (item.subItems) {
          // Recursively check sub-items
          if (findAndMarkActiveParents(item.subItems, menuTypePrefix, [...currentPathSegments, index])) {
            newOpenSubmenus[itemKey] = true; // Mark this parent as open
            anyChildOrCurrentItemIsActive = true;
          }
        } else if (item.path && isActive(item.path)) {
          // If a leaf item's path matches, mark its direct parent as open
          // This logic seems slightly off for deeply nested items.
          // It should mark all parents up the chain.
          // Let's refine this:
          const tempSegments = [...currentPathSegments];
          for (let i = tempSegments.length - 1; i >= 0; i--) {
            const parentKey = `${menuTypePrefix}-${tempSegments.slice(0, i + 1).join("-")}`;
            newOpenSubmenus[parentKey] = true;
          }
          anyChildOrCurrentItemIsActive = true;
        }
      });
      return anyChildOrCurrentItemIsActive;
    };

    const allMenuMaps = {
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
      academy: academyItems, // Correctly using the nested academyItems
      providerpreferences: providerpreferenceItems,
      report: reportItems,
      offer: offerItems,
    };

    (Object.keys(allMenuMaps) as Array<keyof typeof allMenuMaps>).forEach((menuType) => {
      findAndMarkActiveParents(allMenuMaps[menuType], menuType);
    });

    setOpenSubmenus(newOpenSubmenus);
  }, [pathname, isActive]);

  // Effect to calculate submenu heights
  useEffect(() => {
    const newHeights: Record<string, number> = {};
    Object.keys(openSubmenus).forEach((key) => {
      if (openSubmenus[key] && subMenuRefs.current[key]) {
        newHeights[key] = subMenuRefs.current[key]?.scrollHeight || 0;
      }
    });
    setSubMenuHeight(newHeights);
  }, [openSubmenus]);

  // Handler for toggling submenus
  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenus((prevOpenSubmenus) => {
      const newOpenSubmenus = { ...prevOpenSubmenus };

      // Toggle the state of the clicked submenu
      newOpenSubmenus[key] = !newOpenSubmenus[key];

      // Optional: Close sibling submenus at the same level (if you want only one open at a time)
      // This part can be more complex for deeply nested menus.
      // For now, it just toggles the specific clicked submenu.
      // If you implement a "close others" logic, ensure it doesn't close parent/child submenus.

      return newOpenSubmenus;
    });
  };

  // --- RECURSIVE RENDER FUNCTION ---
  const renderMenuItems = (
    items: NavItem[],
    menuTypePrefix: string,
    currentPathSegments: number[] = [], // Tracks indices for unique key generation
    marginLeftClass = "ml-0" // Controls indentation for nested items
  ) => (
    <ul className={`flex flex-col gap-4 ${marginLeftClass}`}>
      {items.map((nav, index) => {
        const itemKey = `${menuTypePrefix}-${[...currentPathSegments, index].join("-")}`;
        const isOpen = !!openSubmenus[itemKey];
        const currentSubMenuHeight = subMenuHeight[itemKey] || 0;

        // const isLeaf = !nav.subItems || nav.subItems.length === 0; // This variable is not used

        return (
          <li key={itemKey}>
            {/* Conditional rendering for items with subItems vs. direct links */}
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(itemKey)}
                className={`menu-item group ${
                  isOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered && currentPathSegments.length === 0
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                {/* Only render icon for top-level items or if explicitly present */}
                {nav.icon && (
                  <span className={`${isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              // This is a direct link (leaf node)
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${
                    !isExpanded && !isHovered && currentPathSegments.length === 0
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  {/* Only render icon for top-level items or if explicitly present */}
                  {nav.icon && (
                    <span
                      className={`${
                        isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* Render nested sub-items if available and sidebar is expanded/hovered/mobile-open */}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[itemKey] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen ? `${currentSubMenuHeight}px` : "0px",
                }}
              >
                {/* Recursive call for nested sub-items */}
                {renderMenuItems(
                  nav.subItems,
                  menuTypePrefix,
                  [...currentPathSegments, index],
                  "ml-9" // Indent nested sub-items
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
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
        className={`pb-8 pt-3 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Render each top-level menu section */}
            {[
              { title: "Menu", items: navItems, type: "main" },
              { title: "Customer Management", items: customerItems, type: "customer" },
              { title: "Module Management", items: moduleItems, type: "module" },
              { title: "Service Management", items: serviceItems, type: "service" },
              { title: "Package Management", items: packageItems, type: "package" },
              { title: "Booking Management", items: bookingItems, type: "booking" },
              { title: "Subscribe Management", items: subscribeItems, type: "subscribe" },
              { title: "Provider Management", items: providerItems, type: "provider" },
              { title: "Promotion Management", items: promotionItems, type: "coupon" },
              { title: "Preferences", items: privacyItems, type: "preferences" },
              { title: "Offer Management", items: offerItems, type: "offer" },
              { title: "Provider Preferences", items: providerpreferenceItems, type: "providerpreferences" },
              // --- ACADEMY SECTION ---
              { title: "Academy", items: academyItems, type: "academy" },
              // --- END ACADEMY SECTION ---
              { title: "Report Management", items: reportItems, type: "report" },
              { title: "System Management", items: systemItems, type: "system" },
            ].map((section) => (
              <div key={section.type}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? section.title : <HorizontaLDots />}
                </h2>
                {renderMenuItems(section.items, section.type)}
              </div>
            ))}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;