import React from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function Card({ title, value, icon, trend, trendUp }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="bg-blue-50 p-3 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}