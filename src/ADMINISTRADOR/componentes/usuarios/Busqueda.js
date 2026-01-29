import React from "react";
import { FormControlLabel, Switch } from '@mui/material';

function BusquedaDinamica({ searchTerm, onSearchChange, mostrarActivos, onSwitchChange }) {
    return (
        <div>
            <input
                type="text"
                placeholder="Buscar Usuario"
                className="busqueda-D"
                value={searchTerm}
                onChange={onSearchChange}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={mostrarActivos}
                        onChange={onSwitchChange}
                        name="estadoUsuario"
                        color="primary"
                    />
                }
                label={mostrarActivos ? "Mostrar Activos" : "Mostrar Desactivados"}
            />
        </div>
    );
}

export default BusquedaDinamica;
