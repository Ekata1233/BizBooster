
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
  title: "Next.js Profile | FetchTrue Dashboard",
  description:
    "This is Next.js Profile page for FetchTrue - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard
            userId={"123"}
            imageSrc="/images/logo/user1.png"
            name="Fetch True Admin"
            role="Admin"
            location="Amanora Chember, Hadapsar, Pune"
            isCommissionDistribute={false}
            isToggleButton={false}
            franchiseId={"Fetch_True_001"}

          />
          <UserInfoCard
            fullName="FetchTrue Admin"
            email="fetchtrue@admin.com"
            phone="+91 9988776655"
            referralCode={" "}
            address="Amanora Chember, Hadapsar, Pune"
          />
        </div>
      </div>
    </div>
  );
}
