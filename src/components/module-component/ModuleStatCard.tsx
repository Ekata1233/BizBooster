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
import { usePathname } from 'next/navigation'; 
import { useCertificate } from '@/context/CertificationContext';
import { useWebinars } from '@/context/WebinarContext';

const ModuleStatCard: React.FC = () => {
  const pathname = usePathname();

  const { modules } = useModule();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { services } = useService();
  const { webinars: liveWebinars } = useLiveWebinars();
  const { certificates } = useCertificate();
  const { webinars } = useWebinars();

  let totalMainItems = 0; 
  let totalUsers = 0; 
  let approvedUsers = 0; 
  let pendingUsers = 0; 
  let totalTutorialVideos = 0; 
  let mainTitle = ''; 

  const isLiveWebinarsPath = pathname === '/academy/livewebinars-management/livewebinars-list';
  const isCertificationsPath = pathname === '/academy/certifications-management/Tutorial-List';
  const isWebinarsPath = pathname === '/academy/webinars-management/webinars-list';

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
    totalTutorialVideos = certificates?.reduce((sum, cert) => sum + (cert.video?.length || 0), 0) || 0;

  } else if (isWebinarsPath) {
    mainTitle = "Webinars";
    totalMainItems = webinars?.length || 0;
    totalTutorialVideos = webinars?.reduce((sum, webinar) => sum + (webinar.video?.length || 0), 0) || 0;
  } else {
    mainTitle = "Dashboard Overview";
    totalMainItems = 0;
  }

  const isLoading =
    !modules || !categories || !subcategories || !services || !liveWebinars || !certificates;

  if (isLoading) {
    return <RouteLoader />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">

        {isLiveWebinarsPath && (
          <>
            <StatCard
              title={`Total ${mainTitle}`}
              value={totalMainItems}
              icon={CalenderIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-blue-100 to-blue-200"
              textColor="text-blue-800"
            />
            <StatCard
              title="Total Unique Users"
              value={totalUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-green-100 to-green-200"
              textColor="text-green-800"
            />
            <StatCard
              title="Approved Enrolled Users"
              value={approvedUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-red-100 to-red-200"
              textColor="text-red-800"
            />
            <StatCard
              title="Pending Enrolled Users"
              value={pendingUsers}
              icon={UserIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-purple-100 to-purple-200"
              textColor="text-purple-800"
            />
          </>
        )}

        {isCertificationsPath && (
          <>
            <StatCard
              title="Total Tutorials"
              value={totalMainItems}
              icon={CalenderIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-blue-100 to-blue-200"
              textColor="text-blue-800"
            />
            <StatCard
              title="Total Tutorial Videos"
              value={totalTutorialVideos}
              icon={BoxCubeIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-green-100 to-green-200"
              textColor="text-green-800"
            />
          </>
        )}

        {isWebinarsPath && (
          <>
            <StatCard
              title="Total Webinars"
              value={totalMainItems}
              icon={CalenderIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-blue-100 to-blue-200"
              textColor="text-blue-800"
            />
            <StatCard
              title="Total Webinar Videos"
              value={totalTutorialVideos}
              icon={BoxCubeIcon}
              badgeColor="success"
              badgeValue="0.00%"
              badgeIcon={ArrowUpIcon}
              gradient="from-green-100 to-green-200"
              textColor="text-green-800"
            />
          </>
        )}

      </div>
    </div>
  );
}

export default ModuleStatCard;
