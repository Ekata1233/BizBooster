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
    gradient: 'from-pink-100 to-pink-300',
    textColor: 'text-pink-800',
  },
  {
    title: 'Admin Commission',
    value: getRandomAmount(),
    icon: <FaClipboardList size={48} />,
    gradient: 'from-blue-100 to-blue-300',
    textColor: 'text-blue-800',
  },
  {
    title: 'Extra Fee',
    value: getRandomAmount(),
    icon: <FaMoneyBill size={48} />,
    gradient: 'from-green-100 to-green-300',
    textColor: 'text-green-800',
  },
  {
    title: 'Payble to Vendor',
    value: getRandomAmount(),
    icon: <FaTools size={48} />,
    gradient: 'from-yellow-100 to-yellow-300',
    textColor: 'text-yellow-800',
  },
  {
    title: 'Payble to Franchise',
    value: getRandomAmount(),
    icon: <FaStore size={48} />,
    gradient: 'from-purple-100 to-purple-300',
    textColor: 'text-purple-800',
  },
  {
    title: 'Extra',
    value: getRandomAmount(),
    icon: <FaChartLine size={48} />,
    gradient: 'from-teal-100 to-teal-300',
    textColor: 'text-teal-800',
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
