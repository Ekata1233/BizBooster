'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';

const PrivacyAboutUsPage = dynamic(
    () => import('@/components/providerpreferences-components/ProviderAboutUsPage'),
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

type AboutUsEntry = {
    _id: string;
    content: string;
    module: Module | string;
    createdAt?: string;
    updatedAt?: string;
};

const BLANK_ENTRY: AboutUsEntry = { _id: '', content: '', module: '' };

const AdminProviderAboutUsPage: React.FC = () => {
    const [entries, setEntries] = useState<AboutUsEntry[]>([]);
    const [editingEntry, setEditingEntry] = useState<AboutUsEntry | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    /* ------------------ Data Fetch ------------------ */
    const fetchModules = async () => {
        try {
            const res = await axios.get('/api/modules');
            if (res.data.success) setModules(res.data.data);
        } catch {
            /* ignore for now */
        }
    };

    const fetchPolicies = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/provideraboutus');
            setEntries(res.data.data || []);
        } catch {
            setError('Failed to load entries.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
        fetchModules();
    }, []);

    /* ------------------ Save ------------------ */
    const handleSave = async (data: { _id?: string; content: string; module: string }) => {
        if (!selectedModule) {
            alert('Please select a module.');
            return;
        }
        try {
            setIsSaving(true);
            const payload = { content: data.content, module: selectedModule };

            const res = data._id
                ? await axios.put(`/api/provideraboutus/${data._id}`, payload)
                : await axios.post(`/api/provideraboutus`, payload);

            if (res.data.success) {
                setSaveSuccess(true);
                setEditingEntry(null);        // hide form after save
                setSelectedModule('');
                setModules([]);    // reset select
                fetchPolicies();
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch {
            setError('Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    /* ------------------ Delete ------------------ */
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await axios.delete(`/api/provideraboutus/${id}`);
            // If we were editing this entry, close the editor
            setEditingEntry(prev => (prev && prev._id === id ? null : prev));
            fetchPolicies();
        } catch {
            setError('Failed to delete.');
        }
    };


    const startEditEntry = (entry: AboutUsEntry) => {
        setEditingEntry(entry);
        const mod = entry.module;
        setSelectedModule(
            typeof mod === 'object' && mod !== null ? (mod as Module)._id : (mod as string) || ''
        );
    };

    /* ------------------ Cancel ------------------ */
    const handleCancel = () => {
        setEditingEntry(null);
        setSelectedModule('');
    };

    const currentFormEntry = editingEntry ?? BLANK_ENTRY;
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6 text-center">Manage Provider About Us</h1>

            {saveSuccess && (
                <p className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">Content saved!</p>
            )}
            {isSaving && (
                <p className="bg-blue-100 text-blue-700 px-4 py-2 mb-4 rounded">Processing...</p>
            )}
            {error && (
                <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>
            )}

            {/* <div className="bg-white p-6 rounded shadow mb-10">
                <h2 className="text-2xl font-semibold mb-4">
             {currentFormEntry._id ? 'Edit About Us Section' : 'Add New About Us Section'}
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
                            <option key={mod._id} value={mod._id}>
                                {mod.name}
                            </option>
                        ))}
                    </select>
                </div>
                   
                <PrivacyAboutUsPage
                    initialData={{ ...currentFormEntry, module: selectedModule }}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
                
            </div>


 */}

            <div className="p-6 bg-white rounded-lg shadow-md w-full my-8">
                <h2 className="text-2xl font-semibold mb-4">
                    {currentFormEntry._id ? 'Edit About Us Section' : 'Add New About Us Section'}
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
                            <option key={mod._id} value={mod._id}>
                                {mod.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Align editor with select box */}
                <div className="w-full">
                    <PrivacyAboutUsPage
                        initialData={{ ...currentFormEntry, module: selectedModule }}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>


            <h2 className="text-2xl font-bold mb-4">Existing Entries</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Module Name</th>
                            <th className="p-3">Module Image</th>
                            <th className="p-3">Content</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => {
                            const moduleData =
                                typeof entry.module === 'object' && entry.module !== null
                                    ? (entry.module as Module)
                                    : null;
                            return (
                                <tr key={entry._id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">
                                        {moduleData?.name ?? 'N/A'}
                                    </td>
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
                                    <td className="p-3 max-w-xs">
                                        <div
                                            className="prose text-gray-700 max-h-48 overflow-y-auto"
                                            dangerouslySetInnerHTML={{ __html: entry.content }}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => startEditEntry(entry)}
                                                className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
                                                aria-label="Edit"
                                            >
                                                <PencilIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry._id)}
                                                className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
                                                aria-label="Delete"
                                            >
                                                <TrashBinIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProviderAboutUsPage;
