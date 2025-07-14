import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

const page = () => {
  return (
    <div>
        <PageBreadcrumb pageTitle="Add Request" />
        <ComponentCard title="Add Request">
            <div></div>
        </ComponentCard>
    </div>
  )
}

export default page