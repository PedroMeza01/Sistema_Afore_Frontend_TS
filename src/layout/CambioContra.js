import React, { Fragment, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useParams, withRouter } from "react-router-dom";
import usuariosAxios from "../config/axios";

function RecuperarContra({ history }) {
    // Obtener el parámetro de la URL
    const { usuarioweb } = useParams();

    // usuario - state, guardarUsuario = funcion para guardar el state
    const [usuario, guardarUsuario] = useState({
        user: usuarioweb, // Inicializa con el valor del parámetro de la URL
        password: '',
        confirmarPassword: ''
    });

    // Estado para habilitar/deshabilitar el botón de envío
    const [isFormValid, setIsFormValid] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true); // Estado para rastrear si las contraseñas coinciden

    // Sincronizar el estado con selectedCode cuando cambia
    useEffect(() => {
        guardarUsuario(prevState => ({
            ...prevState,
            user: usuarioweb // Actualiza el estado cuando cambie el parámetro de la URL
        }));
    }, [usuarioweb]);

    // Validar formulario
    const validarFormulario = (data) => {
        const { user, password, confirmarPassword } = data;
        const isValid = user !== '' &&
            password.trim() !== '' && confirmarPassword.trim() !== '' && password === confirmarPassword;
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
            const response = await usuariosAxios.patch(`/usuarios/cambiarContrasena/${usuario.user}`, cambiarContra);
            Swal.fire({
                title: "Se modificó la contraseña",
                text: response.data.mensaje,
                icon: "success"
            });

            // Redirigir al usuario
            history.push('/perfil');
        } catch (error) {
            console.error('Error al cambiar la contraseña', error);
            Swal.fire({
                title: "Error",
                text: "Hubo un error al cambiar la contraseña",
                icon: "error"
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
            <h2 className="etiqueta">Recuperar Contraseña</h2>
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

                {!passwordsMatch && (
                    <div style={{ color: 'red' }}>
                        Las contraseñas no coinciden.
                    </div>
                )}

                <div className="enviar">
                    <input
                        type="submit"
                        className="btn btn-azul"
                        value="Modificar Contraseña"
                        disabled={!isFormValid} // Habilitar/deshabilitar el botón según la validez del formulario
                    />
                </div>
            </form>
        </Fragment>
    );
}

export default withRouter(RecuperarContra);
