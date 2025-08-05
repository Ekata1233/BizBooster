'use client'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const AddAdvisorForm = dynamic(
  () => import('@/components/advisor-component/AddAdvisorForm'),
  { ssr: false }
);

// This interface is REQUIRED for a dynamic page component.
interface AddAdvisorPageProps {
  params: {
    advisorId: string;
  };
}

const Loading = () => (
  <div className="text-center p-8">
    <p>Loading form...</p>
  </div>
);

export default function EditAdvisorPage({ params }: AddAdvisorPageProps) {
  // We pass the advisorId from the URL params to the form component.
  return (
    <Suspense fallback={<Loading />}>
      <AddAdvisorForm advisorIdToEdit={params.advisorId} />
    </Suspense>
  );
}