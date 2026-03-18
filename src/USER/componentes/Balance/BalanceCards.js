import React from 'react';

const fmt = num =>
  (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const BalanceCards = ({ totales }) => {
  const saldoLibre =
    (totales.cobrado || 0) - (totales.comision_total || 0) - (totales.bono_total || 0);

  return (
    <div className="balance-cards">
      <div className="card cobrado">
        <h4>Total Cobrado</h4>
        <p>{fmt(totales.cobrado)}</p>
      </div>

      <div className="card comision">
        <h4>Comisiones + Bonos</h4>
        <p>{fmt(totales.comision_total)}</p>
        <span className="card-sub">Bonos: {fmt(totales.bono_total)}</span>
      </div>

      <div className="card libre">
        <h4>Saldo Libre</h4>
        <p>{fmt(saldoLibre)}</p>
        <span className="card-sub">Cobrado − comisiones − bonos</span>
      </div>
    </div>
  );
};

export default BalanceCards;
