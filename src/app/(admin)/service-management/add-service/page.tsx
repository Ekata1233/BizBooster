'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import AddNewService from '@/components/service-component/AddNewService'
import React from 'react'

const AddService = () => {
  return (
    <div>
        <PageBreadcrumb pageTitle="Add Service" />
        <div className="my-5">
                <AddNewService />
            </div>
    </div>
  )
}

export default AddService