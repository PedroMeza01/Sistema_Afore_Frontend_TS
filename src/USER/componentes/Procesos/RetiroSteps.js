import { useHistory, useLocation, useParams } from 'react-router-dom';
import './RetiroSteps.css';

const STEPS = [
  {
    label: '1 Datos del Retiro',
    paso: 'paso1'
  },
  {
    label: '2 Documentos',
    paso: 'paso2'
  }
];

export default function RetiroSteps() {
  const history = useHistory();
  const location = useLocation();
  const { id_cliente, id_proceso } = useParams();

  const isNuevo = location.pathname.includes('/procesos/nuevo');

  const currentPaso = location.pathname.match(/\/(paso\d)(\/|$)/)?.[1];

  const buildUrl = paso => {
    if (isNuevo) {
      return `/clientes/${id_cliente}/procesos/nuevo/${paso}`;
    }

    return `/clientes/${id_cliente}/procesos/${id_proceso}/editar/${paso}`;
  };

  return (
    <div className="retiro-steps">
      {STEPS.map(step => (
        <button
          key={step.paso}
          type="button"
          className={`step ${currentPaso === step.paso ? 'active' : ''}`}
          onClick={() => history.push(buildUrl(step.paso))}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}
