import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import React from 'react'

const page = () => {
  return (
    <div>
         <PageBreadcrumb pageTitle="Add Coupon" />
          <ComponentCard title="Add New Coupon">
                <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                    <div>
                        <Label>Coupon Code</Label>
                        <Input
                            type="text"
                            placeholder="Enter Coupon"
                            // value={couponCode}
                            // onChange={(e) => setCouponCode(e.target.value)}
                        />

                    </div>
                    
                    <div className='mt-6 '>
                        <Button size="sm" variant="primary" 
                        // onClick={handleSubmit}
                        >
                            Add Coupon
                        </Button>
                    </div>
                </div>
            </ComponentCard>
    </div>
  )
}

export default page