'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useParams } from 'next/navigation';
import SelfLeadTable from '@/components/user-profile/SelfLeadTable';
import TeamLeadTable from '@/components/user-profile/TeamLeadTable';

const UserDetails = () => {
  const {
    fetchSingleUser,
    singleUser,
    singleUserLoading,
    singleUserError,
  } = useUserContext();

  const params = useParams();
  const userId = params?.id as string;
    const leadUserId = params?.leadId as string;

  console.log("leadUserId Id : ", leadUserId)
  const [activeTab, setActiveTab] = useState('selfLead');

  useEffect(() => {
    if (leadUserId) {
      fetchSingleUser(leadUserId);
    }
  }, [leadUserId]);

  if (singleUserLoading)
    return <div className="text-center text-gray-500">Loading user...</div>;
  if (singleUserError)
    return <div className="text-center text-red-500">Error: {singleUserError}</div>;
  if (!singleUser)
    return <div className="text-center text-gray-500">No user found.</div>;

  const tabButtons = [
    { key: 'selfLead', label: 'Self Lead' },
    { key: 'teamLead', label: 'Team Lead' },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" />
      <div className="space-y-6">
        <UserMetaCard
        userId={singleUser._id}
          imageSrc="/images/logo/user1.webp"
          name={singleUser.fullName}
          role={singleUser.email}
          location="Amanora Chember, Hadapsar, Pune"
          isCommissionDistribute={singleUser.isCommissionDistribute}
        />

        {/* Tabs */}
        <div className="grid grid-cols-7 gap-2 pt-2">
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
          {activeTab === 'selfLead' && <SelfLeadTable  userId={leadUserId || ' '} isAction={false} />}

          {activeTab === 'teamLead' && <TeamLeadTable
            userId={leadUserId || ' '} isAction={false}
          />}

          
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
