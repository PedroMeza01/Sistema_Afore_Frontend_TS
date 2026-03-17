import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import './ProcesosList.css';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import DateRangeFilter from './components/common/DateRangeFilter';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const FILTERS = {

  docs_incompletos: { label: 'Docs incompletos' },
  tramite_sin_resultado: { label: 'Trámite sin resultado' },
  citas_vencidas: { label: 'Citas vencidas' },
  '46_vencidos': { label: '46 días vencidos' },
  inconsistencia_tramite: { label: 'Inconsistencia trámite' },
  criticos: { label: 'Críticos' },
  docs: { label: 'Documentos' },
  solicitados: { label: 'Solicitados' },
  bloqueados: { label: 'Bloqueados' }
};

export default function ProcesosList() {
  const history = useHistory();
  const query = useQuery();
  const location = useLocation();
  const [auth] = useContext(CRMContext);

  const [asesores, setAsesores] = useState([]);
  const [filterAsesor, setFilterAsesor] = useState(query.get('asesor') || '');

  const f = query.get('f') || '';
  const [search, setSearch] = useState(query.get('q') || '');
  const [page, setPage] = useState(Number(query.get('page') || 1));
  const [limit, setLimit] = useState(Number(query.get('limit') || 10));

  const [from, setFrom] = useState(query.get('desde') || '');
  const [to, setTo] = useState(query.get('hasta') || '');

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterLabel = FILTERS[f]?.label || (f ? f : 'Todos');

  const pushQuery = next => {
    const q = new URLSearchParams(location.search);
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || Number.isNaN(v)) q.delete(k);
      else q.set(k, String(v));
    });
    history.push(`${location.pathname}?${q.toString()}`);


  };

  // ✅ useEffect 1 — sincronizar URL con estado
  useEffect(() => {
    setSearch(query.get('q') || '');
    setPage(Number(query.get('page') || 1));
    setLimit(Number(query.get('limit') || 10));
    setFrom(query.get('desde') || '');
    setTo(query.get('hasta') || '');
    setFilterAsesor(query.get('asesor') || '');
  }, [location.search]);

  // ✅ useEffect 2 — cargar asesores (independiente, solo una vez)
  useEffect(() => {
    if (!auth?.token) return;
    (async () => {
      try {

        const { data } = await usuariosAxios.get('/asesores', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const list = Array.isArray(data) ? data : (data?.mensaje ?? []);
        // console.log('ASESORES CARGADOS:', list); 
        setAsesores(Array.isArray(list) ? list : []);
      } catch (e) {
        // console.error('Error al cargar asesores', e);
      }
    })();
  }, [auth?.token]);

  // ✅ useEffect 3 — cargar procesos
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // En el useEffect 3, justo antes del GET
        // console.log('FILTRO ASESOR:', filterAsesor);
        // console.log('PARAMS:', {
        //   page, limit, search,
        //   f: f || undefined,
        //   id_asesor: filterAsesor || undefined
        // });
        const { data } = await usuariosAxios.get('/procesos', {
          params: {
            page,
            limit,
            search,
            f: f || undefined,
            desde: from || undefined,
            hasta: to || undefined,
            id_asesor: filterAsesor || undefined
          },
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (!mounted) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
        setMeta(data?.meta ?? { page, limit, totalItems: 0, totalPages: 1 });
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Error cargando procesos');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [auth?.token, page, limit, search, f, from, to, filterAsesor]);

  const onSearchSubmit = e => {
    e.preventDefault();
    pushQuery({ q: search, page: 1 });
  };

  const reset = () => {
    setSearch('');
    setFilterAsesor('');
    pushQuery({ q: '', page: 1, f: '', asesor: '' });
  };

  // ✅ handlers de fecha
  const handleDateChange = ({ from, to }) => {
    setFrom(from);
    setTo(to);
    pushQuery({ desde: from, hasta: to, page: 1 }); // ← agrega esto
  };

  const resetDateFilter = () => {
    setFrom('');
    setTo('');

    pushQuery({
      desde: '',
      hasta: '',
      page: 1
    });
  };

  const openProceso = p => {
    history.push(`/clientes/${p.id_cliente}/procesos/${p.id_proceso}`);
  };

  const canPrev = meta.page > 1;
  const canNext = meta.page < meta.totalPages;

  return (
    <div className="pr-page">
      <div className="pr-head">
        <div>
          <div className="pr-title">Procesos</div>
          <div className="pr-sub">
            Filtro: <b>{filterLabel}</b>
          </div>
        </div>

        <div className="pr-actions">
          <button className="pr-btn" onClick={() => history.push('/dashboard')}>
            Dashboard
          </button>
          <button className="pr-btn primary" onClick={() => history.push('/clientes')}>
            Ver clientes
          </button>
        </div>
      </div>

      <div className="pr-filters">

        <input
          className="pr-input"
          placeholder="Buscar por nombre, curp, nss, teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select
          className="pr-select"
          value={filterAsesor}
          onChange={e => {
            setFilterAsesor(e.target.value);
            pushQuery({ asesor: e.target.value, page: 1 });
          }}
        >
          <option value="">Todos los asesores</option>
          {asesores.map(a => {
            const nombre = [a?.nombre_asesor, a?.apellido_pat_asesor, a?.apellido_mat_asesor]
              .filter(Boolean)
              .join(' ');
            const label = a?.alias ? `${nombre} (${a.alias})` : nombre;
            return (
              <option key={a.id_asesor} value={a.id_asesor}>
                {label}
              </option>
            );
          })}
        </select>

        {/* ✅ filtro por fechas */}
        <DateRangeFilter from={from} to={to} onChange={handleDateChange} onReset={resetDateFilter} />



        <div className="pr-filterRow">
          <select className="pr-select" value={f} onChange={e => pushQuery({ f: e.target.value, page: 1 })}>
            <option value="">Todos</option>
            <option value="solicitados">Activos</option>
            <option value="docs_incompletos">Docs incompletos</option>
            <option value="tramite_sin_resultado">Trámite sin resultado</option>
            <option value="citas_vencidas">Citas vencidas</option>
            <option value="46_vencidos">46 días vencidos</option>
            <option value="inconsistencia_tramite">Inconsistencia trámite</option>
            <option value="criticos">Críticos</option>
            <option value="finalizados">Finalizados</option>
            <option value="bloqueados">Bloqueados</option>
          </select>

          <select
            className="pr-select"
            value={limit}
            onChange={e => pushQuery({ limit: Number(e.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="pr-card">
        <div className="pr-card-head">
          <div className="pr-card-title">Resultados ({meta.totalItems ?? items.length})</div>

          <div className="pr-pager">
            <button className="pr-btn sm" disabled={!canPrev} onClick={() => pushQuery({ page: page - 1 })}>
              ←
            </button>
            <span className="pr-pageInfo">
              Página <b>{meta.page}</b> / {meta.totalPages}
            </span>
            <button className="pr-btn sm" disabled={!canNext} onClick={() => pushQuery({ page: page + 1 })}>
              →
            </button>
          </div>
        </div>

        <div className="pr-table">
          <div className="pr-row head">
            <div>Cliente</div>
            <div>Estatus</div>
            <div>Docs</div>
            <div>Trámite</div>
            <div>Fechas</div>
            <div className="right">Acción</div>
          </div>

          {loading ? (
            <div className="pr-empty">Cargando...</div>
          ) : error ? (
            <div className="pr-empty">Error: {error}</div>
          ) : items.length === 0 ? (
            <div className="pr-empty">Sin resultados</div>
          ) : (
            items.map(p => (
              <div className="pr-row" key={p.id_proceso}>
                <div className="pr-cell">
                  <div className="pr-main">{p.cliente_nombre}</div>
                  <div className="pr-muted">
                    {p.curp_cliente || ''} · {p.telefono_cliente || ''}
                  </div>
                </div>

                <div className="pr-cell">
                  <span className={`pr-badge ${statusClass(p.estatus_proceso)}`}>
                    {(p.estatus_proceso || 'N/A').toUpperCase()}
                  </span>
                </div>

                <div className="pr-cell">
                  <div className="pr-main">{p.docs_ok ? 'COMPLETO' : 'INCOMPLETO'}</div>
                  <div className="pr-muted">
                    {p.docs_count}/{p.docs_required}
                  </div>
                </div>

                <div className="pr-cell">
                  <div className="pr-main">{p.tramite_solicitado ? 'SI' : 'NO'}</div>
                  <div className="pr-muted">{p.resultado_tramite || '-'}</div>
                </div>

                <div className="pr-cell">
                  <div className="pr-muted">Cita: {p.cita_afore || '-'}</div>
                  <div className="pr-muted">46 días: {p.fecha_46_dias || '-'}</div>
                </div>

                <div className="pr-cell right">
                  <button className="pr-link" onClick={() => openProceso(p)}>
                    Abrir proceso
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function statusClass(s) {
  const x = (s || '').toString().toUpperCase();
  if (x === 'ACTIVO') return 'ok';
  if (x === 'BLOQUEADO') return 'warn';
  if (x === 'CANCELADO') return 'bad';
  return 'muted';
}
