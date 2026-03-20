import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const fmt = num =>
  (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const BalanceDesglose = ({ desgloseAsesor, desgloseCliente, meta, onPageChange, onLimitChange }) => {
  const [tab, setTab] = useState('asesor');

  return (
    <div className="balance-desglose">
      <div className="desglose-tabs">
        <button
          className={`desglose-tab ${tab === 'asesor' ? 'active' : ''}`}
          onClick={() => setTab('asesor')}
        >
          Por Asesor
        </button>
        <button
          className={`desglose-tab ${tab === 'cliente' ? 'active' : ''}`}
          onClick={() => setTab('cliente')}
        >
          Por Cliente
        </button>
      </div>

      {tab === 'asesor' && (
        <div className="balance-table">
          <table>
            <thead>
              <tr>
                <th>Asesor</th>
                <th>Total Cobrado</th>
                <th>Comisión</th>
                <th>Saldo Libre</th>
              </tr>
            </thead>
            <tbody>
              {desgloseAsesor.length === 0 ? (
                <tr><td colSpan={4} className="empty">Sin datos</td></tr>
              ) : (
                desgloseAsesor.map((row, i) => {
                  const libre = row.cobrado - row.comision - row.bono;
                  return (
                    <tr key={i}>
                      <td>
                        <Link to={`/procesos?asesor=${row.id_asesor}`}><b>{row.label}</b></Link>
                      </td>
                      <td className="cobrado-text">{fmt(row.cobrado)}</td>
                      <td>{fmt(row.comision)}</td>
                      <td className="libre-text">{fmt(libre)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'cliente' && (
        <>
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
                {desgloseCliente.length === 0 ? (
                  <tr><td colSpan={5} className="empty">Sin datos</td></tr>
                ) : (
                  desgloseCliente.map((row, i) => {
                    const libre = row.cobrado - row.comision - row.bono;
                    return (
                      <tr key={i}>
                        <td><b>{row.label}</b></td>
                        <td>{row.asesor}</td>
                        <td className="cobrado-text">{fmt(row.cobrado)}</td>
                        <td>{fmt(row.comision)}</td>
                        <td className="libre-text">{fmt(libre)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="balance-pagination">
              <span className="pagination-info">
                {meta.totalItems} registros — página {meta.page} de {meta.totalPages}
              </span>
              <div className="pagination-controls">
                <select value={meta.limit} onChange={e => onLimitChange(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <button
                  className="btn-pag"
                  onClick={() => onPageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  ‹ Anterior
                </button>
                <button
                  className="btn-pag"
                  onClick={() => onPageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                >
                  Siguiente ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalanceDesglose;
