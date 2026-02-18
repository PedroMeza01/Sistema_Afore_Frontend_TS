import React, { Fragment, useContext } from 'react';

/*ROUTING */
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

/*LAYOUT  PRUEBAS DE CAMBIOS PARA VER SI FUNCIONA */

import NavegacionAdmin from './layout/NavAdmin';
/*Componentes */

import Login from './auth/Login';

import { CRMContext, CRMProvider } from './context/CRMContext';
import Organizaciones from './ADMINISTRADOR/componentes/Organizaciones/Organizaciones';

import Afores from './USER/componentes/Afores/Afores';
import Asesores from './USER/componentes/Asesor/Asesores';
import Usuarios from './ADMINISTRADOR/componentes/Usuarioss/Usuarios';
import Clientes from './USER/componentes/Clientes/Clientes';
import ProcesosCliente from './USER/componentes/Clientes/ProcesosCliente';

import DashboardProcesos from './USER/componentes/Dashboard/DashboardProcesos';

import ProcesosList from './USER/componentes/Dashboard/ProcesosList';
import ProcesoDetalle from './USER/componentes/Procesos/ProcesoDetalle';
import Datos_Del_Retiro from './USER/componentes/Procesos/Datos_Del_Retiro';
import Documentos from './USER/componentes/Procesos/Documentos';
function App() {
  //UTILIZAR CONTEXT
  const [auth, guardarAuth] = useContext(CRMContext);
  return (
    <Router>
      <Fragment>
        <CRMProvider value={[auth, guardarAuth]}>
          <div className="grid contenedor contenido-principal">
            <main className="caja-contenido col-9">
              <NavegacionAdmin />
              <Switch>
                <Route exact path="/" component={Login} />

                <Route exact path="/usuarios" component={Usuarios} />
                <Route exact path="/dashboard" component={DashboardProcesos} />
                <Route exact path="/organizaciones" component={Organizaciones} />

                <Route exact path="/clientes" component={Clientes} />
                <Route exact path="/afores" component={Afores} />
                <Route exact path="/asesores" component={Asesores} />

                <Route exact path="/proceso/cliente/:id_cliente" component={ProcesosCliente} />
                <Route exact path="/procesos" component={ProcesosList} />
                <Route exact path="/clientes/:id_cliente/procesos/nuevo" component={Datos_Del_Retiro} />
                <Route exact path="/clientes/:id_cliente/procesos/nuevo/paso2" component={Documentos} />
                <Route
                  exact
                  path="/clientes/:id_cliente/procesos/:id_proceso/editar/paso1"
                  component={Datos_Del_Retiro}
                />
                <Route exact path="/clientes/:id_cliente/procesos/:id_proceso/editar/paso2" component={Documentos} />
                <Route exact path="/clientes/:id_cliente/procesos/:id_proceso" component={ProcesoDetalle} />
              </Switch>
            </main>
          </div>
        </CRMProvider>
      </Fragment>
    </Router>
  );
}

export default App;
