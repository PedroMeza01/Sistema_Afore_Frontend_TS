import React from "react";

const BalanceTable = ({ data }) => {
  const formato = (num) =>
    num.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });

  return (
    <div className="balance-table">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Asesor</th>
            <th>Total</th>
            <th>Cobrado</th>
            <th>Pendiente</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.cliente}</td>
              <td>{item.asesor}</td>
              <td>{formato(item.total)}</td>
              <td className="cobrado-text">
                {formato(item.cobrado)}
              </td>
              <td className="pendiente-text">
                {formato(item.pendiente)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceTable;