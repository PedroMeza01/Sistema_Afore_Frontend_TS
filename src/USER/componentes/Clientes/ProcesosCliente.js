// src/pages/Clientes/Procesos/ProcesosCliente.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import './ProcesosCliente.css';

export default function ProcesosCliente() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const { id_cliente } = useParams();

  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  const [cliente, setCliente] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [loadingProcesos, setLoadingProcesos] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!auth?.token || !id_cliente) return;
    fetchCliente();
    fetchProcesos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, id_cliente]);

  const fetchCliente = async () => {
    setLoadingCliente(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get(`/clientes/${id_cliente}`, { headers });
      setCliente(data?.mensaje ?? data);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar cliente'));
    } finally {
      setLoadingCliente(false);
    }
  };

  const fetchProcesos = async () => {
    setLoadingProcesos(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get(`/procesos/cliente/${id_cliente}`, { headers });
      const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setProcesos(rows);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar procesos'));
      setProcesos([]);
    } finally {
      setLoadingProcesos(false);
    }
  };

  const nombreCompleto = useMemo(() => {
    if (!cliente) return '';
    return [cliente.nombre_cliente, cliente.apellido_pat_cliente, cliente.apellido_mat_cliente]
      .filter(Boolean)
      .join(' ');
  }, [cliente]);

  const inicial = useMemo(() => {
    const n = cliente?.nombre_cliente?.trim();
    return n ? n[0].toUpperCase() : 'C';
  }, [cliente]);

  const existeProceso = procesos.length > 0;

  const goNuevoProceso = () => {
    // si ya existe, no hace nada
    if (existeProceso) return;
    history.push(`/clientes/${id_cliente}/procesos/nuevo`);
  };

  const goDetalle = id_proceso => history.push(`/clientes/${id_cliente}/procesos/${id_proceso}`);

  const procesosTable = useMemo(() => {
    return procesos.map(p => ({
      id_proceso: p.id_proceso,
      tipo: mapTipoProceso(p),
      modalidad: mapModalidad(p),
      estatus: mapEstatus(p),
      fecha: p.createdAt || p.fecha_firma || null
    }));
  }, [procesos]);

  const loading = loadingCliente || loadingProcesos;

  return (
    <div className="pc-page">
      <div className="pc-topbar">
        <div className="pc-user">
          <div className="pc-avatar">
            {cliente?.avatar_url ? <img src={cliente.avatar_url} alt="avatar" /> : <span>{inicial}</span>}
          </div>

          <div className="pc-userinfo">
            <h2 className="pc-name">{nombreCompleto || 'Cliente'}</h2>

            <div className="pc-meta">
              <div className="pc-meta-row">
                <span className="pc-meta-label">CURP:</span>
                <span className="pc-meta-value">{cliente?.curp_cliente || '-'}</span>
              </div>
              <div className="pc-meta-row">
                <span className="pc-meta-label">NSS:</span>
                <span className="pc-meta-value">{cliente?.nss_cliente || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="pc-btn pc-btn-primary" onClick={goNuevoProceso} disabled={existeProceso || loading}>
          {existeProceso ? 'Proceso ya iniciado' : 'Iniciar Proceso'}
        </button>
      </div>

      {error && <div className="pc-alert">{error}</div>}

      <div className="pc-card">
        <div className="pc-card-head">
          <h3>Información del proceso</h3>

          {/* <button className="pc-btn" onClick={fetchProcesos} disabled={loadingProcesos}>
            {loadingProcesos ? 'Actualizando...' : 'Actualizar'}
          </button> */}
        </div>

        {loading ? (
          <div className="pc-loading">Cargando...</div>
        ) : (
          <div className="pc-table-wrap">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Estatus</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {procesosTable.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="pc-empty">
                      Sin procesos
                    </td>
                  </tr>
                ) : (
                  procesosTable.map(p => (
                    <tr key={p.id_proceso}>
                      <td>{p.tipo}</td>
                      <td>{p.modalidad}</td>
                      <td>
                        <span className={`pc-badge ${badgeClass(p.estatus)}`}>{p.estatus}</span>
                      </td>
                      <td>
                        <button className="pc-link" onClick={() => goDetalle(p.id_proceso)}>
                          Ver detalle →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function mapTipoProceso(p) {
  if (p?.listo_para_cobro) return 'Retiro (Cobro)';
  if (p?.tramite_solicitado) return 'Retiro (Trámite)';
  return 'Retiro';
}
function mapModalidad(p) {
  const m = (p?.modo_retiro || '').toString().toUpperCase();
  if (m === 'PRESENCIAL') return 'Presencial';
  if (m === 'DISTANCIA') return 'Distancia';
  return '-';
}
function mapEstatus(p) {
  const e = (p?.estatus_proceso || '').toString().toUpperCase();
  if (e === 'ACTIVO') return 'ACTIVO';
  if (e === 'BLOQUEADO') return 'BLOQUEADO';
  if (e === 'CANCELADO') return 'CANCELADO';
  return e || '-';
}
function badgeClass(estatus) {
  const e = (estatus || '').toUpperCase();
  if (e === 'ACTIVO') return 'ok';
  if (e === 'BLOQUEADO') return 'warn';
  if (e === 'CANCELADO') return 'bad';
  return 'muted';
}
function getErrMsg(err, fallback) {
  try {
    return err?.response?.data?.message || err?.response?.data?.mensaje || err?.message || fallback;
  } catch {
    return fallback;
  }
}
