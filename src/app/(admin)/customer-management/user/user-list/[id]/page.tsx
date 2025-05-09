
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import UserStatCard from '@/components/user-profile/UserAddressCard'
import UserInfoCard from '@/components/user-profile/UserInfoCard'
import UserMetaCard from '@/components/user-profile/UserMetaCard'
import React from 'react'

const UserDetails = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="User Details" />
            <div className="space-y-6">
                <div className="space-y-6">
                    <UserMetaCard
                        imageSrc="/images/logo/user1.webp"
                        name="BizBooster Admin"
                        role="Admin"
                        location="Amanora Chember, Hadapsar, Pune"
                    />
                    <UserInfoCard
                        fullName="John Doe"
                        email="johndoe@example.com"
                        phone="+123456789"
                        referralCode="ABC123"
                        address="Amanora Chember, Hadapsar, Pune"
                    />
                    <UserStatCard />
                </div>
            </div>
        </div>
    )
}

export default UserDetails