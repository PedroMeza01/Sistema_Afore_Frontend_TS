import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './Usuarios.css';

const initialForm = {
  id_organizacion: '',
  nombre_usuario: '',
  apellido_pat_usuario: '',
  apellido_mat_usuario: '',
  username: '',
  password: '',
  activo: true,
  rol: 1
};

export default function Usuarios() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [organizaciones, setOrganizaciones] = useState([]);

  const fetchOrganizaciones = async () => {
    try {
      const { data } = await usuariosAxios.get('/organizacion', { headers });
      setOrganizaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al cargar organizaciones', e);
    }
  };

  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  useEffect(() => {
    if (!auth?.token) {
      history.push('/');
      return;
    }
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  // =========================
  // API
  // =========================
  const fetchUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      // AJUSTA si tu ruta real es otra (ej. '/auth' o '/usuarios')
      const { data } = await usuariosAxios.get('/usuarios', { headers });
      // console.log(data);
      // soporta respuestas: [] o {mensaje: []}
      const list = Array.isArray(data.usuario) ? data.usuario : (data?.usuario ?? []);
      setUsuarios(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar usuarios'));
    } finally {
      setLoading(false);
    }
  };

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const openCreate = () => {
    setForm(initialForm);
    setModalOpen(true);
    fetchOrganizaciones();
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setForm(initialForm);
  };

  const validate = () => {
    if (!String(form.id_organizacion || '').trim()) return 'id_organizacion es requerido';
    if (!String(form.nombre_usuario || '').trim()) return 'nombre_usuario es requerido';
    if (!String(form.apellido_pat_usuario || '').trim()) return 'apellido_pat_usuario es requerido';
    if (!String(form.apellido_mat_usuario || '').trim()) return 'apellido_mat_usuario es requerido';
    if (!String(form.username || '').trim()) return 'username es requerido';
    if (!String(form.password || '').trim()) return 'password es requerido';

    const rolNum = Number(form.rol);
    if (!Number.isInteger(rolNum) || rolNum < 1) return 'rol inválido';

    return '';
  };

  const buildPayload = () => ({
    id_organizacion: String(form.id_organizacion).trim(),
    nombre_usuario: String(form.nombre_usuario).trim(),
    apellido_pat_usuario: String(form.apellido_pat_usuario).trim(),
    apellido_mat_usuario: String(form.apellido_mat_usuario).trim(),
    username: String(form.username).trim(),
    password: String(form.password),
    activo: Boolean(form.activo),
    rol_usuario: Number(form.rol)
  });

  const createUsuario = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError('');

    try {
      // AJUSTA si tu ruta real es otra (ej. '/crearUsuario' directo)
      await usuariosAxios.post('/usuarios/crearUsuario', buildPayload(), { headers });

      closeModal();
      await fetchUsuarios();
    } catch (e) {
      setError(getErrMsg(e, 'Error al crear usuario'));
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Normalización de columnas (porque tu GET ALL puede venir con diferentes nombres)
  // =========================
  const getNombreOrganizacion = u =>
    u?.organizacion?.nombre_organizacion ||
    u?.organizacion?.nombre ||
    u?.nombre_organizacion ||
    u?.Organizacion?.nombre_organizacion ||
    '';

  const getRol = u => u?.rol_usuario ?? u?.idrol_user ?? u?.id_rol ?? '';

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h2>Usuarios</h2>
        <div className="usuarios-actions">
          <button className="btn-secondary" onClick={fetchUsuarios} disabled={loading || saving}>
            Recargar
          </button>
          <button className="btn-primary" onClick={openCreate} disabled={saving}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {error ? <div className="usuarios-alert">{error}</div> : null}

      {loading ? (
        <div className="usuarios-loading">Cargando...</div>
      ) : (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Organización</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  Sin registros
                </td>
              </tr>
            ) : null}

            {usuarios.map(u => (
              <tr key={u?.id_usuario ?? u?.id ?? u?.uuid ?? u?.username}>
                <td>{u?.username}</td>
                <td>{getNombreOrganizacion(u)}</td>
                <td>{getRol(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL CREAR */}
      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Nuevo Usuario</h3>
                <p className="modal-sub">Crea un usuario y asígnalo a una organización</p>
              </div>
              <button className="icon-btn" onClick={closeModal} disabled={saving} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="field field-full">
                  <label>Organización</label>
                  <select
                    value={form.id_organizacion}
                    onChange={e => setField('id_organizacion', e.target.value)}
                    disabled={saving}
                  >
                    <option value="">-- Selecciona una organización --</option>

                    {organizaciones.map(org => (
                      <option key={org.id_organizacion} value={org.id_organizacion}>
                        {org.nombre_organizacion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Nombre</label>
                  <input
                    value={form.nombre_usuario}
                    onChange={e => setField('nombre_usuario', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Apellido paterno</label>
                  <input
                    value={form.apellido_pat_usuario}
                    onChange={e => setField('apellido_pat_usuario', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Apellido materno</label>
                  <input
                    value={form.apellido_mat_usuario}
                    onChange={e => setField('apellido_mat_usuario', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Username</label>
                  <input
                    value={form.username}
                    onChange={e => setField('username', e.target.value)}
                    disabled={saving}
                    style={{ textTransform: 'none' }}
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="field">
                  <label>Rol</label>
                  <select
                    value={String(form.rol)}
                    onChange={e => setField('rol', Number(e.target.value))}
                    disabled={saving}
                  >
                    <option value="1">1 - Administrador</option>
                    <option value="2">2 - Cliente</option>
                  </select>
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
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={createUsuario} disabled={saving}>
                {saving ? 'Guardando...' : 'Crear'}
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
