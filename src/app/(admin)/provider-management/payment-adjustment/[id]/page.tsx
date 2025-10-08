'use client';

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";


export default function PaymentAdjustmentDetails() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Payment Adjustment Details" />
            <div className="space-y-5 sm:space-y-6">


                <ComponentCard title="Payment Adjustment Details">
                    <div></div>
                </ComponentCard>

            </div>
        </div>
    );
}