"use client"
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { useLead } from '@/context/LeadContext';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

const page = () => {
    const params = useParams();
    const leadId = params?.id;
    const { getLeadById } = useLead();
    console.log("lead ID : ", leadId)

    useEffect(() => {
        const fetchLead = async () => {
            const lead = await getLeadById(leadId);
            console.log("Fetched lead:", lead);
        };

        fetchLead();
    }, []);
    return (
        <div>
            <PageBreadcrumb pageTitle="Lead Request Details" />

            <div className="space-y-6">
                <ComponentCard title="Lead Details"><div></div></ComponentCard>
            </div>
        </div>
    )
}

export default page