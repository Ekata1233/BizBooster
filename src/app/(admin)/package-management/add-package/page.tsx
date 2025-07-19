'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PackageType, usePackage } from '@/context/PackageContext';

const ClientSideCustomEditor = dynamic(() => import('@/components/custom-editor/CustomEditor'), {
  ssr: false,
  loading: () => <p>Loading rich text editor...</p>,
});

const PackageForm = () => {
  const { packages, addPackage, updatePackage } = usePackage();
  const isContentEdited = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'gp' | 'sgp' | 'pgp'>('gp');

  const [form, setForm] = useState<PackageType>({
    description: {
      gp: '',
      sgp: '',
      pgp: '',
    },
    price: 0,
    discount: 0,
    discountedPrice: 0,
    deposit: 0,
    grandtotal: 0,
  });

 useEffect(() => {
  let isMounted = true;
  setHasMounted(true);

  if (packages.length > 0 && isMounted) {
    const latest = packages[0];
    setForm({
      _id: latest._id,
      description: {
        gp: latest.description?.gp || '',
        sgp: latest.description?.sgp || '',
        pgp: latest.description?.pgp || '',
      },
      price: latest.price || 0,
      discount: latest.discount || 0,
      discountedPrice: latest.discountedPrice || 0,
      deposit: latest.deposit || 0,
      grandtotal: latest.grandtotal || 0,
    });
  }

  return () => {
    isMounted = false;
  };
}, [packages]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setForm(prev => {
      const newForm = { ...prev, [name]: numericValue };
      if (name === 'price' || name === 'discount') {
        const price = name === 'price' ? numericValue : prev.price;
        const discount = name === 'discount' ? numericValue : prev.discount;
        newForm.discountedPrice = price - (price * discount) / 100;
      }
      return newForm;
    });
  };

  const handleEditorChange = (data: string) => {
    if (!hasMounted) return;
    setForm(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [selectedTab]: data,
      },
    }));
    isContentEdited.current = true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatePayload: Partial<PackageType> = {
      description: {
        ...form.description,
      },
    };

    if (selectedTab !== 'gp') {
      // Only update selected tab description
      updatePayload.description = {
        ...packages[0]?.description,
        [selectedTab]: form.description[selectedTab],
      };
    } else {
      // On GP tab also update price, discount, deposit
      updatePayload.price = form.price;
      updatePayload.discount = form.discount;
      updatePayload.discountedPrice = form.discountedPrice;
      updatePayload.deposit = form.deposit;
    }

    if (form._id) {
      await updatePackage(form._id, updatePayload);
    } else {
      await addPackage({
        ...form,
        description: {
          gp: form.description.gp || '',
          sgp: form.description.sgp || '',
          pgp: form.description.pgp || '',
        },
      });
    }

    alert(`${selectedTab.toUpperCase()} saved successfully!`);
    isContentEdited.current = false;
  };

  if (!hasMounted) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Package Description</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Select Description</label>
          <div className="flex space-x-4 mb-4">
            {(['gp', 'sgp', 'pgp'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedTab(type)}
                className={`px-4 py-2 rounded-lg border ${selectedTab === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* CKEditor */}
        <div>
          <label className="block font-medium mb-2">
            Description ({selectedTab.toUpperCase()})
          </label>
          <ClientSideCustomEditor
            value={form.description[selectedTab]}
            onChange={handleEditorChange}
          />
        </div>

        {/* Show only for GP */}
        {selectedTab === 'gp' && (
          <>
            <div>
              <label className="block font-medium mb-1">Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleInputChange} className="w-full border p-2 rounded" min={0} />
            </div>
            <div>
              <label className="block font-medium mb-1">Discount (%)</label>
              <input type="number" name="discount" value={form.discount} onChange={handleInputChange} className="w-full border p-2 rounded" min={0} max={100} />
            </div>
            <div>
              <label className="block font-medium mb-1">Discounted Price (₹)</label>
              <input type="number" name="discountedPrice" value={form.discountedPrice} readOnly className="w-full border p-2 rounded bg-gray-100" />
            </div>
            <div>
              <label className="block font-medium mb-1">Deposit (₹)</label>
              <input type="number" name="deposit" value={form.deposit} onChange={handleInputChange} className="w-full border p-2 rounded" min={0} />
            </div>
            <div className="flex items-center justify-between border p-3 rounded bg-gray-50">
              <span className="font-bold">Grand Total (₹):</span>
              <span className="text-xl font-bold text-blue-700">
                ₹{form.grandtotal?.toLocaleString() || 0}
              </span>
            </div>
          </>
        )}
        <div className="text-center">
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Save {selectedTab.toUpperCase()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;
