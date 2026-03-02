// src/components/ClienteBottomBar.jsx
import './ClienteBottomBar.css';

export default function ClienteBottomBar({ cliente }) {
  if (!cliente) return null;

  const nombre = [
    cliente.nombre_cliente,
    cliente.apellido_pat_cliente,
    cliente.apellido_mat_cliente
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cliente-context-bar">
      <div className="cliente-context-left">
        <div className="cliente-avatar">
          {nombre?.charAt(0)}
        </div>

        <div className="cliente-info">
          <div className="cliente-nombre">{nombre}</div>
          <div className="cliente-curp">
            CURP: <span>{cliente?.curp_cliente}</span>
          </div>
           <div className="cliente-asesor">
            Asesor: <span>{cliente?.asesor?.nombre_asesor}</span>
          </div>
        </div>
      </div>

      <div className="cliente-context-right">
        <div className="cliente-chip">Retiro en proceso</div>
      </div>
    </div>
  );
}