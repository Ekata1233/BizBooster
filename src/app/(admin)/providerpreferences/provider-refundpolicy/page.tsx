'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon, } from 'lucide-react';
import { TrashBinIcon } from '@/icons';

const RefundPolicyPage = dynamic(
    () => import('@/components/providerpreferences-components/ProvideRefundPolicyPage'),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-700">Loading editor...</p>
            </div>
        ),
    }
);

type Module = {
    _id: string;
    name: string;
    image?: string;
};

type PrivacyEntry = {
    _id: string;
    content: string;
    module: Module | string;
    createdAt?: string;
    updatedAt?: string;
};

const BLANK_ENTRY: PrivacyEntry = { _id: '', content: '', module: '' };

const AdminProviderRefundPolicyPage: React.FC = () => {
    const [entries, setEntries] = useState<PrivacyEntry[]>([]);
    const [editingEntry, setEditingEntry] = useState<PrivacyEntry | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchModules = async () => {
        const res = await axios.get('/api/modules'); // Adjust this to your actual module fetch API
        if (res.data.success) setModules(res.data.data);
    };

    const fetchPolicies = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/providerrefundpolicy');
            setEntries(res.data.data);
        } catch {
            setError('Failed to load policies.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
        fetchModules();
    }, []);

    const handleSave = async (data: { _id?: string; content: string; module: string }) => {
        if (!selectedModule) {
            alert('Please select a module.');
            return;
        }

        try {
            setIsSaving(true);
            const payload = { content: data.content, module: selectedModule };

            const res = data._id
                ? await axios.put(`/api/providerrefundpolicy/${data._id}`, payload)
                : await axios.post(`/api/providerrefundpolicy`, payload);

            if (res.data.success) {
                setSaveSuccess(true);
                setEditingEntry(null);
                fetchPolicies();
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch {
            setError('Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await axios.delete(`/api/providerrefundpolicy/${id}`);
            fetchPolicies();
        } catch {
            setError('Failed to delete.');
        }
    };

    const currentFormEntry = editingEntry ?? BLANK_ENTRY;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6 text-center">Manage Provider Refund Policy</h1>

            {saveSuccess && <p className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">Content saved!</p>}
            {isSaving && <p className="bg-blue-100 text-blue-700 px-4 py-2 mb-4 rounded">Processing...</p>}
            {error && <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>}

        

           
                <div className="bg-white p-6 rounded shadow mb-10">
                    <h2 className="text-2xl font-semibold mb-4">
                        {currentFormEntry._id ? 'Edit Refund Entry' : 'Add New Refund Entry'}
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Select Module</label>
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-full border px-4 py-2 rounded"
                        >
                            <option value="">-- Choose Module --</option>
                            {modules.map((mod) => (
                                <option key={mod._id} value={mod._id}>{mod.name}</option>
                            ))}
                        </select>
                    </div>

                    <RefundPolicyPage
                        initialData={{ ...currentFormEntry, module: selectedModule }}
                        onSave={handleSave}
                        onCancel={() => setEditingEntry(null)}
                    />
                </div>
        



            <h2 className="text-2xl font-bold mb-4">Existing Entries</h2>
            <div className="overflow-x-auto">
         

                <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3 font-semibold text-gray-700">Module Name</th>
                            <th className="p-3 font-semibold text-gray-700">Module Image</th>
                            <th className="p-3 font-semibold text-gray-700">Content</th>
                            <th className="p-3 font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {entries.map((entry) => {
                            const moduleData =
                                typeof entry.module === "object" && entry.module !== null
                                    ? entry.module
                                    : null;
                            return (
                                <tr key={entry._id} className="hover:bg-gray-50 transition">
                                    {/* Name */}
                                    <td className="p-3 font-medium text-gray-800">
                                        {moduleData && "name" in moduleData ? moduleData.name : "N/A"}
                                    </td>

                                    {/* Image */}
                                    <td className="p-3">
                                        {moduleData?.image ? (
                                            <img
                                                src={moduleData.image}
                                                alt="Module"
                                                className="w-12 h-12 object-cover rounded-full"
                                            />
                                        ) : (
                                            <span className="text-gray-500 italic">No Image</span>
                                        )}
                                    </td>

                                    {/* Content */}
                                    <td className="p-3 max-w-xs">
                                        <div
                                            className="prose text-gray-700 max-h-48 overflow-y-auto"
                                            dangerouslySetInnerHTML={{ __html: entry.content }}
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingEntry(entry);
                                                    setSelectedModule(moduleData?._id || "");
                                                }}
                                                className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white transition"
                                                aria-label="Edit"
                                            >
                                                <PencilIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry._id)}
                                                className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white transition"
                                                aria-label="Delete"
                                            >
                                                <TrashBinIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default AdminProviderRefundPolicyPage;
