"use client"
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import { useModule } from '@/context/ModuleContext';
import { useProvider } from '@/context/ProviderContext';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const centerDefault = {
  lat: 18.501426841362647,
  lng: 73.88318878735599,
};

const identityTypes = [
  'Passport',
  'Driver License',
  'National ID',
  'Other',
];

const AddProvider = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [markerPosition, setMarkerPosition] = useState(centerDefault);
  const { modules } = useModule();
  const { createProvider } = useProvider();


  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setValue('latitude', lat);
      setValue('longitude', lng);
    }
  }, [setValue]);

  const onSubmit = (data: any) => {
    console.log('Form Data:', data);
    alert('Form submitted! Check console for data.');
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="container mx-auto p-4">
      <ComponentCard title="Add New Provider">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information - Full width row */}
          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-100 text-blue-700">
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Name</Label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input-field"
                  type="text"
                  placeholder="Provider Name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  className="input-field"
                  type="tel"
                  placeholder="Phone Number"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  className="input-field"
                  type="email"
                  placeholder="Email Address"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Address</Label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  className="input-field"
                  type="text"
                  placeholder="Address"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Zone</Label>
                <select
                  {...register('zone', { required: 'Zone is required' })}
                  className="input-field"
                >
                  <option value="">Select Zone</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
                {errors.zone && <p className="text-red-600 text-sm mt-1">{errors.zone.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Company Logo</Label>
                <input
                  {...register('companyLogo')}
                  type="file"
                  accept="image/*"
                  className="input-field"
                />
              </div>
            </div>
          </section>

          {/* Business and Account Information in one row (2 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Information */}
            <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-purple-100 text-purple-700">
                Business Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Select Module</label>
                  <select
                    {...register('moduleId', { required: 'Module selection is required' })}
                    className="input-field"
                  >
                    <option value="">Select a Module</option>
                    {modules.map((module) => (
                      <option key={module._id} value={module._id}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                  {errors.moduleId && <p className="text-red-600 text-sm mt-1">{errors.moduleId.message}</p>}
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identity Type</Label>
                  <select
                    {...register('identityType', { required: 'Select identity type' })}
                    className="input-field"
                    defaultValue=""
                  >
                    <option value="" disabled>Select identity type</option>
                    {identityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.identityType && <p className="text-red-600 text-sm mt-1">{errors.identityType.message}</p>}
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identity Number</Label>
                  <input
                    {...register('identityNumber', { required: 'Identity number is required' })}
                    className="input-field"
                    type="text"
                    placeholder="Identity Number"
                  />
                  {errors.identityNumber && <p className="text-red-600 text-sm mt-1">{errors.identityNumber.message}</p>}
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identification Image</Label>
                  <input
                    {...register('identificationImage')}
                    type="file"
                    accept="image/*"
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Account Information */}
            <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-yellow-100 text-yellow-700">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Name</Label>
                  <input
                    {...register('accountName', { required: 'Account name required' })}
                    className="input-field"
                    type="text"
                    placeholder="Account Name"
                  />
                  {errors.accountName && <p className="text-red-600 text-sm mt-1">{errors.accountName.message}</p>}
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                  <input
                    {...register('accountEmail', {
                      required: 'Account email required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                    })}
                    className="input-field"
                    type="email"
                    placeholder="Account Email"
                  />
                  {errors.accountEmail && <p className="text-red-600 text-sm mt-1">{errors.accountEmail.message}</p>}
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                  <input
                    {...register('accountPhone', { required: 'Account phone required' })}
                    className="input-field"
                    type="tel"
                    placeholder="Account Phone"
                  />
                  {errors.accountPhone && <p className="text-red-600 text-sm mt-1">{errors.accountPhone.message}</p>}
                </div>

                {/* Password and Confirm Password Side-by-Side */}
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <Label className="block mb-1 font-medium text-gray-700">Password</Label>
                    <input
                      {...register('accountPassword', { required: 'Password required' })}
                      className="input-field"
                      type="password"
                      placeholder="Password"
                    />
                    {errors.accountPassword && <p className="text-red-600 text-sm mt-1">{errors.accountPassword.message}</p>}
                  </div>
                  <div className="w-1/2">
                    <Label className="block mb-1 font-medium text-gray-700">Confirm Password</Label>
                    <input
                      {...register('confirmPassword', {
                        required: 'Confirm password required',
                        validate: (value) => value === watch('accountPassword') || 'Passwords do not match',
                      })}
                      className="input-field"
                      type="password"
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>
            </section>

          </div>

          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-green-100 text-green-700">
              Contact Person
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Contact Person Name</Label>
                <input
                  {...register('contactPersonName', { required: 'Contact person name required' })}
                  className="input-field"
                  type="text"
                  placeholder="Contact Person Name"
                />
                {errors.contactPersonName && <p className="text-red-600 text-sm mt-1">{errors.contactPersonName.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                <input
                  {...register('contactPersonPhone', { required: 'Contact person phone required' })}
                  className="input-field"
                  type="tel"
                  placeholder="Contact Person Phone"
                />
                {errors.contactPersonPhone && <p className="text-red-600 text-sm mt-1">{errors.contactPersonPhone.message}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                <input
                  {...register('contactPersonEmail', {
                    required: 'Contact person email required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className="input-field"
                  type="email"
                  placeholder="Contact Person Email"
                />
                {errors.contactPersonEmail && <p className="text-red-600 text-sm mt-1">{errors.contactPersonEmail.message}</p>}
              </div>
            </div>
          </section>

          {/* Map Section - Full width */}
          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-red-100 text-red-700">
              Select Address from Map
            </h2>
            <p className="mb-2 text-gray-600">
              Click on the map to select the location. The latitude and longitude will be captured.
            </p>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition}
              zoom={12}
              onClick={onMapClick}
            >
              <Marker position={markerPosition} />
            </GoogleMap>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Latitude</Label>
                <input
                  {...register('latitude', { required: true })}
                  type="number"
                  step="any"
                  className="input-field"
                  readOnly
                  value={markerPosition.lat}
                />
              </div>
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Longitude</Label>
                <input
                  {...register('longitude', { required: true })}
                  type="number"
                  step="any"
                  className="input-field"
                  readOnly
                  value={markerPosition.lng}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition shadow-md"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background-color: white;
        }
        .input-field:hover {
          border-color: #a0aec0;
        }
        .input-field:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AddProvider;