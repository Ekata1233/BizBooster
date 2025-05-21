"use client"
import AddBanner from '@/components/banner-component/AddBanner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

const AddNewBanner = () => {
  return (
    <div>
        <PageBreadcrumb pageTitle="Add Banner" />
      <div className="my-5">
        <AddBanner />
      </div>
    </div>
  )
}

export default AddNewBanner