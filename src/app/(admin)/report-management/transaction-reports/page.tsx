import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'
import StatCard from '@/components/common/StatCard'
import { ArrowUpIcon, CalenderIcon, DollarLineIcon, UserIcon } from '@/icons'

const page = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Transaction Reports" />
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 my-5">
                    <StatCard
                        title="Total Revenue"
                        value="150"
                        icon={UserIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                    <StatCard
                        title="Admin Commission"
                        value="150"
                        icon={CalenderIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                    <StatCard
                        title="Extra Fee"
                        value="150"
                        icon={DollarLineIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 my-5">
                    <StatCard
                        title="Payable to Vendor"
                        value="150"
                        icon={UserIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                    <StatCard
                        title="Payable to Franchise"
                        value="150"
                        icon={CalenderIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                    <StatCard
                        title="Pending Balance"
                        value="150"
                        icon={DollarLineIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                </div>
            </div>
        </div>
    )
}

export default page