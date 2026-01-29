import axios from 'axios';

const usuariosAxios = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
});

export default usuariosAxios;