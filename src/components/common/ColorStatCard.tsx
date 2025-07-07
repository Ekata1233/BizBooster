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
      className={`rounded-2xl px-8 py-6 shadow-md bg-gradient-to-r ${gradient} flex items-center justify-between`}
    >
      {/* Left: Icon */}
      <div className={`${textColor} flex-shrink-0`}>
        {icon}
      </div>

      {/* Right: Title & Value */}
      <div className="flex flex-col items-end gap-2">
        <h2 className={`text-lg  ${textColor}`}>{title}</h2>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default ColorStatCard;
