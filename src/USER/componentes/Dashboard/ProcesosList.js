import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import './ProcesosList.css';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';

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
  solicitados: { label: 'Solicitados' }
};

export default function ProcesosList() {
  const history = useHistory();
  const query = useQuery();
  const location = useLocation();
  const [auth] = useContext(CRMContext);

  const f = query.get('f') || '';
  const [search, setSearch] = useState(query.get('q') || '');
  const [page, setPage] = useState(Number(query.get('page') || 1));
  const [limit, setLimit] = useState(Number(query.get('limit') || 10));

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

  // Mantén estado sincronizado con URL si el usuario navega
  useEffect(() => {
    setSearch(query.get('q') || '');
    setPage(Number(query.get('page') || 1));
    setLimit(Number(query.get('limit') || 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await usuariosAxios.get('/procesos', {
          params: { page, limit, search, f: f || undefined },
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

    return () => {
      mounted = false;
    };
  }, [auth?.token, page, limit, search, f]);

  const onSearchSubmit = e => {
    e.preventDefault();
    pushQuery({ q: search, page: 1 });
  };

  const reset = () => {
    setSearch('');
    pushQuery({ q: '', page: 1, f: '' });
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
            ← Dashboard
          </button>
          <button className="pr-btn primary" onClick={() => history.push('/clientes')}>
            Ver clientes
          </button>
        </div>
      </div>

      <div className="pr-filters">
        <form onSubmit={onSearchSubmit} className="pr-search">
          <input
            className="pr-input"
            placeholder="Buscar por nombre, curp, nss, teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="pr-btn" type="submit">
            Buscar
          </button>
          <button className="pr-btn ghost" type="button" onClick={reset}>
            Reset
          </button>
        </form>

        <div className="pr-filterRow">
          <select className="pr-select" value={f} onChange={e => pushQuery({ f: e.target.value, page: 1 })}>
            <option value="">Todos</option>
            <option value="docs_incompletos">Docs incompletos</option>
            <option value="tramite_sin_resultado">Trámite sin resultado</option>
            <option value="citas_vencidas">Citas vencidas</option>
            <option value="46_vencidos">46 días vencidos</option>
            <option value="inconsistencia_tramite">Inconsistencia trámite</option>
            <option value="criticos">Críticos</option>
            <option value="solicitados">Solicitados</option>
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
                    Abrir →
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
