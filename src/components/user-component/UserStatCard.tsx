import React from 'react'
import StatCard from '../common/StatCard'
import {
    BoxCubeIcon,
    ArrowUpIcon,
    UserIcon,
    CalenderIcon,
    DollarLineIcon,
} from "../../icons/index";
import { useUserContext } from '@/context/UserContext';

const UserStatCard = () => {
    const { users } = useUserContext();

    console.log("users data : ", users)


    if (!users) {
        return <div>Loading...</div>;
    }

    const gpCount = users.filter(user => user.packageActive === true).length;
    const nonGpCount = users.filter(user => user.packageActive === false).length;
    return (
        <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6 my-5">
                <StatCard
                    title="Total Users"
                    value={users.length}
                    icon={UserIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="GP"
                    value={gpCount}
                    icon={CalenderIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />
                <StatCard
                    title="Non GP"
                    value={nonGpCount}
                    icon={DollarLineIcon}
                    badgeColor="success"
                    badgeValue="6.88%"
                    badgeIcon={ArrowUpIcon}
                />

            </div>
        </div>
    )
}

export default UserStatCard