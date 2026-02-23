import React, { useEffect, useState, useCallback } from "react";
import BalanceHeader from "./BalanceHeader";
import BalanceCards from "./BalanceCards";
import BalanceTable from "./BalanceTable";
import "./balance.css";

const Balance = () => {
  const [data, setData] = useState([]);
  const [totales, setTotales] = useState({
    facturado: 0,
    cobrado: 0,
    pendiente: 0,
  });

  const fetchBalance = useCallback(async () => {
    // 🔥 Simulación (aquí conectas tu backend)
    const response = [
      {
        cliente: "Juan Pérez",
        asesor: "Carlos López",
        total: 50000,
        cobrado: 30000,
      },
      {
        cliente: "María Gómez",
        asesor: "Andrea Ruiz",
        total: 40000,
        cobrado: 40000,
      },
    ];

    const calculado = response.map((item) => ({
      ...item,
      pendiente: item.total - item.cobrado,
    }));

    const facturado = calculado.reduce((acc, i) => acc + i.total, 0);
    const cobrado = calculado.reduce((acc, i) => acc + i.cobrado, 0);

    setData(calculado);
    setTotales({
      facturado,
      cobrado,
      pendiente: facturado - cobrado,
    });
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="balance-container">
      <BalanceHeader />
      <BalanceCards totales={totales} />
      <BalanceTable data={data} />
    </div>
  );
};

export default Balance;