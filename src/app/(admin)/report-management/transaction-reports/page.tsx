import ColorStatCard from '@/components/common/ColorStatCard';
import React from 'react';
import {
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaClipboardList,
  FaStore,
  FaTools,
} from 'react-icons/fa';// adjust the import path as needed

const getRandomAmount = () => {
  const amount = Math.random() * (500000 - 100000) + 100000;
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cards = [
  {
    title: 'Total Revenue',
    value: getRandomAmount(),
    icon: <FaUsers size={48} />,
    gradient: 'from-pink-50 to-pink-100',
    textColor: 'text-pink-600',
  },
  {
    title: 'Admin Commission',
    value: getRandomAmount(),
    icon: <FaClipboardList size={48} />,
    gradient: 'from-blue-50 to-blue-100',
    textColor: 'text-blue-600',
  },
  {
    title: 'Extra Fee',
    value: getRandomAmount(),
    icon: <FaMoneyBill size={48} />,
    gradient: 'from-green-50 to-green-100',
    textColor: 'text-green-600',
  },
  {
    title: 'Payble to Vendor',
    value: getRandomAmount(),
    icon: <FaTools size={48} />,
    gradient: 'from-yellow-50 to-yellow-100',
    textColor: 'text-yellow-600',
  },
  {
    title: 'Payble to Franchise',
    value: getRandomAmount(),
    icon: <FaStore size={48} />,
    gradient: 'from-purple-50 to-purple-100',
    textColor: 'text-purple-600',
  },
  {
    title: 'Extra',
    value: getRandomAmount(),
    icon: <FaChartLine size={48} />,
    gradient: 'from-teal-50 to-teal-100',
    textColor: 'text-teal-600',
  },
];


const Page = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, index) => (
        <ColorStatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          gradient={card.gradient}
          textColor={card.textColor}
        />
      ))}
    </div>
  );
};

export default Page;
