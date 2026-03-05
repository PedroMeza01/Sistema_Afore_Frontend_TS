import React, { useState, useContext,useEffect } from 'react';
import Swal from 'sweetalert2';
import { withRouter, useHistory } from 'react-router-dom';
import usuariosAxios from '../config/axios';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa'; // Importa los íconos
import './login.css';

//context
import { CRMContext } from '../context/CRMContext';
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>

function Login() {

  const [auth, guardarAuth] = useContext(CRMContext);
  const [credenciales, guardarCredenciales] = useState({});
  const [verContraseña, setVerContraseña] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const history = useHistory(); // Hook para redirección

   useEffect(() => {
    if (auth?.auth && auth?.token) {
      const rol = String(auth.rol ?? '');
      if (rol === '1') history.replace('/organizaciones');
      else if (rol === '2') history.replace('/dashboard');
    }
  }, [auth, history]);

  // Inicia sesión en el servidor
  const iniciarSesion = async e => {
    e.preventDefault();
    try {
      // console.log(credenciales);
      const { data } = await usuariosAxios.post('/usuarios/iniciarSesion', credenciales);
      console.log('LOGIN RESPONSE:', data); // ← agrega esto temporal
      const { usuario, rol, mensaje } = data || {};
      //console.log(data);
      //console.log(rol);
      if (!usuario) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Si tu backend mete el JWT dentro de usuario.token, lo usamos; si no, seguimos sin token
      const token = usuario || null;
      // Guarda lo que sí tienes
      if (token) sessionStorage.setItem('token', token);
      if (rol) sessionStorage.setItem('rol', rol);

      guardarAuth({
        token: token || undefined,
        rol: rol,
        auth: true
      });

      Swal.fire('Login Correcto', mensaje || 'Has iniciado sesión', 'success');

      const rolStr = String(rol ?? '');

      if (rolStr === '1') {
        history.push('/organizaciones');
      } else if (rolStr === '2') {
        history.push('/dashboard');
      } else {
        history.push('/'); // fallback
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.mensaje || error.message || 'Error al iniciar sesión';
      Swal.fire({ icon: 'error', title: 'Hubo un error', text: msg });
    }
  }; 

  // Almacenar lo que el usuario escribe en el state
  const leerDatos = e => {
    guardarCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login">
      <div className="logos-formulario">
        {/* <img src={require('../img/logo.png')} alt="Logo" className="logo" /> */}
        <img src={require('../img/logo2.png')} alt="Logo" className="logo" />
        
        </div>
      <div className="contenedor-formulario">
        <h2>Inicio de sesión </h2>
        <form onSubmit={iniciarSesion}>
          <div className="campo">
            <label className="label-login">Usuario</label>
            <input
              type="text"
              name="username"
              placeholder="Ejemplo: juan.perez"
              onChange={leerDatos}
              style={{ textTransform: 'none' }} // Desactivar las mayúsculas
            />
            

          </div>          
          <div className="campo">
            <label className="label-login">Contraseña</label>
            <div className="input-contenedor">
              <input
                type={verContraseña ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                onChange={leerDatos}
              />

              <button type="button" onClick={() => setVerContraseña(!verContraseña)} className="ver-contrasena-btn">
                {verContraseña ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <input type="submit" value="Iniciar Sesión" className="btn-iniciarSesion" />
        </form>
      </div>
    </div>
  );
}

export default withRouter(Login);
