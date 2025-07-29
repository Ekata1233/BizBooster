

'use client';

import { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

// This 'Coupon' type is now imported from your central context or types file
// and contains all the correct fields (isActive, customer, category as an object, etc.).
import { useCoupon, type Coupon } from '@/context/CouponContext';
import { useParams } from 'next/navigation';



const CouponDetailsPage = () => {
  const { id } = useParams();
  const { coupons } = useCoupon();
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (id && coupons.length > 0) {
      const found = coupons.find((c) => c._id === id);
      setCoupon(found || null);
    }
  }, [id, coupons]);

  if (!coupon) {
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  }

  // The code below now works without errors because the imported 'Coupon' type
  // correctly describes the data structure.
  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle={`Coupon: ${coupon.couponCode}`} />
      <ComponentCard title="Coupon Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Coupon Code" value={coupon.couponCode} />
          <Detail label="Type" value={coupon.couponType} />
          <Detail label="Title" value={coupon.discountTitle} />
          <Detail label="Amount" value={coupon.amount ?? '—'} />
          <Detail label="Amount Type" value={coupon.discountAmountType} />
          <Detail label="Cost Bearer" value={coupon.discountCostBearer} />
          <Detail label="Min Purchase" value={coupon.minPurchase} />
          <Detail label="Max Discount" value={coupon.maxDiscount ?? '—'} />
          <Detail label="Valid From" value={new Date(coupon.startDate).toLocaleDateString()} />
          <Detail label="Valid To" value={new Date(coupon.endDate).toLocaleDateString()} />
       
          {/* <Detail
            label="Applies To"
            value={
              coupon.category?.name ||
              coupon.service?.serviceName ||
              coupon.zone?.name ||
              coupon.customer?.fullName ||
              '—'
            }
          /> */}
        </div>
      </ComponentCard>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-4 border rounded-md bg-white dark:bg-dark-800">
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
    <p className="text-base font-semibold text-black dark:text-white mt-1">{value}</p>
  </div>
);

export default CouponDetailsPage;