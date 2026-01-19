'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { useCoupon } from '@/context/CouponContext';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Badge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}) => {
  const colors = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[type]}`}
    >
      {label}
    </span>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString() : '--';

const Page = () => {
  const { id } = useParams();
  const { getCouponById } = useCoupon();
  const [coupon, setCoupon] = useState<any>(null);

  useEffect(() => {
    const loadCoupon = async () => {
      if (!id) return;
      const data = await getCouponById(id);
      setCoupon(data);
    };

    loadCoupon();
  }, [id]);

  const handleApprove = async (id: string) => {
  try {
    const res = await fetch(`/api/coupon/approve/${id}`, {
      method: 'PUT',
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Approval failed');
      return;
    }

    alert('Coupon approved successfully');

    // update local state so UI reflects approval immediately
    setCoupon((prev: any) => ({
      ...prev,
      isApprove: true,
    }));
  } catch (error) {
    console.error('Approve error:', error);
    alert('Something went wrong while approving coupon');
  }
};


  if (!coupon) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="Coupon Details" />
        <ComponentCard title="Loading...">
          <p className="text-sm text-gray-500">Fetching coupon details...</p>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Coupon Details" />

      {/* ───────── Coupon Header ───────── */}
      <ComponentCard title="Coupon Overview">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{coupon.couponCode}</h2>
            <p className="text-sm text-gray-500">
              {coupon.discountTitle}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge
              label={coupon.isActive ? 'Active' : 'Inactive'}
              type={coupon.isActive ? 'success' : 'warning'}
            />
            <Badge
              label={coupon.isApprove ? 'Approved' : 'Pending'}
              type={coupon.isApprove ? 'success' : 'warning'}
            />
            {coupon.isDeleted && (
              <Badge label="Deleted" type="danger" />
            )}
          </div>
        </div>
      </ComponentCard>

      {/* ───────── Coupon Details ───────── */}
      <ComponentCard title="Coupon Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DetailItem label="Coupon Type" value={coupon.couponType} />
          <DetailItem label="Discount Type" value={coupon.discountType} />
          <DetailItem label="Applies To" value={coupon.couponAppliesTo} />

          <DetailItem
            label="Discount"
            value={
              coupon.discountAmountType === 'Percentage'
                ? `${coupon.amount}%`
                : `₹${coupon.amount}`
            }
          />

          <DetailItem
            label="Max Discount"
            value={coupon.maxDiscount ?? '--'}
          />

          <DetailItem
            label="Min Purchase"
            value={`₹${coupon.minPurchase}`}
          />

          <DetailItem
            label="Limit Per User"
            value={coupon.limitPerUser}
          />

          <DetailItem
            label="Cost Bearer"
            value={coupon.discountCostBearer}
          />

        </div>
      </ComponentCard>

      {/* ───────── Validity ───────── */}
      <ComponentCard title="Validity Period">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem
            label="Start Date"
            value={formatDate(coupon.startDate)}
          />
          <DetailItem
            label="End Date"
            value={formatDate(coupon.endDate)}
          />
        </div>
      </ComponentCard>

      {/* ───────── Zone Details ───────── */}
      <ComponentCard title="Zone Details">
        <div className="space-x-4">
          <DetailItem label="Zone Name" value={coupon.zone?.name} />

          <DetailItem
            label="Pan India"
            value={coupon.zone?.isPanIndia ? 'Yes' : 'No'}
          />
        </div>
      </ComponentCard>

      <div>
        <Button
  size="md"
  variant="primary"
  disabled={coupon.isApprove}
  onClick={() => handleApprove(coupon._id)}
>
  {coupon.isApprove ? 'Approved' : 'Approve'}
</Button>

      </div>
    </div>
  );
};

export default Page;
