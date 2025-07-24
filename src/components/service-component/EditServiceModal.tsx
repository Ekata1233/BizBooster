// components/EditModuleModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/modal';
import ComponentCard from '../common/ComponentCard';
import BasicDetailsForm from './BasicDetailsForm';
import ServiceDetailsForm from './ServiceDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';
import { ServiceData } from '@/app/(admin)/service-management/service-list/page';

interface ExtraSection {
    title: string;
    description: string;
}

interface WhyChooseItem {
    _id?: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface KeyValue {
    key: string;
    value: string;
}

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceData | null;
    onUpdate: (id: string, updatedData: FormData) => void;
}

type FormDataType = {
    basic: {
        name: string;
        category: string;
        subcategory: string;
        price: number;
        discount?: number;
        thumbnail: File | null;
        thumbnailPreview?: string;
        bannerImages: File[];
        bannerPreviews?: string[];
        tags?: string[];
        keyValues?: KeyValue[];
    };
    service: {
        overview: string;
        highlight: File[] | FileList | null;  // <-- fix here
        benefits: string;
        howItWorks: string;
        terms: string;
        document: string;
        rows: ExtraSection[];
        whyChoose: WhyChooseItem[];
        faqs: FaqItem[];
    };
    franchise: {
        overview: string;
        commission: string;
        howItWorks: string;
        termsAndConditions: string;
        rows: ExtraSection[];
    };
};


