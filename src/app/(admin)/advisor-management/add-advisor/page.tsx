'use client'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const AddAdvisorForm = dynamic(
  () => import('@/components/advisor-component/AddAdvisorForm'),
  { ssr: false }
);

const Loading = () => (
  <div className="text-center p-8">
    <p>Loading form...</p>
  </div>
);

export default function AddAdvisorPage() {

  return (
    <Suspense fallback={<Loading />}>
      <AddAdvisorForm />
    </Suspense>
  );
}