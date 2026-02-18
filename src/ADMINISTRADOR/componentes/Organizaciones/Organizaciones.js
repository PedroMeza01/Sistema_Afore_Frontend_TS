// src/pages/Organizaciones/Organizaciones.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2'; // ajusta la ruta si tu axios config está en otro lado

import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';

const Organizaciones = () => {
  const [auth] = useContext(CRMContext);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    nombre_organizacion: '',
    rfc_organizacion: '',
    telefono_organizacion: '',
    correo_organizacion: '',
    direccion_organizacion: '',
    activo: true
  });

  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    if (auth?.token) h['Authorization'] = `Bearer ${auth.token}`;
    return h;
  }, [auth?.token]);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await usuariosAxios.get('/organizacion', { headers });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (error) {
     // console.log(error);
      Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const abrirModal = () => {
    setForm({
      nombre_organizacion: '',
      rfc_organizacion: '',
      telefono_organizacion: '',
      correo_organizacion: '',
      direccion_organizacion: '',
      activo: true
    });
    setOpen(true);
  };

  const cerrarModal = () => setOpen(false);

  const submit = async e => {
    e.preventDefault();

    if (!form.nombre_organizacion.trim()) {
      return Swal.fire('Validación', 'nombre_organizacion es requerido', 'warning');
    }

    try {
      const payload = {
        nombre_organizacion: form.nombre_organizacion.trim(),
        rfc_organizacion: form.rfc_organizacion.trim() || null,
        telefono_organizacion: form.telefono_organizacion.trim() || null,
        correo_organizacion: form.correo_organizacion.trim() || null,
        direccion_organizacion: form.direccion_organizacion.trim() || null,
        activo: Boolean(form.activo)
      };

      const res = await usuariosAxios.post('/organizacion', payload, { headers });

      Swal.fire('OK', 'Organización creada', 'success');
      setOpen(false);

      // refresco rápido: si backend regresa el objeto creado, lo agrego
      const created = res.data;
      if (created && (created.id || created.id_organizacion)) {
        setData(prev => [created, ...prev]);
      } else {
        await cargar();
      }
    } catch (error) {
     // console.log(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'No se pudo crear la organización';

      Swal.fire('Error', msg, 'error');
    }
  };

  return (
    <div className="org-page">
      <div className="org-head">
        <div>
          <h2 className="org-title">Organizaciones</h2>
          <p className="org-sub">Listado y alta de organizaciones</p>
        </div>

        <button className="org-add" onClick={abrirModal} title="Nueva organización">
          +
        </button>
      </div>

      {loading ? (
        <div className="org-loading">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="org-empty">No hay organizaciones.</div>
      ) : (
        <div className="org-grid">
          {data.map(o => (
            <div className="org-card" key={o.id || o.id_organizacion}>
              <div className="org-card-top">
                <div className="org-name">{o.nombre_organizacion || o.nombre || 'Sin nombre'}</div>
                <span className={`org-pill ${o.activo ? 'on' : 'off'}`}>{o.activo ? 'Activa' : 'Inactiva'}</span>
              </div>

              <div className="org-meta">
                <div>
                  <b>RFC:</b> {o.rfc_organizacion || '-'}
                </div>
                <div>
                  <b>Tel:</b> {o.telefono_organizacion || '-'}
                </div>
                <div>
                  <b>Correo:</b> {o.correo_organizacion || '-'}
                </div>
                <div className="org-dir">
                  <b>Dirección:</b> {o.direccion_organizacion || '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <div className={`org-modal-wrap ${open ? 'open' : ''}`} onClick={cerrarModal}>
        <div className="org-modal" onClick={e => e.stopPropagation()}>
          <div className="org-modal-head">
            <h3>Nueva organización</h3>
            <button className="org-x" onClick={cerrarModal} aria-label="Cerrar">
              ✕
            </button>
          </div>

          <form onSubmit={submit} className="org-form">
            <div className="org-field">
              <label>Nombre *</label>
              <input
                name="nombre_organizacion"
                value={form.nombre_organizacion}
                onChange={onChange}
                maxLength={120}
                placeholder="Nombre de la organización"
                autoFocus
              />
            </div>

            <div className="org-row">
              <div className="org-field">
                <label>RFC</label>
                <input
                  name="rfc_organizacion"
                  value={form.rfc_organizacion}
                  onChange={onChange}
                  maxLength={13}
                  placeholder="XAXX010101000"
                />
              </div>

              <div className="org-field">
                <label>Teléfono</label>
                <input
                  name="telefono_organizacion"
                  value={form.telefono_organizacion}
                  onChange={onChange}
                  maxLength={20}
                  placeholder="Ej. 6691234567"
                />
              </div>
            </div>

            <div className="org-field">
              <label>Correo</label>
              <input
                type="email"
                name="correo_organizacion"
                value={form.correo_organizacion}
                onChange={onChange}
                maxLength={120}
                placeholder="correo@dominio.com"
              />
            </div>

            <div className="org-field">
              <label>Dirección</label>
              <textarea
                name="direccion_organizacion"
                value={form.direccion_organizacion}
                onChange={onChange}
                rows={3}
                placeholder="Calle, número, colonia, ciudad..."
              />
            </div>

            <div className="org-check">
              <input type="checkbox" id="activo" name="activo" checked={form.activo} onChange={onChange} />
              <label htmlFor="activo">Activa</label>
            </div>

            <div className="org-actions">
              <button type="button" className="org-btn ghost" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="org-btn">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Organizaciones;
