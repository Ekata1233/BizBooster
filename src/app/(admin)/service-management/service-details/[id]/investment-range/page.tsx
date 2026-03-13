'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

// Custom Icons (to avoid import issues)
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface InvestmentItem {
  franchiseSize: string;
  franchiseType: string;
  city: string;
  franchiseFee: number;
  businessLicenses: number;
  insurance: number;
  legalAndAccountingFee: number;
  inventoryFee: number;
  officeSetup: number;
  initialStartupEquipmentAndMarketing: number;
  staffAndManagementTrainingExpense: number;
  otherExpense: number;
  totalInvestment: number;
  gstIncluded: boolean;
  gst: number;
  tokenAmount: number;
  _id: string;
}

interface InvestmentData {
  _id: string;
  serviceId: string;
  investment: InvestmentItem[];
  createdAt: string;
  updatedAt: string;
}

const InvestmentRangePage = () => {
  const params = useParams();
  const serviceId = params?.id as string;
  
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [serviceName, setServiceName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoading(true);
        // Fetch service details
        try {
          const serviceResponse = await fetch(`/api/service/${serviceId}`);
          const serviceResult = await serviceResponse.json();
          if (serviceResult.success) {
            setServiceName(serviceResult.data.serviceName);
          }
        } catch (err) {
          console.error('Error fetching service details:', err);
        }

        // Fetch investment data
        const response = await fetch(`/api/service/franchise/investment?serviceId=${serviceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch investment data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setInvestmentData(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchInvestmentData();
    }
  }, [serviceId]);

  const toggleExpand = (investmentId: string) => {
    setExpandedId(expandedId === investmentId ? null : investmentId);
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = (item: InvestmentItem) => {
    return (
      (item.franchiseFee || 0) +
      (item.businessLicenses || 0) +
      (item.insurance || 0) +
      (item.legalAndAccountingFee || 0) +
      (item.inventoryFee || 0) +
      (item.officeSetup || 0) +
      (item.initialStartupEquipmentAndMarketing || 0) +
      (item.staffAndManagementTrainingExpense || 0) +
      (item.otherExpense || 0)
    );
  };

  const getFilteredItems = () => {
    if (!investmentData) return [];
    if (selectedCity === 'all') return investmentData.investment;
    return investmentData.investment.filter(item => item.city === selectedCity);
  };

  const getUniqueCities = () => {
    if (!investmentData) return [];
    return ['all', ...new Set(investmentData.investment.map(item => item.city))];
  };

  const getSizeColor = (size: string) => {
    const colors = {
      small: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100' },
      medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100' },
      large: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100' }
    };
    return colors[size.toLowerCase() as keyof typeof colors] || colors.medium;
  };

  const getProgressWidth = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${(value / total) * 100}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (error || !investmentData || investmentData.investment.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Investment Data Available</h3>
            <p className="text-gray-500 mb-6">{error || 'This service does not have any investment details yet.'}</p>
            <Link 
              href={`/service-management/service-details/${serviceId}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Service Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const cities = getUniqueCities();
  const colors = getSizeColor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6 max-w-7xl mx-auto">
        <PageBreadcrumb 
          pageTitle="Investment Analysis"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/service-management' },
            { label: serviceName || 'Details', href: `/service-management/service-details/${serviceId}` },
            { label: 'Investment', href: '#' }
          ]}
        />
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/service-management/service-details/${serviceId}`}
                className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-3 group"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Service
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Franchise Investment Analysis
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <BuildingIcon />
                {serviceName} • Complete investment breakdown for all franchise sizes
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-blue-600">{investmentData.investment.length}</p>
                <p className="text-xs text-gray-500">Options</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-purple-600">{new Set(investmentData.investment.map(i => i.city)).size}</p>
                <p className="text-xs text-gray-500">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* City Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
              <CityIcon />
              <div className="flex gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCity === city
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {city === 'all' ? 'All Cities' : city}
                    {city !== 'all' && (
                      <span className="ml-1 text-xs opacity-75">
                        ({investmentData.investment.filter(i => i.city === city).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Cards - Grid/List View */}
      <div className={`max-w-7xl mx-auto ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
        {filteredItems.map((item) => {
          const calculatedTotal = calculateTotal(item);
          const isExpanded = expandedId === item._id;
          const colorScheme = colors(item.franchiseSize);
          const totalToShow = item.totalInvestment > 0 ? item.totalInvestment : calculatedTotal;

          return (
            <div
              key={item._id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 ${
                colorScheme.border
              } ${isExpanded ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            >
              {/* Card Header */}
              <div className="p-6 cursor-pointer" onClick={() => toggleExpand(item._id)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${colorScheme.bg} rounded-xl flex items-center justify-center`}>
                      <span className="text-2xl">
                        {item.franchiseSize === 'small' ? '🏢' : item.franchiseSize === 'medium' ? '🏬' : '🏭'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {item.franchiseSize} Franchise
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 ${colorScheme.badge} ${colorScheme.text} rounded-full text-xs font-medium`}>
                          {item.franchiseType}
                        </span>
                        <span className="flex items-center text-gray-500 text-sm">
                          <CityIcon />
                          {item.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Investment</p>
                    <p className={`text-2xl font-bold ${colorScheme.text}`}>
                      {formatCurrency(totalToShow)}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-400">Franchise Fee</p>
                    <p className="text-sm font-semibold text-gray-700">{formatCurrency(item.franchiseFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Token Amount</p>
                    <p className="text-sm font-semibold text-gray-700">{formatCurrency(item.tokenAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">GST</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {item.gst > 0 ? `${item.gst}%` : '—'}
                      {item.gst > 0 && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({item.gstIncluded ? 'Inc' : 'Exc'})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Progress Bar (if total > 0) */}
                {totalToShow > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorScheme.badge}`}
                        style={{ width: `${(item.franchiseFee / totalToShow) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>Franchise Fee</span>
                      <span>Other Costs</span>
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Indicator */}
                <div className="mt-4 flex justify-center">
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CurrencyIcon />
                    Detailed Breakdown
                  </h4>

                  {/* Expense Categories */}
                  <div className="space-y-3">
                    {[
                      { label: 'Franchise Fee', value: item.franchiseFee, icon: '💰' },
                      { label: 'Business Licenses', value: item.businessLicenses, icon: '📋' },
                      { label: 'Insurance', value: item.insurance, icon: '🛡️' },
                      { label: 'Legal & Accounting', value: item.legalAndAccountingFee, icon: '⚖️' },
                      { label: 'Initial Inventory', value: item.inventoryFee, icon: '📦' },
                      { label: 'Office Setup', value: item.officeSetup, icon: '🏢' },
                      { label: 'Equipment & Marketing', value: item.initialStartupEquipmentAndMarketing, icon: '📱' },
                      { label: 'Staff Training', value: item.staffAndManagementTrainingExpense, icon: '👥' },
                      { label: 'Other Expenses', value: item.otherExpense, icon: '🔧' },
                    ].map((expense, idx) => (
                      expense.value > 0 && (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{expense.icon}</span>
                            <span className="text-sm text-gray-600">{expense.label}</span>
                          </div>
                          <span className="font-medium text-gray-900">{formatCurrency(expense.value)}</span>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Summary with GST */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Subtotal</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(calculatedTotal)}</span>
                    </div>
                    
                    {item.gst > 0 && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            GST ({item.gst}%) {item.gstIncluded ? '(Included)' : ''}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {formatCurrency((calculatedTotal * item.gst) / 100)}
                          </span>
                        </div>

                        {!item.gstIncluded && (
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Total with GST</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(calculatedTotal + (calculatedTotal * item.gst) / 100)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="mt-4 flex items-center justify-end gap-1 text-xs text-gray-400">
                    <CalendarIcon />
                    Updated: {new Date(investmentData.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ⓘ All figures are in Indian Rupees (INR) and are indicative. Final investment may vary based on 
            location, market conditions, and other factors. Please consult with our franchise team for exact figures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentRangePage;