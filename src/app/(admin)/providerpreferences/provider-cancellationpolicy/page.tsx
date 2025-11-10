'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import Image from 'next/image';

const CancellationPolicyPage = dynamic(
  () => import('@/components/providerpreferences-components/ProviderCancellationPolicyPage'),
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

type CancellationEntry = {
  _id: string;
  content: string;
  module: Module | string;
  createdAt?: string;
  updatedAt?: string;
};

const BLANK_ENTRY: CancellationEntry = { _id: '', content: '', module: '' };

const AdminProviderCancellationPolicyPage: React.FC = () => {
  const [entries, setEntries] = useState<CancellationEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<CancellationEntry | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchModules = async () => {
    const res = await axios.get('/api/modules');
    if (res.data.success) setModules(res.data.data);
  };

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/providercancellationpolicy');
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
        ? await axios.put(`/api/providercancellationpolicy/${data._id}`, payload)
        : await axios.post(`/api/providercancellationpolicy`, payload);

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
      await axios.delete(`/api/providercancellationpolicy/${id}`);
      fetchPolicies();
    } catch {
      setError('Failed to delete.');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(entries.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = entries.slice(indexOfFirstRow, indexOfLastRow);

  const columns = [
    {
      header: 'Sr. No',
      accessor: 'srNo',
      render: (row: CancellationEntry) => {
        const idx = currentRows.findIndex((r) => r._id === row._id);
        return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
      },
    },
    {
      header: 'Module Name',
      accessor: 'moduleName',
      render: (row: CancellationEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return <span>{moduleData && 'name' in moduleData ? moduleData.name : 'N/A'}</span>;
      },
    },
    {
      header: 'Module Image',
      accessor: 'moduleImage',
      render: (row: CancellationEntry) => {
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
      render: (row: CancellationEntry) => (
        <div
          className="prose text-gray-700 max-h-48 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: row.content }}
        />
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: CancellationEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setEditingEntry(row);
                setSelectedModule(moduleData?._id || '');
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
      <PageBreadcrumb pageTitle="Manage Provider Cancellation Policy" />

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
          title={currentFormEntry._id ? 'Edit Cancellation Entry' : 'Add New Cancellation Entry'}
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

          <CancellationPolicyPage
            initialData={{ ...currentFormEntry, module: selectedModule }}
            onSave={handleSave}
            onCancel={() => setEditingEntry(null)}
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

export default AdminProviderCancellationPolicyPage;
