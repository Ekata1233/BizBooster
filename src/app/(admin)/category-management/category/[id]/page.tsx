// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import Image from 'next/image';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import { useCategory } from '@/context/CategoryContext';
// import { useModule } from '@/context/ModuleContext';

// interface CategoryType {
//   _id?: string;
//   name: string;
//   module: string | { name: string };
//   isDeleted: boolean;
//   image?: string;
//   subcategoryCount?: number;
// }

// const CategoryDetailsPage = () => {
//   const { id } = useParams();
//   const { categories } = useCategory();
//   const { modules } = useModule();

//   const [category, setCategory] = useState<CategoryType | null>(null);

//   useEffect(() => {
//     if (id && categories.length > 0) {
//       const foundCategory = categories.find((cat) => cat._id === id);
//       if (foundCategory) {
//         setCategory(foundCategory as CategoryType);
//       }
//     }
//   }, [id, categories]);

//   if (!category) return <div className="p-4">Loading...</div>;

//   const moduleName =
//     typeof category.module === 'object'
//       ? category.module.name
//       : modules.find((m) => m._id === category.module)?.name || 'N/A';

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Category Details" />

//       <div className="my-5">
//         <ComponentCard title="Category Info">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//              <div className="col-span-1 md:col-span-2">
//               <h2 className="text-lg font-semibold mb-2">Image:</h2>
//               {category.image ? (
//                 <Image
//                   src={category.image}
//                   alt="Category"
//                   width={200}
//                   height={200}
//                   className="object-cover rounded border"
//                 />
//               ) : (
//                 <p className="text-sm text-gray-500">No image available</p>
//               )}

             
//                 <h2 className="text-lg font-semibold">Name:</h2>
//                 <p className="text-gray-700">{category.name}</p>
              

//             </div>

//             <div>
//               <h2 className="text-lg font-semibold">Module:</h2>
//               <p className="text-gray-700">{moduleName}</p>
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold">Status:</h2>
//               <p
//                 className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
//                   category.isDeleted
//                     ? 'text-red-500 bg-red-100 border border-red-300'
//                     : 'text-green-600 bg-green-100 border border-green-300'
//                 }`}
//               >
//                 {category.isDeleted ? 'Deleted' : 'Active'}
//               </p>
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold">Subcategory Count:</h2>
//               <p className="text-gray-700">{category.subcategoryCount ?? 0}</p>
//             </div>

           
//           </div>
//         </ComponentCard>
//       </div>
//     </div>
//   );
// };

// export default CategoryDetailsPage;




'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useCategory } from '@/context/CategoryContext';
import { useModule } from '@/context/ModuleContext';

interface CategoryType {
  _id?: string;
  name: string;
  module: string | { name: string };
  isDeleted: boolean;
  image?: string;
  subcategoryCount?: number;
}

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const { categories } = useCategory();
  const { modules } = useModule();

  const [category, setCategory] = useState<CategoryType | null>(null);

  useEffect(() => {
    if (id && categories.length > 0) {
      const foundCategory = categories.find((cat) => cat._id === id);
      if (foundCategory) {
        setCategory(foundCategory as CategoryType);
      }
    }
  }, [id, categories]);

  if (!category) return <div className="p-4">Loading...</div>;

  const moduleName =
    typeof category.module === 'object'
      ? category.module.name
      : modules.find((m) => m._id === category.module)?.name || 'N/A';

  return (
    <div>
      <PageBreadcrumb pageTitle="Category Details" />

      {/* Card 1: Image + Name */}
      <div className="my-5">
        <ComponentCard title="Category Overview">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {category.image ? (
              <Image
                src={category.image}
                alt="Category"
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
              <p className="text-gray-700 mt-1">{category.name}</p>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Card 2: Remaining Info */}
      <div className="my-5">
        <ComponentCard title="Category Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold">Module:</h2>
              <p className="text-gray-700">{moduleName}</p>
            </div>

           

            <div>
              <h2 className="text-lg font-semibold">Subcategory Count:</h2>
              <p className="text-gray-700">{category.subcategoryCount ?? 0}</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
