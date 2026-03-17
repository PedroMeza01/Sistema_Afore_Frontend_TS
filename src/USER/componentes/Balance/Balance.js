import React, { useEffect, useState, useCallback, useContext } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import BalanceHeader from './BalanceHeader';
import BalanceCards from './BalanceCards';
import BalanceTable from './BalanceTable';
import BalanceDesglose from './BalanceDesglose';
import { fetchBalanceMock } from './balanceMock';
import './balance.css';

// ─────────────────────────────────────────────────────────────
// 🔌 Cuando el backend esté listo, reemplaza fetchBalanceMock
//    por una llamada real así:
//
//  import usuariosAxios from '../../../config/axios';
//
//  const { data } = await usuariosAxios.get('/balance', {
//    params: { asesor, mes },
//    headers: { Authorization: `Bearer ${auth.token}` }
//  });
//  return data;  // misma forma: { items, totales }
// ─────────────────────────────────────────────────────────────

const Balance = () => {
  const [auth] = useContext(CRMContext);

  const [items, setItems] = useState([]);
  const [totales, setTotales] = useState({
    facturado: 0, cobrado: 0, pendiente: 0,
    comision_total: 0, bono_total: 0
  });

  const [asesor, setAsesor] = useState('');
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 Mock — reemplazar por llamada axios cuando el backend esté listo
      const data = await fetchBalanceMock({ asesor, mes });

      setItems(data.items);
      setTotales(data.totales);
    } catch (e) {
      setError(e?.message || 'Error cargando balance');
    } finally {
      setLoading(false);
    }
  }, [asesor, mes]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Desglose por asesor (calculado desde items)
  const desgloseAsesor = Object.values(
    items.reduce((acc, item) => {
      if (!acc[item.asesor]) {
        acc[item.asesor] = { label: item.asesor, monto_cobrar: 0, cobrado: 0, comision: 0, bono: 0 };
      }
      acc[item.asesor].monto_cobrar += item.monto_cobrar;
      acc[item.asesor].cobrado += item.cobrado;
      acc[item.asesor].comision += item.comision_asesora;
      acc[item.asesor].bono += item.bono_asesora;
      return acc;
    }, {})
  );

  // Desglose por mes
  const desgloseMes = Object.values(
    items.reduce((acc, item) => {
      if (!acc[item.mes]) {
        acc[item.mes] = { label: item.mes, monto_cobrar: 0, cobrado: 0 };
      }
      acc[item.mes].monto_cobrar += item.monto_cobrar;
      acc[item.mes].cobrado += item.cobrado;
      return acc;
    }, {})
  ).sort((a, b) => a.label.localeCompare(b.label));

  // Pendientes de cobro
  const pendientes = items.filter(i => i.pendiente > 0);

  return (
    <div className="balance-container">
      <BalanceHeader
        asesor={asesor}
        mes={mes}
        onAsesorChange={setAsesor}
        onMesChange={setMes}
        items={items}
      />

      {error && <div className="balance-alert">{error}</div>}

      <BalanceCards totales={totales} />

      {loading ? (
        <div className="balance-loading">Cargando...</div>
      ) : (
        <>
          <BalanceDesglose
            desgloseAsesor={desgloseAsesor}
            desgloseMes={desgloseMes}
          />

          <BalanceTable
            data={pendientes}
            titulo="Procesos pendientes de cobro"
            showComision
          />
        </>
      )}
    </div>
  );
};

export default Balance;