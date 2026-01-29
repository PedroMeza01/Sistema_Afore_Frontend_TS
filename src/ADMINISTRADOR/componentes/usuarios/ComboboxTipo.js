import React, { useEffect, useState, Fragment, useContext } from 'react';
import RadioButton from './OpcionRadio';
import comboboxTipo from '../../../config/axios';
import FormularioNuevoUsuario from './FormularioNuevoUsuario';
import { useHistory } from 'react-router-dom'; // Importa useHistory
import { CRMContext } from '../../../context/CRMContext';

function ComboboxAgente({ selectedCode, setSelectedCode }) {
  const [auth, guardarAunt] = useContext(CRMContext);
  const [agentes, guardarAgentes] = useState([]);
  const [clientes, guardarClientes] = useState([]);
  const [administra, guardarAdministra] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [showComboBox, setShowComboBox] = useState(false);
  const history = useHistory(); // Hook para manejar navegación

  const consultarAPI = async () => {
    if (auth.token !== '') {
      try {
        const agentesConsulta = await comboboxTipo.get('/agentes/sinCuenta', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        guardarAgentes(agentesConsulta.data);

        const clientesConsulta = await comboboxTipo.get('/clientes/sinCuenta', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        guardarClientes(clientesConsulta.data);

        const administraConsulta = await comboboxTipo.get('/administradores/sinCuenta', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        guardarAdministra(administraConsulta.data);
      } catch (error) {
        console.error('Error al consultar la API', error);
      }
    } else {
      history.push('/'); // Redirige si no hay token
    }
  };

  useEffect(() => {
    consultarAPI();
  }, []);

  const handleRadioChange = e => {
    const valorSeleccionado = e.target.value;
    setSelectedOption(valorSeleccionado);

    if (valorSeleccionado === 'Cliente') {
      const opciones = clientes.map(cliente => ({
        value: cliente.clicdclic.trim(),
        label: cliente.clinomcoc.trim()
      }));
      setOptions(opciones);
    } else if (valorSeleccionado === 'Administrador') {
      const opciones = administra.map(admi => ({
        value: admi.cd_adminweb,
        label: admi.nom_adminweb
      }));
      setOptions(opciones);
    } else if (valorSeleccionado === 'Agente') {
      const opciones = agentes.map(agente => ({
        value: agente.agecdagen,
        label: agente.agedsagec.trim()
      }));
      setOptions(opciones);
    }

    setShowComboBox(true);
    setSelectedCode('');
  };

  const handleChange = e => {
    const valorSeleccionado = e.target.value;
    setSelectedCode(valorSeleccionado);
  };

  return (
    <Fragment>
      <div>
        <label className="campo">¿Qué rol va a tener?</label>
        <RadioButton selectedOption={selectedOption} handleOptionChange={handleRadioChange} />
        {showComboBox && (
          <select value={selectedCode} onChange={handleChange} className="center-select">
            <option value="" disabled>
              Selecciona una opción
            </option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <FormularioNuevoUsuario selectedCode={selectedCode} selectedOption={selectedOption} />
    </Fragment>
  );
}

export default ComboboxAgente;
