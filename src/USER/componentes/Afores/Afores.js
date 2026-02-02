import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios'; // AJUSTA RUTA si difiere
import './Afores.css';

export default function Afores() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();

  const [afores, setAfores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editAfore, setEditAfore] = useState(null);
  const [nombre, setNombre] = useState('');

  const headers = useMemo(() => {
    return {
      Authorization: auth?.token ? `Bearer ${auth.token}` : ''
    };
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token) {
      history.push('/');
      return;
    }
    fetchAfores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const fetchAfores = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get('/afores', { headers });

      // Tu backend a veces responde { mensaje: [...] } o directo [...]
      const list = Array.isArray(data) ? data : (data?.mensaje ?? data?.data ?? []);
      console.log(list);
      setAfores(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar AFORES'));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditAfore(null);
    setNombre('');
    setModalOpen(true);
  };

  const openEdit = afore => {
    setEditAfore(afore);
    setNombre(afore?.nombre_afore ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditAfore(null);
    setNombre('');
  };

  const onSave = async () => {
    const nombreTrim = (nombre ?? '').trim();
    if (!nombreTrim) {
      setError('nombre_afore es requerido');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editAfore?.id_afore) {
        // PUT /api/afores/:id
        await usuariosAxios.put(`/afores/${editAfore.id_afore}`, { nombre_afore: nombreTrim }, { headers });
      } else {
        // POST /api/afores
        await usuariosAxios.post('/afores', { nombre_afore: nombreTrim }, { headers });
      }

      closeModal();
      await fetchAfores();
    } catch (e) {
      setError(getErrMsg(e, 'Error al guardar AFORE'));
    } finally {
      setSaving(false);
    }
  };

  const onToggleStatus = async afore => {
    const id = afore?.id_afore;
    if (!id) return;

    // si tu modelo usa "activo" o "estatus" etc.
    const actual = Boolean(afore?.activo);
    const nuevo = !actual;

    setSaving(true);
    setError('');

    try {
      await usuariosAxios.patch(`/afores/${id}`, { activo: nuevo }, { headers });

      await fetchAfores();
    } catch (e) {
      setError(getErrMsg(e, 'Error al actualizar estatus'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="afores-page">
      <div className="afores-header">
        <h2>Afore</h2>
        <div className="afores-actions">
          
          <button className="btn-primary" onClick={openCreate} disabled={saving}>
            + Nueva AFORE
          </button>
        </div>
      </div>

      {error ? <div className="afores-alert">{error}</div> : null}

      {loading ? (
        <div className="afores-loading">Cargando...</div>
      ) : (
        <table className="afores-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {afores.map(a => {
              const activo = Boolean(a?.activo_afore);
              return (
                <tr key={a?.id_afore}>
                  <td>{a?.nombre_afore}</td>
                  <td>
                    <span className={activo ? 'tag activo' : 'tag inactivo'}>{activo ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="acciones">
                    <button className="btn-link" onClick={() => openEdit(a)} disabled={saving}>
                      Editar
                    </button>
                    <button
                      className="btn-link danger"
                      onClick={() => onToggleStatus(a)}
                      disabled={saving}
                      title="PATCH /api/afores/:id"
                    >
                      {activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              );
            })}

            {afores.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  Sin registros
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <h3>{editAfore ? 'Editar AFORE' : 'Nueva AFORE'}</h3>

            <label>Nombre de la AFORE</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Afore SURA"
              disabled={saving}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={onSave} disabled={saving}>
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
    const msg = err?.response?.data?.message || err?.response?.data?.mensaje || err?.message;
    return String(msg || fallback);
  } catch {
    return fallback;
  }
}
