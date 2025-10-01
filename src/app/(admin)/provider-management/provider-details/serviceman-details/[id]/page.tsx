"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useServiceMan, ServiceMan } from "@/context/ServiceManContext";

const ServiceManDetailsPage = () => {
  const { id } = useParams();
  const { fetchServiceManById, loading, error } = useServiceMan();

  const [serviceMan, setServiceMan] = useState<ServiceMan | null>(null);

  useEffect(() => {
    if (id) {
      fetchServiceManById(id as string).then((data) => {
        if (data) setServiceMan(data);
      });
    }
  }, [id]);

  if (loading) return <div className="p-4">Loading serviceman details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!serviceMan) return <div className="p-4">No serviceman found</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="ServiceMan Details" />

      {/* Card 1: Image + Name */}
      <div className="my-5">
        <ComponentCard title="ServiceMan Overview">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {serviceMan.generalImage ? (
              <Image
                src={serviceMan.generalImage}
                alt="Serviceman"
                width={150}
                height={150}
                className="object-cover rounded border"
              />
            ) : (
              <div className="w-[150px] h-[150px] flex items-center justify-center border rounded text-gray-500 text-sm">
                No image
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">Name:</h2>
              <p className="text-gray-700 mt-1">
                {serviceMan.name} {serviceMan.lastName}
              </p>

              <h2 className="text-lg font-semibold mt-4">Email:</h2>
              <p className="text-gray-700 mt-1">{serviceMan.email}</p>

              <h2 className="text-lg font-semibold mt-4">Phone:</h2>
              <p className="text-gray-700 mt-1">{serviceMan.phoneNo}</p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 2: Business Information */}
      <div className="my-5">
        <ComponentCard title="Business Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Identity Type:</h2>
              <p className="text-gray-700">{serviceMan.businessInformation?.identityType || "N/A"}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Identity Number:</h2>
              <p className="text-gray-700">{serviceMan.businessInformation?.identityNumber || "N/A"}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Identity Image:</h2>
              {serviceMan.businessInformation?.identityImage ? (
                <Image
                  src={serviceMan.businessInformation.identityImage}
                  alt="Identity"
                  width={200}
                  height={200}
                  className="object-cover rounded border mt-2"
                />
              ) : (
                <p className="text-gray-700 mt-2">No Identity Image</p>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 3: System Info */}
      <div className="my-5">
        <ComponentCard title="System Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">ServiceMan ID:</h2>
              <p className="text-gray-700">{serviceMan.serviceManId}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Provider ID:</h2>
              <p className="text-gray-700">{serviceMan.provider}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Created At:</h2>
              <p className="text-gray-700">
                {new Date(serviceMan.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Updated At:</h2>
              <p className="text-gray-700">
                {new Date(serviceMan.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default ServiceManDetailsPage;
