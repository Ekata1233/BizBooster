"use client"
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import { useModule } from '@/context/ModuleContext';
import { useProvider } from '@/context/ProviderContext';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';
import FileInput from '@/components/form/input/FileInput';

type ModuleType = {
  _id: string;
  name: string;
};
const containerStyle = {
  width: '100%',
  height: '300px',
};
 const [markerPosition, setMarkerPosition] = useState({
    lat: 0,
    lng: 0,
  });
const centerDefault = {
  lat: 18.501426841362647,
  lng: 73.88318878735599,
};



const zoneOptions = [
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "south", label: "South" },
  { value: "north", label: "North" },
  { value: "central", label: "Central" },
];

const idOptions = [
  { value: "passport", label: "Passport" },
  { value: "drivingLicense", label: "Driving License" },
  { value: "other", label: "Other" },
];

const AddProvider = () => {
  const { handleSubmit, setValue, formState: { } } = useForm();
  const [markerPosition, setMarkerPosition] = useState(centerDefault);
  const { modules } = useModule();
  const { createProvider } = useProvider();
  const [companyName, setCompanyName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setSort] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [identityType, setId] = useState('');
  const [identity, setIdentityNo] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
const [ setLatitude] = useState<number>(0);

 const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLat = parseFloat(e.target.value) || 0; // Fallback to 0 if input is empty
    setLatitude(newLat); // update separate latitude (if you want to track it separately)
    setMarkerPosition((prev) => ({
      ...prev,
      lat: newLat, // also update in markerPosition object
    }));
  };
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


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Fix: safe access
    if (file) {
      setLogo(file);
    }
  };

  const handleSelectModule = (selected: string) => {
    setSelectedModule(selected);
  };


  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdImage(e.target.files[0]);
    }
  };

  const onSubmit = async () => {
    try {
      const providerData = {
        companyName,
        phoneNo,
        email,
        address,
        zone,
        logo,
        selectedModule,
        identityType,
        identity,
        idImage,
        accountEmail,
        accountPhone,
        password,
        confirmPassword,
        contactName,
        contactPhone,
        contactEmail,
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
      };

      console.log("Provider Data:", providerData);

      // Check for basic validation (example)
      if (!companyName || !email || !phoneNo || !password || !confirmPassword) {
        alert("Please fill all required fields.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // Convert providerData object to FormData
      const formData = new FormData();

      Object.entries(providerData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      await createProvider(formData); // Make sure this is a promise
      alert("Provider registered successfully!");
    } catch (error) {
      console.error("Error while registering provider:", error);
      alert("An error occurred while registering the provider. Please try again.");
    }
  };



  const options = modules.map((mod: ModuleType) => ({
    value: mod._id,
    label: mod.name,
  }));

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
                <Input
                  type="text"
                  placeholder="Enter Company / Individual Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                <Input
                  type="number"
                  placeholder="Enter Phone No"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Address</Label>
                <Input
                  type="text"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Zone</Label>
                <div className="relative">
                  <Select
                    options={zoneOptions}
                    placeholder="Select Zone"
                    onChange={(value) => setSort(value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Company Logo</Label>
                <FileInput onChange={handleLogoChange} className="custom-class" />
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
                  <div className="relative">
                    <Select
                      options={options}
                      placeholder="Select Module"
                      onChange={handleSelectModule}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identity Type</Label>
                  <div className="relative">
                    <Select
                      options={idOptions}
                      placeholder="Select Identity Type"
                      onChange={(value) => setId(value)}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identity Number</Label>
                  <Input
                    type="number"
                    placeholder="Enter Indentity Number"
                    value={identity}
                    onChange={(e) => setIdentityNo(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Identification Image</Label>
                  <FileInput onChange={handleIdImageChange} />

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
                  <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter Account Email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                  <Input
                    type="number"
                    placeholder="Enter Account Phone No"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                  />
                </div>

                {/* Password and Confirm Password Side-by-Side */}

                <div className="w-1/2">
                  <Label className="block mb-1 font-medium text-gray-700">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <Label className="block mb-1 font-medium text-gray-700">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
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
                <Input
                  type="text"
                  placeholder="Enter Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                <Input
                  type="text"
                  placeholder="Enter Phone No"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
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
      <Input
        type="number"
        placeholder="Enter Latitude"
        value={markerPosition.lat}
        onChange={handleLatitudeChange}
      />
    </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Longitude</Label>
                <Input
                  type="number"
                  placeholder="Enter Longitude"
                  value={markerPosition.lng}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />


                {/* <input
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
                /> */}
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