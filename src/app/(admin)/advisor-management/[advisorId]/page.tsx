import React from 'react';
import AddAdvisor from '../add-advisor/page';

export default function Page({ params, searchParams }: { 
  params: { advisorId?: string }; 
  searchParams: { [key: string]: string | string[] | undefined }; 
}) {
  return <AddAdvisor params={params} searchParams={searchParams} />;
}
