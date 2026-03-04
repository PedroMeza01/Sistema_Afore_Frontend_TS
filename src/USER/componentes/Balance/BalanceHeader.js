import React from 'react';
import { MOCK_ASESORES, MOCK_MESES } from './balanceMock';

// Cuando conectes el backend, pasa asesores y meses como props
// desde Balance.js (los puedes obtener del endpoint o de un GET /asesores)

const BalanceHeader = ({ asesor, mes, onAsesorChange, onMesChange, items }) => {
  // Exportar a CSV
  const handleExportar = () => {
    if (!items?.length) return;

    const headers = ['Cliente', 'Asesor', 'Mes', 'Monto', 'Cobrado', 'Pendiente', 'Comisión', 'Bono'];
    const rows = items.map(i => [
      i.cliente,
      i.asesor,
      i.mes,
      i.monto_cobrar,
      i.cobrado,
      i.pendiente,
      i.comision_asesora,
      i.bono_asesora
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `balance_${mes || 'general'}_${asesor || 'todos'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="balance-header">
      <h1>Balance General</h1>

      <div className="balance-actions">
        <select value={asesor} onChange={e => onAsesorChange(e.target.value)}>
          <option value="">Todos los asesores</option>
          {MOCK_ASESORES.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select value={mes} onChange={e => onMesChange(e.target.value)}>
          <option value="">Todos los meses</option>
          {MOCK_MESES.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <button className="btn-exportar" onClick={handleExportar}>
          Exportar CSV
        </button>
      </div>
    </div>
  );
};

export default BalanceHeader;