const EditModuleModal: React.FC<EditServiceModalProps> = ({
    isOpen, onClose, service, onUpdate
}) => {
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);



    const [formData, setFormData] = useState<FormDataType>({
        basic: {
            name: '',
            category: '',
            subcategory: '',
            price: 0,
            discount: 0,
            thumbnail: null,
            bannerImages: [],
            tags: [],
            keyValues: [{ key: '', value: '' }],
        },
        service: {
            overview: '',
            highlight: null,  // OK, since highlight can be null too
            benefits: '',
            howItWorks: '',
            terms: '',
            document: '',
            rows: [],
            whyChoose: [],
            faqs: [],
        },
        franchise: {
            overview: '',
            commission: '',
            howItWorks: '',
            termsAndConditions: '',
            rows: [],
        },
    });


    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (isOpen && service && !hasInitialized) {
            console.log("service in edit modal : ", service)

            const mappedKeyValues = Array.isArray(service.keyValues) && service.keyValues.length > 0
                ? service.keyValues.map(({ key, value }) => ({ key, value }))
                : [{ key: '', value: '' }];
            console.log("Mapped keyValues:", mappedKeyValues);
            setFormData({
                basic: {
                    name: service.name || '',
                    category: service.category._id || '',
                    subcategory: service.subcategory._id || '',
                    price: service.price,
                    discount: service.discount || 0,
                    thumbnail: null,
                    thumbnailPreview: service.thumbnailImage || '',
                    bannerImages: [],
                    bannerPreviews: service.bannerImages || [],
                    tags: service.tags || [],
                    keyValues: Array.isArray(service.keyValues) && service.keyValues.length > 0
                        ? service.keyValues.map(({ key, value }) => ({ key, value }))
                        : [{ key: '', value: '' }],

                },
                service: {
                    overview: service.serviceDetails.overview,
                    highlight: service.serviceDetails.highlight || null,
                    benefits: service.serviceDetails.benefits,
                    howItWorks: service.serviceDetails.howItWorks,
                    terms: service.serviceDetails.termsAndConditions,
                    document: service.serviceDetails.document,
                    rows: service.serviceDetails.row || [],
                    whyChoose: service.serviceDetails.whyChoose
                        ? service.serviceDetails.whyChoose.map(item => ({ _id: item._id }))
                        : [],
                    faqs: service.serviceDetails.faq || [],
                },
                franchise: {
                    overview: service.franchiseDetails?.overview || '',
                    commission: service.franchiseDetails?.commission || '',
                    howItWorks: service.franchiseDetails?.howItWorks || '',
                    termsAndConditions: service.franchiseDetails?.termsAndConditions || '',
                    rows: service.franchiseDetails?.extraSections || [],
                },
            });

            if (service.name && service.category?._id && service.subcategory?._id && service.price) {
                setCompletedSteps([1]);
            }

            setHasInitialized(true); // Ensure it runs only once per modal open
        }
    }, [isOpen, service, hasInitialized]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasInitialized(false);
        }
    }, [isOpen]);



    const isStepComplete = (stepNumber: number): boolean => {
        switch (stepNumber) {
            case 1:
                return (
                    !!formData.basic.name.trim() &&
                    formData.basic.category !== '' &&
                    formData.basic.price >= 0
                );
            case 2:
                return (
                    !!formData.service.overview.trim() &&
                    !!formData.service.benefits.trim() &&
                    !!formData.service.howItWorks.trim() &&
                    // !!formData.service.terms.trim() &&
                    !!formData.service.document.trim()
                );
            case 3:
                return (
                    !!formData.franchise.overview.trim() &&
                    !!formData.franchise.commission &&
                    !!formData.franchise.howItWorks.trim() &&
                    !!formData.franchise.termsAndConditions.trim()
                );
            default:
                return false;
        }
    };

    const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isStepComplete(step)) {
            alert(`Please complete all required fields in step ${step}`);
            return;
        }
        if (!completedSteps.includes(step)) {
            setCompletedSteps([...completedSteps, step]);
        }
        if (step < 3) setStep(step + 1);
    };

    const prevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !isStepComplete(3)) return;

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();

            // Append basic details
            formDataToSend.append('name', formData.basic.name);
            formDataToSend.append('category', formData.basic.category);
            formDataToSend.append('subcategory', formData.basic.subcategory);
            formDataToSend.append('price', formData.basic.price.toString());
            if (formData.basic.discount !== undefined) {
                formDataToSend.append('discount', formData.basic.discount.toString());
            }

            if (formData.basic.thumbnail) {
                formDataToSend.append('thumbnailImage', formData.basic.thumbnail);
            }
            formData.basic.bannerImages.forEach((file) => {
                formDataToSend.append(`bannerImages`, file);
            });

            // Append service details
            formDataToSend.append('serviceDetails[overview]', formData.service.overview);
            if (formData.service.highlight) {
                // if highlight is FileList or File[]
                const filesArray = Array.isArray(formData.service.highlight)
                    ? formData.service.highlight
                    : Array.from(formData.service.highlight);

                filesArray.forEach((file, index) => {
                    formDataToSend.append(`serviceDetails[highlight][${index}]`, file);
                });
            } else {
                // if highlight is null, you might want to skip or append empty string
                // formDataToSend.append('serviceDetails[highlight]', '');
            }

            formDataToSend.append('serviceDetails[benefits]', formData.service.benefits);
            formDataToSend.append('serviceDetails[howItWorks]', formData.service.howItWorks);
            formDataToSend.append('serviceDetails[termsAndConditions]', formData.service.terms);
            formDataToSend.append('serviceDetails[document]', formData.service.document);

            // Append service arrays
            formData.service.rows.forEach((section, index) => {
                formDataToSend.append(`serviceDetails[extraSections][${index}][title]`, section.title);
                formDataToSend.append(`serviceDetails[extraSections][${index}][description]`, section.description);
            });

            formData.service.whyChoose.forEach((item, index) => {
                if (item._id) {
                    formDataToSend.append(`serviceDetails[whyChoose][${index}][_id]`, item._id);
                }
            });


            formData.service.faqs.forEach((item, index) => {
                formDataToSend.append(`serviceDetails[faq][${index}][question]`, item.question);
                formDataToSend.append(`serviceDetails[faq][${index}][answer]`, item.answer);
            });

            // Append franchise details
            formDataToSend.append('franchiseDetails[overview]', formData.franchise.overview);
            formDataToSend.append('franchiseDetails[commission]', String(formData.franchise.commission));

            formDataToSend.append('franchiseDetails[howItWorks]', formData.franchise.howItWorks);
            formDataToSend.append('franchiseDetails[termsAndConditions]', formData.franchise.termsAndConditions);

            formData.franchise.rows.forEach((section, index) => {
                formDataToSend.append(`franchiseDetails[extraSections][${index}][title]`, section.title);
                formDataToSend.append(`franchiseDetails[extraSections][${index}][description]`, section.description);
            });

            // Append service ID
            formDataToSend.append('serviceId', service.id);

            await onUpdate(service.id, formDataToSend);

            // Show success alert
            alert('Service updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Failed to update service. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[750px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 max-h-[650px]">
                <ComponentCard title="Edit Service">
                    <div>
                        <div className="flex items-center justify-between mb-10 relative">
                            {['Basic', 'Service', 'Franchise'].map((label, index) => {
                                const stepNumber = index + 1;
                                const isCompleted = completedSteps.includes(stepNumber) || step > stepNumber;
                                const isActive = step === stepNumber;

                                return (
                                    <div key={label} className="flex-1 flex flex-col items-center relative">
                                        {index !== 0 && (
                                            <div className="absolute top-5 left-[-50%] w-full h-1">
                                                <div
                                                    className={`h-1 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                ></div>
                                            </div>
                                        )}

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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {step === 1 && (
                                <BasicDetailsForm
                                    data={formData.basic}
                                    setData={(newData) =>
                                        setFormData(prev => ({ ...prev, basic: { ...prev.basic, ...newData } }))
                                    }
                                />
                            )}

                            {step === 2 && (
                                <ServiceDetailsForm
                                    data={formData.service}
                                    setData={(newData) =>
                                        setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))
                                    }
                                />
                            )}

                            {step === 3 && (
                                <FranchiseDetailsForm
                                    data={formData.franchise}
                                    setData={(newData) =>
                                        setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))
                                    }
                                       price={formData.basic?.price}
                                       
                                />
                            )}

                            <div className="flex justify-between pt-4">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Previous
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!isStepComplete(step) && !completedSteps.includes(step)}
                                        className={`ml-auto px-4 py-2 text-white rounded ${(isStepComplete(step) || completedSteps.includes(step))
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!isStepComplete(3) || isSubmitting}
                                        className={`ml-auto px-4 py-2 text-white rounded ${isStepComplete(3)
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </ComponentCard>
            </div>
        </Modal>
    );
};

export default EditModuleModal;
