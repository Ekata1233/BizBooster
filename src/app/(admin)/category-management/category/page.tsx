'use client'
import AddCategory from '@/components/category-component/AddCategory'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

const Category = () => {
  return (
    <div>
    <PageBreadcrumb pageTitle="Category" />
    <div className='my-5'>
        <AddCategory />
    </div>
    <div className='my-5'>
        <ComponentCard title="All Categories">
            <div>
                
            </div>
        </ComponentCard>
    </div>
</div>
  )
}

export default Category