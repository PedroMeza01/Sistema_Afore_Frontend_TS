import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Usuario from './Usuario';
import BusquedaDinamica from './Busqueda';

// Importar axios configurado para usuarios
import usuariosAxios from '../../../config/axios';
//IMPORTAR EL CONTEXT
import { CRMContext } from '../../../context/CRMContext';

function Usuarios(props) {
  const [auth, guardarAunt] = useContext(CRMContext);
  const [usuarios, setUsuarios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarActivos, setMostrarActivos] = useState(true);
  const limit = 50;

  useEffect(() => {
    if (auth.token !== '') {
      const fetchUsuarios = async () => {
        setLoading(true);
        try {
          const response = await usuariosAxios.get(`/usuarios2`, {
            params: {
              page: currentPage,
              limit: limit,
              nombre: searchTerm,
              estado: mostrarActivos ? 'A' : 'D'
            },
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          });
          const usuariosDatos = Array.isArray(response.data.items) ? response.data.items : [];
          setUsuarios(usuariosDatos);
          setTotalPages(response.data.totalPages || 1);
        } catch (error) {
          console.error('Error fetching data: ', error);
        }
        setLoading(false);
      };

      // Realiza la búsqueda con un retraso de 2 segundos después de que el usuario deje de escribir
      const delayDebounceFn = setTimeout(() => {
        fetchUsuarios();
      }, 200);

      // Limpiar el temporizador si el usuario sigue escribiendo
      return () => clearTimeout(delayDebounceFn);
    } else {
      props.history.push('/');
    }
  }, [currentPage, searchTerm, mostrarActivos]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se realice una nueva búsqueda
  };

  const handleSwitchChange = e => {
    setMostrarActivos(e.target.checked);
    setCurrentPage(1); // Resetear a la primera página cuando se cambie el estado de los usuarios
  };

  return (
    <div>
      <h2>Usuarios</h2>
      <Link to={'/usuarios/nuevo'} className="btn btn-verde nvo-cliente inp">
        <i className="fas fa-plus-circle"></i>
        Nuevo Usuario
      </Link>
      <BusquedaDinamica
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        mostrarActivos={mostrarActivos}
        onSwitchChange={handleSwitchChange}
      />
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <ul>
            {usuarios.map(usuario => (
              <Usuario key={usuario.usuarioweb} usuario={usuario} />
            ))}
          </ul>
          <div className="paginas">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
