import React from 'react';

export default function OverviewCard({ icon, label, value, colorClass, trend }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft hover:shadow-lg transform transition duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${colorClass} text-white`}>
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500 font-inter">{label}</div>
            <div className="text-2xl font-semibold text-kama-text font-poppins">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
        </div>
        {trend && (
          <div className="text-xs text-gray-400 flex items-center">
            <i className={`fas ${trend > 0 ? 'fa-arrow-up text-green-500' : 'fa-arrow-down text-red-500'} mr-1`}></i>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}