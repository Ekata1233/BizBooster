"use client"
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Select from '@/components/form/Select'
import FileInput from '@/components/form/input/FileInput'
import { ChevronDownIcon } from '@/icons'
import React, { useState } from 'react'

const page = () => {
  const [selectedRole, setSelectedRole] = useState("")
  const [identityType, setIdentityType] = useState("")

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ]

  const identityOptions = [
    { value: "aadhar", label: "Aadhar" },
    { value: "pan", label: "PAN" },
    { value: "passport", label: "Passport" },
  ]

  const handleSelectRole = (val: string) => {
    setSelectedRole(val)
  }

  const handleSelectIdentity = (val: string) => {
    setIdentityType(val)
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Employee" />
      <div className="space-y-6">
        {/* General Information */}
        <ComponentCard title="General Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <Label>First Name</Label>
                <Input type="text" placeholder="Enter First Name" />
              </div>
              <div>
                <Label>Phone No</Label>
                <Input type="text" placeholder="Enter Phone Number" />
              </div>
              
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label>Last Name</Label>
                <Input type="text" placeholder="Enter Last Name" />
              </div>
              <div>
                <Label>Address</Label>
                <Input type="text" placeholder="Enter Address" />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div>
                <Label>Upload Image</Label>
                <FileInput />
              </div>
              <div>
                <Label>Select Role</Label>
                <div className="relative">
                  <Select
                    options={roleOptions}
                    placeholder="Select a role"
                    onChange={handleSelectRole}
                    className="dark:bg-dark-900"
                    value={selectedRole}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Business Information */}
        <ComponentCard title="Business Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <Label>Identity Type</Label>
                <div className="relative">
                  <Select
                    options={identityOptions}
                    placeholder="Select Identity Type"
                    onChange={handleSelectIdentity}
                    className="dark:bg-dark-900"
                    value={identityType}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              <div>
                <Label>Identity Number</Label>
                <Input type="text" placeholder="Enter Identity Number" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label>Upload Identity Image</Label>
                <FileInput />
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Account Information */}
        <ComponentCard title="Account Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Enter Email" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" placeholder="Enter Password" />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Confirm Password" />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default page
