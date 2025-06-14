'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Radio from '@/components/form/input/Radio';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ChevronDownIcon } from '@/icons';

import { useCategory } from '@/context/CategoryContext';
import { useSubcategory } from '@/context/SubcategoryContext';
import { useZone } from '@/context/ZoneContext';                // ⬅️ if you have one

import type { CouponType } from '@/app/(admin)/coupons-management/coupons-list/page';
import { useServiceCustomer } from '@/context/ServiceCustomerContext';

/* -------------------------------------------------------------------------- */
/* 🔖 constants                                                               */
/* -------------------------------------------------------------------------- */

const couponTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'firstBooking', label: 'First Booking' },
  { value: 'customerWise', label: 'Customer Wise' },
];

const discountTypes: CouponType['discountType'][] = [
  'Category Wise',
  'Service Wise',
  'Mixed',
];

const amountTypes: CouponType['discountAmountType'][] = [

  'Percentage',
  'Fixed Amount',
];

const costBearers: CouponType['discountCostBearer'][] = [
  'Provider',
  'Customer',
];

const appliesTo = ["Growth Partner", "Customer"] as const;

/* -------------------------------------------------------------------------- */
/* 🔖 component                                                               */
/* -------------------------------------------------------------------------- */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coupon: CouponType | null;
  onSave: (payload: Partial<CouponType>) => Promise<void>;
}

