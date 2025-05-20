import React, { useEffect, useState } from 'react'
import ComponentCard from '../common/ComponentCard'
import BasicDetailsForm from './BasicDetailsForm';
import ServiceDetailsForm from './ServiceDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';
import { useService } from '@/context/ServiceContext';

const AddNewService = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        basic: {
            name: '',
            category: '',
            subcategory: '',
            price: '',
            thumbnail: null,
            covers: [],
        },
        service: {
            benefits: '',
            overview: '',
            highlight: '',
            document: '',
            whyChoose: [],
            howItWorks: '',
            terms: '',
            faqs: [],
            rows: [],
        },
        franchise: {
            commission: '',
            overview: '',
            howItWorks: '',
            terms: '',
            rows: [],
        },
    });

    useEffect(()=>{
        console.log("formdata of console : ", formData)
    },[])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createService } = useService();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const buildFormData = (data: any, formDataInstance = new FormData(), parentKey = '') => {
        if (data && typeof data === 'object' && !(data instanceof File)) {
            Object.keys(data).forEach(key => {
                const value = data[key];
                const fullKey = parentKey ? `${parentKey}[${key}]` : key;
                buildFormData(value, formDataInstance, fullKey);
            });
        } else {
            formDataInstance.append(parentKey, data);
        }
        return formDataInstance;
    };


    const handleSubmit = async (e: any) => {
        setIsSubmitting(true);
        try {
            const fd = buildFormData(formData);
            await createService(fd);
            alert("Service added successfully!");
        } catch (err) {
            console.error("Failed to add service:", err);
            alert("Failed to add service");
        }
    };

    const getProgress = () => (step / 3) * 100;
    return (
        <div>
            <ComponentCard title="Add New Service">
                <div>
                    <div className="flex items-center justify-between mb-10 relative">
                        {['Basic', 'Service', 'Franchise'].map((label, index) => {
                            const stepNumber = index + 1;
                            const isCompleted = step > stepNumber;
                            const isActive = step === stepNumber;

                            return (
                                <div key={label} className="flex-1 flex flex-col items-center relative">
                                    {/* Line Between Steps (after the circle, not on first) */}
                                    {index !== 0 && (
                                        <div className="absolute top-5 left-[-50%] w-full h-1">
                                            <div
                                                className={`h-1 w-full ${step > stepNumber
                                                    ? 'bg-blue-600'
                                                    : step === stepNumber
                                                        ? 'bg-blue-600'
                                                        : 'bg-gray-300'
                                                    }`}
                                            ></div>
                                        </div>
                                    )}

                                    {/* Circle */}
                                    <div
                                        className={`z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300
            ${isCompleted
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : isActive
                                                    ? 'bg-white text-blue-600 border-blue-600'
                                                    : 'bg-white text-gray-400 border-gray-300'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            stepNumber
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`mt-2 text-sm text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>


                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 1 && (
                            <div>
                                <BasicDetailsForm data={formData.basic}
                                    setData={(newData) =>
                                        setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))
                                    } />
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <ServiceDetailsForm data={formData.service}
                                    setData={(newData) =>
                                        setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))
                                    } />
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <FranchiseDetailsForm data={formData.franchise}
                                    setData={(newData) =>
                                        setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))
                                    } />
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-between pt-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Previous
                                </button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </ComponentCard>
        </div>
    )
}

export default AddNewService