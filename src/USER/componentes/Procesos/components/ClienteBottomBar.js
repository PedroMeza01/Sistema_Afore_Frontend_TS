// src/components/ClienteBottomBar.jsx
import './ClienteBottomBar.css';

export default function ClienteBottomBar({ cliente }) {
  if (!cliente) return null;

  const nombre = [cliente.nombre_cliente, cliente.apellido_pat_cliente, cliente.apellido_mat_cliente]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cliente-bottom-bar" role="status" aria-live="polite">
      <div className="cliente-bottom-content">
        <span className="cliente-bottom-label">Cliente:</span>
        <span className="cliente-bottom-name">{nombre}</span>

        {cliente.curp_cliente && <span className="cliente-bottom-meta">CURP: {cliente.curp_cliente}</span>}
      </div>
    </div>
  );
}
