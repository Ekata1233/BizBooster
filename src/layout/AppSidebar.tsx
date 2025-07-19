"use client";

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

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [{ icon: <GridIcon />, name: "Dashboard", path: "/" }];

const moduleItems: NavItem[] = [
  { icon: <PieChartIcon />, name: "Module", path: "/module-management/module" },
  { icon: <FolderIcon />, name: "Category", path: "/category-management/category" },
  { icon: <BoxIcon />, name: "SubCategory", path: "/subCategory-management/subCategory" },
  {
    icon: <FolderIcon />,
    name: "Banner",
    subItems: [
      { name: "Add Banner", path: "/banner-management/add-banner" },
      { name: "Banner-list", path: "/banner-management/banners" },
    ],
  },
];

const customerItems: NavItem[] = [
  { icon: <PieChartIcon />, name: "Users", path: "/customer-management/user/user-list" },
   { icon: <PieChartIcon />, name: "UsersSupport", path: "/customer-management/user/user-list/681c72b9062be714d7037840" },
];





const providerItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Provider",
    subItems: [
      { name: "Add Provider", path: "/provider-management/add-provider" },
      { name: "Provider Request", path: "/provider-management/provider-request" },
      { name: "Provider List", path: "/provider-management/provider-list" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Zone Setup",
    subItems: [
      { name: "Add Zone", path: "/zone-management/add-zone" },
      { name: "Zone List", path: "/zone-management/zone-list" },
    ],
  },
];

const serviceItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Service",
    subItems: [
      { name: "Add New Service", path: "/service-management/add-service" },
      { name: "Service List", path: "/service-management/service-list" },
      { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose" },
    ],
  },
];

const packageItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Package",
    subItems: [{ name: "Add Package", path: "/package-management/add-package" }],
  },
];

const subscribeItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Subscribe",
    subItems: [
      { name: "Subscribe Request", path: "/subscribe-management/subscribe-request" },
      { name: "Subscribe List", path: "/subscribe-management/subscribe-list" },
    ],
  },
];

const systemItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Settings Management",
    subItems: [{ name: "Business Settings", path: "/system-management/business-settings" }],
  },
];

const promotionItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Coupons",
    subItems: [
      { name: "Add Coupons", path: "/coupons-management/add-coupon" },
      { name: "Coupons List", path: "/coupons-management/coupons-list" },
    ],
  },
];

const bookingItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Bookings",
    subItems: [{ name: "All Bookings", path: "/booking-management/all-booking" }],
  },
  {
    icon: <PieChartIcon />,
    name: "Leads",
    subItems: [{ name: "Lead Requests", path: "/booking-management/lead-request" }],
  },
];

const reportItems: NavItem[] = [
  { icon: <GridIcon />, name: "Transaction Reports", path: "/report-management/transaction-reports" },
  { icon: <GridIcon />, name: "Business Reports", path: "/report-management/business-reports" },
];

const privacyItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Preferences",
    subItems: [
      // { name: "About Us", path: "/about-us-management/about-us" },
      { name: "Privacy & Policy", path: "/preferences/privacy-policy" },
      { name: "Refund Policy", path: "/preferences/refund-policy" },
      { name: "Terms and Conditions", path: "/preferences/terms-conditions" },
      { name: "Cancellation Policy", path: "/preferences/cancellation-policy" },
      { name: "About Us", path: "/preferences/aboutus" },
      { name: "Partner Review", path: "/preferences/partner-review" },
      { name: "Offer", path: "/preferences/offer-management/offer" },
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

const academyItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Academy",
    subItems: [
      { name: "Training Tutorials", path: "/academy/certifications" },
      { name: "Live Webinars", path: "/academy/livewebinars" },
      { name: "Recorded Webinars", path: "/academy/webinars" },
      { name: "Understanding Fetch True", path: "/academy/understandingfetchtrue" },
    ],
  },
];

const menuItems: NavItem[] = [];

type MenuType =
  | "main"
  | "customer"
  | "module"
  | "provider"
  | "service"
  | "package"
  | "subscribe"
  | "coupon"
  | "booking"
  | "report"
  | "system"
  | "preferences"
  | "academy"
  | "providerpreferences"
  | "menu";

const menuMap: Record<MenuType, NavItem[]> = {
  main: navItems,
  customer: customerItems,
  module: moduleItems,
  provider: providerItems,
  service: serviceItems,
  package: packageItems,
  subscribe: subscribeItems,
  coupon: promotionItems,
  booking: bookingItems,
  report: reportItems,
  system: systemItems,
  preferences: privacyItems,
  academy: academyItems,
  providerpreferences: providerpreferenceItems,
  menu: menuItems,
  
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{ type: MenuType; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let matched = false;
    (Object.keys(menuMap) as MenuType[]).forEach((type) => {
      menuMap[type].forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type, index });
            matched = true;
          }
        });
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((h) => ({ ...h, [key]: el.scrollHeight }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, type: MenuType) => {
    setOpenSubmenu((prev) => (prev && prev.type === type && prev.index === index ? null : { type, index }));
  };

  const renderMenuItems = (items: NavItem[], type: MenuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, type)}
              className={`menu-item group ${
                openSubmenu?.type === type && openSubmenu.index === index ? "menu-item-active" : "menu-item-inactive"
              } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`${
                  openSubmenu?.type === type && openSubmenu.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === type && openSubmenu.index === index ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === type && openSubmenu.index === index
                    ? `${subMenuHeight[`${type}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      href={sub.path}
                      className={`menu-dropdown-item ${
                        isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {sub.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {sub.new && (
                          <span
                            className={`ml-auto ${
                              isActive(sub.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {sub.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(sub.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`pb-8 pt-3 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/final-logo.png" alt="Logo" width={150} height={40} />
              <Image className="hidden dark:block" src="/images/logo/final-logo.png" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {Object.keys(menuMap).map((type) => (
              <div key={type}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? type.toUpperCase().replace(/([A-Z])/g, " $1") : <HorizontaLDots />}
                </h2>
                {renderMenuItems(menuMap[type as MenuType], type as MenuType)}
              </div>
            ))}
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
