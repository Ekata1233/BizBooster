"use client";
import * as React from "react";
import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Radio from "@/components/form/input/Radio";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon } from "@/icons";
import { useCategory } from "@/context/CategoryContext";
import { useService } from "@/context/ServiceContext";
import { useZone } from "@/context/ZoneContext";
import { useCoupon } from "@/context/CouponContext";
import { useServiceCustomer } from "@/context/ServiceCustomerContext";
import { useUserContext } from "@/context/UserContext";

const couponTypeOptions = [
    { value: "default", label: "Default" },
    { value: "firstBooking", label: "First Booking" },
    { value: "customerWise", label: "Customer Wise" },
] as const;
type DiscountType = "Category Wise" | "Service Wise" | "Mixed";
const discountTypes: DiscountType[] = ["Category Wise", "Service Wise", "Mixed"];
type AmountType = "Percentage" | "Fixed Amount";
const amountTypes: AmountType[] = ["Percentage", "Fixed Amount"];
const costBearers = ["Admin", "Provider"] as const;
const appliesTo = ["Growth Partner", "Customer"] as const;
type CostBearer = typeof costBearers[number];
type AppliesTo = typeof appliesTo[number];

type Option = {
    value: string;
    label: string;
};
const AddCouponPage = () => {
    const { addCoupon } = useCoupon();
    const { customers } = useServiceCustomer();
    const { users } = useUserContext();
    const { categories } = useCategory();
    const { services } = useService();
    const { zones } = useZone();
    // const customersOptions: Option[] = customers?.map(cus => ({
    //     value: String(cus._id), // ensure it's a string
    //     label: cus.fullName,
    // })) ?? [];  
    const customersOptions: Option[] = Array.isArray(customers)
        ? customers.map(cus => ({
            value: String(cus._id),
            label: cus.fullName,
        }))
        : [];

    const usersOptions: Option[] = Array.isArray(users)
        ? users.map(cus => ({
            value: String(cus._id),
            label: cus.fullName,
        }))
        : [];
    // const categoryOptions = categories?.map(c => ({ value: c._id, label: c.name })) ?? [];
    const categoryOptions = categories?.map(c => ({
        value: c._id ?? "",  // ensure it's never undefined
        label: c.name
    })) ?? [];
    const serviceOptions = services?.map(s => ({ value: s._id, label: s.serviceName })) ?? [];
    const zoneOptions = zones
  ?.filter(z => z.isDeleted === false)
  .map(z => ({ value: z._id, label: z.name })) ?? [];


    const [form, setForm] = useState({
        couponType: "",
        couponCode: "",
        customer: "",
        discountType: "Category Wise" as DiscountType,
        discountTitle: "",
        category: "",
        service: "",
        zone: "",
        discountAmountType: "Percentage" as AmountType,
        amount: "",
        startDate: "",
        endDate: "",
        minPurchase: "",
        maxDiscount: "",
        limitPerUser: "",
        discountCostBearer: "Admin" as CostBearer,
        couponAppliesTo: "Growth Partner" as AppliesTo,
    });
    const handleChange = <K extends keyof typeof form>(
        field: K,
        value: typeof form[K]
    ) => setForm(prev => ({ ...prev, [field]: value }));
    const handleDiscountTypeChange = (type: DiscountType) =>
        setForm(prev => ({
            ...prev,
            discountType: type,
            category: type === "Service Wise" ? "" : prev.category,
            service: type === "Category Wise" ? "" : prev.service,
        }));
    const handleAmountTypeChange = (type: AmountType) =>
        setForm(prev => ({
            ...prev,
            discountAmountType: type,
            maxDiscount: type === "Percentage" ? prev.maxDiscount : "",
        }));
    const handleSubmit = async () => {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (v !== "") fd.append(k, v as string);
            // if (k === "customer" && form.couponType !== "customerWise") return;
            // fd.append(k, typeof v === "object" ? v.value ?? "" : v as string);
        });

        try {
            const res = await addCoupon(fd); // Make sure this returns a proper JSON response

            // ✅ Check if response indicates success
            if (res?.success) {
                alert("Coupon added!");
                setForm({
                    couponType: "",
                    couponCode: "",
                    customer: "",
                    discountType: "Category Wise",
                    discountTitle: "",
                    category: "",
                    service: "",
                    zone: "",
                    discountAmountType: "Percentage",
                    amount: "",
                    startDate: "",
                    endDate: "",
                    minPurchase: "",
                    maxDiscount: "",
                    limitPerUser: "",
                    discountCostBearer: "Admin",
                    couponAppliesTo: "Growth Partner",
                });
            } else {
                // ❌ Show backend error message
                alert(res?.message || "Something went wrong");
            }
        } catch (err) {
            console.error("Error saving coupon:", err);
            alert("Failed to create coupon");
        }
    };

    console.log("users in to the cooupon : ", usersOptions)

    const renderDynamicSelects = () => {
        const selects = [] as React.ReactElement[];

        if (form.discountType === "Category Wise" || form.discountType === "Mixed") {
            selects.push(
                <div key="category" className="md:col-span-2">
                    <Label>Select Category</Label>
                    <Select
                        options={categoryOptions}
                        placeholder="Select category"
                        value={form.category}
                        onChange={val => handleChange("category", val)}
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
                <div key="service" className="md:col-span-2">
                    <Label>Select Service</Label>
                    <Select
                        options={serviceOptions}
                        placeholder="Select service"
                        value={form.service}
                        onChange={val => handleChange("service", val)}
                        className="w-full dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <ChevronDownIcon />
                    </span>
                </div>
            );
        }
        selects.push(
            <div key="zone" className="md:col-span-2">
                <Label>Select Zone</Label>
                <Select
                    options={zoneOptions}
                    placeholder="Select zone"
                    value={form.zone}
                    onChange={val => handleChange("zone", val)}
                    className="w-full dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 mt-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                </span>
            </div>
        );
        return selects;
    };
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
                        value={form.amount}
                        onChange={e => handleChange("amount", e.target.value)}
                    />
                </div>
                <div>
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={form.startDate}
                        onChange={e => handleChange("startDate", e.target.value)}
                    />
                </div>
                <div>
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        value={form.endDate}
                        onChange={e => handleChange("endDate", e.target.value)}
                    />
                </div>
            </div>
            <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
                <div>
                    <Label>Min&nbsp;Purchase&nbsp;(₹)</Label>
                    <Input
                        type="number"
                        placeholder="Order amount to qualify"
                        value={form.minPurchase}
                        onChange={e => handleChange("minPurchase", e.target.value)}
                    />
                </div>
                {form.discountAmountType === "Percentage" && (
                    <div>
                        <Label>Max Discount&nbsp;(₹)</Label>
                        <Input
                            type="number"
                            placeholder="Upper cap"
                            value={form.maxDiscount}
                            onChange={e => handleChange("maxDiscount", e.target.value)}
                        />
                    </div>
                )}
                <div>
                    <Label>Limit&nbsp;per&nbsp;User</Label>
                    <Input
                        type="number"
                        placeholder="Uses allowed for same user"
                        value={form.limitPerUser}
                        onChange={e => handleChange("limitPerUser", e.target.value)}
                    />
                </div>
            </div>
        </>
    );
    return (
        <div>
            <PageBreadcrumb pageTitle="Add Coupon" />
            <ComponentCard title="Add New Coupon">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative">
                        <Label>Select Coupon Type</Label>
                        <Select
                            options={[...couponTypeOptions]} // Convert readonly to mutable
                            placeholder="Select coupon type"
                            value={form.couponType}
                            onChange={val => handleChange("couponType", val)}
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
                            value={form.couponCode}
                            onChange={e => handleChange("couponCode", e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap items-center gap-8">
                        {form.couponType === "customerWise" && (
                            <div className="w-full">            {/* or: basis-full */}
                                <Label>Select User</Label>
                                <Select
                                    options={usersOptions}
                                    placeholder="Select User"
                                    value={form.customer}
                                    onChange={val => handleChange("customer", val)}
                                    className="w-full dark:bg-dark-900"
                                />

                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 flex flex-wrap items-center gap-8">
                        <Label>Discount Type</Label>
                        {discountTypes.map((type, idx) => (
                            <Radio
                                key={idx}
                                id={`discountType-${idx}`}
                                name="discountType"
                                value={type}
                                checked={form.discountType === type}
                                onChange={() => handleDiscountTypeChange(type)}
                                label={type}
                            />
                        ))}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Discount Title</Label>
                        <Input
                            type="text"
                            placeholder="Enter discount title"
                            value={form.discountTitle}
                            onChange={e => handleChange("discountTitle", e.target.value)}
                        />
                    </div>
                    {renderDynamicSelects()}
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
                    {renderAmountFields()}
                    <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                        <div className="flex flex-wrap items-center gap-6">
                            <Label>Discount Cost&nbsp;Bearer</Label>
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
                        <div className="flex flex-wrap items-center gap-6">
                            <Label>Coupon&nbsp;Applies&nbsp;To</Label>
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
                    <div className="md:col-span-2">
                        <Button size="sm" variant="primary" onClick={handleSubmit}>
                            Add Coupon
                        </Button>
                    </div>
                </div>
            </ComponentCard>
        </div>
    );
};

export default AddCouponPage;

