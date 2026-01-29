import React, { useContext } from "react";
import { Link,useHistory } from "react-router-dom";
import usuarioAxios from '../../../config/axios';
import Swal from "sweetalert2";
//IMPORTAR EL CONTEXT 
import { CRMContext } from '../../../context/CRMContext';



function Usuario({ usuario }, props) {
    const history = useHistory();
    const [auth, guardarAunt] = useContext(CRMContext);
    const { usuarioweb, clvcli, clvage, clvadmin, statusadmin, clienteNombre, agenteNombre, adminNombre } = usuario;

    const activo = statusadmin === 'A'; // Suponiendo que statusadmin indica el estado del usuario

    // Cambiar estatus del usuario
    const cambiarStatusUsuario = async (usuarioWeb) => {
        try {
            // Realiza la solicitud PATCH
            const res = await usuarioAxios.patch(`/usuarios/activarDesactivar`, { usuarioweb: usuarioWeb }, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });
            if (res.status === 200) {
                // Mostrar el Swal
                await Swal.fire({
                    title: "Se guardó correctamente el usuario",
                    text: "El estado del usuario ha sido actualizado",
                    icon: "success"
                });
                // Redirigir a otra ruta después del éxito
                history.push('/perfil');
            }



            // Aquí podrías hacer algo más si es necesario, como actualizar el estado del componente
        } catch (error) {
            console.error('Error al cambiar el estado del usuario:', error);

            // Mostrar el Swal en caso de error
            await Swal.fire({
                title: "Error",
                text: "Hubo un problema al cambiar el estado del usuario.",
                icon: "error"
            });
            // Redirigir a otra ruta después del éxito
            history.push('/perfil');
        }
    };

    return (
        <li className="usuario">
            <div className="info-usuario">
                <p className="nombre"> Nombre: {clienteNombre} {agenteNombre} {adminNombre}</p>
                <p>Clave: {clvcli} {clvage} {clvadmin}</p>
                <p className="empresa">Usuario: {usuarioweb}</p>
                <p>Estatus: {statusadmin}</p>
            </div>
            <div className="acciones">
                <Link to={`/usuarios/recuperarcontra/${usuarioweb}`} className="btn btn-azul">
                    <i className="fas fa-pen-alt"></i>
                    Recuperar contraseña
                </Link>
                {activo ? (
                    <button type="button" className="btn btn-rojo btn-desactivar"
                        onClick={() => cambiarStatusUsuario(usuarioweb)}>
                        <i className="fas fa-times"></i>
                        Desactivar Usuario
                    </button>
                ) : (
                    <button type="button" className="btn btn-verde"
                        onClick={() => cambiarStatusUsuario(usuarioweb)}>
                        <i className="fas fa-check"></i>
                        Activar Usuario
                    </button>
                )}
            </div>
        </li>
    );
}

export default Usuario;
