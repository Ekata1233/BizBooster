'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserStatCard from '@/components/user-profile/UserAddressCard';
import UserInfoCard from '@/components/user-profile/UserInfoCard';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useParams, usePathname } from 'next/navigation';
// import ComponentCard from '@/components/common/ComponentCard';
import SelfLeadTable from '@/components/user-profile/SelfLeadTable';
import TeamLeadTable from '@/components/user-profile/TeamLeadTable';
import FiveXGuarantee from '@/components/user-profile/FiveXGuarantee';
import HelpSupport from '@/components/user-profile/HelpSupport';
import UserDeposite from '@/components/user-profile/UserDeposite';
import UserWallet from '@/components/user-profile/UserWallet';
import Image from 'next/image';
import PackageTransaction from '@/components/user-profile/PackageTransaction';

const UserDetails = () => {
  const {
    users,
    fetchSingleUser,
    singleUser,
    singleUserLoading,
    singleUserError,
  } = useUserContext();

  const params = useParams();
  const userId = params?.id as string;

  const pathname = usePathname();
  const isRootUser = !pathname.includes('/leads/');

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (userId) {
      fetchSingleUser(userId);
    }

  }, [userId]);

  if (singleUserLoading)
    return <div className="text-center text-gray-500">Loading user...</div>;
  if (singleUserError)
    return <div className="text-center text-red-500">Error: {singleUserError}</div>;
  if (!singleUser)
    return <div className="text-center text-gray-500">No user found.</div>;

  const tabButtons = [
    { key: 'info', label: 'Profile' },
    // { key: 'stats', label: 'Stats' },
    { key: 'selfLead', label: 'Self Lead' },
    { key: 'teamLead', label: 'Team Lead' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'guarantee', label: '5x Guarantee' },
    { key: 'support', label: 'Support' },
    { key: 'deposite', label: 'Deposite' },
    { key: 'package', label: 'Package' },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        <UserMetaCard
          imageSrc={singleUser?.profilePhoto || "/images/logo/user1.png"}
          name={singleUser.fullName}
          role={singleUser.email}
          location={
            singleUser?.homeAddress?.fullAddress ||
            singleUser?.workAddress?.fullAddress ||
            "No Address"
          }
          userId={singleUser._id}
          isCommissionDistribute={singleUser.isCommissionDistribute}
          isToggleButton={true}
          franchiseId={singleUser.userId}
        />


        {/* Tabs */}
        <div className="flex gap-2 pt-2">
          {tabButtons.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border ${activeTab === tab.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6 pt-4">
          {activeTab === 'info' && (
            <UserInfoCard
              fullName={singleUser.fullName}
              email={singleUser.email}
              phone={singleUser.mobileNumber}
              referralCode={singleUser.referralCode || ' '}
              address={
                singleUser?.homeAddress?.fullAddress ||
                singleUser?.workAddress?.fullAddress ||
                'No Address'
              }
            />
          )}

          
          {activeTab === 'selfLead' && (
            <SelfLeadTable userId={userId || ' '} isAction={true} />
          )}

          {activeTab === 'teamLead' && (
            <TeamLeadTable userId={userId || ' '} isAction={true} />
          )}

          {activeTab === 'wallet' && <UserWallet userId={userId || ' '} />}

          {activeTab === 'guarantee' && <FiveXGuarantee />}
          {activeTab === 'deposite' && <UserDeposite />}
          {activeTab === 'support' && <HelpSupport />}
          {activeTab === 'package' && <PackageTransaction />}

        </div>

      </div>
    </div>
  );
};

export default UserDetails;
