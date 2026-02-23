import React from "react";

const BalanceHeader = () => {
  return (
    <div className="balance-header">
      <h1>Balance General</h1>

      <div className="balance-actions">
        <select>
          <option>Filtrar por Asesor</option>
        </select>

        <select>
          <option>Filtrar por Fecha</option>
        </select>

        <button className="btn-exportar">Exportar</button>
      </div>
    </div>
  );
};

export default BalanceHeader;