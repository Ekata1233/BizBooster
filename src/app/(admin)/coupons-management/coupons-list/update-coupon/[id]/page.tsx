"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CouponType } from "../../page";
import { useServiceCustomer } from "@/context/ServiceCustomerContext";
import { useCategory } from "@/context/CategoryContext";
import { useSubcategory } from "@/context/SubcategoryContext";
import { useCoupon } from "@/context/CouponContext";
import { useZone } from "@/context/ZoneContext";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Radio from "@/components/form/input/Radio";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

/* ─── option lists ───────────────────────────────────────────── */
const couponTypeOptions = [
  { value: "default", label: "Default" },
  { value: "firstBooking", label: "First Booking" },
  { value: "customerWise", label: "Customer Wise" },
];

const discountTypes: CouponType["discountType"][] = [
  "Category Wise",
  "Service Wise",
  "Mixed",
];

const amountTypes: CouponType["discountAmountType"][] = [
  "Percentage",
  "Fixed Amount",
];

const costBearers: CouponType["discountCostBearer"][] = [
  "Provider",
  "Admin",
];

const appliesTo = ["Growth Partner", "Customer"] as const;

/* ─── component ─────────────────────────────────────────────── */
const EditCouponPage: React.FC = () => {
  const [form, setForm] = useState<Partial<CouponType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const params = useParams();
  const couponId = params.id;
  const router = useRouter();

  console.log("form ", form);


  const { customers } = useServiceCustomer();
  const { categories } = useCategory();
  const { subcategories } = useSubcategory();
  const { coupons, deleteCoupon, updateCoupon } = useCoupon();
  const { zones = [] } = useZone?.() ?? { zones: [] };

  /* ─── load coupon data into form ───────────────────────────── */
  useEffect(() => {
    if (coupons && couponId) {
      const found = coupons.find((c) => c._id === couponId);
      if (found) {
        setForm(found as Partial<CouponType>);
      }
    }
  }, [coupons, couponId]);

  /* ─── helpers ─────────────────────────────────────────────── */
  const handleChange = (field: keyof CouponType, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDiscountTypeChange = (val: CouponType["discountType"]) => {
    setForm((prev) => ({
      ...prev,
      discountType: val,
      category: undefined,
      service: undefined,
    }));
  };

  const handleAmountTypeChange = (val: CouponType["discountAmountType"]) => {
    setForm((prev) => ({
      ...prev,
      discountAmountType: val,
      maxDiscount: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      // Clear previous errors
  setErrors({});
  
  // Validate form
  if (!validateForm()) {
    alert("Please fill all required fields correctly");
    return; // Stop submission if validation fails
  }
    if (!form?._id) return;

    const formData = new FormData();

    if (form.couponType) formData.append("couponType", form.couponType);
    if (form.couponCode) formData.append("couponCode", form.couponCode);
    if (form.discountType) formData.append("discountType", form.discountType);
    if (form.discountAmountType) formData.append("discountAmountType", form.discountAmountType);
    if (form.discountCostBearer) formData.append("discountCostBearer", form.discountCostBearer);
    if (form.discountTitle) formData.append("discountTitle", form.discountTitle);

    if (form.amount !== undefined) formData.append("amount", String(form.amount));
    if (form.maxDiscount !== undefined) formData.append("maxDiscount", String(form.maxDiscount));
    if (form.minPurchase !== undefined) formData.append("minPurchase", String(form.minPurchase));
    if (form.limitPerUser !== undefined) formData.append("limitPerUser", String(form.limitPerUser));

    if (form.startDate) formData.append("startDate", form.startDate);
    if (form.endDate) formData.append("endDate", form.endDate);
    if (form.isActive !== undefined) formData.append("isActive", String(form.isActive));

    if (form.zone?._id) formData.append("zone", form.zone._id);
    if (form.category?._id) formData.append("category", form.category._id);
    if (form.service?._id) formData.append("service", form.service._id);
    if (form.customer?._id) formData.append("customer", form.customer._id);
    if (form.couponAppliesTo) formData.append("couponAppliesTo", form.couponAppliesTo);
    try {
      await updateCoupon(form._id, formData);
      alert("Coupon updated successfully! ✅");
      router.push("/coupons-management/coupons-list");
    } catch (error) {
      console.error("Failed to update coupon:", error);
      alert("Failed to update coupon ❌");
    }
  };
  
/* ─── validation function ─────────────────────────────────── */
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  // Required fields validation
  if (!form.couponType) newErrors.couponType = "Coupon type is required";
  if (!form.couponCode) newErrors.couponCode = "Coupon code is required";
  if (!form.discountType) newErrors.discountType = "Discount type is required";
  if (!form.discountTitle) newErrors.discountTitle = "Discount title is required";
  if (!form.discountAmountType) newErrors.discountAmountType = "Amount type is required";
  if (!form.zone?._id) newErrors.zone = "Zone selection is required";
  
  // Amount validation
  if (!form.amount && form.amount !== 0) {
    newErrors.amount = "Amount is required";
  } else if (form.amount && form.amount < 0) {
    newErrors.amount = "Amount cannot be negative";
  }
  
  // Min purchase validation
  if (!form.minPurchase && form.minPurchase !== 0) {
    newErrors.minPurchase = "Minimum purchase amount is required";
  } else if (form.minPurchase && form.minPurchase < 0) {
    newErrors.minPurchase = "Minimum purchase cannot be negative";
  }
  
  // Max discount validation for percentage type
  if (form.discountAmountType === "Percentage" && !form.maxDiscount && form.maxDiscount !== 0) {
    newErrors.maxDiscount = "Max discount is required for percentage discount";
  } else if (form.maxDiscount && form.maxDiscount < 0) {
    newErrors.maxDiscount = "Max discount cannot be negative";
  }
  
  // Date validation
  if (!form.startDate) {
    newErrors.startDate = "Start date is required";
  }
  
  if (!form.endDate) {
    newErrors.endDate = "End date is required";
  } else if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
    newErrors.endDate = "End date must be after start date";
  }
  
  // Limit per user validation
  if (!form.limitPerUser && form.limitPerUser !== 0) {
    newErrors.limitPerUser = "Limit per user is required";
  } else if (form.limitPerUser && form.limitPerUser < 1) {
    newErrors.limitPerUser = "Limit must be at least 1";
  }
  
  // Cost bearer validation
  if (!form.discountCostBearer) newErrors.discountCostBearer = "Cost bearer is required";
  
  // Applies to validation
  if (!form.couponAppliesTo) newErrors.couponAppliesTo = "Coupon applies to is required";
  
  // Conditional validations based on discount type
  if (form.discountType === "Category Wise" && !form.category?._id) {
    newErrors.category = "Category selection is required";
  }
  
  if (form.discountType === "Service Wise" && !form.service?._id) {
    newErrors.service = "Service selection is required";
  }
  
  if (form.discountType === "Mixed" && (!form.category?._id || !form.service?._id)) {
    if (!form.category?._id) newErrors.category = "Category selection is required for mixed discount";
    if (!form.service?._id) newErrors.service = "Service selection is required for mixed discount";
  }
  
  // Customer validation for customerWise coupon type
  if (form.couponType === "customerWise" && !form.customer?._id) {
    newErrors.customer = "Customer selection is required for customer wise coupon";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
/* ─── error display component ──────────────────────────────── */  // <-- ADD HERE
const ErrorMessage = ({ message }: { message: string }) => (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
);
  /* ─── memoized options ────────────────────────────────────── */
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c._id ?? "",
        label: c.name,
      })),
    [categories]
  );

  const customersOptions = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.map((cus) => ({
      value: String(cus._id),
      label: cus.fullName,
    }));
  }, [customers]);

  const serviceOptions = useMemo(
    () =>
      subcategories
        .filter((sc) => sc.category?._id === (form.category as any)?._id)
        .map((sc) => ({ value: sc._id, label: sc.name })),
    [subcategories, form.category]
  );

  const zoneOptions = useMemo(
    () => zones
    .filter(z => z.isDeleted === false) 
    .map((z) => ({ value: z._id, label: z.name })),
    [zones]
  );

  /* ─── dynamic selects ─────────────────────────────────────── */
  const renderDynamicSelects = () => {
    const selects = [] as React.ReactElement[];

    if (form.discountType === "Category Wise" || form.discountType === "Mixed") {
      selects.push(
        <div key="category" className="md:col-span-2 relative">
          <Label>Select Category</Label>
          <Select
            options={categoryOptions}
            placeholder="Select category"
            value={form.category?._id}
            onChange={(val) => handleChange("category", val)}
            className="w-full dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      );
    }

    if (form.discountType === "Service Wise" || form.discountType === "Mixed") {
      selects.push(
        <div key="service" className="md:col-span-2 relative">
          <Label>Select Service</Label>
          <Select
            options={serviceOptions}
            placeholder="Select service"
            value={(form.service as any)?._id}
            onChange={(val) => handleChange("service", val)}
            className="w-full dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      );
    }

    selects.push(
      <div key="zone" className="md:col-span-2 relative">
        <Label>Select Zone</Label>
        <Select
          options={zoneOptions}
          placeholder="Select zone"
          value={form.zone?._id}
          onChange={(val) => handleChange("zone", val)}
          className="w-full dark:bg-dark-900"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDownIcon />
        </span>
      </div>
    );

    return selects;
  };

  /* ─── amount fields ───────────────────────────────────────── */
  const renderAmountFields = () => (
    <>
      <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
        <div>
          <Label>
            Amount&nbsp;
            {form.discountAmountType === "Percentage" ? "(%)" : "(₹)"}
          </Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.amount ?? ""}
            onChange={(e) => handleChange("amount", +e.target.value)}
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={form.startDate?.slice(0, 10) ?? ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={form.endDate?.slice(0, 10) ?? ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
        <div>
          <Label>Min&nbsp;Purchase&nbsp;(₹)</Label>
          <Input
            type="number"
            placeholder="Order amount to qualify"
            value={form.minPurchase ?? ""}
            onChange={(e) => handleChange("minPurchase", +e.target.value)}
          />
        </div>

        {form.discountAmountType === "Percentage" && (
          <div>
            <Label>Max Discount&nbsp;(₹)</Label>
            <Input
              type="number"
              placeholder="Upper cap"
              value={form.maxDiscount ?? ""}
              onChange={(e) => handleChange("maxDiscount", +e.target.value)}
            />
          </div>
        )}

        <div>
          <Label>Limit&nbsp;per&nbsp;User</Label>
          <Input
            type="number"
            placeholder="Uses allowed for same user"
            value={form.limitPerUser ?? ""}
            onChange={(e) => handleChange("limitPerUser", +e.target.value)}
          />
        </div>
      </div>
    </>
  );

  /* ─── ui ─────────────────────────────────────────────────── */
  return (
    <div className="w-full dark:bg-gray-900 ">
      <PageBreadcrumb pageTitle="Edit Coupon" />

      <ComponentCard title="Edit Coupon" className=" h-full">

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Coupon Type & Code */}
            <div className="relative">
              <Label>Select Coupon Type</Label>
              <Select
                options={couponTypeOptions}
                placeholder="Select coupon type"
                value={form.couponType}
                onChange={(val) => handleChange("couponType", val)}
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
                value={form.couponCode ?? ""}
                onChange={(e) => handleChange("couponCode", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-8">
              {form.couponType === "customerWise" && (
                <div className="w-full">
                  <Label>Select Customer</Label>
                  <Select
                    options={customersOptions}
                    placeholder="Select customer"
                    value={form.customer?._id}
                    onChange={(val) => handleChange("customer", val)}
                    className="w-full dark:bg-dark-900"
                  />
                </div>
              )}
            </div>

            {/* Discount Type */}
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
                value={form.discountTitle ?? ""}
                onChange={(e) => handleChange("discountTitle", e.target.value)}
              />
            </div>

            {/* Category / Service / Zone */}
            {renderDynamicSelects()}

            {/* Amount Type */}
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
                      onChange={() => handleChange("discountCostBearer", cb)}
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
                      checked={form.couponAppliesTo === ap}
                      onChange={() => handleChange("couponAppliesTo", ap)}
                      label={ap}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2 md:col-span-2">
             <Button
  variant="outline"
  size="sm"
  type="button"
  onClick={() => router.back()}
>
  Cancel
</Button>

              <Button size="sm" type="submit">
                Update Changes
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditCouponPage;
