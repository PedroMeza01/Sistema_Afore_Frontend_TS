import React, { useEffect, useMemo, useState } from 'react';
import { buildMonthMatrix, monthLabel, toISODate } from '../../../../helpers/calendar.utils';


// Reusa tus funciones (puedes borrarlas del Dashboard si las mueves aquí)
const eventTone = tipo => {
  const t = (tipo || '').toString().toUpperCase();
  if (t === 'CITA_AFORE') return 'blue';
  if (t === 'DIAS_46') return 'orange';
  if (t === 'COBRO') return 'green';
  if (t === 'DOCS_PENDIENTES') return 'red';
  return 'muted';
};

const isCritical = tipo => ['DOCS_PENDIENTES', 'DIAS_46'].includes((tipo || '').toString().toUpperCase());

const isToday = isoDate => {
  const today = new Date().toISOString().slice(0, 10);
  return isoDate === today;
};

const isPast = isoDate => {
  const today = new Date().toISOString().slice(0, 10);
  return isoDate < today;
};

export default function CalendarioModal({
  open,
  onClose,
  events = [], // [{ id, date:'YYYY-MM-DD', tipo, titulo, estatus, id_proceso, id_cliente }]
  onOpenProceso // (id_proceso, id_cliente) => void
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // indexa eventos por date
  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const ev of events || []) {
      if (!ev?.date) continue;
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  // al abrir, centra el calendario en el mes de hoy y selecciona hoy (si no quieres eso, quítalo)
  useEffect(() => {
    if (!open) return;
    const todayISO = new Date().toISOString().slice(0, 10);
    setSelectedDate(todayISO);
    setViewDate(new Date()); // mes actual
  }, [open]);

  const { weeks, monthStart } = useMemo(() => buildMonthMatrix(viewDate, 1), [viewDate]);

  const daysHeader = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const selectedEvents = eventsByDate.get(selectedDate) || [];

  const prevMonth = () => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goToday = () => {
    const t = new Date();
    setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t.toISOString().slice(0, 10));
  };

  if (!open) return null;

  return (
    <div className="db-modal-backdrop" onClick={onClose}>
      <div className="db-modal calendar-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-head">
          <div>
            <div className="db-modal-title">Calendario</div>
            <div className="db-sub">{monthLabel(monthStart)}</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="db-btn sm" onClick={prevMonth}>
              ←
            </button>
            <button className="db-btn sm" onClick={goToday}>
              Hoy
            </button>
            <button className="db-btn sm" onClick={nextMonth}>
              →
            </button>
            <button className="db-btn sm" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="db-modal-body">
          <div className="cal-wrap">
            {/* GRID */}
            <div className="cal-grid">
              {daysHeader.map(d => (
                <div className="cal-dow" key={d}>
                  {d}
                </div>
              ))}

              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  const iso = toISODate(day);
                  const inMonth = day.getMonth() === viewDate.getMonth();
                  const dayEvents = eventsByDate.get(iso) || [];
                  const hasCritical = dayEvents.some(e => isCritical(e.tipo));

                  return (
                    <button
                      key={`${wi}-${di}`}
                      className={[
                        'cal-cell',
                        inMonth ? 'in-month' : 'out-month',
                        iso === selectedDate ? 'selected' : '',
                        isToday(iso) ? 'today' : '',
                        hasCritical ? 'critical' : ''
                      ].join(' ')}
                      onClick={() => setSelectedDate(iso)}
                      type="button"
                    >
                      <div className="cal-daynum">{day.getDate()}</div>

                      {/* chips */}
                      <div className="cal-chips">
                        {dayEvents.slice(0, 3).map(ev => (
                          <span key={ev.id} className={`cal-chip ${eventTone(ev.tipo)}`} title={ev.titulo}>
                            {ev.tipo}
                          </span>
                        ))}
                        {dayEvents.length > 3 ? <span className="cal-more">+{dayEvents.length - 3}</span> : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* PANEL DERECHA */}
            <div className="cal-side">
              <div className="cal-side-head">
                <div className="cal-side-title">Eventos</div>
                <div className="cal-side-date">
                  {selectedDate} {isToday(selectedDate) ? '· Hoy' : isPast(selectedDate) ? '· Pasado' : ''}
                </div>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="db-empty">Sin eventos</div>
              ) : (
                <div className="cal-events">
                  {selectedEvents.map(ev => (
                    <div
                      key={ev.id}
                      className={[
                        'db-event',
                        isPast(ev.date) ? 'is-past' : '',
                        isToday(ev.date) ? 'is-today' : '',
                        isCritical(ev.tipo) ? 'is-critical' : ''
                      ].join(' ')}
                    >
                      <div className={`db-dot ${eventTone(ev.tipo)}`} />
                      <div className="db-event-main">
                        <div className="db-event-title">{ev.titulo}</div>
                        <div className="db-event-meta">
                          Tipo: <b>{ev.tipo}</b> · Estatus: <b>{ev.estatus}</b> · Proceso: <b>{ev.id_proceso}</b>
                        </div>
                      </div>
                      <div className="db-event-actions">
                        <button className="db-btn sm" onClick={() => onOpenProceso?.(ev.id_proceso, ev.id_cliente)}>
                          Abrir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="db-legend" style={{ marginTop: 12 }}>
                <LegendItem tone="blue" label="Cita Afore" />
                <LegendItem tone="orange" label="46 días" />
                <LegendItem tone="green" label="Cobro" />
                <LegendItem tone="red" label="Docs pendientes" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ tone, label }) {
  return (
    <div className="db-legend-item">
      <span className={`db-dot ${tone}`} />
      <span>{label}</span>
    </div>
  );
}
