// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import PageBreadcrumb from '@/components/common/PageBreadCrumb';
// import ComponentCard from '@/components/common/ComponentCard';
// import BasicTableOne from '@/components/tables/BasicTableOne';
// import { useRouter } from 'next/navigation';
// import Button from '@/components/ui/button/Button';

// interface SupportEntry {
//   _id: string;
//   user: {
//     _id: string;
//     fullName: string;
//     email: string;
//   } | null;
//   question: string;
//   answer?: string;
//   createdAt: string;
// }

// interface TableData {
//   id: string;       // question id
//   userId: string;   // user id
//   srNo: number;
//   fullName: string;
//   email: string;
//   question: string;
//   action: string;   // can still keep question id for action
// }

// const SupportQuestionsPage = () => {
//   const [supportData, setSupportData] = useState<TableData[]>([]);
//   const router = useRouter();

//   const fetchSupportQuestions = async () => {
//     try {
//       const response = await axios.get<{ data: SupportEntry[] }>("/api/support/question");
//       const data = response.data.data; // ✅ fully typed


//       const tableData: TableData[] = data.map((entry, index) => ({
//         id: entry._id,
//         userId: entry.user?._id || 'N/A', // <-- add user id here
//         srNo: index + 1,
//         fullName: entry.user?.fullName || 'N/A',
//         email: entry.user?.email || 'N/A',
//         question: entry.question,
//         action: entry._id, // still using question id for the button
//       }));


//       setSupportData(tableData);
//     } catch (error) {
//       console.error('Error fetching support questions:', error);
//       setSupportData([]);
//     }
//   };

//   useEffect(() => {
//     fetchSupportQuestions();
//   }, []);
//   console.log("supprtdata", supportData);

//   const handleSendAnswer = (id: string, userId: string) => {
//     router.push(`/customer-management/user/support/send-answer/${id}?user=${userId}`);
//   };


//   const columns = [
//     { header: 'Sr No', accessor: 'srNo' },
//     { header: 'Full Name', accessor: 'fullName' },
//     { header: 'Email', accessor: 'email' },
//     { header: 'Question', accessor: 'question' },
//     {
//       header: 'Action',
//       accessor: 'action',
//       render: (row: TableData) => (
//         <Button size="sm" onClick={() => handleSendAnswer(row.action, row.userId)}>
//           Send Answer
//         </Button>

//       ),
//     },
//   ];

//   return (
//     <div>
//       <PageBreadcrumb pageTitle="Support Questions" />
//       <div className="my-5">
//         <ComponentCard title="All Support Questions">
//           <BasicTableOne columns={columns} data={supportData} />
//         </ComponentCard>
//       </div>
//     </div>
//   );
// };

// export default SupportQuestionsPage;


'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import BasicTableOne from '@/components/tables/BasicTableOne';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface SupportEntry {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  question: string;
  answer?: string;   // ✅ from API
  createdAt: string;
}

interface TableData {
  id: string;
  userId: string;
  srNo: number;
  fullName: string;
  email: string;
  question: string;
  answer?: string;   // ✅ include answer
  action: string;   // keep id for button
}

const SupportQuestionsPage = () => {
  const [supportData, setSupportData] = useState<TableData[]>([]);
  const router = useRouter();

  const fetchSupportQuestions = async () => {
    try {
      const response = await axios.get<{ data: SupportEntry[] }>("/api/support/question");
      const data = response.data.data;

      const tableData: TableData[] = data.slice().reverse().map((entry, index) => ({
        id: entry._id,
        userId: entry.user?._id || 'N/A',
        srNo: index + 1,
        fullName: entry.user?.fullName || 'N/A',
        email: entry.user?.email || 'N/A',
        question: entry.question,
        answer: entry.answer || '', // ✅ capture answer
        action: entry._id,
      }));

      setSupportData(tableData);
    } catch (error) {
      console.error("❌ Error fetching support questions:", error);
      setSupportData([]);
    }
  };

  useEffect(() => {
    fetchSupportQuestions();
  }, []);

  const handleSendAnswer = (id: string, userId: string) => {
    router.push(`/customer-management/user/support/send-answer/${id}?user=${userId}`);
  };

  const columns = [
    { header: "Sr No", accessor: "srNo" },
    { header: "Full Name", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) =>
        row.answer && row.answer.trim() !== '' ? (
          <Button size="sm"  disabled>
            Answered
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleSendAnswer(row.action, row.userId)}>
            Send Answer
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Support Questions" />
      <div className="my-5">
        <ComponentCard title="All Support Questions">
          <BasicTableOne columns={columns} data={supportData} />
        </ComponentCard>
      </div>
    </div>
  );
};

export default SupportQuestionsPage;
