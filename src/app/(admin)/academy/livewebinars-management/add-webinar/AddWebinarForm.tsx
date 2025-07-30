'use client';

import React, { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const AddLiveWebinar = dynamicImport(
  () => import('@/components/livewebinars-component/LiveWebinarComponent'),
  { ssr: false }
);

const LiveWebinarPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [webinarId, setWebinarId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = searchParams.get('id') || searchParams.get('webinarId') || undefined;
    setWebinarId(id);
  }, [searchParams]);

  return (
    <div>
      <div className="my-5">
      
        <AddLiveWebinar webinarIdToEdit={webinarId} />
      </div>

     
    </div>
  );
};

export default LiveWebinarPage;

