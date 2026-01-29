import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [error, setError] = useState('');

  const [finalizing, setFinalizing] = useState(false);

  const [showArchivos, setShowArchivos] = useState(true);
  const filesRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [fileDrafts, setFileDrafts] = useState({}); // { [id_proceso_archivo]: File }
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    if (!auth?.token || !id_proceso) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, id_proceso]);

  const fetchProceso = async () => {
    const { data } = await usuariosAxios.get(`/procesos/${id_proceso}`, { headers });
    return data?.mensaje ?? data;
  };

  const fetchArchivos = async () => {
    const { data } = await usuariosAxios.get(`/procesos/${id_proceso}/archivos`, { headers });
    return Array.isArray(data?.mensaje) ? data.mensaje : Array.isArray(data) ? data : [];
  };

  const fetchAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [p, list] = await Promise.all([fetchProceso(), fetchArchivos()]);
      setProceso(p);
      setArchivos(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar el proceso'));
    } finally {
      setLoading(false);
    }
  };

  const actualizarArchivos = async () => {
    if (!auth?.token || !id_proceso) return;
    setError('');
    setLoadingArchivos(true);
    try {
      const list = await fetchArchivos();
      setArchivos(list);
      setShowArchivos(true);
      setTimeout(() => filesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (e) {
      setError(getErrMsg(e, 'Error al actualizar archivos'));
    } finally {
      setLoadingArchivos(false);
    }
  };

  const verArchivos = () => {
    setShowArchivos(prev => {
      const next = !prev;
      if (!prev) setTimeout(() => filesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return next;
    });
  };

  const getPreviewUrl = a => {
    // 1) Si tienes public_url (Supabase public bucket), úsalo
    if (a?.public_url) return a.public_url;

    // 2) Si es LOCAL: endpoint backend que sirve el archivo
    // Requiere que lo implementes (te lo dejo abajo)
    return `/procesos/archivos/${a.id_proceso_archivo}/preview`;
  };

  const openPreview = archivo => {
    setPreviewFile(archivo);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const onPickReplaceFile = (id_proceso_archivo, file) => {
    if (!file) return;
    setFileDrafts(prev => ({ ...prev, [id_proceso_archivo]: file }));
  };

  const clearDraft = id_proceso_archivo => {
    setFileDrafts(prev => {
      const copy = { ...prev };
      delete copy[id_proceso_archivo];
      return copy;
    });
  };

  const subirReemplazo = async archivo => {
    const id = archivo?.id_proceso_archivo;
    const file = fileDrafts[id];

    if (!file) {
      setError('Selecciona un archivo primero.');
      return;
    }

    setUploadingId(id);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('id_proceso_archivo', id);

      // si quieres mantener misma categoría (recomendado)
      form.append('categoria', archivo?.categoria || '');

      await usuariosAxios.put(`/procesos/archivos/${id}`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });

      clearDraft(id);
      await actualizarArchivos();
    } catch (e) {
      setError(getErrMsg(e, 'Error al actualizar el archivo'));
    } finally {
      setUploadingId(null);
    }
  };

  const finalizarCliente = async () => {
    if (!id_cliente || !auth?.token) return;

    const ok = window.confirm(
      '¿Seguro que deseas FINALIZAR?\n\nEsto enviará la información al correo de la organización y luego BORRARÁ al cliente.'
    );
    if (!ok) return;

    setFinalizing(true);
    setError('');

    try {
      await usuariosAxios.post(`/clientes/${id_cliente}/finalizar`, {}, { headers });
      history.push('/clientes');
    } catch (e) {
      setError(getErrMsg(e, 'Error al finalizar cliente'));
    } finally {
      setFinalizing(false);
    }
  };

  const goBack = () => history.push(`/proceso/cliente/${id_cliente}`);
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

        <div className="pd-actions">
          <button className="pd-btn" onClick={verArchivos} disabled={!proceso}>
            {showArchivos ? 'Ocultar archivos' : 'Ver archivos'}
          </button>

          <button className="pd-btn" onClick={actualizarArchivos} disabled={!proceso || loadingArchivos}>
            {loadingArchivos ? 'Actualizando...' : 'Actualizar archivos'}
          </button>

          <button className="pd-btn primary" onClick={goModificar} disabled={!proceso}>
            Modificar
          </button>

          <button className="pd-btn danger" onClick={finalizarCliente} disabled={finalizing}>
            {finalizing ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
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
          {showArchivos ? (
            <div className="pd-card" ref={filesRef}>
              <div className="pd-card-head">
                <span>Archivos</span>
                <span className="pd-muted">{archivos.length} archivo(s)</span>
              </div>

              <div className="pd-files">
                {archivos.length === 0 ? (
                  <div className="pd-empty">Sin archivos</div>
                ) : (
                  archivos.map(a => {
                    const id = a.id_proceso_archivo;
                    const draft = fileDrafts[id];
                    const isUploading = uploadingId === id;

                    return (
                      <div key={id} className="pd-file-row">
                        <div className="pd-file-main">
                          <div className="pd-file-top">
                            <div className="pd-file-name">{a.nombre_original}</div>

                            {/* ETIQUETA CATEGORIA */}
                            <span className={`pd-chip ${chipClass(a.categoria)}`}>{categoriaLabel(a.categoria)}</span>
                          </div>

                          <div className="pd-file-meta">
                            {a.mime_type} · {formatBytes(a.tamano_bytes)}
                          </div>

                          {draft ? (
                            <div className="pd-file-draft">
                              Nuevo: <b>{draft.name}</b> ({formatBytes(draft.size)})
                              <button className="pd-link-btn" onClick={() => clearDraft(id)}>
                                Quitar
                              </button>
                            </div>
                          ) : null}
                        </div>

                        <div className="pd-file-actions">
                          <button className="pd-btn sm" onClick={() => openPreview(a)}>
                            Ver
                          </button>

                          <label className="pd-btn sm ghost">
                            Actualizar
                            <input
                              type="file"
                              className="pd-file-input"
                              accept="image/*,application/pdf"
                              onChange={e => onPickReplaceFile(id, e.target.files?.[0])}
                            />
                          </label>

                          <button
                            className="pd-btn sm primary"
                            onClick={() => subirReemplazo(a)}
                            disabled={!draft || isUploading}
                          >
                            {isUploading ? 'Subiendo...' : 'Subir'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* MODAL PREVIEW */}
      {previewOpen ? (
        <div className="pd-modal-backdrop" onClick={closePreview}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-head">
              <div className="pd-modal-title">{previewFile?.nombre_original || 'Archivo'}</div>
              <button className="pd-btn sm" onClick={closePreview}>
                Cerrar
              </button>
            </div>

            <div className="pd-modal-body">
              {previewFile ? (
                isPdf(previewFile?.mime_type) ? (
                  <iframe title="pdf" src={getPreviewUrl(previewFile)} className="pd-iframe" />
                ) : (
                  <img src={getPreviewUrl(previewFile)} alt="preview" className="pd-img" />
                )
              ) : (
                <div className="pd-empty">Sin archivo</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isPdf(mime) {
  return (mime || '').toLowerCase().includes('pdf');
}

function chipClass(cat) {
  const c = (cat || '').toString().toUpperCase();
  if (c.includes('INE') || c.includes('IDENT')) return 'chip-id';
  if (c.includes('CURP')) return 'chip-curp';
  if (c.includes('NSS')) return 'chip-nss';
  if (c.includes('RFC')) return 'chip-rfc';
  return 'chip-default';
}

function categoriaLabel(cat) {
  if (!cat) return 'OTRO';

  const c = cat.toString().toUpperCase();

  if (c.includes('INE')) return 'INE';
  if (c.includes('CURP')) return 'CURP';
  if (c.includes('NSS')) return 'NSS';
  if (c.includes('RFC')) return 'RFC';

  return 'OTRO';
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

function badgeClass(estatus) {
  const e = (estatus || '').toString().toUpperCase();

  if (e === 'ACTIVO') return 'ok';
  if (e === 'BLOQUEADO') return 'warn';
  if (e === 'CANCELADO') return 'bad';

  return 'muted';
}
