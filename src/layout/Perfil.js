import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import adminAxios from '../config/axios';
import { CRMContext } from '../context/CRMContext';

function Perfil(props) {
  const [auth] = useContext(CRMContext);
  const [perfil, guardarPerfil] = useState(null); // Inicializar con null para evitar array vacío

  const tipo = String(auth.idrol_user); // <- normaliza
  //console.log(auth)
  // QUERY API
  const consultarAPI = async () => {
    try {
      // Inicializamos params como un objeto vacío
      let params = {};
      params = {
        idrol_user: tipo,
        claveUsuario: auth.claveUsuario
      };

      //console.log("Parámetros de consulta:", params);
      // Realizamos la consulta a la API con los parámetros correctos
      const perfilConsulta = await adminAxios.get('/usuario/perfil', { params });
      //console.log(perfilConsulta.data);
      guardarPerfil(perfilConsulta.data);
    } catch (error) {
      console.error('Error al consultar la API', error);
    }
  };

  useEffect(() => {
    if (auth.token !== '') {
      consultarAPI();
    } else {
      props.history.push('/');
    }
  }, [auth.token]);

  return (
    <Fragment>
      <h2>Perfil</h2>
      <Link to={'/modificarContraseña'} className="btn btn-azul nvo-cliente">
        <i className="fas fa-plus-circle"></i>
        Actualizar contraseña
      </Link>

      {perfil ? (
        <div>
          {auth.idrol_user === 1 ? (
            // Mostrar dos campos para administrador
            <Fragment>
              <h2>Administrador</h2>
              <form>
                <h3>Datos Generales</h3>
                <div className="campo">
                  <label>Código:</label>
                  <input type="text" value={perfil.idinterno_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Nombre Completo:</label>
                  <input
                    type="text"
                    value={perfil.nombre_empleado + ' ' + perfil.ap_pat_empleado + ' ' + perfil.ap_mat_empleado}
                    disabled
                  />
                </div>
                <div className="campo">
                  <label>CURP:</label>
                  <input type="text" value={perfil.curp_empleado} disabled />
                </div>
                <div className="campo">
                  <label>RFC:</label>
                  <input type="text" value={perfil.rfc_empleado} disabled />
                </div>
                <div className="campo">
                  <label>NSS:</label>
                  <input type="text" value={perfil.nss_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Fecha Nacimiento:</label>
                  <input type="text" value={perfil.fechanacimiento_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Direccion:</label>
                  <input type="text" value={perfil.direccion_empleado + ' ' + perfil.codigo_postal_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Correo Electrónico:</label>
                  <input type="text" value={perfil.correo_empleado} disabled />
                </div>
                <h3>Datos Laborales</h3>
                <div className="campo">
                  <label>Departamento:</label>
                  <input type="text" value={perfil.departamento_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Puesto:</label>
                  <input type="text" value={perfil.puesto_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Empresa:</label>
                  <input type="text" value={perfil.idempresa_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Fecha de Ingreso:</label>
                  <input type="text" value={perfil.fecha_inicio_rel_laboral} disabled />
                </div>
                <h3>Datos Fiscales y Bancarios</h3>
                <div className="campo">
                  <label>Régimen Fiscal:</label>
                  <input type="text" value={perfil.regimen_fiscal_empleado} disabled />{' '}
                  <input type="text" value={perfil.regimen_fiscal_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Periodicidad de Pago:</label>
                  <input type="text" value={perfil.periodicidadpago_empleado} disabled />{' '}
                  <input type="text" value={perfil.periodicidadpago_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Tipo de Contrato:</label>
                  <input type="text" value={perfil.tipocontrato_empleado} disabled />{' '}
                  <input type="text" value={perfil.tipocontrato_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Tipo de Jornada:</label>
                  <input type="text" value={perfil.tipojornada_empleado} disabled />
                  <input type="text" value={perfil.tipojornada_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Riesgo de Trabajo:</label>
                  <input type="text" value={perfil.riesgo_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Salario diario:</label>
                  <input type="text" value={perfil.salario_diario_integrado} disabled />
                </div>
                <div className="campo">
                  <label>Banco:</label>
                  <input type="text" value={perfil.ctabanco_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Cuenta Bancaria:</label>
                  <input type="text" value={perfil.cuenta_bancaria} disabled />
                </div>
                <div className="campo">
                  <label>CLABE interbancaria:</label>
                  <input type="text" value={perfil.clabe_interbancaria} disabled />
                </div>
                {/*<Link to={`/usuarios/recuperarcontra/${auth.claveUsuario}`} className="btn btn-azul">
                                    <i className="fas fa-pen-alt"></i>
                                    Recuperar contraseña
                                </Link>*/}
              </form>
            </Fragment>
          ) : auth.idrol_user === 2 ? (
            // Mostrar dos campos para administrador
            <Fragment>
              <h2>Administrador</h2>
              <form>
                <h3>Datos Generales</h3>
                <div className="campo">
                  <label>Código:</label>
                  <input type="text" value={perfil.idinterno_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Nombre Completo:</label>
                  <input
                    type="text"
                    value={perfil.nombre_empleado + ' ' + perfil.ap_pat_empleado + ' ' + perfil.ap_mat_empleado}
                    disabled
                  />
                </div>
                <div className="campo">
                  <label>CURP:</label>
                  <input type="text" value={perfil.curp_empleado} disabled />
                </div>
                <div className="campo">
                  <label>RFC:</label>
                  <input type="text" value={perfil.rfc_empleado} disabled />
                </div>
                <div className="campo">
                  <label>NSS:</label>
                  <input type="text" value={perfil.nss_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Fecha Nacimiento:</label>
                  <input type="text" value={perfil.fechanacimiento_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Direccion:</label>
                  <input type="text" value={perfil.direccion_empleado + ' ' + perfil.codigo_postal_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Correo Electrónico:</label>
                  <input type="text" value={perfil.correo_empleado} disabled />
                </div>
                <h3>Datos Laborales</h3>
                <div className="campo">
                  <label>Departamento:</label>
                  <input type="text" value={perfil.departamento_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Puesto:</label>
                  <input type="text" value={perfil.puesto_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Empresa:</label>
                  <input type="text" value={perfil.idempresa_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Fecha de Ingreso:</label>
                  <input type="text" value={perfil.fecha_inicio_rel_laboral} disabled />
                </div>
                <h3>Datos Fiscales y Bancarios</h3>
                <div className="campo">
                  <label>Régimen Fiscal:</label>
                  <input type="text" value={perfil.regimen_fiscal_empleado} disabled />{' '}
                  <input type="text" value={perfil.regimen_fiscal_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Periodicidad de Pago:</label>
                  <input type="text" value={perfil.periodicidadpago_empleado} disabled />{' '}
                  <input type="text" value={perfil.periodicidadpago_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Tipo de Contrato:</label>
                  <input type="text" value={perfil.tipocontrato_empleado} disabled />{' '}
                  <input type="text" value={perfil.tipocontrato_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Tipo de Jornada:</label>
                  <input type="text" value={perfil.tipojornada_empleado} disabled />
                  <input type="text" value={perfil.tipojornada_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Riesgo de Trabajo:</label>
                  <input type="text" value={perfil.riesgo_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Salario diario:</label>
                  <input type="text" value={perfil.salario_diario_integrado} disabled />
                </div>
                <div className="campo">
                  <label>Banco:</label>
                  <input type="text" value={perfil.ctabanco_empleado} disabled />
                </div>
                <div className="campo">
                  <label>Cuenta Bancaria:</label>
                  <input type="text" value={perfil.cuenta_bancaria} disabled />
                </div>
                <div className="campo">
                  <label>CLABE interbancaria:</label>
                  <input type="text" value={perfil.clabe_interbancaria} disabled />
                </div>
                {/*<Link to={`/usuarios/recuperarcontra/${auth.claveUsuario}`} className="btn btn-azul">
                                    <i className="fas fa-pen-alt"></i>
                                    Recuperar contraseña
                                </Link>*/}
              </form>
            </Fragment>
          ) : (
            // Mostrar cuatro campos para cliente
            <Fragment>
              <form>
                <div className="campo">
                  <label>Código:</label>
                  <input type="text" value={perfil.clicdclic} disabled />
                </div>
                <div className="campo">
                  <label>Razón Social:</label>
                  <input type="text" value={perfil.clirazonc} disabled />
                </div>
                <div className="campo">
                  <label>Nombre Corto:</label>
                  <input type="text" value={perfil.clinomcoc} disabled />
                </div>
                <div className="campo">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={
                      perfil.clitelnuc && perfil.clitelnuc.trim() !== ''
                        ? perfil.clitelnuc
                        : 'NO TIENE NUMERO REGISTRADO'
                    }
                    disabled
                  />
                </div>
                <div className="campo">
                  <label>RFC:</label>
                  <input type="text" value={perfil.clicvrfcc ? perfil.clicvrfcc : 'NO TIENE RFC REGISTRADO'} disabled />
                </div>
                <div className="campo">
                  <label>Clave de Uso:</label>
                  <input type="text" value={perfil.usccvuscc} disabled />
                </div>
                <div className="campo">
                  <label>Metodo de pago:</label>
                  <input type="text" value={perfil.mepcvmepc} disabled />
                </div>
                <div className="campo">
                  <label>Código Postal:</label>
                  <input type="text" value={perfil.clicodpon} disabled />
                </div>
                <div className="campo">
                  <label>Limite de Credito:</label>
                  <input
                    type="text"
                    value={
                      perfil.clilimcrn
                        ? `$ ${perfil.clilimcrn.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        : 'Saldo no disponible'
                    }
                    disabled
                  />
                </div>
                <div className="campo">
                  <label>Saldo actual:</label>
                  <input
                    type="text"
                    value={
                      perfil.clisaldon
                        ? `$ ${perfil.clisaldon.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        : 'Saldo no disponible'
                    }
                    disabled
                  />
                </div>
                <div className="acciones-perfil">
                  <Link to={`/facturas`} className="btn btn-azul">
                    <i className="fa-solid fa-dollar-sign"></i>
                    Ver Facturas Pendientes de Pago
                  </Link>
                  {/*<Link to={`/cambiarContra`} className="btn btn-azul">
                                        <i className="fas fa-pen-alt"></i>
                                        Recuperar contraseña
                                    </Link>*/}
                </div>
              </form>
            </Fragment>
          )}
        </div>
      ) : (
        <p>No se encontró información del perfil.</p>
      )}
    </Fragment>
  );
}

export default Perfil;
