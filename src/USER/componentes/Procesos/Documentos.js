// src/pages/Clientes/Procesos/Documentos.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { CRMContext } from '../../../context/CRMContext';
import usuariosAxios from '../../../config/axios';
import './Documentos.css';
import RetiroSteps from './RetiroSteps';

const REQUIRED_DOCS = [
  { key: 'INE_FRENTE', label: 'INE Frente', categoria: 'INE_FRENTE' },
  { key: 'INE_POSTERIOR', label: 'INE Posterior', categoria: 'INE_POSTERIOR' },
  { key: 'ESTADO_CUENTA', label: 'Estado de Cuenta', categoria: 'ESTADO_CUENTA' },
  { key: 'COMPROBANTE_DOM', label: 'Comprobante de Domicilio', categoria: 'COMPROBANTE_DOM' },
  { key: 'CONTRATO_PAGARE', label: 'Contrato / Pagaré', categoria: 'CONTRATO_PAGARE' }
];
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Documentos() {
  console.log(useParams());
  const [auth] = useContext(CRMContext);
  const history = useHistory();
  const { id_cliente, id_proceso: idProcesoParam } = useParams();
  console.log('Proceso', idProcesoParam);
  console.log('Cliente', id_cliente);
  const q = useQuery();
  const idProcesoQuery = q.get('id_proceso');

  const idProceso = idProcesoParam || idProcesoQuery; // PRIORIDAD: params
  // console.log(idProceso);
  const headers = useMemo(() => ({ Authorization: auth?.token ? `Bearer ${auth.token}` : '' }), [auth?.token]);

  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [error, setError] = useState('');

  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    if (!auth?.token || !idProceso) return;
    fetchArchivos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, idProceso]);

  const fetchArchivos = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await usuariosAxios.get(`/procesos/${idProceso}/archivos`, { headers });
      console.log(data);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.mensaje)
            ? data.mensaje
            : [];
      // console.log(list);
      setArchivos(list);
    } catch (e) {
      setError(getErrMsg(e, 'Error al cargar archivos'));
      setArchivos([]);
    } finally {
      setLoading(false);
    }
  };

  const docsUI = useMemo(() => {
    return REQUIRED_DOCS.map(d => {
      const found = archivos.find(a => a?.categoria === d.categoria && a?.activo !== false);
      return { ...d, estado: found ? 'Subido' : 'Pendiente', archivo: found || null };
    });
  }, [archivos]);

  const onUpload = doc => async e => {
    const already = archivos.some(a => a?.categoria === doc.categoria);
    if (already) {
      setError(`La categoría ${doc.label} ya fue subida. Si necesitas reemplazarla, usa "Reemplazar".`);
      e.target.value = '';
      return;
    }
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

      await usuariosAxios.post(`/procesos/${idProceso}/archivos`, fd, {
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

  const onBack = () => history.push(`/clientes/${id_cliente}/procesos/${idProceso}/editar/paso1`);
  const onFinish = () => history.push(`/proceso/cliente/${id_cliente}`);

  const faltantes = useMemo(() => docsUI.filter(d => d.estado !== 'Subido').length, [docsUI]);

  return (
    <div className="retiro-container">
      <RetiroSteps />

      <div className="dp-wrap">
        <div className="dp-card">
          <div className="dp-header">
            <h3>Informacion de los documentos del proceso</h3>

            <div className="dp-right">
              <span className={`dp-pill ${faltantes === 0 ? 'ok' : 'bad'}`}>
                {faltantes === 0 ? 'Completo' : `Faltan ${faltantes}`}
              </span>

              {/* <button className="dp-refresh" onClick={fetchArchivos} disabled={loading || uploadingKey !== ''}>
                {loading ? 'Cargando...' : 'Actualizar'}
              </button> */}
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
                  ) : d.archivo ? (
                    <span className="dp-muted">Subido</span>
                  ) : (
                    <span className="dp-muted">—</span>
                  )}
                </div>

                <div className="dp-col subir">
                  {d.archivo ? (
                    <span className="dp-muted">Ya existe</span>
                  ) : (
                    <label className="dp-upload">
                      {uploadingKey === d.key ? 'Subiendo...' : 'Subir Archivo'}
                      <input
                        type="file"
                        onChange={onUpload(d)}
                        disabled={uploadingKey !== '' || !!d.archivo}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
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
