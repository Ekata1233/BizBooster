"use client";
import React, { useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import { useProviderBankDetails } from "@/context/ProviderBankDetailsContext";
import { useParams } from "next/navigation";

const ProviderBankInfo = () => {
  const {
    singleBankDetails,
    loadingBankDetails,
    errorBankDetails,
    fetchBankDetailsById,
  } = useProviderBankDetails();

  const params = useParams();
  const providerId = params?.id as string;

  console.log('provider id : ', providerId)

  useEffect(() => {
    fetchBankDetailsById(providerId);
  }, [providerId]);

  return (
    <div>
      <ComponentCard title="Bank Information">
        {loadingBankDetails ? (
          <p className="text-gray-500">Loading bank details...</p>
        ) : errorBankDetails ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-base font-medium text-gray-700">
              No bank details available
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We couldn’t find any bank information for this provider.
            </p>
          </div>

        ) : singleBankDetails ? (
          <div className="space-y-6">
            {/* Row 1: Bank Name + Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Bank Name</p>
                <p className="text-base text-gray-600">
                  {singleBankDetails.bankName}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Branch Name
                </p>
                <p className="text-base text-gray-600">
                  {singleBankDetails.branchName}
                </p>
              </div>
            </div>

            {/* Row 2: Account Number + IFSC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Account Number
                </p>
                <p className="text-base text-gray-600">
                  {singleBankDetails.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  IFSC Number
                </p>
                <p className="text-base text-gray-600">
                  {singleBankDetails.ifsc}
                </p>
              </div>
            </div>

            {/* Row 3: Status + Created Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Status</p>
                <p
                  className={`text-base ${singleBankDetails.isActive
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {singleBankDetails.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Added On
                </p>
                <p className="text-base text-gray-600">
                  {new Date(singleBankDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No bank details found.</p>
        )}
      </ComponentCard>
    </div>
  );
};

export default ProviderBankInfo;
