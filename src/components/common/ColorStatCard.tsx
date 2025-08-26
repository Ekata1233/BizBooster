import React from 'react';

interface ColorStatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

const ColorStatCard: React.FC<ColorStatCard> = ({
  title,
  value,
  icon,
  gradient,
  textColor,
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} ${textColor} p-6 rounded-xl shadow flex justify-between items-center`}
    >
      {/* Left: Icon */}
      <div className="text-3xl bg-white/40 p-3 rounded-full">
        {icon}
      </div>

      {/* Right: Title & Value */}
      <div className="text-right">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>

  );
};

export default ColorStatCard;
