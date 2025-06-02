"use client"
import { z } from "zod";
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
import { providerValidationSchema } from '@/validation/providerValidationSchema';

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



const AddProvider = () => {
  const { handleSubmit, setValue, formState: { } } = useForm();
  // State for all fields
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [zone, setZone] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [tax, setTax] = useState('');
  const [locationType, setLocationType] = useState('home');
  const [markerPosition, setMarkerPosition] = useState(centerDefault);
  const [address, setAddress] = useState('');
  const [officeNo, setOfficeNo] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [aadhaarCardFiles, setAadhaarCardFiles] = useState<File[]>([]);
  const [panCardFiles, setPanCardFiles] = useState<File[]>([]);
  const [storeDocumentFiles, setStoreDocumentFiles] = useState<File[]>([]);
  const [gstFiles, setGstFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [businessPlan] = useState<'commission base' | 'other'>('commission base');
  const [activeTab, setActiveTab] = useState("Home");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


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

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  // Submit handler
  const onSubmit = async () => {
    const formDataToValidate = {
      fullName,
      phoneNo,
      email,
      password,
      confirmPassword,    // optional
      referredBy,       // optional
      setBusinessPlan: businessPlan, // optional
      isVerified: false, // optional (you can skip this if you want)
      isDeleted: false,  // optional

      storeInfo: {
        storeName,
        storePhone,
        storeEmail,
        module: selectedModule, // must be a 24-character string
        zone,                   // must be one of: "east", "west", "south", "north", "central"
        logo: '',               // optional, must be a URL string (e.g. uploaded file URL or keep undefined)
        cover: '',              // optional, must be a URL string
        tax,
        location: {
          type: locationType,               // must be one of "home", "office", "other"
          coordinates: [
            markerPosition.lng,  // already a number
            markerPosition.lat,  // already a number
          ],

        },
        address,
        officeNo,
        city,
        state,
        country,
      },

      kyc: {
        aadhaarCard: aadhaarCardFiles,       // must be array of URL strings
        panCard: panCardFiles,
        storeDocument: storeDocumentFiles,
        GST: gstFiles,
        other: otherFiles,
      },
    };

    console.log("before submititing ")
    try {
      console.log("old submititing ")
      try {
        providerValidationSchema.parse(formDataToValidate);
        console.log("Validation passed");
      } catch (err) {
        console.log("Zod validation error:", err);
      }

      console.log("new submititing ")
      setErrors({});
      console.log("mid submititing ")
      // Basic validations
      if (!selectedModule
      ) {
        alert('Please fill all required fields');
        return;
      }
      console.log("mid submititing ")
      const formData = new FormData();

      formData.append('fullName', fullName);
      formData.append('phoneNo', phoneNo);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('referredBy', referredBy);
      formData.append('storeName', storeName);
      formData.append('storePhone', storePhone);
      formData.append('storeEmail', storeEmail);
      formData.append('selectedModule', selectedModule);
      formData.append('zone', zone);
      formData.append('tax', tax);
      formData.append('locationType', locationType);
      formData.append('longitude', markerPosition.lng.toString());
      formData.append('latitude', markerPosition.lat.toString());
      formData.append('address', address);
      formData.append('officeNo', officeNo);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('country', country);
      formData.append('setBusinessPlan', businessPlan);

      if (logo) formData.append('logo', logo);
      if (cover) formData.append('cover', cover);

      // Append multiple files
      aadhaarCardFiles.forEach((file) => formData.append('aadhaarCard', file));
      panCardFiles.forEach((file) => formData.append('panCard', file));
      storeDocumentFiles.forEach((file) => formData.append('storeDocument', file));
      gstFiles.forEach((file) => formData.append('GST', file));
      otherFiles.forEach((file) => formData.append('other', file));

      const success = await createProvider(formData);
      console.log("end submititing ")
      if (success) {
        alert('Provider registered successfully!');
      } else {
        alert('Failed to register provider. Please try again.');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((e) => {
          if (e.path && e.path.length > 0) {
            const key = e.path.join('.'); // For nested fields like storeInfo.address
            fieldErrors[key] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Error while registering provider:', error);
        alert('An error occurred while registering the provider. Please try again.');
      }
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  const handleSelectModule = (selected: string) => {
    setSelectedModule(selected);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Fix: safe access
    if (file) {
      setLogo(file);
    }
  };

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCover(e.target.files[0]);
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
                  placeholder="Enter Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Phone</Label>
                <Input
                  type="number"
                  placeholder="Enter Phone No"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                />
                {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Enter Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Referral Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter Referral Code"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                />
                {errors.referredBy && <p className="text-red-500 text-sm mt-1">{errors.referredBy}</p>}
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
                <Label className="block mb-1 font-medium text-gray-700">Store Name</Label>
                <Input
                  type="text"
                  placeholder="Enter Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                {errors['storeInfo.storeName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.storeName']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Store Phone</Label>
                <Input
                  type="text"
                  placeholder="Enter Store Phone No"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
                {errors['storeInfo.storePhone'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.storePhone']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Store Email</Label>
                <Input
                  type="email"
                  placeholder="Enter Store Email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
                {errors['storeInfo.storeEmail'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.storeEmail']}</p>
                )}

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
                {errors['storeInfo.options'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.options']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Zone</Label>
                <div className="relative">
                  <Select
                    options={zoneOptions}
                    placeholder="Select Zone"
                    onChange={(value) => setZone(value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
                {errors['storeInfo.zoneOptions'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.zoneOptions']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Store Logo</Label>
                <FileInput onChange={handleLogoChange} className="custom-class" />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Store Cover Image</Label>
                <FileInput className="custom-class" onChange={handleIdImageChange} />
              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Vat/Tax</Label>
                <Input
                  type="text"
                  placeholder="Enter Vat/Tax"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                />
                {errors['storeInfo.tax'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.tax']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Address</Label>
                <Input
                  type="text"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors['storeInfo.address'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.address']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">Office No</Label>
                <Input
                  type="text"
                  placeholder="Enter Office No"
                  value={officeNo}
                  onChange={(e) => setOfficeNo(e.target.value)}
                />
                {errors['storeInfo.officeNo'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.officeNo']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">City</Label>
                <Input
                  type="text"
                  placeholder="Enter City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {errors['storeInfo.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.city']}</p>
                )}

              </div>

              <div>
                <Label className="block mb-1 font-medium text-gray-700">State</Label>
                <Input
                  type="text"
                  placeholder="Enter State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                {errors['storeInfo.state'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['storeInfo.state']}</p>
                )}

              </div>

            </div>

            {/* Last row, single column full-width */}
            <div className="mt-4">
              <Label className="block mb-1 font-medium text-gray-700">Country</Label>
              <Input
                type="text"
                placeholder="Enter Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              {errors['storeInfo.country'] && (
                <p className="text-red-500 text-sm mt-1">{errors['storeInfo.country']}</p>
              )}

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
                  onClick={() => {
                    setActiveTab(tab);
                    setLocationType(tab.toLowerCase()); // convert to lowercase like 'home', 'office', 'others'
                  }}
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
                // onChange={handleLatitudeChange}
                />
              </div>
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Longitude</Label>
                <Input
                  type="number"
                  placeholder="Enter Longitude"
                  value={markerPosition.lng}
                // onChange={handleLongitudeChange}
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
                <FileInput className="custom-class" multiple
                  onChange={(e) => handleFileChange(e, setAadhaarCardFiles)} />
              </div>

              {/* PAN Card */}
              <div>
                <Label className="block mb-1 font-medium text-gray-700">PAN Card</Label>
                <FileInput className="custom-class" multiple
                  onChange={(e) => handleFileChange(e, setPanCardFiles)} />
              </div>

              {/* Business Legal Document */}
              <div>
                <Label className="block mb-1 font-medium text-gray-700">Business Legal Document</Label>
                <FileInput className="custom-class" multiple
                  onChange={(e) => handleFileChange(e, setStoreDocumentFiles)} />
              </div>

              {/* GSTIN Number (optional) */}
              <div className="">
                <Label className="block mb-1 font-medium text-gray-700">Other Document (Optional)</Label>
                <FileInput className="custom-class" multiple
                  onChange={(e) => handleFileChange(e, setOtherFiles)} />
              </div>

            </div>

            {/* Other Document (optional) - single full-width row */}
            <div className='mt-4'>
              <Label className="block mb-1 font-medium text-gray-700">GSTIN Number (Optional)</Label>
              <FileInput className="custom-class" multiple
                onChange={(e) => handleFileChange(e, setGstFiles)} />
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