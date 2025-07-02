import React from 'react';
import {
  FaUsers,
  FaChartLine,
  FaMoneyBill,
  FaClipboardList,
  FaStore,
  FaTools,
} from 'react-icons/fa';

// Generate random amount between ₹100,000.00 and ₹500,000.00
const getRandomAmount = () => {
  const amount = Math.random() * (500000 - 100000) + 100000;
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cards = [
  {
    title: 'Customers',
    amount: getRandomAmount(),
    icon: <FaUsers size={48} />,
    gradient: 'from-pink-100 to-pink-300',
    textColor: 'text-pink-800',
  },
  {
    title: 'Bookings',
    amount: getRandomAmount(),
    icon: <FaClipboardList size={48} />,
    gradient: 'from-blue-100 to-blue-300',
    textColor: 'text-blue-800',
  },
  {
    title: 'Revenue',
    amount: getRandomAmount(),
    icon: <FaMoneyBill size={48} />,
    gradient: 'from-green-100 to-green-300',
    textColor: 'text-green-800',
  },
  {
    title: 'Providers',
    amount: getRandomAmount(),
    icon: <FaTools size={48} />,
    gradient: 'from-yellow-100 to-yellow-300',
    textColor: 'text-yellow-800',
  },
  {
    title: 'Shops',
    amount: getRandomAmount(),
    icon: <FaStore size={48} />,
    gradient: 'from-purple-100 to-purple-300',
    textColor: 'text-purple-800',
  },
  {
    title: 'Performance',
    amount: getRandomAmount(),
    icon: <FaChartLine size={48} />,
    gradient: 'from-teal-100 to-teal-300',
    textColor: 'text-teal-800',
  },
];

const Page = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-2xl px-8 py-6 shadow-md bg-gradient-to-r ${card.gradient} flex items-center justify-between`}
        >
          {/* Left: Icon */}
          <div className={`${card.textColor} flex-shrink-0`}>
            {card.icon}
          </div>

          {/* Right: Title & Amount aligned right */}
          <div className="flex flex-col items-end gap-2">
            <h2 className={`text-lg font-semibold ${card.textColor}`}>{card.title}</h2>
            <p className={`text-2xl font-bold ${card.textColor}`}>{card.amount}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
