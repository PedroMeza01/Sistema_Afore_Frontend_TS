/**
 * Valida el formulario del proceso de retiro
 * Devuelve { valid: boolean, message?: string }
 */

export const validateProcesoForm = (form) => {
  // =========================
  // VALIDACIONES BÁSICAS
  // =========================

  if (!form.id_afore || Number(form.id_afore) <= 0) {
    return {
      valid: false,
      message: 'Selecciona un Afore válido.'
    };
  }

  if (!form.id_asesor || Number(form.id_asesor) <= 0) {
    return {
      valid: false,
      message: 'Selecciona un Asesor válido.'
    };
  }

  if (!form.fecha_firma) {
    return {
      valid: false,
      message: 'La fecha de firma es obligatoria.'
    };
  }

  // =========================
  // CITA AFORE
  // =========================

  if (form.requiere_cita_afore && !form.cita_afore) {
    return {
      valid: false,
      message: 'Debes capturar la fecha de cita en Afore.'
    };
  }

  // =========================
  // TRÁMITE
  // =========================

  if (form.tramite_solicitado) {
    if (!form.resultado_tramite) {
      return {
        valid: false,
        message: 'Selecciona el resultado del trámite.'
      };
    }
  }

  // =========================
  // COBRO
  // =========================

  if (form.listo_para_cobro) {
    if (!form.fecha_cobro) {
      return {
        valid: false,
        message: 'Debes indicar la fecha de cobro.'
      };
    }

    if (!form.monto_cobrar || Number(form.monto_cobrar) <= 0) {
      return {
        valid: false,
        message: 'El monto a cobrar debe ser mayor a 0.'
      };
    }

    if (!form.evidencia_cobro_file) {
      return {
        valid: false,
        message: 'Debes subir la evidencia de cobro.'
      };
    }
  }

  // =========================
  // BLOQUEO
  // =========================

  if (form.estatus_proceso === 'BLOQUEADO' && !form.evidencia_bloqueo_file) {
    return {
      valid: false,
      message: 'Debes subir evidencia para bloquear el proceso.'
    };
  }

  // =========================
  // TODO OK
  // =========================

  return {
    valid: true
  };
};
