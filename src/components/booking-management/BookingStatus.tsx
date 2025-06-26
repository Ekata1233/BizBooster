
import { Lead, useLead } from "@/context/LeadContext";
import { CheckCircleIcon } from "@/icons";
import React, { useEffect, useState } from "react";
interface CheckoutType {
    _id: string;
}
const BookingStatus = ({ checkout }: { checkout: CheckoutType }) => {
    const { getLeadByCheckoutId } = useLead();
    const [lead, setLead] = useState<Lead | null>(null);

    console.log("lead : ", lead);


    useEffect(() => {
        const fetchLead = async () => {
            if (!checkout?._id) return;

            try {
                const fetchedLead = await getLeadByCheckoutId(checkout._id);

                if (!fetchedLead) {
                    console.warn("No lead found for ID:", checkout._id);
                    return;
                }

                setLead(fetchedLead);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("Lead not found (404) for ID:", checkout._id);
                } else {
                    console.error("Error fetching lead:", error.message || error);
                }
            }
        };

        fetchLead();
    }, [checkout]);


    const steps = lead?.leads?.map((entry) => ({
        title: entry.statusType,
        time: entry.createdAt
            ? new Date(entry.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
            })
            : "N/A", // fallback string if createdAt is undefined
        description: entry.description,
        zoomLink: entry.zoomLink,
        paymentLink: entry.paymentLink,
        paymentType: entry.paymentType,
        isAdminApproved: lead.isAdminApproved ?? false,
    })) ?? [];

    console.log("steps in status : ", steps)


    return (
        <div>
            <div className="relative ml-6 mt-6">
                {steps.map((step, index) => (
                    <div key={index} className="relative pl-10">
                        {/* Vertical line */}
                        {index !== steps.length - 1 && (
                            <span className="absolute left-4.5 top-8 w-px h-full bg-green-500"></span>
                        )}

                        {/* Step Icon */}
                        <span className="absolute left-0 top-0 bg-green-400 rounded-full p-2 z-10">
                            <CheckCircleIcon className="text-white text-lg" />
                        </span>

                        {/* Step Content */}
                        <div className="mb-8 ml-7">
                            <h6 className="text-md font-semibold text-gray-700 dark:text-white">
                                {step.title}
                            </h6>
                            <p className="text-sm text-gray-500">{step.time}</p>
                            {step.description && (
                                <p className="text-sm text-gray-400 italic">{step.description}</p>
                            )}
                            <div className="ml-5">
                                {step.zoomLink && (
                                    <a
                                        href={step.zoomLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-sm block"
                                    >
                                        Zoom Link
                                    </a>
                                )}
                                {step.paymentLink && (
                                    step.isAdminApproved ? (
                                        <a
                                            href={step.paymentLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 underline text-sm block"
                                        >
                                            Payment Link ({step.paymentType})
                                        </a>
                                    ) : (
                                        <span className="text-yellow-600 text-sm block italic">
                                            Payment link will be available once approved by the admin.
                                        </span>
                                    )
                                )}


                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingStatus;
