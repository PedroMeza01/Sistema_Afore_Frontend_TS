import React, { useEffect, useMemo, useState } from 'react';
import './Clientes.css';
const initialForm = {
  id_asesor: '',
  nombre_cliente: '',
  apellido_pat_cliente: '',
  apellido_mat_cliente: '',
  curp_cliente: '',
  nss_cliente: '',
  rfc_cliente: '',
  telefono_cliente: '',
  email_cliente: '',
  observaciones: '',
  activo: true
};

export default function ClienteModal({ open, saving, error, asesores = [], editCliente = null, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);

  // cuando abres / cambias editCliente, precarga el form
  useEffect(() => {
    if (!open) return;

    if (editCliente?.id_cliente) {
      setForm({
        id_asesor: editCliente?.id_asesor ?? editCliente?.asesor?.id_asesor ?? '',
        nombre_cliente: editCliente?.nombre_cliente ?? '',
        apellido_pat_cliente: editCliente?.apellido_pat_cliente ?? '',
        apellido_mat_cliente: editCliente?.apellido_mat_cliente ?? '',
        curp_cliente: editCliente?.curp_cliente ?? '',
        nss_cliente: editCliente?.nss_cliente ?? '',
        rfc_cliente: editCliente?.rfc_cliente ?? '',
        telefono_cliente: editCliente?.telefono_cliente ?? '',
        email_cliente: editCliente?.email_cliente ?? '',
        observaciones: editCliente?.observaciones ?? '',
        activo: editCliente?.activo ?? true
      });
    } else {
      setForm(initialForm);
    }
  }, [open, editCliente]);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const validate = () => {
    if (!String(form.id_asesor || '').trim()) return 'Asesor es requerido';

    if (!String(form.nombre_cliente || '').trim()) return 'Nombre es requerido';
    if (!String(form.apellido_pat_cliente || '').trim()) return 'Apellido paterno es requerido';
    if (!String(form.apellido_mat_cliente || '').trim()) return 'Apellido materno es requerido';

    if (!String(form.curp_cliente || '').trim()) return 'CURP es requerido';
    if (!String(form.nss_cliente || '').trim()) return 'NSS es requerido';
    if (!String(form.rfc_cliente || '').trim()) return 'RFC es requerido';

    if (!String(form.telefono_cliente || '').trim()) return 'Teléfono es requerido';
    if (!String(form.email_cliente || '').trim()) return 'Email es requerido';

    return '';
  };

  const payload = useMemo(
    () => ({
      id_asesor: String(form.id_asesor).trim(),
      nombre_cliente: String(form.nombre_cliente).trim(),
      apellido_pat_cliente: String(form.apellido_pat_cliente).trim(),
      apellido_mat_cliente: String(form.apellido_mat_cliente).trim(),
      curp_cliente: String(form.curp_cliente).trim(),
      nss_cliente: String(form.nss_cliente).trim(),
      rfc_cliente: String(form.rfc_cliente).trim(),
      telefono_cliente: String(form.telefono_cliente).trim(),
      email_cliente: String(form.email_cliente).trim(),
      observaciones: String(form.observaciones || '').trim(),
      activo: Boolean(form.activo)
    }),
    [form]
  );

  const handleSave = () => {
    const msg = validate();
    if (msg) return onSave(null, msg); // manda error al padre
    onSave(payload, '');
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{editCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={saving} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error ? <div className="clientes-alert">{error}</div> : null}

          <div className="form-grid">
            <div className="field field-full">
              <label>Asesor</label>
              <select value={form.id_asesor} onChange={e => setField('id_asesor', e.target.value)} disabled={saving}>
                <option value="">-- Selecciona un asesor --</option>
                {asesores.map(a => {
                  const nombre = [a?.nombre_asesor, a?.apellido_pat_asesor, a?.apellido_mat_asesor]
                    .filter(Boolean)
                    .join(' ');
                  const label = a?.alias ? `${nombre} (${a.alias})` : nombre;
                  return (
                    <option key={a.id_asesor} value={a.id_asesor}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="field">
              <label>Nombre</label>
              <input
                value={form.nombre_cliente}
                onChange={e => setField('nombre_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Apellido paterno</label>
              <input
                value={form.apellido_pat_cliente}
                onChange={e => setField('apellido_pat_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Apellido materno</label>
              <input
                value={form.apellido_mat_cliente}
                onChange={e => setField('apellido_mat_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>CURP</label>
              <input
                value={form.curp_cliente}
                onChange={e => setField('curp_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>NSS</label>
              <input
                value={form.nss_cliente}
                onChange={e => setField('nss_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>RFC</label>
              <input
                value={form.rfc_cliente}
                onChange={e => setField('rfc_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Teléfono</label>
              <input
                value={form.telefono_cliente}
                onChange={e => setField('telefono_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                value={form.email_cliente}
                onChange={e => setField('email_cliente', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Activo</label>
              <select
                value={form.activo ? 'true' : 'false'}
                onChange={e => setField('activo', e.target.value === 'true')}
                disabled={saving}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            <div className="field field-full">
              <label>Observaciones</label>
              <textarea
                rows={4}
                value={form.observaciones}
                onChange={e => setField('observaciones', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
