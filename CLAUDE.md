# CLAUDE.md — Contexto del Proyecto CRM

## Stack tecnológico

**Frontend:** React (React Router v5, Context API, Axios)  
**Backend:** Node.js + TypeScript + Express + Sequelize (raw SQL con QueryTypes)  
**Base de datos:** PostgreSQL  
**Autenticación:** JWT via CRMContext (`auth.token`)

---

## Estructura del proyecto (Frontend)
```
src/
├── context/
│   └── CRMContext.js          # Contexto global de autenticación
├── config/
│   └── axios.js               # Instancia axios con baseURL
└── components/
    ├── Procesos/
    │   └── ProcesosList.js    # Lista paginada de procesos con filtros
    └── Balance/
        ├── Balance.js         # Orquestador principal
        ├── BalanceCards.js    # Tarjetas de métricas globales
        ├── BalanceDesglose.js # Tabs: Por Asesor / Por Cliente
        ├── BalanceHeader.js   # Filtro por asesor + exportar CSV
        ├── BalanceTable.js    # Tabla de detalle
        ├── balanceMock.js     # Mock del backend (temporal)
        └── balance.css        # Estilos del módulo
```

---

## Módulo Balance — Estado actual

### Qué hace
Muestra el resumen financiero de los procesos cobrados:
- **Total Cobrado** — suma de todos los cobros registrados
- **Comisiones + Bonos** — lo que le corresponde a cada asesor
- **Saldo Libre** — lo que queda después de pagar comisiones (`cobrado - (comision - bono) unificarlos en un solo campo para que el cliente sepa cuanto gano su asesor y cuanto le quedo libre a el del total.`)
- **Solo se hará la estructura del FrontEnd para que se conecte el backend**

### Reglas de negocio importantes
- **No existe saldo pendiente.** Solo se capturan cobros ya realizados.
- **Requiero hacer un filtro por mes** Se eliminó pero requiero poder seleccionar el filtro en base a la fecha de cobro.
- El saldo libre = `cobrado - comision_asesora - bono_asesora`
- Cada `item` representa un proceso vinculado a un cliente y un asesor.

### Estructura de un `item` (viene del backend o mock)
```typescript
{
  id_proceso:        string;
  cliente:           string;   // nombre completo del cliente
  asesor:            string;   // nombre del asesor
  cobrado:           number;   // monto cobrado
  comision_asesora:  number;   // comisión del asesor (8% del cobrado)
  bono_asesora:      number;   // bono adicional si cobró el 100%
  mes:               string;   // "YYYY-MM" (existe en el mock, no se usa en UI)
}
```

### Estructura de `totales` (simplificada)
```typescript
{
  cobrado:        number;
  comision_total: number;
  bono_total:     number;
}
```

### Filtros disponibles actualmente
- **Por asesor** — dropdown con lista de asesores
- **Exportar CSV** — descarga los items actuales

---

## Módulo Procesos — Filtros de referencia

El módulo `ProcesosList.js` es el más completo en términos de filtros.
Úsalo como referencia de patrón para aplicar filtros similares en Balance.

### Filtros que maneja ProcesosList
| Parámetro URL | Tipo | Descripción |
|---|---|---|
| `q` | string | Búsqueda por nombre, CURP, NSS, teléfono |
| `f` | string | Filtro especial KPI (ver lista abajo) |
| `asesor` | string | id_asesor |
| `desde` | string | Fecha inicio rango (YYYY-MM-DD) |
| `hasta` | string | Fecha fin rango (YYYY-MM-DD) |
| `page` | number | Página actual |
| `limit` | number | Registros por página (10/20/50) |

### Filtros especiales `f` disponibles
```
solicitados          → tramite_solicitado = true
docs_incompletos     → documentos faltantes
tramite_sin_resultado→ trámite sin resultado
citas_vencidas       → cita_afore vencida
46_vencidos          → fecha_46_dias vencida
inconsistencia_tramite
firma_mas_10_dias    → fecha_firma > 10 días y fecha_baja_imss IS NULL
tramite_mas_5_dias   → fecha_tramite > 5 días y fecha_cobro IS NULL
criticos             → combinación de múltiples alertas
finalizados
bloqueados
```

