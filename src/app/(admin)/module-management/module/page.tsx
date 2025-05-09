'use client'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import AddModule from '@/components/module-component/AddModule'
import React from 'react'

const Module = () => {

    return (
        <div>
            <PageBreadcrumb pageTitle="Module" />
            <div className='my-5'>
                <AddModule />
            </div>
            <div className='my-5'>
                <ComponentCard title="All Modules">
                    <div>
                        
                    </div>
                </ComponentCard>
            </div>
        </div>
    )
}

export default Module