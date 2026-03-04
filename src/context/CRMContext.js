import React, { useState } from 'react';

const CRMContext = React.createContext([{}, () => {}]);

const CRMProvider = props => {
  const [auth, guardarToken] = useState(() => {
    // Al iniciar, lee lo que haya en localStorage
    try {
      const token = localStorage.getItem('token') || '';
      const rol = localStorage.getItem('rol') || '';
      return {
        token,
        rol,
        auth: !!token  // si hay token, auth = true
      };
    } catch {
      return { token: '', rol: '', auth: false };
    }
  });

  // Wrapper que guarda en localStorage además de en el estado
  const guardarAuth = (nuevoAuth) => {
    if (nuevoAuth.token) {
      localStorage.setItem('token', nuevoAuth.token);
      localStorage.setItem('rol', nuevoAuth.rol || '');
    } else {
      // Si llaman con token vacío (logout), limpia localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
    }
    guardarToken(nuevoAuth);
  };

  return (
    <CRMContext.Provider value={[auth, guardarAuth]}>
      {props.children}
    </CRMContext.Provider>
  );
};

export { CRMContext, CRMProvider };