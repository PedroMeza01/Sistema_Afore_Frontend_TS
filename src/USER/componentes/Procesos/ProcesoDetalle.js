// src/pages/Clientes/Procesos/ProcesoDetalle.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import './ProcesoDetalle.css';

export default function ProcesoDetalle() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const { id_cliente, id_proceso } = useParams();

  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  const [proceso, setProceso] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.token || !id_proceso) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, id_proceso]);

  const fetchAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        usuariosAxios.get(`/procesos/${id_proceso}`, { headers }),
        usuariosAxios.get(`/procesos/${id_proceso}/archivos`, { headers })
      ]);

      const p = pRes.data?.mensaje ?? pRes.data;
      const list = Array.isArray(aRes.data?.mensaje) ? aRes.data.mensaje : Array.isArray(aRes.data) ? aRes.data : [];

      setProceso(p);
      setArchivos(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar el proceso'));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => history.push(`/clientes/${id_cliente}/procesos`);

  // EDIT FLOW (Paso1/Paso2)
  const goModificar = () => history.push(`/clientes/${id_cliente}/procesos/${id_proceso}/editar/paso1`);

  if (loading) return <div className="pd-page">Cargando...</div>;

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <button className="pd-btn" onClick={goBack}>
          ← Volver
        </button>

        <div className="pd-title">
          <div className="pd-h1">Detalle del Proceso</div>
          <div className="pd-sub">ID: {id_proceso}</div>
        </div>

        <button className="pd-btn primary" onClick={goModificar} disabled={!proceso}>
          Modificar
        </button>
      </div>

      {error ? <div className="pd-alert">{error}</div> : null}

      {!proceso ? (
        <div className="pd-card">No se encontró el proceso.</div>
      ) : (
        <>
          <div className="pd-grid">
            <div className="pd-card">
              <div className="pd-card-head">Resumen</div>

              <div className="pd-row">
                <span className="pd-k">Estatus:</span>
                <span className="pd-v">
                  <span className={`pd-badge ${badgeClass(proceso.estatus_proceso)}`}>{proceso.estatus_proceso}</span>
                </span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Modo retiro:</span>
                <span className="pd-v">{proceso.modo_retiro || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Acompañamiento:</span>
                <span className="pd-v">{proceso.acompanamiento || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Firma:</span>
                <span className="pd-v">{proceso.tipo_firma || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Trámite solicitado:</span>
                <span className="pd-v">{proceso.tramite_solicitado ? 'SI' : 'NO'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Resultado trámite:</span>
                <span className="pd-v">{proceso.resultado_tramite || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Listo cobro:</span>
                <span className="pd-v">{proceso.listo_para_cobro ? 'SI' : 'NO'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Bono asesora:</span>
                <span className="pd-v">${String(proceso.bono_asesora ?? '0.00')}</span>
              </div>
            </div>

            <div className="pd-card">
              <div className="pd-card-head">Fechas</div>

              <div className="pd-row">
                <span className="pd-k">Fecha firma:</span>
                <span className="pd-v">{proceso.fecha_firma || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Baja IMSS:</span>
                <span className="pd-v">{proceso.fecha_baja_imss || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">46 días:</span>
                <span className="pd-v">{proceso.fecha_46_dias || '-'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Requiere cita:</span>
                <span className="pd-v">{proceso.requiere_cita_afore ? 'SI' : 'NO'}</span>
              </div>

              <div className="pd-row">
                <span className="pd-k">Cita Afore:</span>
                <span className="pd-v">{proceso.cita_afore || '-'}</span>
              </div>
            </div>
          </div>

          <div className="pd-card">
            <div className="pd-card-head">Archivos</div>

            <div className="pd-files">
              {archivos.length === 0 ? (
                <div className="pd-empty">Sin archivos</div>
              ) : (
                archivos.map(a => (
                  <div key={a.id_proceso_archivo} className="pd-file-row">
                    <div className="pd-file-main">
                      <div className="pd-file-name">{a.nombre_original}</div>
                      <div className="pd-file-meta">
                        {a.categoria} · {a.mime_type} · {formatBytes(a.tamano_bytes)}
                      </div>
                    </div>

                    <div className="pd-file-actions">
                      {a.public_url ? (
                        <a className="pd-link" href={a.public_url} target="_blank" rel="noreferrer">
                          Ver
                        </a>
                      ) : (
                        <span className="pd-muted">{a.storage_path}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function badgeClass(estatus) {
  const e = (estatus || '').toString().toUpperCase();
  if (e === 'ACTIVO') return 'ok';
  if (e === 'BLOQUEADO') return 'warn';
  if (e === 'CANCELADO') return 'bad';
  return 'muted';
}

function formatBytes(bytes) {
  const b = Number(bytes || 0);
  if (!Number.isFinite(b) || b <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(k)), sizes.length - 1);
  const v = b / Math.pow(k, i);
  return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function getErrMsg(err, fallback) {
  try {
    return err?.response?.data?.message || err?.response?.data?.mensaje || err?.message || fallback;
  } catch {
    return fallback;
  }
}
