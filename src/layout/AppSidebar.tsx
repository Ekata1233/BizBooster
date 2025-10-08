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
  BoxIcon,
  PaperPlaneIcon,
  UserIcon,
  GroupIcon,
  TaskIcon,
  EnvelopeIcon,
  DollarLineIcon,
  UserCircleIcon,
  LockIcon,
  DocsIcon,
  TableIcon,
  ArrowDownIcon,
  BellIcon,
  PlugInIcon
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { useCheckout } from "@/context/CheckoutContext";
import { useLead } from "@/context/LeadContext";
import { CalendarIcon, DollarSignIcon, HelpCircleIcon, MapIcon, Megaphone } from "lucide-react";
import axios from "axios";

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
interface SupportQuestion {
  _id: string;
  question: string;
  answer?: string;
  createdAt: string;
  updatedAt: string;
}

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
];

const moduleItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
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
    icon: <PaperPlaneIcon />,
    name: "Banner",
    subItems: [
      { name: "Add Banner", path: "/banner-management/add-banner", pro: false },
      { name: "Banner-list", path: "/banner-management/banners", pro: false },
    ],
  },
];

const customerItems: NavItem[] = [
  {
    icon: <UserIcon />,
    name: "Users",
    path: "/customer-management/user/user-list",
  },
  {
    icon: <HelpCircleIcon />,
    name: "Support",
    path: "/customer-management/user/support",
  },
];

const providerItems: NavItem[] = [
  {
    icon: <GroupIcon />,
    name: "Provider",
    subItems: [
      { name: "Add Provider", path: "/provider-management/add-provider", pro: false },
      { name: "Provider Request", path: "/provider-management/provider-request", pro: false },
      { name: "Provider List", path: "/provider-management/provider-list", pro: false },
      { name: "Provider Gallery", path: "/provider-management/provider-gallery", pro: false },
      { name: "Payment Adjustment", path: "/provider-management/payment-adjustment", pro: false },
    ],
  },
  {
    icon: <MapIcon />,
    name: "Zone Setup",
    subItems: [
      { name: "Add Zone", path: "/zone-management/add-zone", pro: false },
      { name: "Zone List", path: "/zone-management/zone-list", pro: false },
    ],
  },
];

const serviceItems: NavItem[] = [
  {
    icon: <TaskIcon />,
    name: "Service",
    subItems: [
      { name: "Add New Service", path: "/service-management/add-service", pro: false },
      { name: "Service List", path: "/service-management/service-list", pro: false },
      { name: "Add Why Choose FetchTrue", path: "/service-management/add-why-choose", pro: false },
    ],
  },
];

const subscribeItems: NavItem[] = [
  {
    icon: <EnvelopeIcon />,
    name: "Subscribe",
    subItems: [
      { name: "Subscribe Request", path: "/subscribe-management/subscribe-request", pro: false },
      { name: "Subscribe List", path: "/subscribe-management/subscribe-list", pro: false },
    ],
  },
];

const promotionItems: NavItem[] = [
  {
    icon: <DollarLineIcon />,
    name: "Coupons",
    subItems: [
      { name: "Add Coupons", path: "/coupons-management/add-coupon", pro: false },
      { name: "Coupons List", path: "/coupons-management/coupons-list", pro: false },
    ],
  },
  {
    icon: <Megaphone />,
    name: "Advertisements",
    subItems: [
      { name: "Adds List", path: "/adds-management/adds-list", pro: false },
      { name: "New Add Request", path: "/adds-management/add-request", pro: false },
    ],
  },
];

const bookingItems: NavItem[] = [
  {
    icon: <CalendarIcon />,
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
    icon: <UserCircleIcon />,
    name: "Leads",
    subItems: [
      { name: "Lead Requests", path: "/booking-management/lead-request", pro: false },
    ],
  },
];

const privacyItems: NavItem[] = [
  {
    icon: <LockIcon />,
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
    icon: <DollarSignIcon />,
    name: "Offer Management",
    subItems: [
      { name: "Add Offer", path: "/offer-management/Add-Offer" },
      { name: "Offer List", path: "/offer-management/Offer-List" },
    ],
  },
];

const providerpreferenceItems: NavItem[] = [
  {
    icon: <UserIcon />,
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
    icon: <DocsIcon />,
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
    icon: <UserCircleIcon />,
    name: "Advisor Management",
    subItems: [
      { name: "Add Advisor", path: "/advisor-management/add-advisor" },
      { name: "Advisor List", path: "/advisor-management/advisor-list" },
    ],
  },
];

const reportItems: NavItem[] = [
  { icon: <TableIcon />, name: "Transaction Reports", path: "/report-management/transaction-reports" },
  { icon: <PieChartIcon />, name: "Business Reports", path: "/report-management/business-reports" },
  { icon: <DollarLineIcon />, name: "Admin Earnings", path: "/report-management/admin-earnings" },
  { icon: <ArrowDownIcon />, name: "Payout Details", path: "/report-management/payout-details" },

];

const notificationItems: NavItem[] = [
  { icon: <Megaphone />, name: "Send Notification", path: "/notification-management/send-notification" },
];

const systemItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Settings Management",
    subItems: [
      { name: "Business Settings", path: "/system-management/business-settings", pro: false },
    ],
  },
];

