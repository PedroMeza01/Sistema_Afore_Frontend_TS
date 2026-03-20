import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import BalanceHeader from './BalanceHeader';
import BalanceCards from './BalanceCards';
import BalanceDesglose from './BalanceDesglose';
import { fetchBalanceMock } from './balanceMock';
import './balance.css';

const DEFAULT_LIMIT = 10;

const Balance = () => {
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [totales, setTotales] = useState({ cobrado: 0, comision_total: 0, bono_total: 0 });
  const [meta, setMeta] = useState({ page: 1, limit: DEFAULT_LIMIT, totalItems: 0, totalPages: 1 });
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Leer filtros desde la URL (fuente de verdad)
  const params = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return {
      search: q.get('search') || '',
      asesor: q.get('asesor') || '',
      desde: q.get('desde') || '',
      hasta: q.get('hasta') || '',
      page: Number(q.get('page')) || 1,
      limit: Number(q.get('limit')) || DEFAULT_LIMIT,
    };
  }, [location.search]);

  //  Actualizar URL con nuevos filtros
  const pushQuery = next => {
    const q = new URLSearchParams(location.search);

    Object.entries(next).forEach(([k, v]) => {
      if (!v && v !== 0) q.delete(k);
      else q.set(k, String(v));
    });

    history.push(`${location.pathname}?${q.toString()}`);
  };



  useEffect(() => {
    if (!auth?.token) { history.push('/'); return; }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);


        const { data } = await usuariosAxios.get('/balance', {
          params: {
            search: params.search,
            asesor: params.asesor,
            desde: params.desde,
            hasta: params.hasta,
            page: params.page,
            limit: params.limit,
          },
          headers: { Authorization: `Bearer ${auth.token}` }
        });


        if (!mounted) return;
        setItems(data.items);
        setTotales(data.totales);
        setMeta(data.meta);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Error cargando balance');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [auth?.token, params.search, params.asesor, params.desde, params.hasta, params.page, params.limit]);

  //  ─── PETICIÓN LISTA DE ASESORES (para el dropdown) ────────────────────────────
  // GET /asesores
  // Respuesta: [{ id_asesor, nombre_asesor, apellido_pat_asesor, apellido_mat_asesor }]
  useEffect(() => {
    if (!auth?.token) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await usuariosAxios.get('/asesores', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const list = Array.isArray(data) ? data : (data?.mensaje ?? data?.data ?? []);
        if (mounted) setAsesores(list);
      } catch { /* silencioso */ }
    })();
    return () => { mounted = false; };
  }, [auth?.token]);


  //  Desglose por asesor (agrupado sobre los items de la página actual)
  const desgloseAsesor = Object.values(
    items.reduce((acc, item) => {
      const key = item.asesor;
      if (!acc[key]) acc[key] = { label: key, id_asesor: item.id_asesor || '', cobrado: 0, comision: 0, bono: 0 };
      acc[key].cobrado += item.cobrado;
      acc[key].comision += item.comision_asesora;
      acc[key].bono += item.bono_asesora;
      return acc;
    }, {})
  );

  //  Desglose por cliente (tabla paginada)
  const desgloseCliente = items.map(item => ({
    label: item.cliente,
    asesor: item.asesor,
    cobrado: item.cobrado,
    comision: item.comision_asesora,
    bono: item.bono_asesora,
  }));

  return (
    <div className="balance-container">
      <BalanceHeader
        search={params.search}
        asesor={params.asesor}
        desde={params.desde}
        hasta={params.hasta}
        asesores={asesores}
        items={items}
        onSearchChange={val => pushQuery({ search: val, page: 1 })}
        onAsesorChange={val => pushQuery({ asesor: val, page: 1 })}
        onDesdeChange={val => pushQuery({ desde: val, page: 1 })}
        onHastaChange={val => pushQuery({ hasta: val, page: 1 })}
      />

      {error && <div className="balance-alert">{error}</div>}

      <BalanceCards totales={totales} />

      {loading ? (
        <div className="balance-loading">Cargando...</div>
      ) : (
        <BalanceDesglose
          desgloseAsesor={desgloseAsesor}
          desgloseCliente={desgloseCliente}
          meta={meta}
          onPageChange={page => pushQuery({ page })}
          onLimitChange={limit => pushQuery({ limit, page: 1 })}
        />
      )}
    </div>
  );
};

export default Balance;
