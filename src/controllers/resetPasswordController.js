import dbConnect from '../config/dbConnect.js';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
