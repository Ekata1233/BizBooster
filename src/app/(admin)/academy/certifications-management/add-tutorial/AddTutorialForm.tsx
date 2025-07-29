'use client';

import React, { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const AddCertificate = dynamicImport(
  () => import('@/components/certifications-component/CertificationComponent'),
  { ssr: false }
);

const CertificatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [certificateId, setCertificateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = searchParams.get('id') || searchParams.get('certificateId') || undefined;
    setCertificateId(id);
  }, [searchParams]);

  return (
    <div>
      <div className="my-5">
        {/* <AddCertificate certificateIdToEdit={certificateId} /> */}
        <AddCertificate certificationIdToEdit={certificateId} />
      </div>

      {/* Optionally, keep your list or redirect after save */}
    </div>
  );
};

export default CertificatePage;

