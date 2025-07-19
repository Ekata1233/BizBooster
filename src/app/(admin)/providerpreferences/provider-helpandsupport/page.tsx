"use client"
import React, { useState } from 'react';
import axios from 'axios';


interface FormData {
  email: string;
  call: string;
  whatsapp: string;
}


interface FormErrors {
  email?: string;
  call?: string;
  whatsapp?: string;
}

const ProviderContactForm: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({
    email: '',
    call: '',
    whatsapp: '',
  });


  const [errors, setErrors] = useState<FormErrors>({});

  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
    setSubmissionMessage(null);
  };


  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};


    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }


    if (!formData.call) {
      newErrors.call = 'Call number is required.';
    } else if (!/^\d{10,15}$/.test(formData.call)) {
      newErrors.call = 'Call number must be 10-15 digits.';
    }


    if (!formData.whatsapp) {
      newErrors.whatsapp = 'WhatsApp number is required.';
    } else if (!/^\d{10,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp number must be 10-15 digits.';
    }

    return newErrors;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage(null);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {

      try {

        const response = await axios.post('/api/providerhelpandsupport', formData);

        const result = response.data;

        if (result.success) {
          setSubmissionMessage(result.message || 'Form submitted successfully!');
          setIsSuccess(true);
          setFormData({ email: '', call: '', whatsapp: '' });
        } else {
          setSubmissionMessage(result.message || 'Failed to submit form. Please try again.');
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('Submission error:', error);

        if (axios.isAxiosError(error) && error.response) {
          setSubmissionMessage(error.response.data.message || 'Failed to submit form. Please try again.');
        } else {
          setSubmissionMessage('An unexpected error occurred. Please try again later.');
        }
        setIsSuccess(false);
      }
    } else {
      setSubmissionMessage('Please correct the errors in the form.');
      setIsSuccess(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
    //   <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
    //     <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
    //       Provider Help & Support
    //     </h2>

    //     {submissionMessage && (
    //       <div
    //         className={`p-3 mb-4 rounded-md text-sm ${
    //           isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    //         }`}
    //       >
    //         {submissionMessage}
    //       </div>
    //     )}

    //     <form onSubmit={handleSubmit} className="space-y-5">
    //       <div>
    //         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
    //           Email
    //         </label>
    //         <input
    //           type="email"
    //           id="email"
    //           name="email"
    //           value={formData.email}
    //           onChange={handleChange}
    //           className={`mt-1 block w-full px-4 py-2 border ${
    //             errors.email ? 'border-red-500' : 'border-gray-300'
    //           } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
    //           placeholder="you@example.com"
    //         />
    //         {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
    //       </div>

    //       <div>
    //         <label htmlFor="call" className="block text-sm font-medium text-gray-700 mb-1">
    //           Call Number
    //         </label>
    //         <input
    //           type="tel" 
    //           id="call"
    //           name="call"
    //           value={formData.call}
    //           onChange={handleChange}
    //           className={`mt-1 block w-full px-4 py-2 border ${
    //             errors.call ? 'border-red-500' : 'border-gray-300'
    //           } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
    //           placeholder="e.g., 9876543210"
    //         />
    //         {errors.call && <p className="mt-1 text-sm text-red-600">{errors.call}</p>}
    //       </div>

    //       <div>
    //         <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
    //           WhatsApp Number
    //         </label>
    //         <input
    //           type="tel"
    //           id="whatsapp"
    //           name="whatsapp"
    //           value={formData.whatsapp}
    //           onChange={handleChange}
    //           className={`mt-1 block w-full px-4 py-2 border ${
    //             errors.whatsapp ? 'border-red-500' : 'border-gray-300'
    //           } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
    //           placeholder="e.g., 9876543210"
    //         />
    //         {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>}
    //       </div>

    //       <button
    //         type="submit"
    //         className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
    //       >
    //         Submit
    //       </button>
    //     </form>
    //   </div>
    // </div>

    <div className="min-h-screen w-full  flex flex-col">
     
      <div className=" p-6 text-center shadow-md">
        <h2 className="text-3xl font-bold text-black">Provider Help & Support</h2>
        <p className="text-gray-500 mt-2 text-sm">Fill out the details below and we’ll get in touch!</p>
      </div>

    
      <div className="flex-1 flex justify-start items-start p-8">
        <div className=" w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 p-10">
          
          {submissionMessage && (
            <div
              className={`p-3 mb-6 rounded-md text-sm font-medium ${isSuccess
                  ? 'bg-green-50 text-green-700 border border-green-300'
                  : 'bg-red-50 text-red-700 border border-red-300'
                }`}
            >
              {submissionMessage}
            </div>
          )}

        
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
            <div className="flex flex-col">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

         
            <div className="flex flex-col">
              <label htmlFor="call" className="block text-sm font-semibold text-gray-700 mb-2">
                Call Number
              </label>
              <input
                type="tel"
                id="call"
                name="call"
                value={formData.call}
                onChange={handleChange}
                placeholder="e.g., 9876543210"
                className={`w-full px-4 py-3 rounded-lg border ${errors.call ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              />
              {errors.call && <p className="mt-1 text-xs text-red-600">{errors.call}</p>}
            </div>

           
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="e.g., 9876543210"
                className={`w-full px-4 py-3 rounded-lg border ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              />
              {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
            </div>

         
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-1/3 py-3 px-6 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>


  );
};

export default ProviderContactForm;
