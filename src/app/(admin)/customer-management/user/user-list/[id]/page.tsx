
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import UserAddressCard from '@/components/user-profile/UserAddressCard'
import UserInfoCard from '@/components/user-profile/UserInfoCard'
import UserMetaCard from '@/components/user-profile/UserMetaCard'
import React from 'react'

const UserDetails = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="User Details" />
            <div className="space-y-6">
                <div className="space-y-6">
                    <UserMetaCard />
                    <UserInfoCard
                        fullName="John Doe"
                        email="johndoe@example.com"
                        phone="+123456789"
                        referralCode="ABC123"
                    />
                    <UserAddressCard />
                </div>
            </div>
        </div>
    )
}

export default UserDetails