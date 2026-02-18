// calendar.utils.js
export const pad2 = n => String(n).padStart(2, '0');

export function toISODate(d) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// weekStartsOn: 0=Domingo, 1=Lunes
export function buildMonthMatrix(viewDate, weekStartsOn = 1) {
  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);

  // índice del día de la semana del 1ro del mes
  const firstDow = first.getDay(); // 0..6 (Dom..Sab)

  // offset para alinear inicio de semana
  const offset = (firstDow - weekStartsOn + 7) % 7;

  // primer día a dibujar en grilla
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);

  const weeks = [];
  const cursor = new Date(gridStart);

  // 6 semanas cubren cualquier mes
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthStart: first, monthEnd: last };
}

export function monthLabel(date, locale = 'es-MX') {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  // Capitaliza primera letra
  const s = fmt.format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
