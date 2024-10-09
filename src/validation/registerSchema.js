import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
  nombre: Yup.string().required('Nombre es requerido'),
  apellidos: Yup.string().required('Apellidos son requeridos'),
  usuario: Yup.string().required('Usuario es requerido'),
  correoElectronico: Yup.string().email('Correo electrónico inválido').required('Correo electrónico es requerido'),
  contrasena: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
  repetirContrasena: Yup.string().oneOf([Yup.ref('contrasena'), null], 'Las contraseñas deben coincidir'),
});

export const loginSchema = Yup.object({
  correoElectronico: Yup.string().email('Correo electrónico inválido').required('El correo es obligatorio'),
  contrasena: Yup.string().required('La contraseña es obligatoria'),
});
