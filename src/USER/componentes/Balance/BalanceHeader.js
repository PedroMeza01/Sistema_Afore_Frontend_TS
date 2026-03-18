import React, { useState, useEffect } from 'react';

const BalanceHeader = ({
  search, asesor, desde, hasta,
  asesores, items,
  onSearchChange, onAsesorChange, onDesdeChange, onHastaChange
}) => {
  // Estado local para el input — evita que cada tecla haga un history.push
  const [inputValue, setInputValue] = useState(search);

  // Sincroniza si la URL cambia desde afuera (ej. botón atrás)
  useEffect(() => { setInputValue(search); }, [search]);

  // Debounce: espera 400ms sin escribir antes de empujar a la URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (inputValue !== search) onSearchChange(inputValue);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);
  const handleExportar = () => {
    if (!items?.length) return;

    const headers = ['Cliente', 'Asesor', 'Cobrado', 'Comision', 'Bono', 'Saldo Libre'];
    const rows = items.map(i => {
      const libre = (i.cobrado || 0) - (i.comision_asesora || 0) - (i.bono_asesora || 0);
      return [i.cliente, i.asesor, i.cobrado, i.comision_asesora, i.bono_asesora, libre];
    });

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `balance_${desde || 'inicio'}_${hasta || 'hoy'}_${asesor || 'todos'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="balance-header">
      <h1>Balance General</h1>

      <div className="balance-actions">
        {/* Búsqueda por nombre de cliente */}
        <input
          className="balance-search"
          type="text"
          placeholder="Buscar cliente..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />

        {/* Dropdown de asesores — se llena con GET /asesores */}
        <select value={asesor} onChange={e => onAsesorChange(e.target.value)}>
          <option value="">Todos los asesores</option>
          {asesores.map(a => (
            <option key={a.id_asesor} value={a.id_asesor}>
              {[a.nombre_asesor, a.apellido_pat_asesor, a.apellido_mat_asesor]
                .filter(Boolean).join(' ')}
            </option>
          ))}
        </select>

        {/* Rango de fechas (sobre fecha_cobro) */}
        <input
          className="balance-date"
          type="date"
          value={desde}
          onChange={e => onDesdeChange(e.target.value)}
          title="Desde"
        />
        <input
          className="balance-date"
          type="date"
          value={hasta}
          onChange={e => onHastaChange(e.target.value)}
          title="Hasta"
        />

        <button className="btn-exportar" onClick={handleExportar}>
          Exportar CSV
        </button>
      </div>
    </div>
  );
};

export default BalanceHeader;
