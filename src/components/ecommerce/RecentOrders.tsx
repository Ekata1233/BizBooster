'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useProvider } from "@/context/ProviderContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define Provider Type
interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phoneNo?: string;
  storeInfo?: {
    storeName?: string;
    logo?: string;
  };
}

export default function RecentOrders() {
  const { providerDetails } = useProvider();
  const router = useRouter();

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (Array.isArray(providerDetails)) {
      setProviders(providerDetails as Provider[]);
    }
  }, [providerDetails]);

  const handleClick = () => {
    router.push('/provider-management/provider-list');
  };

  if (!providers.length) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading providers...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Providers
        </h3>
        <div className="flex items-center gap-3">
          {/* <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filter
          </button> */}
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Provider
              </TableCell>
              <TableCell isHeader className="py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Store Name
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {providers.slice(0, 4).map((provider) => (
              <TableRow key={provider._id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100">
                      <Image
                        width={50}
                        height={50}
                        src={provider.storeInfo?.logo || "/images/fallback.png"}
                        alt={provider.fullName}
                        className="h-[50px] w-[50px] object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {provider.fullName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {provider.storeInfo?.storeName || "N/A"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {provider.email}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {provider.storeInfo?.storeName || "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
