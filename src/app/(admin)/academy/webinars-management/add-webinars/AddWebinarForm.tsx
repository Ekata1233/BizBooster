'use client';

import React, { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const AddWebinar = dynamicImport(
  () => import('@/components/webinars-component/WebinarComponent'),
  { ssr: false }
);

const WebinarPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [webinarId, setWebinarId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = searchParams.get('id') || searchParams.get('WebinarId') || undefined;
    setWebinarId(id);
  }, [searchParams]);

  return (
    <div>
      <div className="my-5">
      
        <AddWebinar certificationIdToEdit={webinarId} />
      </div>

     
    </div>
  );
};

export default WebinarPage;

