'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import UserStatCard from '@/components/user-profile/UserAddressCard'
import UserInfoCard from '@/components/user-profile/UserInfoCard'
import UserMetaCard from '@/components/user-profile/UserMetaCard'
import React, { useEffect } from 'react'
import { useUserContext } from '@/context/UserContext';
import { useParams } from 'next/navigation';

const UserDetails = () => {
    const {
        fetchSingleUser,
        singleUser,
        singleUserLoading,
        singleUserError,
      } = useUserContext();

      const params = useParams();
      const userId = params?.id as string;

      console.log("user ID ",userId)

      useEffect(() => {
        if (userId) {
          fetchSingleUser(userId);
        }
      }, [userId]);
    
      if (singleUserLoading) return <p>Loading user...</p>;
      if (singleUserError) return <p>Error: {singleUserError}</p>;
      if (!singleUser) return <p>No user found.</p>;

      console.log("user singleUser ",singleUser)
    return (
        <div>
            <PageBreadcrumb pageTitle="User Details" />
            <div className="space-y-6">
                <div className="space-y-6">
                    <UserMetaCard
                        imageSrc="/images/logo/user1.webp"
                        name={singleUser.fullName}
                        role={singleUser.email}
                        location="Amanora Chember, Hadapsar, Pune"
                    />
                    <UserInfoCard
                        fullName={singleUser.fullName}
                        email={singleUser.email}
                        phone={singleUser.mobileNumber}
                        referralCode={singleUser.referralCode || " "}
                        address="Amanora Chember, Hadapsar, Pune"
                    />
                    <UserStatCard
                        stat1={{
                            title: "Total Booking",
                            value: "20",
                        }}
                        stat2={{
                            title: "Total Revenue",
                            value: "$8420",
                        }}
                        stat3={{
                            title: "Other",
                            value: "420",
                        }}
                        stat4={{
                            title: "Next Other",
                            value: "320",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default UserDetails