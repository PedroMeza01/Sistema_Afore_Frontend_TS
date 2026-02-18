// src/pages/Clientes/Procesos/Datos_Del_Retiro/Datos_Del_Retiro.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CRMContext } from '../../../context/CRMContext';
import { useHistory, useParams } from 'react-router-dom';
import usuariosAxios from '../../../config/axios';
import './Datos_Del_Retiro.css';
import { swalError } from '../../../helpers/swal';
import RetiroSteps from './RetiroSteps';

export default function Datos_Del_Retiro() {
  const history = useHistory();
  const { id_cliente, id_proceso } = useParams();
  const isEdit = Boolean(id_proceso);

  const [auth] = useContext(CRMContext);

  // ✅ ya NO cargamos asesores para seleccionar
  const [afores, setAfores] = useState([]);

  const [cliente, setCliente] = useState(null); // ✅ para mostrar nombre asesor del cliente
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    fecha_firma: todayStr,
    tipo_firma: 'Oficina',

    id_afore: '',
    id_asesor: '', // ✅ se llena desde el cliente (no editable)

    fecha_baja_imss: '',
    fecha_46_dias: '',

    requiere_cita_afore: false,
    cita_afore: null,

    acompanamiento: 'Si',
    modo_retiro: 'Distancia',

    expediente_actualizado: false,
    app_vinculada: false,

    tramite_solicitado: false,
    resultado_tramite: 'SOLICITADO',
    observacion_tramite: '',

    listo_para_cobro: false,
    fecha_cobro: '',
    tipo_cobro: 'TRANSFERENCIA',
    evidencia_cobro_file: null,
    monto_cobrar: '',
    comision_porcentaje: '',
    encuesta_aplicada: false,

    estatus_proceso: 'ACTIVO',
    evidencia_bloqueo_file: null
  });

  const headers = useMemo(
    () => ({
      Authorization: auth?.token ? `Bearer ${auth.token}` : ''
    }),
    [auth?.token]
  );

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!auth?.token) {
      history.push('/');
      return;
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, id_proceso]);

  const init = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchCatalogos(); // solo afores

      // ✅ SIEMPRE trae cliente para fijar asesor
      await fetchClienteToForm();

      if (isEdit) {
        await fetchProcesoToForm();
        // ✅ blinda: fuerza asesor del cliente aunque el proceso venga mal
        await enforceAsesorCliente();
      }
    } catch (e) {
      setError(getErrMsg(e, 'Error al inicializar'));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // API CATALOGOS (solo AFORES)
  // =========================
  const fetchCatalogos = async () => {
    const afoRes = await usuariosAxios.get('/afores', { headers });
    const afoList = normalizeList(afoRes.data);

    setAfores(afoList);

    // SOLO en NUEVO: setear default de afore si sigue vacío
    if (!isEdit) {
      setForm(prev => ({
        ...prev,
        id_afore: prev.id_afore || (afoList[0]?.id_afore ?? '')
      }));
    }
  };

  // =========================
  // API CLIENTE (para fijar asesor)
  // =========================
  const fetchClienteToForm = async () => {
    const { data } = await usuariosAxios.get(`/clientes/${id_cliente}`, { headers });

    // ajusta si tu backend regresa distinto
    const c = data?.row ?? data?.mensaje ?? data;
    if (!c) throw new Error('No se encontró el cliente');

    setCliente(c);

    const idAsesorCliente = c?.id_asesor ?? c?.asesor?.id_asesor ?? '';
    if (!idAsesorCliente) {
      // ✅ decisión: bloquear creación/edición si no hay asesor asignado en cliente
      throw new Error(
        'El cliente no tiene asesor asignado. Asigna un asesor al cliente antes de crear/editar el proceso.'
      );
    }

    setForm(prev => ({
      ...prev,
      id_asesor: idAsesorCliente
    }));
  };

  const enforceAsesorCliente = async () => {
    const { data } = await usuariosAxios.get(`/clientes/${id_cliente}`, { headers });
    const c = data?.row ?? data?.mensaje ?? data;
    const idAsesorCliente = c?.id_asesor ?? c?.asesor?.id_asesor ?? '';

    if (!idAsesorCliente) return;

    setForm(prev => ({
      ...prev,
      id_asesor: idAsesorCliente
    }));
  };

  const asesorNombre = useMemo(() => {
    const a = cliente?.asesor;
    if (!a) return '';
    return [a?.nombre_asesor, a?.apellido_pat_asesor, a?.apellido_mat_asesor].filter(Boolean).join(' ').trim();
  }, [cliente]);

  // =========================
  // API PROCESO (EDITAR)
  // =========================
  const fetchProcesoToForm = async () => {
    const { data } = await usuariosAxios.get(`/procesos/${id_proceso}`, { headers });
    const p = data.row;
    if (!p) throw new Error('No se encontró el proceso');

    setForm(prev => ({
      ...prev,

      fecha_firma: p.fecha_firma,
      tipo_firma: toUiTipoFirma(p.tipo_firma) || prev.tipo_firma,

      id_afore: p.id_afore ?? prev.id_afore ?? '',
      // ⚠️ id_asesor lo vamos a forzar al del cliente después

      fecha_baja_imss: p.fecha_baja_imss || '',
      fecha_46_dias: p.fecha_46_dias || (p.fecha_baja_imss ? addDaysISO(p.fecha_baja_imss, 46) : ''),

      requiere_cita_afore: Boolean(p.requiere_cita_afore),
      cita_afore: p.cita_afore || null,

      acompanamiento: toUiSiNo(p.acompanamiento) || 'Si',
      modo_retiro: toUiModoRetiro(p.modo_retiro) || 'Distancia',

      expediente_actualizado: Boolean(p.expediente_actualizado),
      app_vinculada: Boolean(p.app_vinculada),

      tramite_solicitado: Boolean(p.tramite_solicitado),
      resultado_tramite: p.resultado_tramite || 'SOLICITADO',
      observacion_tramite: p.observacion_tramite || '',

      listo_para_cobro: Boolean(p.listo_para_cobro),
      fecha_cobro: p.fecha_cobro || '',
      tipo_cobro: p.tipo_cobro || 'TRANSFERENCIA',
      evidencia_cobro_file: null,
      monto_cobrar: p.monto_cobrar ?? '',
      encuesta_aplicada: Boolean(p.encuesta_aplicada),

      estatus_proceso: (p.estatus_proceso || 'ACTIVO').toString().toUpperCase(),
      evidencia_bloqueo_file: null
    }));
  };

  // =========================
  // DERIVADOS: fecha 46 días (UTC safe)
  // =========================
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      fecha_46_dias: prev.fecha_baja_imss ? addDaysISO(prev.fecha_baja_imss, 46) : ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fecha_baja_imss]);

  // ✅ bono = tipo firma + encuesta + comision fija (ejemplo)
  const bono_asesora = getBonoAsesora({
    tipoFirma: form.tipo_firma,
    encuestaAplicada: form.encuesta_aplicada,
    montoCobrar: form.monto_cobrar
  });

  const listoParaSolicitar =
    Boolean(form.id_afore) &&
    Boolean(form.id_asesor) &&
    form.expediente_actualizado &&
    form.app_vinculada &&
    (!form.requiere_cita_afore || Boolean(form.cita_afore));

  const estatusPreparacion = getEstatusPreparacion(form, listoParaSolicitar);

  // =========================
  // HANDLERS
  // =========================
  const onChange = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const onToggle = key => e => setForm(prev => ({ ...prev, [key]: e.target.checked }));

  const onFile = key => e => {
    const file = e.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, [key]: file }));
  };

  const onToggleRequiereCita = e => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      requiere_cita_afore: checked,
      cita_afore: checked ? (prev.cita_afore ?? prev.fecha_46_dias ?? prev.fecha_firma) : null
    }));
  };

  const onToggleTramiteSolicitado = e => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      tramite_solicitado: checked,
      resultado_tramite: checked ? prev.resultado_tramite : 'LISTO',
      observacion_tramite: checked ? prev.observacion_tramite : ''
    }));
  };

  const onToggleListoCobro = e => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      listo_para_cobro: checked,
      fecha_cobro: checked ? prev.fecha_cobro || prev.fecha_firma : '',
      tipo_cobro: checked ? prev.tipo_cobro || 'TRANSFERENCIA' : 'TRANSFERENCIA',
      evidencia_cobro_file: checked ? prev.evidencia_cobro_file : null,
      monto_cobrar: checked ? prev.monto_cobrar : '',
      encuesta_aplicada: checked ? prev.encuesta_aplicada : false
    }));
  };

  const bloquearProceso = () => {
    if (!form.evidencia_bloqueo_file) {
      setError('Para bloquear el proceso debes adjuntar evidencia de bloqueo.');
      return;
    }
    setError('');
    setForm(prev => ({ ...prev, estatus_proceso: 'BLOQUEADO' }));
  };

  // =========================
  // API (subida archivos)
  // =========================
  const uploadArchivo = async (pid, categoria, file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('categoria', categoria);

    await usuariosAxios.post(`/procesos/${pid}/archivos`, fd, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });
  };

  const validateOrSwal = () => {
    if (!form.id_afore) {
      swalError('Selecciona una Afore.');
      return false;
    }

    // ✅ ahora NO se elige: debe venir del cliente
    if (!form.id_asesor) {
      swalError('El cliente no tiene asesor asignado.');
      return false;
    }

    if (form.requiere_cita_afore && !form.cita_afore) {
      swalError('La cita Afore es requerida.');
      return false;
    }

    if (form.tramite_solicitado) {
      if (!form.expediente_actualizado || !form.app_vinculada) {
        swalError('Para solicitar trámite debes marcar "Expediente actualizado" y "App vinculada".');
        return false;
      }

      if (!form.resultado_tramite) {
        swalError('Selecciona el resultado del trámite.');
        return false;
      }

      if (form.resultado_tramite === 'RECHAZADO' && !safeStr(form.observacion_tramite)) {
        swalError('Si el trámite está RECHAZADO, captura una observación.');
        return false;
      }
    }

    if (form.listo_para_cobro) {
      if (!form.fecha_cobro) {
        swalError('Captura la fecha de cobro.');
        return false;
      }

      if (!form.tipo_cobro) {
        swalError('Selecciona el tipo de cobro.');
        return false;
      }

      if (!isPositiveNumber(form.monto_cobrar)) {
        swalError('Captura un monto válido a cobrar.');
        return false;
      }
    }

    if (
      (form.estatus_proceso === 'BLOQUEADO' || form.estatus_proceso === 'CANCELADO') &&
      !form.evidencia_bloqueo_file
    ) {
      swalError('Para BLOQUEADO/CANCELADO debes adjuntar evidencia.');
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    id_cliente,
    id_afore: form.id_afore,

    // ✅ asesor fijo del cliente
    id_asesor: form.id_asesor,

    fecha_firma: form.fecha_firma,
    tipo_firma: form.tipo_firma === 'Asesor' ? 'ASESOR' : 'OFICINA',

    fecha_baja_imss: form.fecha_baja_imss || null,
    fecha_46_dias: form.fecha_46_dias || null,

    requiere_cita_afore: form.requiere_cita_afore,
    cita_afore: form.cita_afore,

    acompanamiento: form.acompanamiento === 'No' ? 'NO' : 'SI',
    modo_retiro: form.modo_retiro === 'Presencial' ? 'PRESENCIAL' : 'DISTANCIA',

    expediente_actualizado: form.expediente_actualizado,
    app_vinculada: form.app_vinculada,

    tramite_solicitado: form.tramite_solicitado,
    resultado_tramite: form.tramite_solicitado ? form.resultado_tramite : null,
    observacion_tramite: form.tramite_solicitado ? safeStr(form.observacion_tramite) || null : null,

    listo_para_cobro: form.listo_para_cobro,
    fecha_cobro: form.listo_para_cobro ? form.fecha_cobro : null,
    tipo_cobro: form.listo_para_cobro ? form.tipo_cobro : null,
    monto_cobrar: form.listo_para_cobro ? String(form.monto_cobrar) : null,

    encuesta_aplicada: form.listo_para_cobro ? form.encuesta_aplicada : false,
    bono_asesora: String(bono_asesora),

    estatus_proceso: form.estatus_proceso
  });

  const saveCreateOrPatch = async () => {
    if (!validateOrSwal()) return;
    const payload = buildPayload();

    if (!isEdit) {
      const createdRes = await usuariosAxios.post('/procesos', payload, { headers });
      const created = createdRes?.data?.data ?? createdRes?.data;
      const pid = created?.id_proceso;
      if (!pid) throw new Error('No regresó id_proceso');

      if (form.listo_para_cobro && form.evidencia_cobro_file) {
        await uploadArchivo(pid, 'EVIDENCIA_COBRO', form.evidencia_cobro_file);
      }
      if (
        (form.estatus_proceso === 'BLOQUEADO' || form.estatus_proceso === 'CANCELADO') &&
        form.evidencia_bloqueo_file
      ) {
        await uploadArchivo(pid, 'BLOQUEO', form.evidencia_bloqueo_file);
      }

      localStorage.setItem(`proceso_actual_${id_cliente}`, pid);
      return pid;
    }

    await usuariosAxios.patch(`/procesos/${id_proceso}`, payload, { headers });

    if (form.listo_para_cobro && form.evidencia_cobro_file) {
      await uploadArchivo(id_proceso, 'EVIDENCIA_COBRO', form.evidencia_cobro_file);
      setForm(prev => ({ ...prev, evidencia_cobro_file: null }));
    }
    if ((form.estatus_proceso === 'BLOQUEADO' || form.estatus_proceso === 'CANCELADO') && form.evidencia_bloqueo_file) {
      await uploadArchivo(id_proceso, 'BLOQUEO', form.evidencia_bloqueo_file);
      setForm(prev => ({ ...prev, evidencia_bloqueo_file: null }));
    }

    return id_proceso;
  };

  const onNext = async () => {
    if (!validateOrSwal()) return;

    setSaving(true);
    setError('');
    try {
      const pid = await saveCreateOrPatch();

      if (isEdit) {
        history.push(`/clientes/${id_cliente}/procesos/${pid}/editar/paso2`);
        return;
      }

      history.push(`/clientes/${id_cliente}/procesos/nuevo/paso2?id_proceso=${pid}`);
    } catch (e) {
      setError(getErrMsg(e, 'Error al guardar proceso'));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (!isEdit) {
      history.push(`/clientes/${id_cliente}/procesos`);
      return;
    }
    history.push(`/clientes/${id_cliente}/procesos/${id_proceso}`);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="retiro-container">
      <RetiroSteps />

      <div className="retiro-card">
        {error ? <div className="form-error">{error}</div> : null}

        <div className="form-group">
          <div className="form-col">
            <label className="sub-label">Fecha de la firma</label>
            <input
              type="date"
              value={form.fecha_firma}
              onChange={onChange('fecha_firma')}
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tipo de firma</label>
          <select value={form.tipo_firma} onChange={onChange('tipo_firma')} disabled={loading || saving}>
            <option value="Oficina">Oficina</option>
            <option value="Asesor">Asesor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Afore</label>
          <select value={form.id_afore} onChange={onChange('id_afore')} disabled={loading || saving}>
            {loading ? (
              <option value="">Cargando...</option>
            ) : afores.length === 0 ? (
              <option value="">Sin afores</option>
            ) : (
              <>
                <option value="">Selecciona...</option>
                {afores.map(a => (
                  <option key={a.id_afore} value={a.id_afore}>
                    {a.nombre_afore}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* ✅ ASESOR FIJO DEL CLIENTE (NO EDITABLE) */}
        <div className="form-group">
          <label>Asesor (del cliente)</label>
          <input
            value={asesorNombre || (form.id_asesor ? `Asesor asignado (ID: ${form.id_asesor})` : 'Sin asesor asignado')}
            readOnly
            disabled
          />
          {!form.id_asesor ? (
            <div className="tiny-note" style={{ color: '#ffb4b4' }}>
              Asigna asesor al cliente antes de continuar.
            </div>
          ) : null}
        </div>

        <div className="form-group">
          <div className="form-row">
            <div className="form-col">
              <label className="sub-label">Fecha de Baja IMSS</label>
              <input
                type="date"
                value={form.fecha_baja_imss}
                onChange={onChange('fecha_baja_imss')}
                disabled={loading || saving}
              />
            </div>

            <div className="form-col">
              <label className="sub-label">Fecha 46 días</label>
              <input type="date" value={form.fecha_46_dias} readOnly disabled />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="check-inline">
            <input
              type="checkbox"
              checked={form.requiere_cita_afore}
              onChange={onToggleRequiereCita}
              disabled={loading || saving}
            />
            Requiere cita en Afore
          </label>
        </div>

        {form.requiere_cita_afore ? (
          <div className="form-group">
            <div className="form-col">
              <label className="sub-label">Cita Afore</label>
              <input
                type="date"
                value={form.cita_afore ?? ''}
                onChange={e => setForm(prev => ({ ...prev, cita_afore: e.target.value || null }))}
                disabled={loading || saving}
              />
            </div>
          </div>
        ) : null}

        <div className="form-group">
          <div className="checks-col">
            <label className="check-inline">
              <input
                type="checkbox"
                checked={form.expediente_actualizado}
                onChange={onToggle('expediente_actualizado')}
                disabled={loading || saving}
              />
              Expediente Actualizado
            </label>

            <label className="check-inline">
              <input
                type="checkbox"
                checked={form.app_vinculada}
                onChange={onToggle('app_vinculada')}
                disabled={loading || saving}
              />
              App Vinculada
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Acompañamiento</label>
          <select value={form.acompanamiento} onChange={onChange('acompanamiento')} disabled={loading || saving}>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Modo De Retiro</label>
          <select value={form.modo_retiro} onChange={onChange('modo_retiro')} disabled={loading || saving}>
            <option value="Distancia">Distancia</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">Trámite</div>
            <label className="check-inline">
              <input
                type="checkbox"
                checked={form.tramite_solicitado}
                onChange={onToggleTramiteSolicitado}
                disabled={loading || saving}
              />
              Trámite solicitado
            </label>
          </div>

          {form.tramite_solicitado ? (
            <div className="section-body">
              <div className="form-row">
                <div className="form-col">
                  <label className="sub-label">Resultado</label>
                  <select
                    value={form.resultado_tramite}
                    onChange={onChange('resultado_tramite')}
                    disabled={loading || saving}
                  >
                    <option value="SOLICITADO">SOLICITADO</option>
                    <option value="LISTO">LISTO</option>
                    <option value="RECHAZADO">RECHAZADO</option>
                  </select>
                </div>

                <div className="form-col">
                  <label className="sub-label">Observación</label>
                  <textarea
                    value={form.observacion_tramite}
                    onChange={onChange('observacion_tramite')}
                    placeholder="Motivo / nota del trámite..."
                    disabled={loading || saving}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="section-hint">Si aún no se solicita, deja desmarcado.</div>
          )}
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">Cobro</div>
            <label className="check-inline">
              <input
                type="checkbox"
                checked={form.listo_para_cobro}
                onChange={onToggleListoCobro}
                disabled={loading || saving}
              />
              Cliente listo para cobro
            </label>
          </div>

          {form.listo_para_cobro ? (
            <div className="section-body">
              <div className="form-row">
                <div className="form-col">
                  <label className="sub-label">Fecha de cobro</label>
                  <input
                    type="date"
                    value={form.fecha_cobro}
                    onChange={onChange('fecha_cobro')}
                    disabled={loading || saving}
                  />
                </div>

                <div className="form-col">
                  <label className="sub-label">Tipo de cobro</label>
                  <select value={form.tipo_cobro} onChange={onChange('tipo_cobro')} disabled={loading || saving}>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    <option value="PRESENCIAL">PRESENCIAL</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label className="sub-label">Monto a cobrar</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.monto_cobrar}
                    onChange={onChange('monto_cobrar')}
                    placeholder="0.00"
                    disabled={loading || saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label className="check-inline">
                    <input
                      type="checkbox"
                      checked={form.encuesta_aplicada}
                      onChange={onToggle('encuesta_aplicada')}
                      disabled={loading || saving}
                    />
                    Encuesta aplicada (+$100)
                  </label>
                </div>

                <div className="form-col">
                  <div className="money-pill">
                    <div className="money-title">Bono asesora</div>
                    <div className="money-value">${Number(bono_asesora || 0).toFixed(2)}</div>
                    <div className="money-sub">
                      Base: {form.tipo_firma === 'Asesor' ? '$700' : '$0'}
                      {form.encuesta_aplicada ? ' + $100 encuesta' : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="sub-label">Evidencia de cobro</label>
                <input
                  className="file-input"
                  type="file"
                  onChange={onFile('evidencia_cobro_file')}
                  disabled={loading || saving}
                />
                {form.evidencia_cobro_file ? (
                  <div className="file-meta">Archivo: {form.evidencia_cobro_file.name}</div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="section-hint">Actívalo sólo cuando ya esté todo para cobrar.</div>
          )}
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">Estatus del proceso</div>
            <span className={`status-pill ${form.estatus_proceso}`}>{form.estatus_proceso}</span>
          </div>

          <div className="section-body">
            <div className="form-row">
              <div className="form-col">
                <label className="sub-label">Estatus</label>
                <select
                  value={form.estatus_proceso}
                  onChange={onChange('estatus_proceso')}
                  disabled={loading || saving}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                  <option value="BLOQUEADO">BLOQUEADO</option>
                </select>
                <div className="tiny-note">Si lo pones en BLOQUEADO/CANCELADO, el sistema exigirá evidencia.</div>
              </div>

              <div className="form-col">
                <label className="sub-label">Evidencia (bloqueo/cancelación)</label>
                <input
                  className="file-input"
                  type="file"
                  onChange={onFile('evidencia_bloqueo_file')}
                  disabled={loading || saving}
                />
                {form.evidencia_bloqueo_file ? (
                  <div className="file-meta">Archivo: {form.evidencia_bloqueo_file.name}</div>
                ) : null}
              </div>
            </div>

            <div className="danger-actions">
              <button className="btn-block" type="button" onClick={bloquearProceso} disabled={loading || saving}>
                Bloquear proceso
              </button>
            </div>
          </div>
        </div>

        <div className={`prep-banner ${estatusPreparacion}`}>
          <div className="prep-left">
            <div className="prep-title">Preparación del proceso</div>
            <div className="prep-sub">
              {renderEstatus(estatusPreparacion)}
              {estatusPreparacion === 'LISTO_PARA_SOLICITAR' ? ' — ya puedes solicitar.' : ' — completa lo faltante.'}
            </div>

            <div className="prep-chips">
              <span className={`chip ${form.app_vinculada ? 'ok' : 'bad'}`}>App vinculada</span>
              <span className={`chip ${form.expediente_actualizado ? 'ok' : 'bad'}`}>Expediente</span>
              <span className={`chip ${!form.requiere_cita_afore || form.cita_afore ? 'ok' : 'bad'}`}>Cita</span>
              <span className={`chip ${form.tramite_solicitado ? 'ok' : 'bad'}`}>Trámite</span>
              <span className={`chip ${form.listo_para_cobro ? 'ok' : 'bad'}`}>Cobro</span>
            </div>
          </div>

          <div className="prep-right">
            <div className="prep-score">
              <div className="score-num">{getScore(form)}</div>
              <div className="score-lab">completo</div>
            </div>

            {estatusPreparacion === 'LISTO_PARA_SOLICITAR' ? (
              <div className="prep-ready">
                <span className="ready-dot" />
                Listo
              </div>
            ) : null}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel" type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>

          <button className="btn-next" type="button" onClick={onNext} disabled={saving || loading || !form.id_asesor}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar y seguir' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   HELPERS
   ========================= */
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.mensaje)) return data.mensaje;
  return [];
}
function getErrMsg(err, fallback) {
  try {
    return err?.response?.data?.message || err?.response?.data?.mensaje || err?.message || fallback;
  } catch {
    return fallback;
  }
}
function addDaysISO(isoDate, days) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return '';
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + Number(days || 0));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
function toUiTipoFirma(v) {
  const x = (v ?? '').toString().toUpperCase();
  if (x === 'ASESOR') return 'Asesor';
  if (x === 'OFICINA') return 'Oficina';
  return '';
}
function toUiSiNo(v) {
  const x = (v ?? '').toString().toUpperCase();
  if (x === 'SI') return 'Si';
  if (x === 'NO') return 'No';
  return '';
}
function toUiModoRetiro(v) {
  const x = (v ?? '').toString().toUpperCase();
  if (x === 'PRESENCIAL') return 'Presencial';
  if (x === 'DISTANCIA') return 'Distancia';
  return '';
}
function getEstatusPreparacion(form, listoParaSolicitar) {
  if (listoParaSolicitar) return 'LISTO_PARA_SOLICITAR';
  if (!form.app_vinculada) return 'VINCULAR_APP';
  if (!form.expediente_actualizado) return 'ACTUALIZAR_EXPEDIENTE';
  if (form.requiere_cita_afore && !form.cita_afore) return 'CAPTURAR_CITA';
  return 'INCOMPLETO';
}
function renderEstatus(code) {
  switch (code) {
    case 'LISTO_PARA_SOLICITAR':
      return 'Listo para solicitar';
    case 'VINCULAR_APP':
      return 'Vincular app';
    case 'ACTUALIZAR_EXPEDIENTE':
      return 'Actualizar expediente';
    case 'CAPTURAR_CITA':
      return 'Capturar cita';
    default:
      return 'Incompleto';
  }
}
function safeStr(v) {
  return (v ?? '').toString().trim();
}
function getScore(form) {
  const total = 5;
  const ok1 = form.app_vinculada ? 1 : 0;
  const ok2 = form.expediente_actualizado ? 1 : 0;
  const ok3 = !form.requiere_cita_afore || Boolean(form.cita_afore) ? 1 : 0;
  const ok4 = form.tramite_solicitado ? 1 : 0;
  const ok5 = form.listo_para_cobro ? 1 : 0;
  const porcentaje = Math.round(((ok1 + ok2 + ok3 + ok4 + ok5) / total) * 100);
  return `${porcentaje}%`;
}
function getBonoAsesora({ tipoFirma, encuestaAplicada, montoCobrar }) {
  const base = tipoFirma === 'Asesor' ? 700 : 0;
  const encuesta = encuestaAplicada ? 100 : 0;

  const monto = Number(montoCobrar) || 0;
  const porcentaje = 25.6;

  const comision = monto > 0 && porcentaje > 0 ? monto * (porcentaje / 100) : 0;

  return base + encuesta + comision;
}
function isPositiveNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
