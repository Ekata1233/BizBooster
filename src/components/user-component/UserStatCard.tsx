import React, { useEffect } from 'react'
import StatCard from '../common/StatCard'
import {
  BoxCubeIcon,
  ArrowUpIcon,
  UserIcon,
  CalenderIcon,
  DollarLineIcon,
} from "../../icons/index";
import { useUserContext } from '@/context/UserContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useUserWallet } from '@/context/WalletContext';

const UserStatCard = () => {
  const { users } = useUserContext();
  const { checkouts } = useCheckout();
  const { allWallets, fetchAllWallets } = useUserWallet();

  console.log("wallet detials : ", allWallets)
  useEffect(() => {
    fetchAllWallets();
  }, []);

const excludedUserId = '444c44d4444be444d4444444';

const filteredWallets = allWallets.filter(
  wallet =>
    wallet.userId?._id &&
    wallet.userId._id.toString() !== excludedUserId // convert ObjectId to string
);

const totalWalletBalance = filteredWallets.reduce(
  (sum, wallet) => sum + (wallet.balance || 0),
  0
);


const totalEarnings = filteredWallets.reduce(
  (sum, wallet) => sum + (wallet.totalCredits || 0),
  0
);



  if (!users) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">

        <StatCard
          title="Total Users"
          value={users.length}
          icon={UserIcon}
          badgeColor="success"
        
          badgeIcon={ArrowUpIcon}
          gradient="from-blue-100 to-blue-200"
          textColor="text-blue-800"
        />

        <StatCard
          title="Total Booking"
          value={checkouts?.length || 0}
          icon={CalenderIcon}
          badgeColor="success"
        
          badgeIcon={ArrowUpIcon}
          gradient="from-green-100 to-green-200"
          textColor="text-green-800"
        />

       <StatCard
  title="Total Earnings"
  value={`₹${Number(totalEarnings).toFixed(2)}`}
  icon={DollarLineIcon}
  badgeColor="success"

  badgeIcon={ArrowUpIcon}
  gradient="from-red-100 to-red-200"
  textColor="text-red-800"
/>

<StatCard
  title="Total Wallet Balance"
  value={`₹${Number(totalWalletBalance).toFixed(2)}`}
  icon={BoxCubeIcon}
  badgeColor="success"

  badgeIcon={ArrowUpIcon}
  gradient="from-purple-100 to-purple-200"
  textColor="text-purple-800"
/>

      </div>
    </div>
  )
}

export default UserStatCard
