import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

const page = () => {
  return (
   <div>
      <PageBreadcrumb pageTitle="Employee List" />
      <div className="space-y-6">
        <ComponentCard title="Employee List">
          <div></div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default page