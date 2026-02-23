import React from "react";

const BalanceCards = ({ totales }) => {
  const formato = (num) =>
    num.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return (
    <div className="balance-cards">
      <div className="card facturado">
        <h4>Total Facturado</h4>
        <p>{formato(totales.facturado)}</p>
      </div>

      <div className="card cobrado">
        <h4>Total Cobrado</h4>
        <p>{formato(totales.cobrado)}</p>
      </div>

      <div className="card pendiente">
        <h4>Saldo Pendiente</h4>
        <p>{formato(totales.pendiente)}</p>
      </div>
    </div>
  );
};

export default BalanceCards;