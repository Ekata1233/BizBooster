import React, { useState } from 'react'
import ComponentCard from '../common/ComponentCard'

const AddNewService = () => {
    const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    basic: '',
    service: '',
    franchise: '',
  });

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    alert("Form Submitted!\n" + JSON.stringify(formData, null, 2));
  };

  const getProgress = () => (step / 3) * 100;
    return (
        <div>
            <ComponentCard title="Add New Service">
                <div>
                    <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
          <span>Basic</span>
          <span>Service</span>
          <span>Franchise</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <p className="text-center text-sm mt-2 text-gray-500">Step {step} of 3</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div>
            <label className="block font-medium mb-1">Basic Info</label>
            <input
              type="text"
              name="basic"
              value={formData.basic}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter basic info"
              required
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block font-medium mb-1">Service Info</label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter service info"
              required
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block font-medium mb-1">Franchise Info</label>
            <input
              type="text"
              name="franchise"
              value={formData.franchise}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter franchise info"
              required
            />
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