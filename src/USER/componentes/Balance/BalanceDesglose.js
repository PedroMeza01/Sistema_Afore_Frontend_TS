import React, { useState } from 'react';

const fmt = num =>
  (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const BalanceDesglose = ({ desgloseAsesor, desgloseMes }) => {
  const [tab, setTab] = useState('asesor'); // 'asesor' | 'mes'

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
          className={`desglose-tab ${tab === 'mes' ? 'active' : ''}`}
          onClick={() => setTab('mes')}
        >
          Por Mes
        </button>
      </div>

      {tab === 'asesor' && (
        <div className="balance-table">
          <table>
            <thead>
              <tr>
                <th>Asesor</th>
                <th>Facturado</th>
                <th>Cobrado</th>
                <th>Pendiente</th>
                <th>Comisión</th>
                <th>Bono</th>
                <th>% Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {desgloseAsesor.length === 0 ? (
                <tr><td colSpan={7} className="empty">Sin datos</td></tr>
              ) : (
                desgloseAsesor.map((row, i) => {
                  const pct = row.facturado > 0
                    ? Math.round((row.cobrado / row.facturado) * 100)
                    : 0;
                  return (
                    <tr key={i}>
                      <td><b>{row.label}</b></td>
                      <td>{fmt(row.facturado)}</td>
                      <td className="cobrado-text">{fmt(row.cobrado)}</td>
                      <td className="pendiente-text">{fmt(row.facturado - row.cobrado)}</td>
                      <td>{fmt(row.comision)}</td>
                      <td>{fmt(row.bono)}</td>
                      <td>
                        <div className="pct-bar-wrap">
                          <div className="pct-bar" style={{ width: `${pct}%` }} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mes' && (
        <div className="balance-table">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Facturado</th>
                <th>Cobrado</th>
                <th>Pendiente</th>
                <th>% Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {desgloseMes.length === 0 ? (
                <tr><td colSpan={5} className="empty">Sin datos</td></tr>
              ) : (
                desgloseMes.map((row, i) => {
                  const pct = row.facturado > 0
                    ? Math.round((row.cobrado / row.facturado) * 100)
                    : 0;
                  return (
                    <tr key={i}>
                      <td><b>{row.label}</b></td>
                      <td>{fmt(row.facturado)}</td>
                      <td className="cobrado-text">{fmt(row.cobrado)}</td>
                      <td className="pendiente-text">{fmt(row.facturado - row.cobrado)}</td>
                      <td>
                        <div className="pct-bar-wrap">
                          <div className="pct-bar" style={{ width: `${pct}%` }} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BalanceDesglose;