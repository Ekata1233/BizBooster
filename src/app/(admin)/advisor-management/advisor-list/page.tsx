"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon } from "lucide-react";
import { TrashBinIcon, UserIcon, ArrowUpIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import StatCard from "@/components/common/StatCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useAdvisor } from "@/context/Advisor";
import Image from "next/image";

const AdvisorListPage: React.FC = () => {
    const { advisors, deleteAdvisor } = useAdvisor();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAdvisors = useMemo(() => {
        return advisors.filter((advisor) => {
            const nameMatch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase());
            const tagsMatch = advisor.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || tagsMatch;
        });
    }, [advisors, searchTerm]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Advisors List</h1>

            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="w-full lg:w-3/4">
                    <ComponentCard title="Search Filter">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 py-3">
                            <div>
                                <Label>Search by Name or Tags</Label>
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </ComponentCard>
                </div>

                <div className="w-full lg:w-1/4">
                    <StatCard
                        title="Total Advisors"
                        value={advisors.length}
                        icon={UserIcon}
                        badgeColor="success"
                        badgeValue="0.00%"
                        badgeIcon={ArrowUpIcon}
                    />
                </div>
            </div>

            <ComponentCard title="All Advisors">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-600">
                                <th className="px-5 py-3 text-left">Sr No</th>
                                <th className="px-5 py-3 text-left">Image</th>
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3 text-left">Phone</th>
                                <th className="px-5 py-3 text-left">Language</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdvisors.map((advisor ,index) => (
                                <tr
                                    key={advisor._id}
                                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                                >
                                     <td className="px-5 py-3">{index + 1}</td>
                                    <td className="px-5 py-3">
                                        <div className="relative w-20 h-20">
                                            {advisor.imageUrl ? (
                                                <Image
                                                    src={advisor.imageUrl}
                                                    alt={advisor.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover rounded-md ring-1 ring-gray-200"
                                                />
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">No Image</span>
                                            )}
                                        </div>

                                    </td>
                                    <td className="px-5 py-3">{advisor.name}</td>
                                    <td className="px-5 py-3">{advisor.phoneNumber}</td>
                                    <td className="px-5 py-3">{advisor.language}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/advisor-management/advisor-list/${advisor._id}`}
                                                className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
                                            >
                                                <EyeIcon size={16} />
                                            </Link>
                                            <Link
                                                href={`/advisor-management/modals/${advisor._id}`}
                                                className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                                            >
                                                <PencilIcon size={16} />
                                            </Link>
                                            <button
                                                onClick={() => deleteAdvisor(advisor._id)}
                                                className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                                            >
                                                <TrashBinIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAdvisors.length === 0 && (
                                <tr>
                                    <td className="px-5 py-10 text-center text-gray-500 text-sm" colSpan={7}>
                                        No advisors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ComponentCard>
        </div>
    );
};

export default AdvisorListPage;
