import { UserIcon, CalenderIcon, DollarLineIcon, BoxCubeIcon, ArrowUpIcon } from '@/icons'; 
import StatCard from '../common/StatCard';
import ComponentCard from '../common/ComponentCard';
import { Provider } from '@/context/ProviderContext';

type Props = {
  provider: Provider;
};

const ProviderStatsSection = ({ provider }: Props) => {
  console.log("particular providers :", provider);

  // const subscribedServicesCount = provider?.subscribedServices?.length || 0;

  return (
    <div className="">
      <ComponentCard title="Statestics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
          <StatCard
            title="Total Customer"
            value="150"
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-blue-100 to-blue-200"
            textColor="text-blue-800"
          />
          <StatCard
            title="Subscribe Services"
            // value={subscribedServicesCount.toString()}
            value="150"
            icon={CalenderIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-green-100 to-green-200"
            textColor="text-green-800"
          />
          <StatCard
            title="Total Subcategories"
            value="150"
            icon={DollarLineIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-red-100 to-red-200"
            textColor="text-red-800"
          />
          <StatCard
            title="Total Services"
            value="150"
            icon={BoxCubeIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-purple-100 to-purple-200"
            textColor="text-purple-800"
          />
        </div>
      </ComponentCard>
    </div>
  );
};

export default ProviderStatsSection;
