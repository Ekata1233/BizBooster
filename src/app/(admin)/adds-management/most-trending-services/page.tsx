'use client';

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import ComponentCard from '@/components/common/ComponentCard';
import Pagination from '@/components/tables/Pagination';
import Switch from '@/components/form/switch/Switch';
import Link from 'next/link';
import axios from 'axios';
import { EyeIcon } from '@/icons';

/* -------------------- Types -------------------- */
interface ServiceRow {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Inactive';
  mostlyTrending: boolean;
  mostlyRecommended: boolean;
  mostlyPopular: boolean;
}

/* -------------------- Component -------------------- */
const MostHomeServicesPage = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* -------------------- FETCH ALL SERVICES + FLAGS -------------------- */
  const fetchAllData = async () => {
    try {
      const [
        allServicesRes,
        trendingRes,
        recommendedRes,
        popularRes,
      ] = await Promise.all([
        axios.get('/api/service'),
        axios.get('/api/service/mostlytrending'),
        axios.get('/api/service/mostlyrecommended'),
        axios.get('/api/service/mostlypopular'),
      ]);

      const trendingSet = new Set(
        (trendingRes.data.data || []).map((i: any) => i.service?._id)
      );
      const recommendedSet = new Set(
        (recommendedRes.data.data || []).map((i: any) => i.service?._id)
      );
      const popularSet = new Set(
        (popularRes.data.data || []).map((i: any) => i.service?._id)
      );

      const mapped: ServiceRow[] = (allServicesRes.data.data || []).map(
        (service: any) => ({
          id: service._id,
          name: service.serviceName,
          category: service.category?.name || 'N/A',
          status: service.isDeleted ? 'Inactive' : 'Active',
          mostlyTrending: trendingSet.has(service._id),
          mostlyRecommended: recommendedSet.has(service._id),
          mostlyPopular: popularSet.has(service._id),
        })
      );

      setServices(mapped);
    } catch (error) {
      console.error('Failed to load services', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  /* -------------------- TOGGLE HANDLER -------------------- */
 const handleToggle = async (
  serviceId: string,
  field: 'mostlyTrending' | 'mostlyRecommended' | 'mostlyPopular',
  checked: boolean
) => {
  // 🔴 Confirmation first
  const confirmAction = window.confirm(
    `Are you sure you want to ${checked ? 'enable' : 'disable'} this option?`
  );

  if (!confirmAction) {
    return; // ❌ Stop if user cancels
  }

  try {
    setLoadingToggle(serviceId);

    // Optimistic UI
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, [field]: checked } : s
      )
    );

    const res = await axios.post('/api/service/most-home-service', {
      service: serviceId,
      [field]: checked,
    });

    // ✅ Show backend success message
    if (res.data?.success) {
      alert(res.data.message);
    }
  } catch (error: any) {
    console.error('Toggle update failed', error);

    // ❌ Revert UI on error
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, [field]: !checked } : s
      )
    );

    alert('Something went wrong. Please try again.');
  } finally {
    setLoadingToggle(null);
  }
};


  /* -------------------- TABLE COLUMNS (NO DESIGN CHANGE) -------------------- */
  const columns = [
    {
      header: 'S.No',
      render: (_: any, index: number) =>
        (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      header: 'Service Name',
      render: (row: ServiceRow) => (
        <span className="font-semibold text-blue-600">{row.name}</span>
      ),
    },
    {
      header: 'Category',
      render: (row: ServiceRow) => row.category,
    },
    {
      header: 'Status',
      render: (row: ServiceRow) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            row.status === 'Active'
              ? 'text-green-600 bg-green-100 border border-green-300'
              : 'text-red-500 bg-red-100 border border-red-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row: ServiceRow) => (
        <Link href={`/service-management/service-details/${row.id}`}>
          <button className="text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white">
            <EyeIcon />
          </button>
        </Link>
      ),
    },
    {
      header: 'Mostly Trending',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyTrending}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyTrending', checked)
          }
        />
      ),
    },
    {
      header: 'Mostly Recommended',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyRecommended}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyRecommended', checked)
          }
        />
      ),
    },
    {
      header: 'Mostly Popular',
      render: (row: ServiceRow) => (
        <Switch
          checked={row.mostlyPopular}
          disabled={loadingToggle === row.id}
          onChange={(checked) =>
            handleToggle(row.id, 'mostlyPopular', checked)
          }
        />
      ),
    },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div>
      <PageBreadcrumb pageTitle="Most Home Services" />

      <ComponentCard title="All Services">
        <BasicTableOne columns={columns} data={services} />

        {services.length > rowsPerPage && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(services.length / rowsPerPage)}
              totalItems={services.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default MostHomeServicesPage;
