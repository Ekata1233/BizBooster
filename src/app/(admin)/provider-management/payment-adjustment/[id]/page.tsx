'use client';

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";

export default function PaymentAdjustmentDetails() {
    // ✅ get providerId from the dynamic route
    const params = useParams();
    const router = useRouter();
    const providerId = params?.id as string;

    // ✅ state for inputs
    const [formData, setFormData] = useState({
        amount: "",
        transactionId: "",
        description: "",
        updaterName: "",
    });

    const [loading, setLoading] = useState(false);

    // ✅ handle input change
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ✅ handle submit (API call)
    const handleConfirm = async () => {
        if (!formData.amount) {
            alert("Please enter adjustment amount");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/provider/wallet/${providerId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(formData.amount),
                    transactionId: formData.transactionId,
                    description: formData.description,
                    updaterName: formData.updaterName,
                }),
            });

            const result = await response.json();

            const userId = "444c44d4444be444d4444444";
            const response2 = await fetch(`/api/wallet/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(formData.amount),
                    transactionId: formData.transactionId,
                    description: formData.description,
                    updaterName: formData.updaterName,
                }),
            });

            const result2 = await response2.json();

            if (response.ok && result2) {
                alert("✅ Adjustment cash updated successfully");
                setFormData({ amount: "", transactionId: "", description: "", updaterName: "" });
                router.push("/provider-management/payment-adjustment");
            } else {
                if (!response.ok) {
                    alert(`❌ Provider Wallet Error: ${result.error}`);
                } else if (!response2.ok) {
                    alert(`❌ User Wallet Error: ${result2.error}`);
                } else {
                    alert("✅ Adjustment cash updated successfully");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Payment Adjustment Details" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Payment Adjustment Details">
                    <div>
                        <Input
                            placeholder="Adjustment Amount"
                            value={formData.amount}
                            onChange={(e) => handleChange("amount", e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Transaction ID"
                            value={formData.transactionId}
                            onChange={(e) => handleChange("transactionId", e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            placeholder="Name of Updater"
                            value={formData.updaterName}
                            onChange={(e) => handleChange("updaterName", e.target.value)}
                            className="mb-4"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setFormData({ amount: "", transactionId: "", description: "", updaterName: "" })}
                                className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
