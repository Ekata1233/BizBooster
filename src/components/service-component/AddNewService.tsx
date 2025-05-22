import React, { useState } from 'react';
import ComponentCard from '../common/ComponentCard';
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createService } = useService();

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isNotEmpty = (value: any) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== '';
  };

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          !!formData?.basic?.name?.trim() &&
          !!formData?.basic?.category &&
          !!formData?.basic?.subcategory
        );
      case 2:
        return (
          !!formData?.service?.benefits?.trim() &&
          !!formData?.service?.overview?.trim() &&
          !!formData?.service?.howItWorks?.trim() &&
          !!formData?.service?.highlight?.trim() &&
          !!formData?.service?.document?.trim() &&
          !!formData?.service?.terms?.trim() &&
          !!formData?.service?.faqs &&
          !!formData?.service?.whyChoose
        );
      case 3:
        return (
          !!formData?.franchise?.commission?.trim() &&
          !!formData?.franchise?.overview?.trim() &&
          !!formData?.franchise?.howItWorks?.trim() &&
          !!formData?.franchise?.terms?.trim()
        );
      default:
        return false;
    }
  };



  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent page refresh on click

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
    e.preventDefault(); // Prevent page refresh on click
    if (step > 1) setStep(step - 1);
  };

  const buildFormData = (data: any, formDataInstance = new FormData(), parentKey = '') => {
    if (data && typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        buildFormData(value, formDataInstance, fullKey);
      });
    } else {
      formDataInstance.append(parentKey, data);
    }
    return formDataInstance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submit reload

    if (!isStepComplete(3)) {
      alert("Please complete all steps before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = buildFormData(formData);
      await createService(fd);
      alert("Service added successfully!");
      setFormData({
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
      setStep(1);
      setCompletedSteps([]);
    } catch (err) {
      console.error("Failed to add service:", err);
      alert("Failed to add service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ComponentCard title="Add New Service">
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
                  setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))
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
              />
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <button
                  type="button" // important: prevent form submit on click
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
                  type="button" // important: prevent form submit on click
                  onClick={nextStep}
                  disabled={!isStepComplete(step)}
                  className={`ml-auto px-4 py-2 text-white rounded ${isStepComplete(step)
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
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </ComponentCard>
    </div>
  );
};

export default AddNewService;
