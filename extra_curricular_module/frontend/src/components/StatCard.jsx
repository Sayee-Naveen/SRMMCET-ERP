import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-purple-50 text-purple-700',
    rose: 'bg-rose-50 text-rose-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorMap[color] || colorMap.blue}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
