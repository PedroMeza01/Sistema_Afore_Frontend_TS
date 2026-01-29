import React, { useState } from 'react';

const CRMContext = React.createContext([{}, () => {}]);

const CRMProvider = props => {
  //definir el state inicial

  const [auth, guardarToken] = useState({
    token: '',
    rol: '',
    auth: false
  });

  return <CRMContext.Provider value={[auth, guardarToken]}>{props.children}</CRMContext.Provider>;
};

export { CRMContext, CRMProvider };
