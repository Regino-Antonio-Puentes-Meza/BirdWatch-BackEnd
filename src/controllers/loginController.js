import jwt from 'jsonwebtoken';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Clave secreta para firmar el token (asegúrate de definir esta variable en tus variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

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

        // Generar token JWT
        const token = jwt.sign(
            { id: user._id, correoElectronico: user.correoElectronico },  // Incluye datos relevantes en el token
            JWT_SECRET,
            { expiresIn: '1h' }  // El token expira en 1 hora
        );

        // Devolver datos del usuario junto con el token
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,  // Devuelve el token al cliente
            user: {
                nombre: user.nombre,
                apellidos: user.apellidos,
                usuario: user.usuario,
                correoElectronico: user.correoElectronico,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
