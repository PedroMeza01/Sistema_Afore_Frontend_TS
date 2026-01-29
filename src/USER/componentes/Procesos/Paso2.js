// src/pages/Clientes/Procesos/Paso2.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import './Paso2.css';

const REQUIRED_DOCS = [
  { key: 'INE_FRENTE', label: 'INE Frente', categoria: 'DOCUMENTO_CLIENTE' },
  { key: 'INE_POSTERIOR', label: 'INE Posterior', categoria: 'DOCUMENTO_CLIENTE' },
  { key: 'ESTADO_CUENTA', label: 'Estado de Cuenta', categoria: 'DOCUMENTO_CLIENTE' },
  { key: 'COMPROBANTE_DOM', label: 'Comprobante de Domicilio', categoria: 'DOCUMENTO_CLIENTE' },
  { key: 'CONTRATO_PAGARE', label: 'Contrato/Pagare', categoria: 'DOCUMENTO_CLIENTE' }
];

export default function Paso2() {
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const { id_cliente, id_proceso } = useParams();

  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [error, setError] = useState('');

  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    if (!auth?.token || !id_proceso) return;
    fetchArchivos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, id_proceso]);

  const fetchArchivos = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get(`/procesos/${id_proceso}/archivos`, { headers });
      const list = Array.isArray(data?.mensaje) ? data.mensaje : Array.isArray(data) ? data : [];
      setArchivos(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar archivos'));
      setArchivos([]);
    } finally {
      setLoading(false);
    }
  };

  const docsUI = useMemo(() => {
    // Heurística por nombre: se recomienda agregar "codigo_documento" en BD.
    return REQUIRED_DOCS.map(d => {
      const found = archivos.find(a => {
        const name = (a?.nombre_original || '').toUpperCase();
        return a?.categoria === d.categoria && name.includes(d.key);
      });
      return { ...d, estado: found ? 'Subido' : 'Pendiente', archivo: found || null };
    });
  }, [archivos]);

  const onUpload = doc => async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKey(doc.key);
    setError('');

    try {
      const fd = new FormData();
      fd.append('categoria', doc.categoria);

      // renombrar para que la heurística funcione (INE_FRENTE_xxx.pdf)
      const renamed = new File([file], `${doc.key}_${file.name}`, { type: file.type });
      fd.append('file', renamed);

      await usuariosAxios.post(`/procesos/${id_proceso}/archivos`, fd, {
        headers: {
          Authorization: headers.Authorization,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchArchivos();
    } catch (err) {
      setError(getErrMsg(err, 'Error al subir archivo'));
    } finally {
      setUploadingKey('');
      e.target.value = '';
    }
  };

  const onBack = () => history.push(`/clientes/${id_cliente}/procesos/${id_proceso}/editar/paso1`);
  const onFinish = () => history.push(`/clientes/${id_cliente}/procesos/${id_proceso}`);

  const faltantes = useMemo(() => docsUI.filter(d => d.estado !== 'Subido').length, [docsUI]);

  return (
    <div className="retiro-container">
      <div className="retiro-steps">
        <div className="step active">1 Seleccionar Cliente</div>
        <div className="step active">2 Datos del Retiro</div>
        <div className="step active">3 Documentos</div>
        <div className="step">4 Confirmación</div>
      </div>

      <div className="dp-wrap">
        <div className="dp-card">
          <div className="dp-header">
            <h3>Documentos del Proceso</h3>
            <div className="dp-right">
              <span className="dp-pill">{faltantes === 0 ? 'Completo' : `Faltan ${faltantes}`}</span>
              <button className="dp-refresh" onClick={fetchArchivos} disabled={loading || uploadingKey !== ''}>
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {error ? <div className="dp-error">{error}</div> : null}

          <div className="dp-table">
            {docsUI.map((d, idx) => (
              <div key={d.key} className={`dp-row ${idx === 0 ? 'first' : ''}`}>
                <div className="dp-col doc">{d.label}</div>

                <div className="dp-col estado">
                  <span className={`dp-status ${d.estado === 'Subido' ? 'ok' : 'pending'}`}>{d.estado}</span>
                </div>

                <div className="dp-col ver">
                  {d.archivo?.public_url ? (
                    <a className="dp-link" href={d.archivo.public_url} target="_blank" rel="noreferrer">
                      Ver
                    </a>
                  ) : d.archivo?.storage_path ? (
                    <span className="dp-muted">Subido</span>
                  ) : (
                    <span className="dp-muted">—</span>
                  )}
                </div>

                <div className="dp-col subir">
                  <label className={`dp-upload ${d.estado === 'Subido' ? 'light' : ''}`}>
                    {uploadingKey === d.key ? 'Subiendo...' : 'Subir Archivo'}
                    <input
                      type="file"
                      onChange={onUpload(d)}
                      disabled={uploadingKey !== ''}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel" type="button" onClick={onBack} disabled={uploadingKey !== ''}>
            Atrás
          </button>

          <button className="btn-next" type="button" onClick={onFinish} disabled={uploadingKey !== ''}>
            Terminar
          </button>
        </div>
      </div>
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
