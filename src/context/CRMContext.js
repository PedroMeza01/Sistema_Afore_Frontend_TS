import React, { useState } from 'react';

const CRMContext = React.createContext([{}, () => {}]);

// Decodifica el JWT sin librería externa
function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return {};
  }
}

const CRMProvider = props => {
  const [auth, guardarToken] = useState(() => {
    try {
      const token = localStorage.getItem('token') || '';
      const rol   = localStorage.getItem('rol')   || '';
      if (!token) return { token: '', rol: '', auth: false, username: '', id_organizacion: '' };

      // Verificar expiración
      const payload = decodeJWT(token);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        return { token: '', rol: '', auth: false, username: '', id_organizacion: '' };
      }

      return {
        token,
        rol,
        auth:             true,
        username:         payload.username         || '',
        id_organizacion:  payload.id_organizacion  || ''
      };
    } catch {
      return { token: '', rol: '', auth: false, username: '', id_organizacion: '' };
    }
  });

  const guardarAuth = (nuevoAuth) => {
    if (nuevoAuth.token) {
      const payload = decodeJWT(nuevoAuth.token);
      localStorage.setItem('token', nuevoAuth.token);
      localStorage.setItem('rol',   String(nuevoAuth.rol || ''));

      guardarToken({
        ...nuevoAuth,
        username:        payload.username        || '',
        id_organizacion: payload.id_organizacion || ''
      });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      guardarToken({ token: '', rol: '', auth: false, username: '', id_organizacion: '' });
    }
  };

  return (
    <CRMContext.Provider value={[auth, guardarAuth]}>
      {props.children}
    </CRMContext.Provider>
  );
};

export { CRMContext, CRMProvider };