'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { ClaimNow, useClaimNow } from "@/context/ClaimContext";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import TextArea from "@/components/form/input/TextArea";


const ClaimNowDetailsPage = () => {
    const { id } = useParams();
    const { getClaimById } = useClaimNow();
    const [claim, setClaim] = useState<ClaimNow | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [rewardTitle, setRewardTitle] = useState("");
    const [disclaimer, setDisclaimer] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchClaim = async () => {
            if (!id) return;
            setLoading(true);
            const data = await getClaimById(id as string);
            if (data) {
                setClaim(data);
                setRewardTitle(data.rewardTitle || "");
                setDisclaimer(data.disclaimer || "");
            }
            setLoading(false);
        };
        fetchClaim();
    }, [id]);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleApprove = async () => {
        if (!claim) return;
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch(
                `http://localhost:3000/api/reward-management/claim-now/admin-approve/${claim._id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isAdminApproved: true, rewardTitle, disclaimer }),
                }
            );

            const data = await res.json();

            if (data.success) {
                setClaim(data.data);
                setMessage("✅ Claim approved successfully!");
                setTimeout(() => closeModal(), 1000);
            } else {
                setMessage("❌ " + (data.message || "Something went wrong!"));
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Error approving claim");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!claim) return <div className="p-4 text-red-500">Claim not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <PageBreadcrumb pageTitle="Claim Details" />

            {/* Reward Info */}
            <ComponentCard title="Reward Overview">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {claim.reward?.photo ? (
                        <Image src={claim.reward.photo} alt="Reward" width={150} height={150} className="rounded border" />
                    ) : (
                        <div className="w-[150px] h-[150px] flex items-center justify-center border rounded text-gray-500 text-sm">
                            No image
                        </div>
                    )}
                    <div>
                        <h1 className="text-lg font-semibold">{claim.reward?.name || "N/A"}</h1>
                        <p className="text-gray-700 mt-1">{claim.reward?.description || "N/A"}</p>
                    </div>
                </div>
            </ComponentCard>

            {/* User Info */}
            <ComponentCard title="User Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h2 className="font-semibold">Full Name:</h2>
                        <p>{claim.user?.fullName || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Email:</h2>
                        <p>{claim.user?.email || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">User ID:</h2>
                        <p>{claim.user?.userId || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Package Type:</h2>
                        <p>{claim.user?.packageType || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Package Active:</h2>
                        <p>{claim.user?.packageActive ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Package Status:</h2>
                        <p>{claim.user?.packageStatus || "N/A"}</p>
                    </div>
                </div>
            </ComponentCard>

            {/* Claim Details */}
            <ComponentCard title="Claim Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h2 className="font-semibold">Reward Title:</h2>
                        <p>{claim.rewardTitle || claim.reward?.name || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Reward Photo:</h2>
                        {claim.rewardPhoto ? (
                            <Image src={claim.rewardPhoto} alt="Reward Photo" width={100} height={100} className="rounded border" />
                        ) : (
                            <span className="text-gray-500">No photo</span>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="font-semibold">Reward Description:</h2>
                        <p>{claim.rewardDescription || claim.reward?.description || "N/A"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Admin Approved:</h2>
                        <p>{claim.isAdminApproved ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Claim Request:</h2>
                        <p>{claim.isClaimRequest ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Claim Accepted:</h2>
                        <p>
                            {claim.isClaimAccepted === null
                                ? "Pending"
                                : claim.isClaimAccepted
                                    ? "Accepted"
                                    : "Rejected"}
                        </p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Claim Settled:</h2>
                        <p>{claim.isClaimSettled ? "Yes" : "No"}</p>
                    </div>
                    {claim.disclaimer && (
                        <div className="md:col-span-2">
                            <h2 className="font-semibold">Disclaimer:</h2>
                            <p className="whitespace-pre-wrap">{claim.disclaimer}</p>
                        </div>
                    )}
                    <div>
                        <h2 className="font-semibold">Created At:</h2>
                        <p>{new Date(claim.createdAt || "").toLocaleString()}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold">Updated At:</h2>
                        <p>{new Date(claim.updatedAt || "").toLocaleString()}</p>
                    </div>
                </div>
            </ComponentCard>

            {/* Approve Button */}
            {!claim.isAdminApproved && (
                <div className="flex justify-end">
                    <Button onClick={openModal} variant="primary">
                        Approve
                    </Button>
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
                <div className="flex flex-col  w-full max-w-[600px] gap-6 p-6 ">
                    <h4 className="font-semibold text-gray-800 text-lg">Admin Approval</h4>

                    <input
                        type="text"
                        value={rewardTitle}
                        onChange={(e) => setRewardTitle(e.target.value)}
                        placeholder="Reward Title"
                        className="w-full border rounded px-3 py-2"
                    />

                    <TextArea
                        value={disclaimer}
                        onChange={(value: string) => setDisclaimer(value)}
                        rows={3}
                        placeholder="Disclaimer"
                    />

                    {message && (
                        <p className={`text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={closeModal}>
                            Close
                        </Button>
                        <Button onClick={handleApprove} disabled={saving}>
                            {saving ? "Saving..." : "Confirm Approve"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClaimNowDetailsPage;
