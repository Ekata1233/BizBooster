// 'use client';

// import React from 'react';
// import StatCard from '../common/StatCard';
// import {
//   ArrowUpIcon,
//   UserIcon,
//   CalenderIcon,
// } from "../../icons/index";
// import { useModule } from '@/context/ModuleContext';
// import { useCategory } from '@/context/CategoryContext';
// import { useSubcategory } from '@/context/SubcategoryContext';
// import { useService } from '@/context/ServiceContext';
// import { useLiveWebinars } from '@/context/LiveWebinarContext';
// import RouteLoader from '../RouteLoader';


// const ModuleStatCard = () => {
//   const { modules } = useModule();
//   const { categories } = useCategory();
//   const { subcategories } = useSubcategory();
//   const { services } = useService();
//   const { webinars } = useLiveWebinars(); // Access webinars from LiveWebinarContext
//   const {certificates} = useCertification(); // Assuming you have a CertificationContext
//   // Calculate total unique user IDs (already implemented)
//   const allWebinarUsers = webinars?.flatMap(webinar => webinar.user || []) || [];
//   const allUserIds = webinars?.flatMap(webinar => webinar.user || []) || [];
//   const uniqueUserIds = new Set(allUserIds);
//   const totalUniqueUserIds = uniqueUserIds.size;

//   // Calculate Approved Enrolled Users
//   const approvedUsersCount = allWebinarUsers.filter(entry => entry.status === true).length;

//   // Calculate Pending Enrolled Users
//   const pendingUsersCount = allWebinarUsers.filter(entry => entry.status === false).length;


//   const isLoading =
//     !modules || !categories || !subcategories || !services || !webinars; // Include webinars in loading check

//   if (isLoading) {
//     return <RouteLoader />;
//   }

//   return (
//     <div>
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
//         <StatCard
//           title="Total Live Webinars"
//           value={webinars.length} // Total count of live webinars
//           icon={CalenderIcon}
//           badgeColor="success"
//           badgeValue="0.00%"
//           badgeIcon={ArrowUpIcon}
//         />
//         <StatCard
//           title="Total Unique Users" // Renamed for clarity, as this counts unique individuals across all webinars
//           value={totalUniqueUserIds}
//           icon={UserIcon}
//           badgeColor="success"
//           badgeValue="0.00%"
//           badgeIcon={ArrowUpIcon}
//         />
//         <StatCard
//           title="Approved Enrolled Users"
//           value={approvedUsersCount} // Use the calculated approved users count
//           icon={UserIcon} // Using UserIcon for user-related stats
//           badgeColor="success"
//           badgeValue="0.00%"
//           badgeIcon={ArrowUpIcon}
//         />
//         <StatCard
//           title="Pending Enrolled Users"
//           value={pendingUsersCount} // Use the calculated pending users count
//           icon={UserIcon} // Using UserIcon for user-related stats
//           badgeColor="success"
//           badgeValue="0.00%"
//           badgeIcon={ArrowUpIcon}
//         />


//       </div>
//     </div>
//   );
// }

// export default ModuleStatCard;





'use client';

import React from 'react';
import StatCard from '../common/StatCard';
import {
  ArrowUpIcon,
  UserIcon,
  CalenderIcon,
  BoxCubeIcon,
} from "../../icons/index";
import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useService } from '@/context/ServiceContext';
import { useLiveWebinars } from '@/context/LiveWebinarContext';
import RouteLoader from '../RouteLoader';
import { usePathname } from 'next/navigation'; // Import usePathname
import { useCertificate } from '@/context/CertificationContext';
import { useWebinars } from '@/context/WebinarContext';


