import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import messages from '@/utils/messages.js'; 

// Clave secreta para firmar el token (asegúrate de definir esta variable en tus variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

export async function login(req, res) {
    try {
        const { correoElectronico, contrasena } = req.body;

        // Convertir el correo electrónico a minúsculas
        const correoElectronicoLowerCase = correoElectronico.toLowerCase();

        const user = await User.findOne({ correoElectronico: correoElectronicoLowerCase });
        if (!user) {
            return res.status(400).json({ error: messages.AUTH.INVALID_CREDENTIALS });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ error: messages.AUTH.INVALID_CREDENTIALS }); 
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user._id, correoElectronico: user.correoElectronico },  // Incluye datos relevantes en el token
            JWT_SECRET,
            { expiresIn: '1h' }  // El token expira en 1 hora
        );

        // Devolver datos del usuario junto con el token
        return res.status(200).json({
            message: messages.AUTH.LOGIN_SUCCESS, 
            token,   // Devuelve el token al cliente
            user: {
                nombre: user.nombre,
                apellidos: user.apellidos,
                usuario: user.usuario,
                correoElectronico: user.correoElectronico
            }
        });
    } catch (error) {
        console.error(messages.AUTH.LOGIN_ERROR, error); 
        return res.status(500).json({ error: messages.SERVER.INTERNAL_SERVER_ERROR }); 
    }
}