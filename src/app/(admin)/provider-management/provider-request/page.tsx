import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

const page = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Provider Request" />
            <div className="my-5">
                <ComponentCard title="Provider Request List">
                    <div>
                        
                    </div>
                </ComponentCard>
            </div>
        </div>
    )
}

export default page