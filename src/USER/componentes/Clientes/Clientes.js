import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './Clientes.css';
import Pagination from '../../../layout/Paginacion';
import ClienteModal from './ClienteModal';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);

  const [search, setSearch] = useState('');
  const [filterAsesor, setFilterAsesor] = useState('');

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
    fetchClientes(1, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

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

  useEffect(() => {
    if (!auth?.token) return;
    fetchClientes(1, search, filterAsesor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAsesor, auth?.token]);

  const openCreate = () => {
    setEditCliente(null);
    setError('');
    setModalOpen(true);
  };

  const openEdit = cliente => {
    setEditCliente(cliente);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditCliente(null);
  };

  const saveCliente = async payload => {
    setSaving(true);

    try {
      if (editCliente?.id_cliente) {
        await usuariosAxios.put(`/clientes/${editCliente.id_cliente}`, payload, { headers });
      } else {
        await usuariosAxios.post('/clientes', payload, { headers });
      }

      closeModal();
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
            placeholder="Buscar cliente (Nombre, CURP, RFC...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading || saving}
          />

          <select
            className="clientes-filter"
            value={filterAsesor}
            onChange={e => setFilterAsesor(e.target.value)}
            disabled={loading || saving}
          >
            <option value=""> Todos los asesores</option>
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
             Nuevo Cliente
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

          {totalPages > 1 && (
            <div className="clientes-pagination">
              <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      <ClienteModal
        open={modalOpen}
        saving={saving}
        error={error}
        asesores={asesores}
        editCliente={editCliente}
        onClose={closeModal}
        onSave={saveCliente}
      />
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
