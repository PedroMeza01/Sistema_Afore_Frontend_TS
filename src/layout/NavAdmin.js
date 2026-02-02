import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { CRMContext } from '../context/CRMContext';

const NavAdmin = ({ collapsed, setCollapsed }) => {
  const [auth, guardarAuth] = useContext(CRMContext);
  const [open, setOpen] = useState(false); // mobile drawer
  const location = useLocation();
  const history = useHistory();

  /* =====================
     EFECTOS
  ===================== */

  // Cerrar drawer mobile al cambiar ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* =====================
     DATA
  ===================== */

  const idrol_user = String(auth?.rol ?? '');

  const tituloRol = useMemo(() => {
    if (idrol_user === '1') return 'Administrador';
    if (idrol_user === '2') return 'Operación';
    return 'Usuario';
  }, [idrol_user]);

  /* =====================
     ACTIONS
  ===================== */

  const cerrarSesion = () => {
    guardarAuth({
      auth: false,
      token: '',
      rol: ''
    });

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    history.push('/');
  };

  const isActive = path =>
    location.pathname === path ? ' is-active' : '';

  if (!auth?.auth) return null;

  /* =====================
     RENDER
  ===================== */

  return (
    <>
      {/* ===== TOPBAR (mobile) ===== */}
      <header className="navadm-topbar">
        <button
          className="navadm-burger"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>

        <span className="navadm-role">{tituloRol}</span>
      </header>

      {/* ===== OVERLAY (mobile) ===== */}
      <div
        className={`navadm-overlay ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`navadm-drawer ${open ? 'is-open' : ''}`}
      >
        {/* HEADER SIDEBAR */}
        <div className="navadm-drawer-head">
        

          {!collapsed && (
            <span className="navadm-drawer-title">
              {tituloRol}
            </span>
          )}

          {/* Cerrar solo en mobile */}
          <button
            className="navadm-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* LINKS */}
        <nav className="navadm-links">

          {idrol_user === '1' && (
            <>
              <Link to="/organizaciones" className={`navadm-link${isActive('/organizaciones')}`}>
                <span className="navadm-text">Organizaciones</span>
              </Link>
              <Link to="/usuarios" className={`navadm-link${isActive('/usuarios')}`}>
                <span className="navadm-text">Usuarios</span>
              </Link>
            </>
          )}

          {idrol_user === '2' && (
            <>
              <Link to="/dashboard" className={`navadm-link${isActive('/dashboard')}`}>
                <span className="navadm-text">Dashboard</span>
              </Link>
              <Link to="/asesores" className={`navadm-link${isActive('/asesores')}`}>
                <span className="navadm-text">Asesores</span>
              </Link>
              <Link to="/clientes" className={`navadm-link${isActive('/clientes')}`}>
                <span className="navadm-text">Clientes</span>
              </Link>
              <Link to="/afores" className={`navadm-link${isActive('/afores')}`}>
                <span className="navadm-text">Afores</span>
              </Link>
              {/* <Link to="/procesos" className={`navadm-link${isActive('/procesos')}`}>
                <span className="navadm-text">Procesos</span>
              </Link> */}
            </>
          )}

          {idrol_user !== '1' && idrol_user !== '2' && (
            <>
              <Link to="/Client_ar" className={`navadm-link${isActive('/Client_ar')}`}>
                <span className="navadm-text">Catálogo</span>
              </Link>
              <Link to="/perfil" className={`navadm-link${isActive('/perfil')}`}>
                <span className="navadm-text">Perfil</span>
              </Link>
              <Link to="/misPedidos" className={`navadm-link${isActive('/misPedidos')}`}>
                <span className="navadm-text">Pedidos</span>
              </Link>
            </>
          )}

        </nav>

        {/* LOGOUT */}
        <div className="navadm-logout">
          <button className="navadm-logout-btn" onClick={cerrarSesion}>
            <span className="navadm-text">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavAdmin;