const EditCouponModal: React.FC<Props> = ({ isOpen, onClose, coupon, onSave }) => {
  const [form, setForm] = useState<Partial<CouponType>>({});
  /* ─── external lists ──────────────────────────────────────────────────── */
  const { customers } = useServiceCustomer();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { zones = [] } = useZone?.() ?? { zones: [] };       // optional

  console.log("formdata of the edit : ", form)

  /* ▶︎ map to Select-friendly [{value,label}] once, memoised */
  const categoryOptions = useMemo(
    () =>
      categories.map(c => ({
        value: c._id ?? "", // fallback to empty string if _id is undefined
        label: c.name,
      })),
    [categories]
  );

  const customersOptions = useMemo(
    () =>
      customers.map(cus => ({
        value: String(cus._id), // 👈 Cast _id to string
        label: cus.fullName,
      })),
    [customers]
  );


  const serviceOptions = useMemo(
    () =>
      subcategories
        .filter(sc => sc.category?._id === (form.category as any)?.value)
        .map(sc => ({ value: sc._id, label: sc.name })),
    [subcategories, form.category]                // ⬅️ depend on form.category
  );

  const zoneOptions = useMemo(
    () => zones.map(z => ({ value: z._id, label: z.name })),
    [zones]
  );

  /* ─── local form state ────────────────────────────────────────────────── */


  useEffect(() => {
    if (coupon) setForm(coupon);
  }, [coupon]);

  /* ─── helpers ─────────────────────────────────────────────────────────── */
  const handleChange = (field: keyof CouponType, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleDiscountTypeChange = (val: CouponType['discountType']) => {
    setForm(prev => ({
      ...prev,
      discountType: val,
      category: undefined,
      service: undefined,
    }));
  };

  const handleAmountTypeChange = (val: CouponType['discountAmountType']) => {
    setForm(prev => ({
      ...prev,
      discountAmountType: val,
      maxDiscount: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon) return;
    await onSave(form);
    onClose();
  };

  /* ─── dynamic inputs (Category / Service / Zone) ──────────────────────── */
  const renderDynamicSelects = () => {
    const selects = [] as React.ReactElement[];

    if (form.discountType === 'Category Wise' || form.discountType === 'Mixed') {
      selects.push(
        <div key="category" className="md:col-span-2 relative">
          <Label>Select Category</Label>
          <Select
            options={categoryOptions}
            placeholder="Select category"
            value={form.category?._id}
            onChange={val => handleChange('category', val)}
            className="w-full dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>,
      );
    }

    if (form.discountType === 'Service Wise' || form.discountType === 'Mixed') {
      selects.push(
        <div key="service" className="md:col-span-2 relative">
          <Label>Select Service</Label>
          <Select
            options={serviceOptions}
            placeholder="Select service"
            value={(form.service as any)?.value ?? form.service?._id}

            onChange={val => handleChange('service', val)}
            className="w-full dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>,
      );
    }

    selects.push(
      <div key="zone" className="md:col-span-2 relative">
        <Label>Select Zone</Label>
        <Select
          options={zoneOptions}
          placeholder="Select zone"
          value={zoneOptions.find(z => z.value === form.zone?._id)}

          onChange={val => handleChange('zone', val)}
          className="w-full dark:bg-dark-900"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDownIcon />
        </span>
      </div>,
    );

    return selects;
  };

  /* ─── amount / date / limit block ─────────────────────────────────────── */
  const renderAmountFields = () => (
    <>
      {/* Amount + dates */}
      <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
        <div>
          <Label>
            Amount&nbsp;
            {form.discountAmountType === 'Percentage' ? '(%)' : '(₹)'}
          </Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.amount ?? ''}
            onChange={e => handleChange('amount', +e.target.value)}
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={form.startDate ?? ''}
            onChange={e => handleChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={form.endDate ?? ''}
            onChange={e => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* minPurchase, maxDiscount (conditional), limitPerUser */}
      <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
        <div>
          <Label>Min&nbsp;Purchase&nbsp;(₹)</Label>
          <Input
            type="number"
            placeholder="Order amount to qualify"
            value={form.minPurchase ?? ''}
            onChange={e => handleChange('minPurchase', +e.target.value)}
          />
        </div>

        {form.discountAmountType === 'Percentage' && (
          <div>
            <Label>Max Discount&nbsp;(₹)</Label>
            <Input
              type="number"
              placeholder="Upper cap"
              value={form.maxDiscount ?? ''}
              onChange={e => handleChange('maxDiscount', +e.target.value)}
            />
          </div>
        )}

        <div>
          <Label>Limit&nbsp;per&nbsp;User</Label>
          <Input
            type="number"
            placeholder="Uses allowed for same user"
            value={form.limitPerUser ?? ''}
            onChange={e => handleChange('limitPerUser', +e.target.value)}
          />
        </div>
      </div>
    </>
  );

  /* ─── ui ──────────────────────────────────────────────────────────────── */
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[770px] m-4">
      <div className="w-full max-h-[80vh] overflow-y-auto  bg-white p-4 dark:bg-gray-900 lg:p-11 scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600">
        <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Coupon
        </h4>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Coupon Type & Code */}
            <div className="relative">
              <Label>Select Coupon Type</Label>
              <Select
                options={couponTypeOptions}
                placeholder="Select coupon type"
                value={form.couponType}
                onChange={val => handleChange('couponType', val)}
                className="w-full dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            <div>
              <Label>Coupon Code</Label>
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={form.couponCode ?? ''}
                onChange={e => handleChange('couponCode', e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-8">
              {form.couponType === "customerWise" && (
                <div className="w-full">            {/* or: basis-full */}
                  <Label>Select Customer</Label>
                  <Select
                    options={customersOptions}
                    placeholder="Select customer"
                    value={form.customer?._id}

                    onChange={val => handleChange("customer", val)}
                    className="w-full dark:bg-dark-900"
                  />

                </div>
              )}
            </div>

            {/* Discount Type (radio) */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-8">
              <Label>Discount Type</Label>
              {discountTypes.map((t, idx) => (
                <Radio
                  key={idx}
                  id={`discountType-${idx}`}
                  name="discountType"
                  value={t}
                  checked={form.discountType === t}
                  onChange={() => handleDiscountTypeChange(t)}
                  label={t}
                />
              ))}
            </div>

            {/* Discount Title */}
            <div className="md:col-span-2">
              <Label>Discount Title</Label>
              <Input
                type="text"
                placeholder="Enter discount title"
                value={form.discountTitle ?? ''}
                onChange={e => handleChange('discountTitle', e.target.value)}
              />
            </div>

            {/* Category / Service / Zone */}
            {renderDynamicSelects()}

            {/* Amount Type (radio) */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-8">
              <Label>Discount Amount Type</Label>
              {amountTypes.map((t, idx) => (
                <Radio
                  key={idx}
                  id={`amountType-${idx}`}
                  name="amountType"
                  value={t}
                  checked={form.discountAmountType === t}
                  onChange={() => handleAmountTypeChange(t)}
                  label={t}
                />
              ))}
            </div>

            {/* Amount / Date / Limits */}
            {renderAmountFields()}

            {/* Cost bearer & applies to */}
            <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Label>Discount Cost&nbsp;Bearer</Label>
                <div className="flex flex-wrap items-center gap-6">
                  {costBearers.map((cb, idx) => (
                    <Radio
                      key={idx}
                      id={`costBearer-${idx}`}
                      name="discountCostBearer"
                      value={cb}
                      checked={form.discountCostBearer === cb}
                      onChange={() => handleChange('discountCostBearer', cb)}
                      label={cb}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Coupon&nbsp;Applies&nbsp;To</Label>
                <div className="flex flex-wrap items-center gap-6">
                  {appliesTo.map((ap, idx) => (
                    <Radio
                      key={idx}
                      id={`appliesTo-${idx}`}
                      name="couponAppliesTo"
                      value={ap}
                      checked={(form as CouponType).couponAppliesTo === ap}
                      onChange={() => handleChange('couponAppliesTo' as keyof CouponType, ap)}
                      label={ap}
                    />
                  ))}
                </div>


              </div>
            </div>


            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2 md:col-span-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button size="sm" >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};



export default EditCouponModal