// balanceMock.js — TEMPORAL
// ──────────────────────────────────────────────────────────────────────────────
// Contrato del endpoint real que reemplazará este mock:
//
//   GET /balance?search=&asesor=&desde=&hasta=&page=1&limit=10
//   Headers: Authorization: Bearer <token>
//
//   Response: {
//     items: [{
//       id_proceso:       string,
//       cliente:          string,   // nombre completo
//       asesor:           string,   // nombre completo del asesor
//       cobrado:          number,
//       comision_asesora: number,   // 8% del cobrado aprox
//       bono_asesora:     number,
//       fecha_cobro:      string    // "YYYY-MM-DD"
//     }],
//     totales: {
//       cobrado:        number,
//       comision_total: number,
//       bono_total:     number
//     },
//     meta: {
//       page:       number,
//       limit:      number,
//       totalItems: number,
//       totalPages: number
//     }
//   }
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_ASESORES = [
  'Carlos López', 'Andrea Ruiz', 'Miguel Torres', 'Sofía Méndez', 'Roberto Vega'
];

const CLIENTES = [
  'Juan Pérez',      'María Gómez',     'Luis Hernández',  'Ana Martínez',    'Pedro Sánchez',
  'Laura García',    'Jorge Ramírez',   'Patricia López',  'Ernesto Flores',  'Carmen Díaz',
  'Roberto Jiménez', 'Alicia Moreno',   'Fernando Castro', 'Claudia Ortega',  'Manuel Ruiz',
  'Verónica Torres', 'Alejandro Vargas','Sandra Reyes',    'Eduardo Mendoza', 'Gabriela Cruz'
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const BASE_DATA = CLIENTES.map((cliente, i) => {
  const cobrado = rand(15000, 90000);
  const mes = String((i % 12) + 1).padStart(2, '0');
  return {
    id_proceso:       `proc-${i + 1}`,
    cliente,
    asesor:           MOCK_ASESORES[i % MOCK_ASESORES.length],
    cobrado,
    comision_asesora: Math.round(cobrado * 0.08),
    bono_asesora:     Math.random() > 0.5 ? Math.round(cobrado * 0.02) : 0,
    fecha_cobro:      `2025-${mes}-${String(rand(1, 28)).padStart(2, '0')}`
  };
});

export function fetchBalanceMock({ search = '', asesor = '', desde = '', hasta = '', page = 1, limit = 10 } = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      let items = [...BASE_DATA];

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(i => i.cliente.toLowerCase().includes(q));
      }
      if (asesor) items = items.filter(i => i.asesor === asesor);
      if (desde)  items = items.filter(i => i.fecha_cobro >= desde);
      if (hasta)  items = items.filter(i => i.fecha_cobro <= hasta);

      const totalItems  = items.length;
      const totalPages  = Math.max(1, Math.ceil(totalItems / limit));
      const safePage    = Math.min(Math.max(1, page), totalPages);
      const paged       = items.slice((safePage - 1) * limit, safePage * limit);

      const cobrado        = items.reduce((a, i) => a + i.cobrado, 0);
      const comision_total = items.reduce((a, i) => a + i.comision_asesora, 0);
      const bono_total     = items.reduce((a, i) => a + i.bono_asesora, 0);

      resolve({
        items: paged,
        totales: { cobrado, comision_total, bono_total },
        meta: { page: safePage, limit, totalItems, totalPages }
      });
    }, 350);
  });
}
