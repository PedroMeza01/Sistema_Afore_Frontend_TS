import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { CRMContext } from '../context/CRMContext';

import { AiOutlineLogout } from "react-icons/ai";
import { AiOutlineDashboard } from "react-icons/ai";
import { AiTwotoneBank } from "react-icons/ai";
import { AiOutlineContacts } from "react-icons/ai";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AiTwotoneCalculator } from "react-icons/ai";
import { AiOutlineContainer } from "react-icons/ai";
import logo from '../img/logo2.png';




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
    if (idrol_user === '2') return 'Módulos';
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

    localStorage.removeItem('token');
    localStorage.removeItem('rol');

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
      {/* TOPBAR */}
      <header className="navadm-topbar">
        {/* Izquierda: burger + usuario */}
        <div className="navadm-topbar-left">
          <button className="navadm-burger" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
          <div className="navadm-top-title">
            <span className="navadm-user-label">Operado por</span>
            <span className="navadm-user-name">{auth.username || tituloRol}</span>
          </div>
        </div>

        {/* Derecha: logo */}
        <img src={logo} alt="Logo" className="navadm-topbar-logo" />
      </header>

      <div className={`navadm-overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`navadm-drawer ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
        {/* ✅ HEADER DEL DRAWER con logo + org + usuario */}
        <div className="navadm-drawer-head">
          <div className="navadm-drawer-user">
            <div className="navadm-avatar">
              {(auth.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="navadm-user-block">
              <span className="navadm-user-small">{tituloRol}</span>
            </div>
          </div>
          <button className="navadm-close" onClick={() => setOpen(false)} aria-label="Cerrar menú">✕</button>
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
              <Link
                to="/dashboard"
                className={`navadm-link${isActive('/dashboard')}`}>

                <AiOutlineDashboard className="icon blue" />
                <span className="navadm-text">Dashboard</span>
              </Link>

              <Link to="/asesores" className={`navadm-link${isActive('/asesores')}`}>
                <AiOutlineContacts className="icon blue" />
                <span className="navadm-text">Asesores</span>
              </Link>

              <Link to="/clientes" className={`navadm-link ${isActive('/clientes')}`}>
                <AiOutlineUserAdd className="navadm-icon" />
                <span className="navadm-text">Clientes</span>
              </Link>

              <Link to="/procesos" className={`navadm-link ${isActive('/procesos')}`}>
                <AiOutlineContainer className="navadm-icon" />
                <span className="navadm-text">Procesos</span>
              </Link>

              <Link to="/afores" className={`navadm-link ${isActive('/afores')}`}>
                <AiTwotoneBank className="navadm-icon" />
                <span className="navadm-text">Afores</span>
              </Link>

              <Link to="/balance" className={`navadm-link ${isActive('/balance')}`}>
                <AiTwotoneCalculator className="navadm-icon" />
                <span className="navadm-text">Balance</span>
              </Link>
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
        <div className="navadm-logout-final">
          <button name=''
            className="navadm-logout-final-btn" onClick={cerrarSesion}>
            <AiOutlineLogout className="navadm-icon" />
            <span className="navadm-logout-final-text">Cerrar sesión</span>



          </button>
        </div>
      </aside>
    </>
  );
};

export default NavAdmin;
