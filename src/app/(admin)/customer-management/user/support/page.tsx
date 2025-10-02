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
  answered: boolean;
  createdAt: string;
}

const SupportQuestionsPage = () => {
  const [supportData, setSupportData] = useState<TableData[]>([]);
  const router = useRouter();

  const fetchSupportQuestions = async () => {
    try {
      const response = await axios.get<{ data: SupportEntry[] }>(
        "/api/support/question"
      );
      let data = response.data.data;

      // 🔹 Sort by createdAt (newest first)
      data = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const tableData: TableData[] = data.map((entry, index) => ({
        id: entry._id,
        userId: entry.user?._id || "N/A",
        srNo: index + 1,
        fullName: entry.user?.fullName || "N/A",
        email: entry.user?.email || "N/A",
        question: entry.question,
        answered: entry.answer && entry.answer.trim() !== "" ? true : false,
        createdAt: entry.createdAt,
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
      header: "Question",
      accessor: "question",
      render: (row: TableData) => (
        <div className="flex items-center gap-2">
          {!row.answered && (
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
          )}
          <span>{row.question}</span>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: "answered",
      render: (row: TableData) =>
        row.answered ? (
          <Button size="sm" disabled className="bg-green-500 text-white">
            Answered
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleSendAnswer(row.id, row.userId)}>
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
