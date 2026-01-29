import React, { Fragment, useState } from "react";
import Combobox from "./ComboboxTipo";
function NuevoUsuario() {
    const [selectedCode, setSelectedCode] = useState('');
    return (
        <Fragment>
            <h2 className="etiqueta">Nuevo Usuario</h2>
            {/*     ComboBox DE TIPO DE */}
            <Combobox selectedCode={selectedCode} setSelectedCode={setSelectedCode} />
           
        </Fragment>
    )
}

export default NuevoUsuario;
