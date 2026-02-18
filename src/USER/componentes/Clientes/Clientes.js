import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './Clientes.css';
import Pagination from '../../../layout/Paginacion'; // ajusta ruta

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

export default function Clientes() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const didInitSearch = useRef(false);

  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  const [clientes, setClientes] = useState([]);
  const [asesores, setAsesores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);

  const [search, setSearch] = useState('');

  // ✅ NUEVO: filtro por asesor (server-side)
  const [filterAsesor, setFilterAsesor] = useState('');

  // =========================
  // API
  // =========================
  const fetchClientes = async (page = currentPage, q = search, asesorId = filterAsesor) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get('/clientes', {
        headers,
        params: {
          page,
          limit: pageSize,
          search: q?.trim() || undefined,
          id_asesor: asesorId || undefined
        }
      });

      const items = data?.items ?? data?.mensaje ?? [];
      const meta = data?.meta;

      setClientes(Array.isArray(items) ? items : []);
      setCurrentPage(meta?.page ?? page);
      setTotalPages(meta?.totalPages ?? 1);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar clientes'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAsesores = async () => {
    try {
      const { data } = await usuariosAxios.get('/asesores', { headers });
      const list = Array.isArray(data) ? data : (data?.mensaje ?? []);
      setAsesores(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error al cargar asesores', e);
    }
  };

  useEffect(() => {
    if (!auth?.token) return;
    fetchAsesores();
    fetchClientes(1, '', ''); // carga inicial: página 1 sin búsqueda ni filtro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const handleSearchChange = e => {
    setSearch(e.target.value);
  };

  // ✅ debounce búsqueda (resetea a page 1)
  useEffect(() => {
    if (!auth?.token) return;

    if (!didInitSearch.current) {
      didInitSearch.current = true;
      return;
    }

    const t = setTimeout(() => {
      fetchClientes(1, search, filterAsesor);
    }, 1000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, auth?.token, filterAsesor]);

  // ✅ cambio de filtro asesor (resetea a page 1)
  useEffect(() => {
    if (!auth?.token) return;
    fetchClientes(1, search, filterAsesor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAsesor, auth?.token]);

  // =========================
  // Helpers
  // =========================
  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const openCreate = () => {
    setEditCliente(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = cliente => {
    setEditCliente(cliente);

    setForm({
      id_asesor: cliente?.id_asesor ?? cliente?.asesor?.id_asesor ?? '',

      nombre_cliente: cliente?.nombre_cliente ?? '',
      apellido_pat_cliente: cliente?.apellido_pat_cliente ?? '',
      apellido_mat_cliente: cliente?.apellido_mat_cliente ?? '',

      curp_cliente: cliente?.curp_cliente ?? '',
      nss_cliente: cliente?.nss_cliente ?? '',
      rfc_cliente: cliente?.rfc_cliente ?? '',

      telefono_cliente: cliente?.telefono_cliente ?? '',
      email_cliente: cliente?.email_cliente ?? '',

      observaciones: cliente?.observaciones ?? '',
      activo: cliente?.activo ?? true
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditCliente(null);
    setForm(initialForm);
  };

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

  const buildPayload = () => ({
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
  });

  const saveCliente = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = buildPayload();

      if (editCliente?.id_cliente) {
        await usuariosAxios.put(`/clientes/${editCliente.id_cliente}`, payload, { headers });
      } else {
        await usuariosAxios.post('/clientes', payload, { headers });
      }

      closeModal();
      // conserva filtro/búsqueda/página actual
      await fetchClientes(currentPage, search, filterAsesor);
    } catch (e) {
      setError(getErrMsg(e, 'Error al guardar cliente'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async cliente => {
    if (!cliente?.id_cliente) return;

    setSaving(true);
    setError('');
    try {
      await usuariosAxios.patch(`/clientes/${cliente.id_cliente}/toggle`, {}, { headers });
      await fetchClientes(currentPage, search, filterAsesor);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cambiar estatus'));
    } finally {
      setSaving(false);
    }
  };

  const getNombreAsesor = c => {
    const a = c?.asesor;
    if (a) {
      const full = [a?.nombre_asesor, a?.apellido_pat_asesor, a?.apellido_mat_asesor].filter(Boolean).join(' ');
      return full || a?.alias || '';
    }
    const found = asesores.find(x => x.id_asesor === c?.id_asesor);
    if (!found) return '';
    return (
      [found?.nombre_asesor, found?.apellido_pat_asesor, found?.apellido_mat_asesor].filter(Boolean).join(' ') ||
      found?.alias ||
      ''
    );
  };

  const goToProcesos = cliente => {
    if (!cliente?.id_cliente) return;
    history.push(`/proceso/cliente/${cliente.id_cliente}`);
  };

  const handlePageChange = page => {
    if (saving || loading) return;
    fetchClientes(page, search, filterAsesor);
  };

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h2>Clientes</h2>

        <div className="clientes-actions">
          <input
            type="text"
            className="clientes-search"
            placeholder="Buscar cliente (nombre, CURP, RFC...)"
            value={search}
            onChange={handleSearchChange}
            disabled={loading || saving}
          />

          {/* ✅ NUEVO: filtro por asesor */}
          <select
            className="clientes-filter"
            value={filterAsesor}
            onChange={e => setFilterAsesor(e.target.value)}
            disabled={loading || saving}
          >
            <option value="">-- Todos los asesores --</option>
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

          <button className="btn-primary" onClick={openCreate} disabled={saving}>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {loading ? (
        <div className="clientes-loading">Cargando...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>NSS</th>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>CURP</th>
                  <th>Estatus</th>
                  <th>Procesos</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    {/* ✅ eran 7 columnas */}
                    <td colSpan={7} className="empty">
                      Sin registros
                    </td>
                  </tr>
                ) : null}

                {clientes.map(c => {
                  const activo = Boolean(c?.activo);
                  const nombreFull = [c?.nombre_cliente, c?.apellido_pat_cliente, c?.apellido_mat_cliente]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <tr key={c?.id_cliente}>
                      <td>{c?.nss_cliente}</td>
                      <td>{nombreFull}</td>
                      <td>{getNombreAsesor(c)}</td>
                      <td>{c?.curp_cliente}</td>
                      <td>
                        <span className={activo ? 'tag activo' : 'tag inactivo'}>{activo ? 'Activo' : 'Inactivo'}</span>
                      </td>

                      <td className="procesos">
                        <button className="btn-link" onClick={() => goToProcesos(c)} disabled={saving}>
                          Ver procesos
                        </button>
                      </td>

                      <td className="acciones">
                        <button className="btn-link" onClick={() => openEdit(c)} disabled={saving}>
                          Editar
                        </button>
                        <button className="btn-link danger" onClick={() => toggleActivo(c)} disabled={saving}>
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="clientes-pagination">
              <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{editCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              </div>
              <button className="icon-btn" onClick={closeModal} disabled={saving} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error ? <div className="clientes-alert">{error}</div> : null}
              <div className="form-grid">
                {/* Asesor */}
                <div className="field field-full">
                  <label>Asesor</label>
                  <select
                    value={form.id_asesor}
                    onChange={e => setField('id_asesor', e.target.value)}
                    disabled={saving}
                  >
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
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={saveCliente} disabled={saving}>
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
