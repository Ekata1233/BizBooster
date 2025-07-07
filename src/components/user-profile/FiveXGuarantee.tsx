'use client';

import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';

const FiveXGuarantee = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const totalEarnings = 372000;
  const totalLeads = 768;
  const targetEarning = 500000;

  const targetLeads = 36 * 25;
  const levelStep = targetLeads / 5; // 180 leads = 1X
  const leadPercent = Math.min((totalLeads / targetLeads) * 100, 100);
  const currentLevel = Math.min(Math.floor(totalLeads / levelStep) + 1, 5);

  const earningPercent = Math.min((totalEarnings / targetEarning) * 100, 100);

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ];

  const generateMonthlyData = (month: number, year: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const totalLead = Math.floor(Math.random() * 50);
      const successful = Math.floor(totalLead * 0.7);
      const failed = totalLead - successful;
      const percent = ((totalLead / 25) * 100).toFixed(1);

      return {
        id: i,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
        targetLead: 25,
        percent,
        totalLead,
        successfulLead: successful,
        failedLead: failed,
      };
    });
  };

  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedMonth !== null) {
      setMonthlyData(generateMonthlyData(selectedMonth, selectedYear));
    }
  }, [selectedMonth, selectedYear]);

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Target Lead', accessor: 'targetLead' },
    { header: 'Percent', accessor: 'percent' },
    { header: 'Total Lead', accessor: 'totalLead' },
    { header: 'Successful Lead', accessor: 'successfulLead' },
    { header: 'Failed Lead', accessor: 'failedLead' },
  ];

  return (
    <ComponentCard title="5x Guarantee">
      {/* Semicircle Progress Graphs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Level Progress Card - Green */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-green-600">
          <div className="mb-4 text-green-600 text-xl font-semibold">Level Progress</div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              <path d="M40,140 A110,110 0 0,1 260,140" fill="none" stroke="#e5e7eb" strokeWidth="18" />
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#10b981"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="345"
                strokeDashoffset={345 - (leadPercent * 345) / 100}
              />
              <text x="150" y="100" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#10b981">
                {leadPercent === 100 ? '5X' : `${currentLevel}X`}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">Progress: {leadPercent.toFixed(1)}%</div>
        </div>

        {/* Earnings Progress Card - Blue */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border-t-4 border-blue-600">
          <div className="mb-4 text-blue-600 text-xl font-semibold">Earning Progress</div>
          <div className="relative w-[300px] h-[160px]">
            <svg width="300" height="160" viewBox="0 0 300 160">
              <path d="M40,140 A110,110 0 0,1 260,140" fill="none" stroke="#e5e7eb" strokeWidth="18" />
              <path
                d="M40,140 A110,110 0 0,1 260,140"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="345"
                strokeDashoffset={345 - (earningPercent * 345) / 100}
              />
              <text x="150" y="100" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#3b82f6">
                ₹{totalEarnings}
              </text>
            </svg>
          </div>
          <div className="text-base mt-2 text-gray-600">Progress: {earningPercent.toFixed(1)}%</div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Current Level</p>
          <p className="text-lg font-semibold text-blue-600">{currentLevel}X</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-lg font-semibold text-green-600">₹{totalEarnings}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl py-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-lg font-semibold text-yellow-600">{totalLeads}</p>
        </div>
      </div>

      {/* Year Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setSelectedYear((prev) => prev - 1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ⬅ {selectedYear - 1}
        </button>
        <h4 className="text-lg font-semibold">Select Month - {selectedYear}</h4>
        <button
          onClick={() => setSelectedYear((prev) => prev + 1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          {selectedYear + 1} ➡
        </button>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={`px-4 py-2 rounded-md border text-sm font-medium ${
              selectedMonth === index
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Table Section */}
      {selectedMonth !== null && (
        <>
          <h4 className="font-semibold text-lg mb-2">
            Leads Summary – {months[selectedMonth]} {selectedYear}
          </h4>
          <BasicTableOne columns={columns} data={monthlyData} />
        </>
      )}
    </ComponentCard>
  );
};

export default FiveXGuarantee;
