import { UserIcon, CalenderIcon, DollarLineIcon, BoxCubeIcon, ArrowUpIcon } from '@/icons'; // adjust imports as needed 
import StatCard from '../common/StatCard';
import ComponentCard from '../common/ComponentCard';
import { Provider } from '@/context/ProviderContext';

type Props = {
  provider: Provider;
  
};


const ProviderStatsSection = ({ provider }: Props) => {
  console.log("particular providers :", provider);

  // Safely get the subscribed services count
  // const subscribedServicesCount = provider?.subscribedServices?.length || 0;

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-gradient-to-br to-white">
      <ComponentCard title="Statestics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
          <StatCard
            title="Total Customer"
            value="150"
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
          <StatCard
            title="Subscribe Services"
            // value={subscribedServicesCount.toString()}
             value="150"
            icon={CalenderIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
          <StatCard
            title="Total Subcategories"
            value="150"
            icon={DollarLineIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
          <StatCard
            title="Total Services"
            value="150"
            icon={BoxCubeIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </ComponentCard>
    </div>
  );
};

export default ProviderStatsSection;
