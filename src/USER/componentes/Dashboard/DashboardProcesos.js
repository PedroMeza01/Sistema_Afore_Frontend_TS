import React, { useMemo, useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './DashboardProcesos.css';
import { CRMContext } from '../../../context/CRMContext';

export default function ProcesosDashboard() {
  const history = useHistory();
  const [auth] = useContext(CRMContext);

  // ===== calendario modal =====
  const [calOpen, setCalOpen] = useState(false);

  // ===== DATA DEL BACKEND =====
  const [dash, setDash] = useState({
    kpis: {
      activos: 0,
      bloqueados: 0,
      cancelados: 0,
      tramite_solicitado: 0,
      tramite_sin_resultado: 0,
      listos_para_cobro: 0,
      pendientes_por_cobrar: 0,
      comision_total: 0,
      bono_total: 0,
      docs_completos: 0,
      docs_incompletos: 0,
      citas_proximas_7: 0,
      citas_vencidas: 0,
      dias46_proximos_7: 0,
      dias46_vencidos: 0,
      inconsistencia_tramite: 0
    },
    pendientesCriticos: [],
    calendario: [],
    topFaltantes: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await usuariosAxios.get('/dashboard', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (!mounted) return;

        setDash({
          kpis: data?.kpis ?? dash.kpis,
          pendientesCriticos: Array.isArray(data?.pendientesCriticos) ? data.pendientesCriticos : [],
          calendario: Array.isArray(data?.calendario) ? data.calendario : [],
          topFaltantes: Array.isArray(data?.topFaltantes) ? data.topFaltantes : []
        });
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Error cargando dashboard');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const k = dash.kpis;

  const money = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

  const openProceso = (id_proceso, id_cliente) => {
    history.push(`/clientes/${id_cliente}/procesos/${id_proceso}`);
  };

  const groupedEvents = useMemo(() => {
    const map = {};
    for (const ev of dash.calendario || []) {
      if (!ev?.date) continue;
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    const dates = Object.keys(map).sort();
    return dates.map(d => ({ date: d, items: map[d] }));
  }, [dash.calendario]);

  return (
    <div className="db-page">
      <div className="db-head">
        <div>
          <div className="db-title">Dashboard de Procesos</div>
          <br></br>
          <div className="db-sub">Estatus, fechas y pendientes críticos</div>
          {/* si quieres indicador sin cambiar layout, descomenta */}
          {/* {loading ? <div className="db-sub">Cargando...</div> : null}
          {error ? <div className="db-sub">Error: {error}</div> : null} */}
        </div>

        <div className="db-head-actions">
          <button className="db-btn" onClick={() => setCalOpen(true)}>
            Calendario
          </button>
          <button className="db-btn primary" onClick={() => history.push('/procesos')}>
            Ver procesos
          </button>
        </div>
      </div>

      {/* KPI ROW 1 */}
      <div className="db-grid">
        <KpiCard title="Procesos activos" value={k.activos} tone="ok" />
        <KpiCard title="Bloqueados" value={k.bloqueados} tone="warn" />
        <KpiCard title="Tramites con docs pendientes" value={k.docs_incompletos} tone="warn" />
      </div>

      {/* KPI ROW 2 */}
      <div className="db-grid">
        <KpiCard title="Trámite solicitado" value={k.tramite_solicitado} tone="muted" />
        <KpiCard title="Citas (7 días)" value={k.citas_proximas_7} tone="muted" />
        <KpiCard title="46 días (7 días)" value={k.dias46_proximos_7} tone="muted" />
      </div>

      {/* CONTENIDO */}
      <div className="db-two">
        {/* Pendientes críticos */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Pendientes críticos</div>
            <button className="db-btn sm" onClick={() => history.push('/procesos?f=criticos')}>
              Ver todo
            </button>
          </div>

          <div className="db-table">
            <div className="db-table-row head">
              <div>Concepto</div>
              <div className="right">Cantidad</div>
              <div className="right">Acción</div>
            </div>

            {(dash.pendientesCriticos || []).length === 0 ? (
              <div className="db-table-row">
                <div className="db-cell">
                  <span className={`db-badge ${badgeClass('OK')}`}>OK</span>
                  <span className="db-text">Sin pendientes críticos</span>
                </div>
                <div className="right">0</div>
                <div className="right">-</div>
              </div>
            ) : (
              dash.pendientesCriticos.map(p => (
                <div className="db-table-row" key={p.tipo}>
                  <div className="db-cell">
                    <span className={`db-badge ${badgeClass(p.severidad)}`}>
                      {(p.severidad || 'muted').toUpperCase()}
                    </span>
                    <span className="db-text">{p.titulo}</span>
                  </div>
                  <div className="right">{p.count}</div>
                  <div className="right">
                    <button className="db-link" onClick={() => history.push(p.accion?.route || '/procesos')}>
                      {p.accion?.label || 'Ver'} →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top faltantes */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Top documentos faltantes</div>
            <button className="db-btn sm" onClick={() => history.push('/procesos?f=docs')}>
              Ver procesos →
            </button>
          </div>

          <div className="db-list">
            {(dash.topFaltantes || []).length === 0 ? (
              <div className="db-list-row">
                <div className="db-list-left">
                  <div className="db-doc-label">Sin faltantes</div>
                </div>
                <div className="db-list-right">
                  <span className="db-pill">0</span>
                </div>
              </div>
            ) : (
              dash.topFaltantes.map(d => (
                <div className="db-list-row" key={d.doc}>
                  <div className="db-list-left">
                    <div className="db-doc-label">{d.label}</div>
                  </div>
                  <div className="db-list-right">
                    <span className="db-pill">{d.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CALENDARIO */}
      {calOpen ? (
        <div className="db-modal-backdrop" onClick={() => setCalOpen(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-head">
              <div>
                <div className="db-modal-title">Calendario de actividades</div>
              </div>
              <button className="db-btn sm" onClick={() => setCalOpen(false)}>
                Cerrar
              </button>
            </div>

            <div className="db-modal-body">
              {groupedEvents.length === 0 ? (
                <div className="db-empty">Sin eventos</div>
              ) : (
                groupedEvents.map(g => (
                  <div className="db-day" key={g.date}>
                    <div className="db-day-title">{g.date}</div>
                    <div className="db-day-list">
                      {g.items.map(ev => (
                        <div
                          className={`db-event 
    ${isPast(ev.date) ? 'is-past' : ''} 
    ${isToday(ev.date) ? 'is-today' : ''} 
    ${isCritical(ev.tipo) ? 'is-critical' : ''}
  `}
                          key={ev.id}
                        >
                          <div className={`db-dot ${eventTone(ev.tipo)}`} />
                          <div className="db-event-main">
                            <div className="db-event-title">{ev.titulo}</div>
                            <div className="db-event-meta">
                              Tipo: <b>{ev.tipo}</b> · Estatus: <b>{ev.estatus}</b> · Proceso: <b>{ev.id_proceso}</b>
                            </div>
                          </div>
                          <div className="db-event-actions">
                            <button className="db-btn sm" onClick={() => openProceso(ev.id_proceso, ev.id_cliente)}>
                              Abrir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="db-modal-foot">
              <div className="db-legend">
                <LegendItem tone="blue" label="Cita Afore" />
                <LegendItem tone="orange" label="46 días" />
                <LegendItem tone="green" label="Cobro" />
                <LegendItem tone="red" label="Docs pendientes" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ title, value, sub, tone }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

function badgeClass(sev) {
  const s = (sev || '').toString().toUpperCase();
  if (s === 'BAD') return 'bad';
  if (s === 'WARN') return 'warn';
  if (s === 'OK') return 'ok';
  return 'muted';
}

function eventTone(tipo) {
  const t = (tipo || '').toString().toUpperCase();
  if (t === 'CITA_AFORE') return 'blue';
  if (t === 'DIAS_46') return 'orange';
  if (t === 'COBRO') return 'green';
  if (t === 'DOCS_PENDIENTES') return 'red';
  return 'muted';
}

function LegendItem({ tone, label }) {
  return (
    <div className="db-legend-item">
      <span className={`db-dot ${tone}`} />
      <span>{label}</span>
    </div>
  );
}

function isToday(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

function isPast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

function isCritical(tipo) {
  return ['DOCS_PENDIENTES', 'DIAS_46'].includes(tipo);
}
