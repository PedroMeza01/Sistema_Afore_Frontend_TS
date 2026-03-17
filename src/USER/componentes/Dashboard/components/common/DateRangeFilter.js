import React from 'react';

export default function DateRangeFilter({ from, to, onChange, onReset }) {
  return (
    <div className="pr-dateRange">
      <input type="date" style={{ marginRight: '10px',maxWidth: '100%' }} className="pr-input" value={from} onChange={e => onChange({ from: e.target.value, to })} />

      <input type="date" style={{ maxWidth: '100%' }} className="pr-input" value={to} onChange={e => onChange({ from, to: e.target.value })} />

      
    </div>
  );
}
