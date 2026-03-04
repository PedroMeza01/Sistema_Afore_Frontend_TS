import React from 'react';

const BalanceCards = ({ totales }) => {
  const fmt = num =>
    (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const pct = totales.facturado > 0
    ? Math.round((totales.cobrado / totales.facturado) * 100)
    : 0;

  return (
    <div className="balance-cards">
      <div className="card facturado">
        <h4>Total Facturado</h4>
        <p>{fmt(totales.facturado)}</p>
      </div>

      <div className="card cobrado">
        <h4>Total Cobrado</h4>
        <p>{fmt(totales.cobrado)}</p>
        <span className="card-sub">{pct}% recuperado</span>
      </div>

      <div className="card pendiente">
        <h4>Saldo Pendiente</h4>
        <p>{fmt(totales.pendiente)}</p>
      </div>

      <div className="card comision">
        <h4>Comisiones</h4>
        <p>{fmt(totales.comision_total)}</p>
        <span className="card-sub">Bonos: {fmt(totales.bono_total)}</span>
      </div>
    </div>
  );
};

export default BalanceCards;