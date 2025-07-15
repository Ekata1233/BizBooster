"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  UserCircleIcon,
  FolderIcon,
  BoxIcon
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
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
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "Franchise",
  //   path: "/customer-management/franchise/franchise-list",
  // },
];

const providerItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Provider",
    subItems: [
      { name: "Add Provider", path: "/provider-management/add-provider", pro: false },
      { name: "Provider Request", path: "/provider-management/provider-request", pro: false },
      { name: "Provider List", path: "/provider-management/provider-list", pro: false },
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
      // { name: "package List", path: "/service-management/service-list", pro: false },
      // { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose", pro: false },
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

const systemItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Settings Management",
    subItems: [
      { name: "Business Settings", path: "/system-management/business-settings", pro: false },
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

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "customer" | "module" | "provider" | "service" |  "package" | "subscribe" | "coupon" | "booking" | "system" | "preferences" | "academy" | "providerpreferences";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "customer", "module", "provider", "service","package", "booking", "subscribe", "coupon", "system", "preferences", "academy", "providerpreferences"].forEach((menuType) => {
      const items =
        menuType === "main" ? navItems :
        menuType === "module" ? moduleItems :
        menuType === "provider" ? providerItems :
        menuType === "service" ? serviceItems :
        menuType === "package" ? packageItems :
        menuType === "booking" ? bookingItems :
        menuType === "subscribe" ? subscribeItems :
        menuType === "coupon" ? promotionItems :
        menuType === "system" ? systemItems :
        menuType === "preferences" ? privacyItems :
        menuType === "academy" ? academyItems :
        menuType === "providerpreferences" ? providerpreferenceItems :
        customerItems;
      
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as any,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number, 
    menuType: "main" | "customer" | "module" | "provider" | "service" | "package" | "booking" | "subscribe" | "coupon" | "system" | "preferences" | "academy" | "providerpreferences"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "customer" | "module" | "provider" | "service" | "package" | "booking" | "subscribe" | "coupon" | "system" | "preferences" | "academy" | "providerpreferences"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
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
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;