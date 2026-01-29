import React from 'react';
import { useHistory } from 'react-router-dom';
import './DashboardProcesos.css';

export default function DashboardProcesos() {
  const history = useHistory();

  // ===== Datos estáticos =====
  const kpis = [
    { id: 'k1', title: 'Procesos Activos', value: 12, variant: 'blue' },
    { id: 'k2', title: 'Esperando 46 Días', value: 5, variant: 'yellow' },
    { id: 'k3', title: 'Citas Pendientes', value: 2, variant: 'red' },
    { id: 'k4', title: 'Listos para Depósito', value: 3, variant: 'green' }
  ];

  const acciones = [
    { id: 'a1', cliente: 'Juan Pérez', proceso: 'Retiro Desempleo', accion: 'Cumple 46 días', fecha: 'Hoy' },
    { id: 'a2', cliente: 'María Gómez', proceso: 'Retiro Desempleo', accion: 'Agendar cita AFORE', fecha: 'Mañana' },
    { id: 'a3', cliente: 'Petre Perez', proceso: 'Retiro Desempleo', accion: '', fecha: 'Hoy' }
  ];

  const alertas = [
    { id: 'al1', type: 'warn', text: '3 Clientes cumplen 46 días esta semana' },
    { id: 'al2', type: 'danger', text: '1 Proceso Rechazado' }
  ];

  const goToProceso = row => {
    // Ruta ejemplo: cámbiala por tu ruta real de detalle
    history.push(`/procesos/${row.id}`);
  };

  return (
    <div className="db-page">
      {/* ===== KPIs ===== */}
      <div className="db-kpis">
        {kpis.map(k => (
          <div key={k.id} className={`db-kpi ${k.variant}`}>
            <div className="db-kpi-title">{k.title}</div>
            <div className="db-kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ===== ACCIONES DEL DÍA ===== */}
      <div className="db-card">
        <div className="db-card-title">Acciones del Día</div>

        <div className="db-table">
          <div className="db-row db-head">
            <div>Cliente</div>
            <div>Proceso</div>
            <div>Acción</div>
            <div>Fecha</div>
            <div />
          </div>

          {acciones.map(a => (
            <div
              key={a.id}
              className="db-row db-body"
              role="button"
              tabIndex={0}
              onClick={() => goToProceso(a)}
              onKeyDown={e => e.key === 'Enter' && goToProceso(a)}
            >
              <div className="db-client">
                <span className="db-avatar" />
                <span>{a.cliente}</span>
              </div>
              <div>{a.proceso}</div>
              <div className="db-accion">{a.accion || '-'}</div>
              <div className="db-fecha">{a.fecha}</div>
              <div className="db-arrow">›</div>
            </div>
          ))}
        </div>

        {/* ===== ALERTAS ===== */}
        <div className="db-alerts">
          <div className="db-alerts-title">Alertas</div>

          {alertas.map(al => (
            <div key={al.id} className="db-alert-row">
              <span className={`db-alert-icon ${al.type}`} />
              <span>{al.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