### Patrón de URL que usa ProcesosList
```
/procesos?q=juan&f=criticos&asesor=3&desde=2025-01-01&hasta=2025-03-31&page=1&limit=10
```

### Patrón de llamada al backend
```javascript
const { data } = await usuariosAxios.get('/procesos', {
  params: { page, limit, search, f, desde, hasta, id_asesor },
  headers: { Authorization: `Bearer ${auth.token}` }
});
// Responde: { items: [...], meta: { page, limit, totalItems, totalPages } }
```

---

## Módulo Balance — Lo que se necesita rediseñar

### Objetivo del rediseño
Rediseñar la pantalla de Balance para que sea **filtrable principalmente por nombre de cliente**, 
manteniendo también los filtros por asesor y rango de fechas, siguiendo el mismo patrón 
de URL y UX que ya usa `ProcesosList`.

### Filtros que debe tener el Balance rediseñado
| Filtro | Descripción |
|---|---|
| **Búsqueda por cliente** | Input de texto — busca por nombre completo del cliente |
| **Por asesor** | Dropdown — igual que el actual |
| **Rango de fechas** | Desde / Hasta — sobre la fecha de cobro |
| **Paginación** | Igual que ProcesosList (page, limit) |

### Columnas que debe mostrar la tabla de detalle
| Columna | Campo |
|---|---|
| Cliente | `item.cliente` |
| Asesor | `item.asesor` |
| Total Cobrado | `item.cobrado` |
| Comisión | `item.comision_asesora` |
| Bono | `item.bono_asesora` |
| Saldo Libre | `cobrado - comision - bono` |

### Tarjetas globales (mantener)
- Total Cobrado
- Comisiones + Bonos  
- Saldo Libre

### Tabs de desglose (mantener)
- **Por Asesor** — agrupado, con totales por asesor
- **Por Cliente** — tabla detallada con búsqueda

---

## Convenciones de código del proyecto

### Manejo de estado y efectos
```javascript
// ✅ Patrón estándar del proyecto
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      setLoading(true);
      const { data } = await usuariosAxios.get('/ruta', { ... });
      if (!mounted) return;
      setItems(data.items);
    } catch (e) {
      if (!mounted) return;
      setError(e?.message || 'Error');
    } finally {
      if (mounted) setLoading(false);
    }
  })();
  return () => { mounted = false; };
}, [deps]);
```

### Navegación con URL como fuente de verdad
```javascript
// ✅ Patrón estándar — pushQuery actualiza la URL
const pushQuery = next => {
  const q = new URLSearchParams(location.search);
  Object.entries(next).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '' || Number.isNaN(v)) q.delete(k);
    else q.set(k, String(v));
  });
  history.push(`${location.pathname}?${q.toString()}`);
};
```

### Formato de moneda MXN
```javascript
const fmt = num =>
  (num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
```

### Autenticación en cada request
```javascript
headers: { Authorization: `Bearer ${auth.token}` }
```

---

## Endpoint de Balance (por construir en backend)
```
GET /balance?search=juan&asesor=3&desde=2025-01-01&hasta=2025-03-31&page=1&limit=10
```

**Response esperada:**
```typescript
{
  items: BalanceItem[];
  totales: {
    cobrado:        number;
    comision_total: number;
    bono_total:     number;
  };
  meta: {
    page:       number;
    limit:      number;
    totalItems: number;
    totalPages: number;
  }
}
```

---

## Notas importantes para Claude

1. **No inventar campos** — usar solo los campos documentados arriba.
2. **No agregar saldo pendiente** — no existe en este flujo.
3. **Seguir el patrón de URL** de `ProcesosList` para filtros y paginación.
4. **El mock `fetchBalanceMock`** es temporal; el código debe estar listo para 
   reemplazarlo con una llamada axios real sin cambiar la estructura.
5. **CSS modular** — los estilos van en `balance.css` con prefijo `.balance-`.
6. **Sin librerías externas** — no agregar chart.js, recharts ni similares a menos 
   que ya estén en el proyecto.
7. **React Router v5** — usar `useHistory` y `useLocation`, no `useNavigate`.
8.- **No hacer push ni pull** dejar ese tema de manera manual