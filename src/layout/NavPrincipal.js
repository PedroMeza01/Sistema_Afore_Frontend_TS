import React, { useContext, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import myImage from '../img/saher_icHori.png';
import { CRMContext } from '../context/CRMContext'; // Importar el contexto

const NavPrincipal = () => {
  const [auth] = useContext(CRMContext); // Obtener el estado de autenticación desde el contexto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();

    // Cierra el menú
    closeMobileMenu();

    // Si ya estamos en la página principal, hace scroll directamente
    if (location.pathname === '/') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra ruta, navega a la página principal primero y luego hace scroll
      history.push('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Espera un momento para asegurar que el componente esté cargado
    }
  };

  if (auth.auth) {
    return null;
  }

  return (
    <header>
      <div className="navbar">
        <div className="logo-container">
          <Link to="/">
            <img src={myImage} alt="Logo Saher" className="logo" />
          </Link>
        </div>

        {/* Menú de hamburguesa visible en móviles */}
        <button className="hamburger-menu" onClick={toggleMobileMenu}>
          <i className={`fa ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/quienesSomosS" className="nav-link">
            ¿Quiénes somos?
          </Link>

          <a
            href="#preguntas-frecuentes"
            onClick={e => handleScrollToSection(e, 'preguntas-frecuentes')}
            className="nav-link"
          >
            Preguntas Frecuentes
          </a>

          <Link to="/VerTodasOfertas" onClick={closeMobileMenu} className="nav-link red">
            Ofertas
          </Link>
          <Link to="/contacto" onClick={closeMobileMenu} className="nav-link">
            Contacto
          </Link>
          <div className="login-container">
            <i className="fas fa-sign-in"></i>
            <Link to="/" onClick={closeMobileMenu} className="login-button">
              Inicia sesión
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavPrincipal;