const ModuleStatCard: React.FC = () => {
  const pathname = usePathname(); // Get the current path

  // Fetch data from all relevant contexts
  const { modules } = useModule();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { services } = useService();
  const { webinars: liveWebinars } = useLiveWebinars(); // Renamed to avoid conflict
  const { certificates } = useCertificate();
  const { webinars } = useWebinars();

  // Initialize all stats
  let totalMainItems = 0; // Total Live Webinars OR Total Certifications
  let totalUsers = 0; // Total Unique Users for Live Webinars
  let approvedUsers = 0; // Approved for Live Webinars
  let pendingUsers = 0; // Pending for Live Webinars
  let totalTutorialVideos = 0; // Total videos for Certifications

  let mainTitle = ''; // Title for the first StatCard

  // Determine which data to show based on the path
  const isLiveWebinarsPath = pathname === '/academy/livewebinars';
  const isCertificationsPath = pathname === '/academy/certifications';
  const isWebinarsPath = pathname === '/academy/webinars';

  if (isLiveWebinarsPath) {
    mainTitle = "Live Webinars";
    totalMainItems = liveWebinars?.length || 0;

    const allLiveWebinarUsers = liveWebinars?.flatMap(webinar => webinar.user || []) || [];
    const uniqueUserIdsSet = new Set(allLiveWebinarUsers);
    totalUsers = uniqueUserIdsSet.size;

    approvedUsers = allLiveWebinarUsers.filter(entry => entry.status === true).length;
    pendingUsers = allLiveWebinarUsers.filter(entry => entry.status === false).length;

  } else if (isCertificationsPath) {
    mainTitle = "Certifications";
    totalMainItems = certificates?.length || 0;

    // Calculate total tutorial videos for certifications
    totalTutorialVideos = certificates?.reduce((sum, cert) => sum + (cert.video?.length || 0), 0) || 0;

    // For certifications, if there are no specific 'approved/pending' user lists,
    // these counts will remain 0. Adjust if your CertificationType has a user enrollment array.
    totalUsers = 0;
    approvedUsers = 0;
    pendingUsers = 0;

  }
  else if (isWebinarsPath) {
    mainTitle = "Webinars";
    totalMainItems = webinars?.length || 0;
    totalTutorialVideos = webinars?.reduce((sum, webinar) => sum + (webinar.video?.length || 0), 0) || 0;

    // For webinars, if there are no specific 'approved/pending' user lists,
    // these counts will remain 0. Adjust if your WebinarType has a user enrollment array.
    totalUsers = 0;
    approvedUsers = 0;
    pendingUsers = 0;
  } else {
    // Default or handle other paths if necessary
    mainTitle = "Dashboard Overview";
    totalMainItems = 0;
  }

  // Loading check for all relevant data
  const isLoading =
    !modules || !categories || !subcategories || !services || !liveWebinars || !certificates;

  if (isLoading) {
    return <RouteLoader />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
        {/* Dynamic Card for Total Live Webinars / Total Certifications */}


        {/* Live Webinar Specific Cards */}
        {isLiveWebinarsPath && (
          <>

            <StatCard
              title={`Total ${mainTitle}`}
              value={totalMainItems}
              icon={CalenderIcon} // Using CalenderIcon for general count
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />

            <StatCard
              title="Total Unique Users"
              value={totalUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />
            <StatCard
              title="Approved Enrolled Users"
              value={approvedUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />
            <StatCard
              title="Pending Enrolled Users"
              value={pendingUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />
          </>
        )}

        {/* Certification Specific Cards */}
        {isCertificationsPath && (
          <>

            <StatCard
              title="Total Tutorials"
              value={totalMainItems}
              icon={CalenderIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />

            <StatCard
              title="Total Tutorial Videos"
              value={totalTutorialVideos}
              icon={BoxCubeIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />


          </>
        )}

         {isWebinarsPath && (
          <>

            <StatCard
              title="Total Certificates"
              value={totalMainItems}
              icon={CalenderIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />

            <StatCard
              title="Total Tutorial Videos"
              value={totalTutorialVideos}
              icon={BoxCubeIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
            />


          </>
        )}




      </div>
    </div>
  );
}

export default ModuleStatCard;