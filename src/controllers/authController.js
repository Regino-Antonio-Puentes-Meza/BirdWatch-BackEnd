import dbConnect from '../config/dbConnect.js';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema } from '../validation/registerSchema.js';
import { sendEmail } from '../utils/emailService.js'; // Importa el servicio de envío de correos

// Manejo de inicio de sesión
export async function login(req, res) {
    try {
        const { correoElectronico, contrasena } = req.body;

        try {
            await dbConnect();
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            return res.status(500).json({ error: 'Error al conectar a la base de datos' });
        }

        const user = await User.findOne({ correoElectronico });
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const datosUsuario = { usuario: { id: user.id } };

        // Generar el token JWT
        jwt.sign(
            datosUsuario,
            process.env.JWT_SECRET, // Se usa la clave secreta para firmar el token
            { expiresIn: '1h' }, // El token expira en 1 hora
            (err, token) => {
                if (err) throw err;
                return res.json({ token }); // Devolver el token como respuesta
            }
        );

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Manejo de registro
export async function register(req, res) {
    try {
        const body = req.body;

        // Validar datos con Yup
        await registerSchema.validate(body);
        const { nombre, apellidos, usuario, correoElectronico, contrasena } = body;

        await dbConnect();

        const userExists = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
        if (userExists) {
            let message = userExists.correoElectronico === correoElectronico
                ? 'El correo ya está registrado'
                : 'El usuario ya está registrado';
            return res.status(400).json({ message });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUser = new User({ nombre, apellidos, usuario, correoElectronico, contrasena: hashedPassword });
        await newUser.save();

        // Crear el payload para el token JWT
        const datosUsuario = { usuario: { id: newUser.id } };

        // Generar el token JWT después de registrar al usuario
        jwt.sign(
            datosUsuario,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                return res.status(201).json({ message: 'Usuario creado exitosamente', token });
            }
        );

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}

//Recuperar contraseña
export async function forgotPassword(req, res) {
    try {
        const { correoElectronico } = req.body;

        await dbConnect();

        const user = await User.findOne({ correoElectronico });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Generar el token de recuperación de contraseña válido por 15 minutos
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET, 
            { expiresIn: '15m' } // Token válido por 15 minutos
        );

        // Generar el enlace de restablecimiento de contraseña
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Texto y HTML del correo
        const subject = 'Recuperación de contraseña';
        const text = `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`;
        const html = `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                      <a href="${resetLink}">${resetLink}</a>`;

        // Llamar a la función `sendEmail` para enviar el correo
        await sendEmail(correoElectronico, subject, text, html);

        return res.status(200).json({ message: 'Se ha enviado un enlace de recuperación de contraseña a tu correo' });
    } catch (error) {
        console.error('Error en la recuperación de contraseña:', error);
        return res.status(500).json({ error: 'Error al intentar recuperar la contraseña' });
    }
}

// Restablecer la contraseña
export async function resetPassword(req, res) {
    try {
        const { token, nuevaContrasena } = req.body;

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña del usuario
        user.contrasena = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'El token ha expirado' });
        }
        return res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
}
