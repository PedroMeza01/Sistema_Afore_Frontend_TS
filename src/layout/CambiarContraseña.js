import React, { Fragment, useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import usuariosAxios from '../config/axios';
import { CRMContext } from '../context/CRMContext';

function CambiarContrasena({ history }) {
  const [auth] = useContext(CRMContext);
  const [usuario, guardarUsuario] = useState({
    user: '', // Se inicializa con un valor vacío
    password: '',
    confirmarPassword: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Obtener el usuario desde el backend
  const obtenerUsuario = async () => {
    try {
      const response = await usuariosAxios.get('/usuario/user', {
        params: { claveUsuario: auth.claveUsuario },
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      //  console.log(response)
      // Si la respuesta es exitosa, guardamos el usuario
      guardarUsuario(prevState => ({
        ...prevState,
        user: response.data.username || ''
      }));
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener el usuario',
        icon: 'error'
      });
    }
  };

  useEffect(() => {
    if (auth.token !== '') {
      obtenerUsuario();
    } else {
      history.push('/');
    }
  }, [auth.claveUsuario]);

  // Validar el formulario
  const validarFormulario = data => {
    const { user, password, confirmarPassword } = data;
    const isValid =
      user !== '' && password.trim() !== '' && confirmarPassword.trim() !== '' && password === confirmarPassword;
    setIsFormValid(isValid);
    setPasswordsMatch(password === confirmarPassword);
  };

  const cambiarContra = async e => {
    e.preventDefault();

    let cambiarContra = {
      usuarioweb: usuario.user,
      contrawebNueva: usuario.password
    };

    try {
      const response = await usuariosAxios.patch(`/auth/cambiarContrasena/${usuario.user}`, cambiarContra, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      Swal.fire({
        title: 'Se modificó la contraseña',
        text: response.data.mensaje,
        icon: 'success'
      });

      // Redirigir al usuario
      history.push('/perfil');
    } catch (error) {
      console.error('Error al cambiar la contraseña', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al cambiar la contraseña',
        icon: 'error'
      });
    }
  };

  // Leer los datos del formulario
  const actualizarState = e => {
    const { name, value } = e.target;
    guardarUsuario(prevState => {
      const updatedUser = { ...prevState, [name]: value };
      validarFormulario(updatedUser);
      return updatedUser;
    });
  };

  return (
    <Fragment>
      <h2 className="etiqueta">Modificar Contraseña</h2>
      <form onSubmit={cambiarContra}>
        <div className="campo">
          <label>Usuario:</label>
          <input
            type="text"
            name="user"
            value={usuario.user}
            disabled // Desactiva el input para que no se pueda editar
          />
        </div>

        <div className="campo">
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            placeholder="Contraseña"
            name="password"
            value={usuario.password}
            onChange={actualizarState}
          />
        </div>

        <div className="campo">
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            name="confirmarPassword"
            value={usuario.confirmarPassword}
            onChange={actualizarState}
          />
        </div>

        {!passwordsMatch && <div style={{ color: 'red' }}>Las contraseñas no coinciden.</div>}

        <div className="enviar">
          <input type="submit" className="btn btn-azul" value="Modificar Contraseña" disabled={!isFormValid} />
        </div>
      </form>
    </Fragment>
  );
}

export default CambiarContrasena;
