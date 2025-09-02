import { UserIcon, CalenderIcon, DollarLineIcon, BoxCubeIcon, ArrowUpIcon } from '@/icons';
import StatCard from '../common/StatCard';
import ComponentCard from '../common/ComponentCard';
import { Provider } from '@/context/ProviderContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useServiceMan } from '@/context/ServiceManContext';

type Props = {
  provider: Provider;
};

const ProviderStatsSection = ({ provider }: Props) => {
  console.log("particular providers :", provider);

  const { checkouts = [], loading: checkoutLoading, error: checkoutError } = useCheckout();
  const { serviceMen = [], loading: serviceManLoading, error: serviceManError } = useServiceMan();

  const subscribedServicesCount = provider?.subscribedServices?.length || 0;

  // If any error, display it
  if (checkoutError || serviceManError) {
    return <p className="text-red-500">{checkoutError || serviceManError}</p>;
  }

  return (
    <div className="">
      <ComponentCard title="Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
          <StatCard
            title="Total Serviceman"
            value={serviceMen?.length?.toString() || "0"}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-blue-100 to-blue-200"
            textColor="text-blue-800"
          />
          <StatCard
            title="Total Bookings"
            value={checkouts?.length?.toString() || "0"}
            icon={CalenderIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-green-100 to-green-200"
            textColor="text-green-800"
          />
          <StatCard
            title="Total Subscribed Services"
            value={subscribedServicesCount.toString()}
            icon={DollarLineIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-red-100 to-red-200"
            textColor="text-red-800"
          />
          <StatCard
            title="Total Earning"
            value="0" // Replace with actual earnings when available
            icon={BoxCubeIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
            gradient="from-purple-100 to-purple-200"
            textColor="text-purple-800"
          />
        </div>

        {/* optional: show a subtle loading indicator below cards */}
        {(checkoutLoading || serviceManLoading) && (
          <p className="text-sm text-gray-400 mt-2">Updating stats...</p>
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderStatsSection;
