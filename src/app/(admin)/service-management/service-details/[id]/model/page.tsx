'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

/* ---------------- Icons ---------------- */

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
  </svg>
);

const RulerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8zM6 20a6 6 0 0112 0" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2 0-3 1-3 2s1 2 3 2 3 1 3 2-1 2-3 2" />
  </svg>
);

const PercentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-5 7-10a7 7 0 10-14 0c0 5 7 10 7 10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
  </svg>
);

/* ---------------- Interfaces ---------------- */

interface ModelItem {
  franchiseSize: string;
  areaRequired: string;
  marketing: string;
  returnOfInvestment: string;
  manPower: number;
  staffManagement: string;
  royaltyPercent: string;
  grossMargin: string;
  radiusArea: string;
  _id: string;
}

interface ModelData {
  _id: string;
  serviceId: string;
  model: ModelItem[];
}

/* ---------------- Page ---------------- */

const FranchiseModelPage = () => {
  const params = useParams();
  const serviceId = params?.id as string;

  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState('');
  const [selectedSize, setSelectedSize] = useState('all');

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serviceRes = await fetch(`/api/service/${serviceId}`);
        const serviceJson = await serviceRes.json();

        if (serviceJson.success) {
          setServiceName(serviceJson.data.serviceName);
        }

        const res = await fetch(`/api/service/franchise/model?serviceId=${serviceId}`);
        const json = await res.json();

        if (json.success) {
          setModelData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) fetchData();
  }, [serviceId]);

  /* ---------------- Helpers ---------------- */

  const getFilteredModels = () => {
    if (!modelData) return [];
    if (selectedSize === 'all') return modelData.model;

    return modelData.model.filter((item) =>
      item.franchiseSize.toLowerCase().includes(selectedSize.toLowerCase())
    );
  };

  const getUniqueSizes = () => {
    if (!modelData) return [];
    return ['all', ...new Set(modelData.model.map((m) => m.franchiseSize.toLowerCase()))];
  };

  const getSizeColor = (size: string) => {
    const map: any = {
      small: 'border-emerald-200 bg-emerald-50',
      medium: 'border-amber-200 bg-amber-50',
      large: 'border-rose-200 bg-rose-50'
    };

    return map[size] || 'border-gray-200 bg-gray-50';
  };

  const getSizeIcon = (size: string) => {
    const icons: any = {
      small: '🏢',
      medium: '🏬',
      large: '🏭'
    };

    return icons[size] || '📊';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin h-14 w-14 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!modelData || modelData.model.length === 0) {
    return (
      <div className="text-center mt-20">
        <p>No franchise models available.</p>
      </div>
    );
  }

  const filteredModels = getFilteredModels();
  const sizes = getUniqueSizes();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Breadcrumb */}

      <PageBreadcrumb
        pageTitle="Franchise Models"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Service Management', href: '/service-management' },
          { label: serviceName || 'Service', href: `/service-management/service-details/${serviceId}` },
          { label: 'Franchise Models', href: '#' }
        ]}
      />

      {/* Header */}

      <div className="flex justify-between items-center mt-6 mb-6">
        <div>
          <Link
            href={`/service-management/service-details/${serviceId}`}
            className="flex items-center text-gray-500 mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>

          <h1 className="text-3xl font-bold">Franchise Models</h1>
          <p className="text-gray-500">{serviceName}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="font-bold text-blue-600">{modelData.model.length}</p>
            <p className="text-xs">Models</p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="font-bold text-purple-600">{sizes.length - 1}</p>
            <p className="text-xs">Sizes</p>
          </div>
        </div>
      </div>

      {/* Filter */}

      <div className="flex gap-3 mb-6 flex-wrap">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedSize === size
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {size === 'all' ? 'All' : size}
          </button>
        ))}
      </div>

      {/* Grid */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model._id}
            className={`border rounded-xl shadow-sm p-5 ${getSizeColor(
              model.franchiseSize.toLowerCase()
            )}`}
          >
            {/* Header */}

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getSizeIcon(model.franchiseSize)}</span>
              <h3 className="text-lg font-semibold capitalize">
                {model.franchiseSize} Franchise
              </h3>
            </div>

            {/* Details */}

            <div className="space-y-3 text-sm">

              <div className="flex items-center gap-2">
                <RulerIcon />
                Area: {model.areaRequired}
              </div>

              <div className="flex items-center gap-2">
                <UsersIcon />
                Manpower: {model.manPower}
              </div>

              <div className="flex items-center gap-2">
                <TrendingUpIcon />
                ROI: {model.returnOfInvestment} months
              </div>

              <div className="flex items-center gap-2">
                <PercentIcon />
                Royalty: {model.royaltyPercent}
              </div>

              <div className="flex items-center gap-2">
                <CurrencyIcon />
                Margin: {model.grossMargin}
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon />
                Radius: {model.radiusArea}
              </div>

              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                Marketing: {model.marketing}
              </div>

              <div className="bg-white/60 p-2 rounded-md text-xs mt-2">
                Staff Management: {model.staffManagement}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div className="text-center text-xs text-gray-500 mt-10">
        ⓘ Figures may vary depending on location and market conditions.
      </div>
    </div>
  );
};

export default FranchiseModelPage;
