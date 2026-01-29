import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { CRMContext } from '../context/CRMContext';

const NavAdmin = () => {
  const [auth, guardarAuth] = useContext(CRMContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const idrol_user = String(auth?.rol ?? ''); // <- usa el mismo campo del segundo

  const tituloRol = useMemo(() => {
    if (idrol_user === '1') return '';
    if (idrol_user === '2') return '';
    return '';
  }, [idrol_user]);

  const cerrarSesion = () => {
    guardarAuth({
      auth: false,
      token: '',
      rol: ''
    });

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    setOpen(false);
    history.push('/');
  };

  // Helper para clase active (opcional)
  const isActive = path => (location.pathname === path ? ' is-active' : '');

  if (!auth?.auth) return null;

  return (
    <>
      {/* Topbar */}
      <header className="navadm-topbar">
        <button className="navadm-burger" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </button>

        <div className="navadm-top-title">
          <span className="navadm-role">{tituloRol}</span>
        </div>
      </header>

      {/* Overlay */}
      <div className={`navadm-overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <aside className={`navadm-drawer ${open ? 'is-open' : ''}`}>
        <div className="navadm-drawer-head">
          <div className="navadm-drawer-title">{tituloRol}</div>
          <button className="navadm-close" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <nav className="navadm-links">
          {/* =====================
              MENU POR ROL
          ===================== */}

          {idrol_user === '1' ? (
            <>
              <Link to="/organizaciones" className={`navadm-link${isActive('/organizaciones')}`}>
                Organizaciones
              </Link>
              <Link to="/usuarios" className={`navadm-link${isActive('/usuarios')}`}>
                Usuarios
              </Link>
            </>
          ) : idrol_user === '2' ? (
            <>
              <Link to="/dashboard" className={`navadm-link${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/asesores" className={`navadm-link${isActive('/asesores')}`}>
                Asesores
              </Link>
              <Link to="/clientes" className={`navadm-link${isActive('/clientes')}`}>
                Clientes
              </Link>
              <Link to="/Afores" className={`navadm-link${isActive('/afores')}`}>
                Afores
              </Link>
              <Link to="/procesos" className={`navadm-link${isActive('/procesos')}`}>
                Procesos
              </Link>
            </>
          ) : (
            <>
              <Link to="/Client_ar" className={`navadm-link${isActive('/Client_ar')}`}>
                Catálogo
              </Link>
              <Link to="/perfil" className={`navadm-link${isActive('/perfil')}`}>
                Perfil
              </Link>
              <Link to="/misPedidos" className={`navadm-link${isActive('/misPedidos')}`}>
                Pedidos
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="navadm-logout">
          <button className="navadm-logout-btn" onClick={cerrarSesion}>
            <i className="far fa-times-circle" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavAdmin;
