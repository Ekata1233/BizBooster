'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PackageType, usePackage } from '@/context/PackageContext';

// Load CKEditor dynamically
const ClientSideCustomEditor = dynamic(() => import('@/components/custom-editor/CustomEditor'), {
  ssr: false,
  loading: () => <p>Loading rich text editor...</p>,
});

const PackageForm = () => {
  const { packages, addPackage } = usePackage();
  const isContentEdited = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);

  const [form, setForm] = useState<PackageType>({
    description: '',
    price: 0,
    discount: 0,
    discountedPrice: 0,
    deposit: 0,
  });

  // Set previously saved data (latest package)
  useEffect(() => {
    setHasMounted(true);

    if (packages.length > 0) {
      const latest = packages[0]; // Assuming sorted by latest first
      setForm({
        description: latest.description || '',
        price: latest.price || 0,
        discount: latest.discount || 0,
        discountedPrice: latest.discountedPrice || 0,
        deposit: latest.deposit || 0,
      });
    }
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
      description: data,
    }));
    isContentEdited.current = true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPackage(form);
    alert('Package saved successfully!');
    // Do not reset the form, just like commission page
    isContentEdited.current = false;
  };

  if (!hasMounted) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Add Package</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description (CKEditor) */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <ClientSideCustomEditor value={form.description} onChange={handleEditorChange} />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price (₹)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Discount */}
        <div>
          <label className="block font-medium mb-1">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Discounted Price (read-only) */}
        <div>
          <label className="block font-medium mb-1">Discounted Price (₹)</label>
          <input
            type="number"
            name="discountedPrice"
            value={form.discountedPrice}
            readOnly
            className="w-full border p-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {/* Deposit */}
        <div>
          <label className="block font-medium mb-1">Deposit (₹)</label>
          <input
            type="number"
            name="deposit"
            value={form.deposit}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Save Package
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;
