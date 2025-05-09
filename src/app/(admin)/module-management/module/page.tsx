'use client'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import React from 'react'

const Module = () => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Selected file:", file.name);
        }
    };
    return (
        <div>
            <PageBreadcrumb pageTitle="Module" />
            <div className='my-5'>
                <ComponentCard title="Add New Module">
                    <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                        <div>
                            <Label>Module Name</Label>
                            <Input
                                type="text"
                                placeholder="Enter Name"
                            // value={searchQuery}
                            // onChange={(e) => setSearchQuery(e.target.value)}
                            />

                        </div>
                        <div>
                            <Label>Select Image</Label>
                            <FileInput onChange={handleFileChange} className="custom-class" />

                        </div>
                        <div className='mt-6'>
                            <Button size="sm" variant="primary">
                                Add Module
                            </Button>
                        </div>
                    </div>
                </ComponentCard>
            </div>
            <div className='my-5'>
                <ComponentCard title="All Modules">
                    <div></div>
                </ComponentCard>
            </div>
        </div>
    )
}

export default Module