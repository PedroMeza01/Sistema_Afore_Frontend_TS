import React from 'react';

export default function DateRangeFilter({ from, to, onChange, onApply, onReset }) {
  return (
    <div className="pr-dateRange">
      <input
        type="date"
        className="pr-input"
        value={from}
        onChange={(e) => onChange({ from: e.target.value, to })}
      />

      <input
        type="date"
        className="pr-input"
        value={to}
        onChange={(e) => onChange({ from, to: e.target.value })}
      />

      <button type="button" className="pr-btn" onClick={onApply}>
        Aplicar
      </button>

      <button type="button" className="pr-btn ghost" onClick={onReset}>
        Limpiar
      </button>
    </div>
  );
}