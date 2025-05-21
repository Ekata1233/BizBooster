import React from 'react'
import StatCard from '../common/StatCard'
import {
  BoxCubeIcon,
  ArrowUpIcon,
  UserIcon,
  CalenderIcon,
  DollarLineIcon,
} from "../../icons/index";
import { useModule } from '@/context/ModuleContext';
import { useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useService } from '@/context/ServiceContext';

const ModuleStatCard = () => {
  const { modules } = useModule();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { services } = useService();


  if (!services) {
    return <div>Loading...</div>;
  }
  if (!modules) {
    return <div>Modules Loading...</div>;
  }
  if (!categories) {
    return <div>Categories Loading...</div>;
  }
  if (!subcategories) {
    return <div>Subcategories Loading...</div>;
  }
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
        <StatCard
          title="Total Modules"
          value={modules.length}
          icon={UserIcon}
          badgeColor="success"
          badgeValue="0.00%"
          badgeIcon={ArrowUpIcon}
        />
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={CalenderIcon}
          badgeColor="success"
          badgeValue="0.00%"
          badgeIcon={ArrowUpIcon}
        />
        <StatCard
          title="Total Subcategories"
          value={subcategories.length}
          icon={DollarLineIcon}
          badgeColor="success"
          badgeValue="0.00%"
          badgeIcon={ArrowUpIcon}
        />
        <StatCard
          title="Total Services"
          value={services?.data?.length || 0}
          icon={BoxCubeIcon}
          badgeColor="success"
          badgeValue="0.00%"
          badgeIcon={ArrowUpIcon}
        />
      </div>
    </div>
  )
}

export default ModuleStatCard