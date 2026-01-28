'use client';
import React, { useEffect, useState } from 'react';
import { useServiceMan } from '@/context/ServiceManContext';
import { ServiceMan } from '@/context/ServiceManContext';
import Image from 'next/image';
import { UserX } from 'lucide-react';

interface Props {
    serviceManId: string; // Optional callback on assign
}

const ServiceMenCard: React.FC<Props> = ({ serviceManId }) => {
    const { fetchServiceManById, loading, error } = useServiceMan();
    const [man, setMan] = useState<ServiceMan | null>(null);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!serviceManId) return;

        const fetchMan = async () => {
            const data = await fetchServiceManById(serviceManId);
            setMan(data ?? null);
            setFetched(true);
        };

        fetchMan();
    }, [serviceManId]);



//    if (loading || !fetched) {
//         return (
//             <div className="text-center py-4 text-gray-500">
//                 Loading service man details...
//             </div>
//         );
//     }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
       <>
       {loading || !fetched && (
                <div className="my-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-8 py-10 text-center">
                    <div className="flex justify-center mb-4">
                        <UserX className="h-12 w-12 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700">
                        Service Man Not Found
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        The assigned service man does not exist or has been removed.
                    </p>
                </div>
            )}

       {man && (
        <div className="px-8 py-6 bg-gray-100 m-3 rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Service Man Information
            </h4>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
            <div className="flex items-center space-x-4">
                <Image
    src={man.generalImage || "/default-profile.png"}
    alt={man.name}
    width={56}
    height={48}
    className="rounded-full object-cover border border-gray-300"
/>

                <div className="space-y-1">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        <strong>Name:</strong> {man.name} {man.lastName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        <strong>Phone:</strong> {man.phoneNo}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        <strong>Identity:</strong> {man.businessInformation?.identityType || 'N/A'} - {man.businessInformation?.identityNumber || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
       )}
       </>
    );
};

export default ServiceMenCard;
