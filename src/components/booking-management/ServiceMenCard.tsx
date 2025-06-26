'use client';
import React, { useEffect, useState } from 'react';
import { useServiceMan } from '@/context/ServiceManContext';
import { ServiceMan } from '@/context/ServiceManContext';

interface Props {
    serviceManId: string; // Optional callback on assign
}

const ServiceMenCard: React.FC<Props> = ({ serviceManId }) => {
    const { fetchServiceManById, loading, error } = useServiceMan();
    const [man, setMan] = useState<ServiceMan | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!serviceManId) return;

        const fetchMan = async () => {
            const data = await fetchServiceManById(serviceManId);
            setMan(data);
        };

        fetchMan();
    }, [serviceManId]);



    if (loading || !man) {
        return <div className="text-center py-4">Loading service man details...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="px-8 py-6 bg-gray-100 m-3 rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Service Man Information
            </h4>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
            <div className="flex items-center space-x-4">
                <img
                    src={man.generalImage || "/default-profile.png"}
                    alt={man.name}
                    className="w-14 h-12 rounded-full object-cover border border-gray-300"
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
    );
};

export default ServiceMenCard;
