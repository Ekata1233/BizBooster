'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserStatCard from '@/components/user-profile/UserAddressCard';
import UserInfoCard from '@/components/user-profile/UserInfoCard';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import SelfLeadTable from '@/components/user-profile/SelfLeadTable';
import TeamLeadTable from '@/components/user-profile/TeamLeadTable';
import UserWallet from '@/components/user-profile/UserWallet';
import FiveXGuarantee from '@/components/user-profile/FiveXGuarantee';
import HelpSupport from '@/components/user-profile/HelpSupport';
import UserDeposite from '@/components/user-profile/UserDeposite';


const UserDetails = () => {
  const {
    fetchSingleUser,
    singleUser,
    singleUserLoading,
    singleUserError,
  } = useUserContext();

  const params = useParams();
  const userId = params?.id as string;

  console.log("user Id : ", userId)
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
    { key: 'stats', label: 'Stats' },
    { key: 'selfLead', label: 'Self Lead' },
    { key: 'teamLead', label: 'Team Lead' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'guarantee', label: '5x Guarantee' },
    { key: 'support', label: 'Support' },
    { key: 'deposite', label: 'Deposite' },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        <UserMetaCard
          imageSrc="/images/logo/user1.webp"
          name={singleUser.fullName}
          role={singleUser.email}
          location="Amanora Chember, Hadapsar, Pune"
        />

        {/* Tabs */}
        <div className="grid grid-cols-8 gap-2 pt-2">
          {tabButtons.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md border ${activeTab === tab.key
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
              address="Amanora Chember, Hadapsar, Pune"
            />
          )}

          {activeTab === 'stats' && (
            <UserStatCard
              stat1={{ title: 'Total Booking', value: '20' }}
              stat2={{ title: 'Total Revenue', value: '$8420' }}
              stat3={{ title: 'Other', value: '420' }}
              stat4={{ title: 'Next Other', value: '320' }}
            />
          )}

          {activeTab === 'teamLead' && <TeamLeadTable
            userId={userId || ' '} isAction={true}
          />}


          {activeTab === 'selfLead' && <SelfLeadTable userId={userId || ' '} isAction={true} />}

          {activeTab === 'wallet' && <UserWallet />}

          {activeTab === 'guarantee' && <FiveXGuarantee/>}
 {activeTab === 'deposite' && <UserDeposite/>}
          {activeTab === 'support' && <HelpSupport/>}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
