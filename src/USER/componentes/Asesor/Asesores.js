import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './Asesores.css';

const initialForm = {
  nombre_asesor: '',
  apellido_pat_asesor: '',
  apellido_mat_asesor: '',
  alias: '',
  observaciones: '',
  activo: true
};

export default function Asesores() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();

  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editAsesor, setEditAsesor] = useState(null);
  const [form, setForm] = useState(initialForm);

  const headers = useMemo(
    () => ({
      Authorization: auth?.token ? `Bearer ${auth.token}` : ''
    }),
    [auth?.token]
  );

  useEffect(() => {
    if (!auth?.token) {
      history.push('/');
      return;
    }
    fetchAsesores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  // =========================
  // API
  // =========================
  const fetchAsesores = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get('/asesores', { headers });
      const list = Array.isArray(data) ? data : (data?.mensaje ?? []);
      setAsesores(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar asesores'));
    } finally {
      setLoading(false);
    }
  };

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const openCreate = () => {
    setError('');
    setEditAsesor(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = asesor => {
    setEditAsesor(asesor);
    setForm({
      nombre_asesor: asesor?.nombre_asesor ?? '',
      apellido_pat_asesor: asesor?.apellido_pat_asesor ?? '',
      apellido_mat_asesor: asesor?.apellido_mat_asesor ?? '',
      alias: asesor?.alias ?? '',
      observaciones: asesor?.observaciones ?? '',
      activo: asesor?.activo ?? true
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setError('');
    setModalOpen(false);
    setEditAsesor(null);
    setForm(initialForm);
  };

  const validate = () => {
    if (!String(form.nombre_asesor || '').trim()) return 'Nombre es requerido';
    if (!String(form.apellido_pat_asesor || '').trim()) return 'Apellido paterno es requerido';
    if (!String(form.alias || '').trim()) return 'Alias es requerido';

    return '';
  };

  const buildPayload = () => {
    return {
      nombre_asesor: form.nombre_asesor.trim(),
      apellido_pat_asesor: form.apellido_pat_asesor.trim(),
      apellido_mat_asesor: form.apellido_mat_asesor.trim(),
      alias: form.alias.trim(),
      observaciones: String(form.observaciones || '').trim() || undefined,
      activo: Boolean(form.activo)
    };
  };

  const saveAsesor = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = buildPayload();

      if (editAsesor?.id_asesor) {
        // PUT /asesores/:id
        await usuariosAxios.put(`/asesores/${editAsesor.id_asesor}`, payload, { headers });
      } else {
        // POST /asesores
        await usuariosAxios.post('/asesores', payload, { headers });
      }

      closeModal();
      await fetchAsesores();
    } catch (e) {
      setError(getErrMsg(e, 'Error al guardar asesor'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async asesor => {
    if (!asesor?.id_asesor) return;

    setSaving(true);
    setError('');

    try {
      // PATCH /asesores/:id/toggle
      await usuariosAxios.patch(`/asesores/${asesor.id_asesor}/toggle`, {}, { headers });
      await fetchAsesores();
    } catch (e) {
      setError(getErrMsg(e, 'Error al cambiar estatus'));
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="asesores-page">
      <div className="asesores-header">
        <h2>Asesores</h2>
        <div className="asesores-actions">
          {/* <button className="btn-secondary" onClick={fetchAsesores} disabled={loading || saving}>
            Recargar
          </button> */}
          <button className="btn-primary" onClick={openCreate} disabled={saving}>
            + Nuevo Asesor
          </button>
        </div>
      </div>

      {loading ? (
        <div className="asesores-loading">Cargando...</div>
      ) : (
        <table className="asesores-table">
          <thead>
            <tr>
              <th>Asesor</th>
              <th>Alias</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asesores.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  Sin registros
                </td>
              </tr>
            )}

            {asesores.map(a => {
              const activo = Boolean(a?.activo);
              const nombreFull = [a?.nombre_asesor, a?.apellido_pat_asesor, a?.apellido_mat_asesor]
                .filter(Boolean)
                .join(' ');

              return (
                <tr key={a.id_asesor}>
                  <td>{nombreFull}</td>
                  <td>{a?.alias}</td>
                  <td>
                    <span className={activo ? 'tag activo' : 'tag inactivo'}>{activo ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="acciones">
                    <button className="btn-link" onClick={() => openEdit(a)} disabled={saving}>
                      Editar
                    </button>
                    <button className="btn-link danger" onClick={() => toggleActivo(a)} disabled={saving}>
                      {activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{editAsesor ? 'Editar Asesor' : 'Nuevo Asesor'}</h3>
                <p className="modal-sub">Captura los datos completos del asesor</p>
              </div>

              <button className="icon-btn" onClick={closeModal} disabled={saving} title="Cerrar">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="asesores-alert">{error}</div>}
              <div className="form-grid">
                <div className="field">
                  <label>Nombre</label>
                  <input
                    value={form.nombre_asesor}
                    onChange={e => setField('nombre_asesor', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Apellido paterno</label>
                  <input
                    value={form.apellido_pat_asesor}
                    onChange={e => setField('apellido_pat_asesor', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Apellido materno</label>
                  <input
                    value={form.apellido_mat_asesor}
                    onChange={e => setField('apellido_mat_asesor', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Alias</label>
                  <input value={form.alias} onChange={e => setField('alias', e.target.value)} disabled={saving} />
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
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={saveAsesor} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getErrMsg(err, fallback) {
  try {
    return err?.response?.data?.message || err?.response?.data?.mensaje || err?.message || fallback;
  } catch {
    return fallback;
  }
}
