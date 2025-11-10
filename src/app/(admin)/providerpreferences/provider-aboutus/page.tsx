'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import Image from 'next/image';

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* ------------------ Fetch Data ------------------ */
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
        setEditingEntry(null);
        setSelectedModule('');
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

  // Pagination logic
  const totalPages = Math.ceil(entries.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = entries.slice(indexOfFirstRow, indexOfLastRow);

  /* ------------------ Table Columns ------------------ */
  const columns = [
    {
      header: 'Sr. No',
      accessor: 'srNo',
      render: (row: AboutUsEntry) => {
        const idx = currentRows.findIndex((r) => r._id === row._id);
        return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
      },
    },
    {
      header: 'Module Name',
      accessor: 'moduleName',
      render: (row: AboutUsEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return <span>{moduleData && 'name' in moduleData ? moduleData.name : 'N/A'}</span>;
      },
    },
    {
      header: 'Module Image',
      accessor: 'moduleImage',
      render: (row: AboutUsEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return moduleData?.image ? (
          <Image
            src={moduleData.image}
            alt="Module"
            width={50}
            height={50}
            className="rounded-full object-cover border"
          />
        ) : (
          <span className="text-gray-500 italic">No Image</span>
        );
      },
    },
    {
      header: 'Content',
      accessor: 'content',
      render: (row: AboutUsEntry) => (
        <div
          className="prose text-gray-700 max-h-48 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: row.content }}
        />
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: AboutUsEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                startEditEntry(row);
              }}
              className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white transition"
            >
              <PencilIcon size={16} />
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white transition"
            >
              <TrashBinIcon />
            </button>
          </div>
        );
      },
    },
  ];

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
      {error && <p className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</p>}

      {/* Form Section */}
      <div className="mb-10">
        <ComponentCard
          title={currentFormEntry._id ? 'Edit About Us Section' : 'Add New About Us Section'}
        >
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
        </ComponentCard>
      </div>

      {/* Table Section */}
      <ComponentCard title="Existing Entries">
        <BasicTableOne columns={columns} data={currentRows} />

        {entries.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={entries.length}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default AdminProviderAboutUsPage;
