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
  const [latitude, setLatitude] = useState<number>(0);
  console.log(latitude);
  const [activeTab, setActiveTab] = useState("Home");


  const handleLongitudeChange = (e) => {
    setMarkerPosition((prev) => ({
      ...prev,
      lng: parseFloat(e.target.value),
    }));
  };
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Full Name</Label>
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
                <Label className="block mb-1 font-medium text-gray-700">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Enter Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Referral Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter Referral Code"
                />
              </div>
            </div>
          </section>


          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-green-100 text-green-700">
              Store Info
            </h2>

            {/* Main grid for 2-cols layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Name</Label>
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

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Select Module</Label>
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
                <Label className="block mb-1 font-medium text-gray-700">Store Logo</Label>
                <FileInput onChange={handleLogoChange} className="custom-class" />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Store Cover Image</Label>
                <FileInput className="custom-class" />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Vat/Tax</Label>
                <Input
                  type="text"
                  placeholder="Enter Vat/Tax"
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
                <Label className="block mb-1 font-medium text-gray-700">Office No</Label>
                <Input
                  type="text"
                  placeholder="Enter Office No"
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">City</Label>
                <Input
                  type="text"
                  placeholder="Enter City"
                />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Status</Label>
                <Input
                  type="text"
                  placeholder="Enter Status"
                />
              </div>

            </div>

            {/* Last row, single column full-width */}
            <div className="mt-4">
              <Label className="block mb-1 font-medium text-gray-700">Country</Label>
              <Input
                type="text"
                placeholder="Enter Country"
              />
            </div>
          </section>



          {/* Map Section - Full width */}
          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-purple-100 text-purple-700">
              Select Address from Map
            </h2>
            <p className="mb-2 text-gray-600">
              Click on the map to select the location. The latitude and longitude will be captured.
            </p>

            {/* Tabs */}
            <div className="flex mb-4 space-x-4">
              {["Home", "Office", "Others"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded ${activeTab === tab
                    ? "bg-purple-500 text-white font-semibold"
                    : "bg-purple-100 text-purple-700"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Map */}
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition}
              zoom={12}
              onClick={onMapClick}
            >
              <Marker position={markerPosition} />
            </GoogleMap>

            {/* Inputs */}
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
                  onChange={handleLongitudeChange}
                />
              </div>
            </div>
          </section>
          <section className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-yellow-100 text-yellow-700">
              KYC Information
            </h2>

            {/* Grid layout with 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aadhaar Card */}
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Aadhaar Card</Label>
                <FileInput />
              </div>

              {/* PAN Card */}
              <div>
                <Label className="block mb-1 font-medium text-gray-700">PAN Card</Label>
                <FileInput />
              </div>

              {/* Business Legal Document */}
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Business Legal Document</Label>
                <FileInput />
              </div>

              {/* GSTIN Number (optional) */}
              <div className="">
              <Label className="block mb-1 font-medium text-gray-700">Other Document (Optional)</Label>
              <FileInput />
            </div>
              
            </div>

            {/* Other Document (optional) - single full-width row */}
            <div className='mt-4'>
                <Label className="block mb-1 font-medium text-gray-700">GSTIN Number (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter GSTIN Number"
                // value={gstin}
                // onChange={(e) => setGstin(e.target.value)}
                />
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