'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { TrashBinIcon } from '@/icons';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import Pagination from '@/components/tables/Pagination';
import Image from 'next/image';

const PrivacyPolicyPage = dynamic(
  () => import('@/components/providerpreferences-components/ProviderPrivacyPolicyPage'),
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
  documentUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const BLANK_ENTRY: PrivacyEntry = { _id: '', content: '', module: '' };

const AdminProviderPrivacyPolicyPage: React.FC = () => {
  const [entries, setEntries] = useState<PrivacyEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PrivacyEntry | null>(null);
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
      const res = await axios.get('/api/providerprivacypolicy');
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

  const handleSave = async (data: {
    _id?: string;
    content: string;
    module: string;
    documentFiles?: File[];
  }) => {
    if (!selectedModule) {
      alert('Please select a module.');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('module', selectedModule);

      data.documentFiles?.forEach((file) => {
        formData.append('documentFiles', file);
      });

      let res;
      if (data._id) {
        res = await axios.put(`/api/providerprivacypolicy/${data._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axios.post('/api/providerprivacypolicy', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setSaveSuccess(true);
        setEditingEntry(null);
        fetchPolicies();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.log('Error message:', err);
      setError('Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`/api/providerprivacypolicy/${id}`);
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
      render: (row: PrivacyEntry) => {
        const idx = currentRows.findIndex((r) => r._id === row._id);
        return <span>{(currentPage - 1) * rowsPerPage + idx + 1}</span>;
      },
    },
    {
      header: 'Module Name',
      accessor: 'moduleName',
      render: (row: PrivacyEntry) => {
        const moduleData = typeof row.module === 'object' ? row.module : null;
        return <span>{moduleData && 'name' in moduleData ? moduleData.name : 'N/A'}</span>;
      },
    },
    {
      header: 'Module Image',
      accessor: 'moduleImage',
      render: (row: PrivacyEntry) => {
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
      render: (row: PrivacyEntry) => (
        <div
          className="prose text-gray-700 max-h-48 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: row.content }}
        />
      ),
    },
    {
      header: 'Documents',
      accessor: 'documents',
      render: (row: PrivacyEntry) =>
        row.documentUrls && row.documentUrls.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            {row.documentUrls.map((url, index) => (
              <li key={index}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800"
                >
                  Document {index + 1}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 italic">No Documents</span>
        ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: PrivacyEntry) => {
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
      <PageBreadcrumb pageTitle="Manage Provider Privacy Policy" />

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
          title={
            currentFormEntry._id ? 'Edit Privacy Policy Section' : 'Add New Privacy Policy Section'
          }
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

          <PrivacyPolicyPage
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

export default AdminProviderPrivacyPolicyPage;
