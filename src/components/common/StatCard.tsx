import React from "react";
import Badge, { BadgeColor } from "../ui/badge/Badge";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  badgeColor?: BadgeColor;
  badgeValue?: string | number;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  gradient?: string;   // background gradient
  textColor?: string;  // text & icon color
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  badgeColor = "primary",
  badgeValue,
  badgeIcon: BadgeIcon,
  gradient = "from-blue-100 to-blue-200",
  textColor = "text-blue-800",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-gradient-to-r ${gradient} p-5 shadow-md md:p-6`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-white/50 rounded-xl">
        {Icon && <Icon className={`size-6 ${textColor}`} />}
      </div>

      {/* Text + Badge */}
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className={`text-sm font-medium ${textColor}`}>{title}</span>
          <h4 className={`mt-2 font-bold text-title-sm ${textColor}`}>{value}</h4>
        </div>
        {badgeValue && (
          <Badge color={badgeColor}>
            {BadgeIcon && <BadgeIcon className="mr-1" />}
            {badgeValue}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default StatCard;