const EmployeeItems: NavItem[] = [
  {
    icon: <TaskIcon />,
    name: "Employee Role",
    path: "/employee-management/employee-role"
  },
  {
    icon: <GroupIcon />,
    name: "Employees",
    subItems: [
      { name: "Add Employee", path: "/employee-management/add-employee", pro: false },
      { name: "Employee-list", path: "/employee-management/employee-list", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string[]>([]);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { checkouts } = useCheckout();
  const { leads } = useLead();
  const [supportQuestions, setSupportQuestions] = useState<SupportQuestion[]>([]);
  const [unansweredCount, setUnansweredCount] = useState(0);
  useEffect(() => {
    // console.log("All Checkouts:", checkouts);
  }, [checkouts]);
  const isActive = useCallback((path: string) => path === pathname, [pathname]);


  // Helper function to recursively check if any descendant is active
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
      booking: bookingItems,
      subscribe: subscribeItems,
      coupon: promotionItems,
      system: systemItems,
      preferences: privacyItems,
      academy: academyItems,
      advisor: advisorItems,
      providerpreferences: providerpreferenceItems,
      report: reportItems,
      notification: notificationItems,
      offer: offerItems,
      employee: EmployeeItems,
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

  //help and support count 
  useEffect(() => {
    const fetchSupportQuestions = async () => {
      try {
        const res = await axios.get("/api/support/question");
        const questions = res.data?.data || [];

        setSupportQuestions(questions);

        // 🔹 Count unanswered
        const unanswered = questions.filter((q: SupportQuestion) => !q.answer).length;


        setUnansweredCount(unanswered);
      } catch (err) {
        console.error("Error fetching support questions:", err);
      }
    };

    fetchSupportQuestions();

    // Auto refresh every 30s (optional)
    const interval = setInterval(fetchSupportQuestions, 30000);
    return () => clearInterval(interval);
  }, []);

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
                    className={`menu-dropdown-item group flex justify-between items-center w-full ${shouldBeActiveSubParent
                      ? "menu-dropdown-item-active"
                      : "menu-dropdown-item-inactive"
                      }`}
                  >
                    <span className="menu-item-text">{subItem.name}</span>

                    <ChevronDownIcon
                      className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""
                        }`}
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
                    className={`menu-dropdown-item flex justify-between items-center w-full ${isActiveLink
                      ? "menu-dropdown-item-active"
                      : "menu-dropdown-item-inactive"
                      }`}
                  >
                    <span className="flex-grow">{subItem.name}</span>

                    {/* 🔹 BADGE SECTION */}
                    <span className="flex items-center gap-2">
                      {subItem.new && (
                        <span
                          className={`menu-dropdown-badge ${isActiveLink
                            ? "menu-dropdown-badge-active"
                            : "menu-dropdown-badge-inactive"
                            }`}
                        >
                          new
                        </span>
                      )}
                      {subItem.pro && (
                        <span
                          className={`menu-dropdown-badge ${isActiveLink
                            ? "menu-dropdown-badge-active"
                            : "menu-dropdown-badge-inactive"
                            }`}
                        >
                          pro
                        </span>
                      )}

                      {/* 🔹 Support Badge - Only for Support item */}
                      {subItem.name === "Support" && unansweredCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {unansweredCount}
                        </span>
                      )}

                      {/* 🔹 Booking Count Badge */}
                      {subItem.name === "All Bookings" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {checkouts.length}
                        </span>
                      )}
                      {/* ✅ Count badge for Booking Requests */}
                      {subItem.name === "Booking Requests" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {checkouts?.filter(
                            (checkout) => checkout.isAccepted === false
                          )?.length || 0}
                        </span>
                      )}
                      {subItem.name === "Accepted Bookings" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {checkouts?.filter(
                            (checkout) =>
                              checkout.isAccepted === true &&
                              checkout.isCompleted === false &&
                              checkout.isCanceled === false
                          )?.length || 0}
                        </span>
                      )}
                      {subItem.name === "Completed Bookings" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {checkouts?.filter(
                            (checkout) =>
                              checkout.isCompleted === true &&
                              checkout.isCanceled === false
                          )?.length || 0}
                        </span>
                      )}
                      {subItem.name === "Cancelled Bookings" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {checkouts?.filter(
                            (checkout) => checkout.isCanceled === true
                          )?.length || 0}
                        </span>
                      )}
                      {subItem.name === "Refunded Bookings" && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {leads?.filter((lead) =>
                            lead.leads?.some((l) => l.statusType === "Refund")
                          )?.length || 0}
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
  }, [openSubmenu, subMenuHeight, updateSubmenuHeight, isActive, isDescendantOfActivePath, handleSubmenuToggle, pathname, unansweredCount, checkouts, leads]);

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
                  {/* 🔹 Support Badge for top-level Support item */}
                  {(isExpanded || isHovered || isMobileOpen) && nav.name === "Support" && unansweredCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unansweredCount}
                    </span>
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
  ), [openSubmenu, subMenuHeight, updateSubmenuHeight, isActive, isExpanded, isHovered, isMobileOpen, handleSubmenuToggle, renderSubMenuItems, pathname, isDescendantOfActivePath, unansweredCount]);

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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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

            {/* Other menu sections remain the same */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "NOTIFICATION MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(notificationItems, "notification")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-700 font-bold ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "EMPLOYEE MANAGEMENT"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(EmployeeItems, "employee")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;