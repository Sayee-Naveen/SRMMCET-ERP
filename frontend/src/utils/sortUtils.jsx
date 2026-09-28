import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function sortData(data, sortKey, sortDirection) {
  if (!sortKey || !data) return data || [];
  return [...data].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // Handle nested or undefined values
    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' })
      : bStr.localeCompare(aStr, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export function SortHeader({ label, sortKey, currentKey, direction, onSort, className = "" }) {
  const isActive = currentKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`cursor-pointer select-none hover:bg-gray-200 transition-colors ${className}`}
      title={`Click to sort by ${label}`}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp size={14} className="text-blue-700" />
          ) : (
            <ArrowDown size={14} className="text-blue-700" />
          )
        ) : (
          <ArrowUpDown size={13} className="text-gray-400 opacity-60" />
        )}
      </div>
    </th>
  );
}
