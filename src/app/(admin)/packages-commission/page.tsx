'use client';

import React, { useEffect, useState } from 'react';
import { usePackagesCommission } from '@/context/PackagesCommissionContext';

const PackagesCommissionPage = () => {
  const { commission, loading, saveCommission } = usePackagesCommission();
    
    
  const [level1Commission, setLevel1Commission] = useState<number>(0);
  const [level2Commission, setLevel2Commission] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (commission) {
      setLevel1Commission(commission.level1Commission || 0);
      setLevel2Commission(commission.level2Commission || 0);
    }
  }, [commission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await saveCommission({ level1Commission, level2Commission });
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Packages Commission Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Level 1 Commission (% or ₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={level1Commission}
            onChange={(e) => setLevel1Commission(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Level 2 Commission (% or ₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={level2Commission}
            onChange={(e) => setLevel2Commission(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {submitting || loading ? 'Saving...' : 'Save Commission'}
        </button>
      </form>
    </div>
  );
};

export default PackagesCommissionPage;
