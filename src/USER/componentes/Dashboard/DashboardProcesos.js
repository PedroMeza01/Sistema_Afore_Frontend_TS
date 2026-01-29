import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './DashboardProcesos.css';

export default function ProcesosDashboard() {
  const history = useHistory();

  // ===== MOCK "respuesta BD" =====
  const mockResponse = useMemo(
    () => ({
      filtros: {
        from: '2026-01-01',
        to: '2026-01-28',
        id_asesor: 'ALL',
        estatus: 'ALL'
      },
      kpis: {
        activos: 28,
        bloqueados: 5,
        cancelados: 2,
        tramite_solicitado: 14,
        tramite_sin_resultado: 6,
        listos_para_cobro: 9,
        monto_total_cobrar: 154320.5,
        comision_total: 18750.0,
        bono_total: 4200.0,
        docs_completos: 17,
        docs_incompletos: 11,
        citas_proximas_7: 4,
        citas_vencidas: 2,
        dias46_proximos_7: 3,
        dias46_vencidos: 1,
        inconsistencia_tramite: 1 // tramite_solicitado=true pero (expediente_actualizado/app_vinculada=false)
      },
      pendientesCriticos: [
        {
          tipo: 'TRAMITE_SIN_RESULTADO',
          titulo: 'Trámite solicitado sin resultado',
          count: 6,
          severidad: 'warn',
          accion: { label: 'Ver lista', route: '/procesos?f=tramite_sin_resultado' }
        },
        {
          tipo: 'DOCS_INCOMPLETOS',
          titulo: 'Expedientes incompletos',
          count: 11,
          severidad: 'warn',
          accion: { label: 'Ver lista', route: '/procesos?f=docs_incompletos' }
        },
        {
          tipo: 'CITAS_VENCIDAS',
          titulo: 'Citas Afore vencidas',
          count: 2,
          severidad: 'bad',
          accion: { label: 'Ver lista', route: '/procesos?f=citas_vencidas' }
        },
        {
          tipo: 'DIAS46_VENCIDOS',
          titulo: '46 días vencidos',
          count: 1,
          severidad: 'bad',
          accion: { label: 'Ver lista', route: '/procesos?f=46_vencidos' }
        },
        {
          tipo: 'INCONSISTENCIA_TRAMITE',
          titulo: 'Trámite marcado sin Expediente/App',
          count: 1,
          severidad: 'bad',
          accion: { label: 'Revisar', route: '/procesos?f=inconsistencia_tramite' }
        }
      ],
      calendario: [
        {
          id: 'ev1',
          date: '2026-01-29',
          tipo: 'CITA_AFORE',
          titulo: 'Cita Afore – Juan Pérez',
          id_proceso: 'P-001',
          id_cliente: 'C-001',
          estatus: 'ACTIVO'
        },
        {
          id: 'ev2',
          date: '2026-01-30',
          tipo: 'DIAS_46',
          titulo: 'Fecha 46 días – María López',
          id_proceso: 'P-002',
          id_cliente: 'C-002',
          estatus: 'ACTIVO'
        },
        {
          id: 'ev3',
          date: '2026-02-01',
          tipo: 'COBRO',
          titulo: 'Cobro – Carlos Ruiz',
          id_proceso: 'P-007',
          id_cliente: 'C-007',
          estatus: 'ACTIVO'
        },
        {
          id: 'ev4',
          date: '2026-01-28',
          tipo: 'DOCS_PENDIENTES',
          titulo: 'Docs pendientes – Ana Torres',
          id_proceso: 'P-003',
          id_cliente: 'C-003',
          estatus: 'ACTIVO'
        }
      ],
      topFaltantes: [
        { doc: 'INE_FRENTE', label: 'INE Frente', count: 7 },
        { doc: 'INE_POSTERIOR', label: 'INE Posterior', count: 6 },
        { doc: 'ESTADO_CUENTA', label: 'Estado de Cuenta', count: 4 },
        { doc: 'COMPROBANTE_DOM', label: 'Comprobante de Domicilio', count: 3 },
        { doc: 'CONTRATO_PAGARE', label: 'Contrato/Pagaré', count: 2 }
      ]
    }),
    []
  );

  // ===== filtros (solo UI, no pega a BD) =====
  const [from, setFrom] = useState(mockResponse.filtros.from);
  const [to, setTo] = useState(mockResponse.filtros.to);
  const [asesor, setAsesor] = useState(mockResponse.filtros.id_asesor);
  const [estatus, setEstatus] = useState(mockResponse.filtros.estatus);

  // ===== calendario modal =====
  const [calOpen, setCalOpen] = useState(false);

  const k = mockResponse.kpis;

  const money = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

  const openProceso = (id_proceso, id_cliente) => {
    // ajusta la ruta real de tu sistema
    history.push(`/clientes/${id_cliente}/procesos/${id_proceso}`);
  };

  const groupedEvents = useMemo(() => {
    const map = {};
    for (const ev of mockResponse.calendario) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    const dates = Object.keys(map).sort();
    return dates.map(d => ({ date: d, items: map[d] }));
  }, [mockResponse.calendario]);

  return (
    <div className="db-page">
      <div className="db-head">
        <div>
          <div className="db-title">Dashboard de Procesos</div>
          <div className="db-sub">Estatus, fechas y pendientes críticos</div>
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

      {/* FILTROS */}
      <div className="db-filters">
        <div className="db-filter">
          <label>Desde</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="db-filter">
          <label>Hasta</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="db-filter">
          <label>Asesor</label>
          <select value={asesor} onChange={e => setAsesor(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="A-001">Asesor 1</option>
            <option value="A-002">Asesor 2</option>
          </select>
        </div>
        <div className="db-filter">
          <label>Estatus</label>
          <select value={estatus} onChange={e => setEstatus(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>

        <div className="db-filter-actions">
          <button
            className="db-btn ghost"
            onClick={() => {
              setFrom(mockResponse.filtros.from);
              setTo(mockResponse.filtros.to);
              setAsesor(mockResponse.filtros.id_asesor);
              setEstatus(mockResponse.filtros.estatus);
            }}
          >
            Reset
          </button>
          <button className="db-btn">Aplicar (mock)</button>
        </div>
      </div>

      {/* KPI ROW 1 */}
      <div className="db-grid">
        <KpiCard title="Procesos activos" value={k.activos} tone="ok" sub={`Rango: ${from} → ${to}`} />
        <KpiCard title="Bloqueados" value={k.bloqueados} tone="warn" sub="Requieren acción" />
        <KpiCard
          title="Docs incompletos"
          value={k.docs_incompletos}
          tone="warn"
          sub={`Completos: ${k.docs_completos}`}
        />
        <KpiCard
          title="$ Total a cobrar"
          value={money(k.monto_total_cobrar)}
          tone="ok"
          sub={`Listos: ${k.listos_para_cobro}`}
        />
      </div>

      {/* KPI ROW 2 */}
      <div className="db-grid">
        <KpiCard
          title="Trámite solicitado"
          value={k.tramite_solicitado}
          tone="muted"
          sub={`Sin resultado: ${k.tramite_sin_resultado}`}
        />
        <KpiCard title="Citas (7 días)" value={k.citas_proximas_7} tone="muted" sub={`Vencidas: ${k.citas_vencidas}`} />
        <KpiCard
          title="46 días (7 días)"
          value={k.dias46_proximos_7}
          tone="muted"
          sub={`Vencidos: ${k.dias46_vencidos}`}
        />
        <KpiCard
          title="Inconsistencias"
          value={k.inconsistencia_tramite}
          tone={k.inconsistencia_tramite > 0 ? 'bad' : 'ok'}
          sub="Trámite sin Expediente/App"
        />
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

            {mockResponse.pendientesCriticos.map(p => (
              <div className="db-table-row" key={p.tipo}>
                <div className="db-cell">
                  <span className={`db-badge ${badgeClass(p.severidad)}`}>{p.severidad.toUpperCase()}</span>
                  <span className="db-text">{p.titulo}</span>
                </div>
                <div className="right">{p.count}</div>
                <div className="right">
                  <button className="db-link" onClick={() => history.push(p.accion.route)}>
                    {p.accion.label} →
                  </button>
                </div>
              </div>
            ))}
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
            {mockResponse.topFaltantes.map(d => (
              <div className="db-list-row" key={d.doc}>
                <div className="db-list-left">
                  <div className="db-doc-label">{d.label}</div>
                  <div className="db-doc-code">{d.doc}</div>
                </div>
                <div className="db-list-right">
                  <span className="db-pill">{d.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="db-note">
            Recomendación: marca categorías reales en ProcesoArchivo (INE_FRENTE, INE_POSTERIOR, etc.) para eliminar
            heurísticas.
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
                <div className="db-modal-sub">Eventos del rango seleccionado (mock)</div>
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
                        <div className="db-event" key={ev.id}>
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
