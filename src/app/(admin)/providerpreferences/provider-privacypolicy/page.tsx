'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { PencilIcon, UploadIcon, XIcon } from 'lucide-react';
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

type DocumentFile = {
  file: File;
  id: string;
  previewUrl?: string;
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
  
  // Document upload state
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Initialize document files when editing an entry
  useEffect(() => {
    if (editingEntry && editingEntry.documentUrls) {
      // Clear existing files when editing
      setDocumentFiles([]);
    } else {
      setDocumentFiles([]);
    }
  }, [editingEntry]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: DocumentFile[] = Array.from(files).map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setDocumentFiles(prev => [...prev, ...newFiles]);
    
    // Clear the input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = documentFiles.find(f => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setDocumentFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async (data: {
    _id?: string;
    content: string;
    module: string;
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

      // Add document files if any
      documentFiles.forEach((docFile) => {
        formData.append('documentFiles', docFile.file);
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
        setDocumentFiles([]); // Clear files after successful save
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

  const handleEditClick = (row: PrivacyEntry) => {
    const moduleData = typeof row.module === 'object' ? row.module : null;
    setEditingEntry(row);
    setSelectedModule(moduleData?._id || '');
    setDocumentFiles([]); // Clear existing files when editing
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
          <div className="space-y-2">
            {row.documentUrls.map((url, index) => {
              const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const fileName = url.split('/').pop() || `Document ${index + 1}`;
              
              return (
                <div key={index} className="flex items-center gap-2">
                  {isImage ? (
                    <div className="w-10 h-10 border rounded overflow-hidden">
                      <Image
                        src={url}
                        alt={fileName}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 border rounded flex items-center justify-center">
                      <span className="text-xs font-medium">DOC</span>
                    </div>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-[150px]"
                    title={fileName}
                  >
                    {fileName}
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-500 italic">No Documents</span>
        ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: PrivacyEntry) => {
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEditClick(row)}
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
        <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
          Content saved successfully!
        </div>
      )}
      {isSaving && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 mb-4 rounded">
          Processing...
        </div>
      )}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>}

      {/* Form Section */}
      <div className="mb-10">
        <ComponentCard
          title={
            currentFormEntry._id ? 'Edit Privacy Policy Section' : 'Add New Privacy Policy Section'
          }
        >
          {/* 1. Module Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">Select Module</label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                // Clear files when module changes
                setDocumentFiles([]);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!editingEntry} // Disable when editing
            >
              <option value="">-- Choose Module --</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod._id}>
                  {mod.name}
                </option>
              ))}
            </select>
            {editingEntry && (
              <p className="text-sm text-gray-500 mt-1">
                Module cannot be changed when editing. Create a new entry for a different module.
              </p>
            )}
          </div>

          {/* 2. Document Upload Section (Only shown when module is selected) */}
          {selectedModule && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium text-gray-700">
                  Upload Documents (PDF, Images, Word, Excel, etc.)
                </label>
                <span className="text-sm text-gray-500">
                  {documentFiles.length} file{documentFiles.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="space-y-4">
                {/* File Upload Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                    id="document-upload"
                    disabled={!selectedModule}
                  />
                  <label 
                    htmlFor="document-upload" 
                    className={`cursor-pointer ${!selectedModule ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">
                        {!selectedModule ? 'Select a module first' : 'Click to upload files'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        PDF, DOC, XLS, JPG, PNG, GIF, WEBP
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Max file size: 10MB each
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selected Files Preview */}
                {documentFiles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">Selected Files</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {documentFiles.map((docFile) => (
                        <div
                          key={docFile.id}
                          className="flex items-center justify-between bg-white border border-blue-100 rounded-lg p-3"
                        >
                          <div className="flex items-center space-x-3">
                            {docFile.previewUrl ? (
                              <div className="w-12 h-12 border rounded overflow-hidden">
                                <Image
                                  src={docFile.previewUrl}
                                  alt="Preview"
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {docFile.file.type.includes('pdf') ? 'PDF' : 
                                   docFile.file.type.includes('word') ? 'DOC' :
                                   docFile.file.type.includes('excel') ? 'XLS' : 
                                   docFile.file.type.includes('image') ? 'IMG' : 'FILE'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {docFile.file.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">
                                  {(docFile.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {docFile.file.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(docFile.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                          >
                            <XIcon size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentFiles([])}
                      className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear all files
                    </button>
                  </div>
                )}

                {/* Existing Documents (when editing) */}
                {editingEntry?.documentUrls && editingEntry.documentUrls.length > 0 && documentFiles.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Existing Documents</h4>
                    <div className="space-y-2 mb-3">
                      {editingEntry.documentUrls.map((url, index) => {
                        const fileName = url.split('/').pop() || `Document ${index + 1}`;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 border rounded flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {url.match(/\.pdf$/i) ? 'PDF' : 
                                 url.match(/\.(doc|docx)$/i) ? 'DOC' :
                                 url.match(/\.(xls|xlsx)$/i) ? 'XLS' :
                                 url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'IMG' : 'FILE'}
                              </span>
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1"
                              title={fileName}
                            >
                              {fileName}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-yellow-700">
                      Note: Uploading new files will replace all existing documents.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. CKEditor Section (Only shown when module is selected) */}
          {selectedModule ? (
            <div className="mt-2">
              <PrivacyPolicyPage
                initialData={{ ...currentFormEntry, module: selectedModule }}
                onSave={handleSave}
                onCancel={() => {
                  setEditingEntry(null);
                  setSelectedModule('');
                  setDocumentFiles([]);
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-medium">Please select a module to continue</p>
              <p className="text-gray-500 text-sm mt-1">
                First choose a module, then upload documents (optional), then edit the content
              </p>
            </div>
          )}
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