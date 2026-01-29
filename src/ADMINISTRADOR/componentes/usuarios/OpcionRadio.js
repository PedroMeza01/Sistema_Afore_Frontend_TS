import React from 'react';

const RadioButton = ({ selectedOption, handleOptionChange }) => {
    return (
        <div className='radios'>
            <label>
                <input
                    type="radio"
                    value="Agente"
                    checked={selectedOption === 'Agente'}
                    onChange={handleOptionChange}
                />
                Agente
            </label>

            <label>
                <input
                    type="radio"
                    value="Cliente"
                    checked={selectedOption === 'Cliente'}
                    onChange={handleOptionChange}
                />
                Cliente
            </label>

            <label>
                <input
                    type="radio"
                    value="Administrador"
                    checked={selectedOption === 'Administrador'}
                    onChange={handleOptionChange}
                />
                Administrador
            </label>
        </div>
    );
};

export default RadioButton;
