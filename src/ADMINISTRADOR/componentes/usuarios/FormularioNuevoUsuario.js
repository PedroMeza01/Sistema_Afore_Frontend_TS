import React, { Fragment, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";
import usuariosAxios from "../../../config/axios";


function FormularioNuevoUsuario({ selectedCode, selectedOption, history }) {
    // usuario - state, guardarUsuario = funcion para guardar el state
    const [usuario, guardarUsuario] = useState({
        codigo: selectedCode,
        user: '',
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
            codigo: selectedCode
        }));
    }, [selectedCode]);

    // Leer los datos del formulario
    const actualizarState = e => {
        const { name, value } = e.target;
        guardarUsuario(prevState => {
            const updatedUser = { ...prevState, [name]: value };
            validarFormulario(updatedUser); // Validar el formulario con los datos actualizados
            return updatedUser;
        });
    };

    // Validar formulario
    const validarFormulario = (data) => {
        const { codigo, user, password, confirmarPassword } = data;
        const isValid = codigo.trim() !== '' && user.trim() !== '' &&
            password.trim() !== '' && confirmarPassword.trim() !== '' && password === confirmarPassword;
        setIsFormValid(isValid);
        setPasswordsMatch(password === confirmarPassword);
    };

    //Ingresa a la restapi un usuario nuevo 
    const agregarUsuario = async e => {
        e.preventDefault();

        let nuevoUsuario = {
            usuarioweb: usuario.user,
            contraweb: usuario.password
        };

        if (selectedOption === 'Cliente') {
            nuevoUsuario.clvcli = selectedCode;
        } else if (selectedOption === 'Agente') {
            nuevoUsuario.clvage = selectedCode;
        } else if (selectedOption === 'Administrador') {
            nuevoUsuario.clvadmin = selectedCode;
        }

        try {
            const response = await usuariosAxios.post('/crear-cuenta', nuevoUsuario);
           // console.log('Usuario agregado exitosamente:', response.data);
            if (selectedOption === 'Cliente') {
                Swal.fire({
                    title: "Se agrego el nuevo usuario(Cliente)",
                    text: response.data.mesnsaje,
                    icon: "success"
                  });
            } else if (selectedOption === 'Agente') {
                Swal.fire({
                    title: "Se agrego el usuario(Agente)",
                    text: response.data.mesnsaje,
                    icon: "success"
                  });
            } else if (selectedOption === 'Administrador') {
                Swal.fire({
                    title: "Se agrego el usuario(Administrador)",
                    text: response.data.mesnsaje,
                    icon: "success"
                  });
            }    
           
        } catch (error) {
            console.error('Error al agregar el usuario', error);
        }
        //REDIRECCIIONAR 
        history.push('/perfil');
    };



    useEffect(() => {
        validarFormulario(usuario); // Validar el formulario al montar el componente
    }, []);

    return (
        <Fragment>
            <form
                onSubmit={agregarUsuario}
            >
                <div className="campo">
                    <label>Código:</label>
                    <input
                        type="text"
                        value={usuario.codigo}
                        placeholder="Código"
                        disabled
                        name="codigo"
                    />
                </div>
                <div className="campo">
                    <label>Usuario:</label>
                    <input
                        type="text"
                        placeholder="Usuario"
                        name="user"
                        value={usuario.user}
                        onChange={actualizarState}
                    />
                </div>

                <div className="campo">
                    <label>Contraseña:</label>
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
                        value="Agregar Usuario"
                        disabled={!isFormValid} // Habilitar/deshabilitar el botón según la validez del formulario
                    />
                </div>
            </form>
        </Fragment>
    );
}

export default withRouter(FormularioNuevoUsuario);
