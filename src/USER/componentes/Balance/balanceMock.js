// balanceMock.js
// 🔥 Datos simulados realistas
// ------------------------------------------------------------
// Contrato esperado del endpoint real (para cuando llegue el dev):
//   GET /balance?id_organizacion=xxx&asesor=xxx&mes=xxx
//   Response: {
//     items: [{
//       id_proceso, cliente, asesor, monto_cobrar, cobrado,
//       pendiente, listo_para_cobro, fecha_cobro,
//       comision_asesora, bono_asesora, mes
//     }],
//     totales: { facturado, cobrado, pendiente, comision_total, bono_total }
//   }
// ------------------------------------------------------------

export const MOCK_ASESORES = [
  'Carlos López',
  'Andrea Ruiz',
  'Miguel Torres',
  'Sofía Méndez',
  'Roberto Vega'
];

export const MOCK_MESES = [
  '2024-10', '2024-11', '2024-12',
  '2025-01', '2025-02', '2025-03'
];

const CLIENTES = [
  'Juan Pérez',     'María Gómez',    'Luis Hernández', 'Ana Martínez',   'Pedro Sánchez',
  'Laura García',   'Jorge Ramírez',  'Patricia López', 'Ernesto Flores', 'Carmen Díaz',
  'Roberto Jiménez','Alicia Moreno',  'Fernando Castro','Claudia Ortega', 'Manuel Ruiz',
  'Verónica Torres','Alejandro Vargas','Sandra Reyes',  'Eduardo Mendoza','Gabriela Cruz'
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generamos una vez para que los filtros sean consistentes durante la sesión
const BASE_DATA = CLIENTES.map((cliente, i) => {
  const monto_cobrar    = rand(15000, 90000);
  const listo_para_cobro = Math.random() > 0.3;
  const cobrado         = listo_para_cobro
    ? (Math.random() > 0.4 ? monto_cobrar : rand(0, monto_cobrar))
    : 0;
  const mes             = MOCK_MESES[i % MOCK_MESES.length];
  const fecha_cobro     = listo_para_cobro
    ? `${mes}-${String(rand(1, 28)).padStart(2, '0')}`
    : null;

  return {
    id_proceso:        `proc-${i + 1}`,
    cliente,
    asesor:            MOCK_ASESORES[i % MOCK_ASESORES.length],
    monto_cobrar,
    cobrado,
    pendiente:         monto_cobrar - cobrado,
    listo_para_cobro,
    fecha_cobro,
    comision_asesora:  Math.round(monto_cobrar * 0.08),
    bono_asesora:      cobrado === monto_cobrar ? Math.round(monto_cobrar * 0.02) : 0,
    mes
  };
});

export function fetchBalanceMock({ asesor = '', mes = '' } = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      let items = [...BASE_DATA];
      if (asesor) items = items.filter(i => i.asesor === asesor);
      if (mes)    items = items.filter(i => i.mes    === mes);

      const facturado      = items.reduce((a, i) => a + i.monto_cobrar,       0);
      const cobrado        = items.reduce((a, i) => a + i.cobrado,            0);
      const comision_total = items.reduce((a, i) => a + i.comision_asesora,   0);
      const bono_total     = items.reduce((a, i) => a + i.bono_asesora,       0);

      resolve({
        items,
        totales: { facturado, cobrado, pendiente: facturado - cobrado, comision_total, bono_total }
      });
    }, 350); // simula latencia de red
  });
}