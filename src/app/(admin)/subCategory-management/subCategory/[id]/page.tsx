'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useSubcategory } from '@/context/SubcategoryContext';

interface SubcategoryType {
  _id: string;
  name: string;
  image?: string;
  category?: {
    _id: string;
    name: string;
  };
}

const SubcategoryDetailsPage = () => {
  const { id } = useParams();
  const { subcategories } = useSubcategory();

  const [subcategory, setSubcategory] = useState<SubcategoryType | null>(null);

  useEffect(() => {
    if (id && subcategories.length > 0) {
      const found = subcategories.find((s) => s._id === id);
      if (found) setSubcategory(found);
    }
  }, [id, subcategories]);

  if (!subcategory) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Subcategory Details" />

      {/* Card 1: Image + Name */}
      <div className="my-5">
        <ComponentCard title="Subcategory Overview">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {subcategory.image ? (
              <Image
                src={subcategory.image}
                alt="Subcategory"
                width={150}
                height={150}
                className="object-cover rounded border"
              />
            ) : (
              <div className="w-[150px] h-[150px] flex items-center justify-center border rounded text-gray-500 text-sm">
                No image
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">Name:</h2>
              <p className="text-gray-700 mt-1">{subcategory.name}</p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 2: Other Details */}
      <div className="my-5">
        <ComponentCard title="Additional Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Category:</h2>
              <p className="text-gray-700">{subcategory.category?.name || 'N/A'}</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default SubcategoryDetailsPage;
