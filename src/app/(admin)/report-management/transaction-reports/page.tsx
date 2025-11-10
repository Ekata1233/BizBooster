'use client';

import React, { useEffect } from 'react';
import { useAdminEarnings } from '@/context/AdminEarningsContext';
import SummaryCards from '@/components/admin/transaction-report/SummaryCards';
import TransactionsTable from '@/components/admin/business-report/TransactionsTable';

const Page = () => {
  const { summary, loading, fetchSummary, transactions, fetchTransactions } = useAdminEarnings();

  console.log("transaction details : ", transactions)

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading earnings summary...</p>;
  if (!summary) return <p className="p-6 text-red-600">No summary data available.</p>;

  return (
    <div>
      <SummaryCards summary={summary} transactionDetails={transactions} />
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default Page;
