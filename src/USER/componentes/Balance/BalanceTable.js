import React from 'react';

const fmt = num =>
  (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// Tabla de detalle — usada como componente auxiliar si se necesita fuera de BalanceDesglose
const BalanceTable = ({ data = [] }) => (
  <div className="balance-table">
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Asesor</th>
          <th>Total Cobrado</th>
          <th>Comisión</th>
          <th>Saldo Libre</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={5} className="empty">Sin datos</td></tr>
        ) : (
          data.map((item, i) => {
            const libre = (item.cobrado || 0) - (item.comision_asesora || 0) - (item.bono_asesora || 0);
            return (
              <tr key={i}>
                <td>{item.cliente}</td>
                <td>{item.asesor}</td>
                <td className="cobrado-text">{fmt(item.cobrado)}</td>
                <td>{fmt(item.comision_asesora)}</td>
                <td className="libre-text">{fmt(libre)}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

export default BalanceTable;
