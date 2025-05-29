'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import AddNewService from '@/components/service-component/AddNewService';
import React from 'react';

const AddServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageBreadcrumb pageTitle="Add Service" />
      <div className="my-5">
        <AddNewService />
      </div>
    </div>
  );
};

export default AddServicePage;