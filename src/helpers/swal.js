import Swal from 'sweetalert2';

export const swalError = message => {
  Swal.fire({
    icon: 'error',
    title: 'Validación',
    text: message,
    confirmButtonText: 'Aceptar'
  });
};
