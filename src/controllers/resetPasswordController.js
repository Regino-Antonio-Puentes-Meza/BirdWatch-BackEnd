import dbConnect from '../config/dbConnect.js';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import messages from '../utils/messages.js'; 

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
            return res.status(400).json({ error: messages.USER.USER_NOT_FOUND }); 
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña del usuario
        user.contrasena = hashedPassword;
        await user.save();

        return res.status(200).json({ error: messages.PASSWORD_RESET.PASSWORD_RESET }); 
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: messages.AUTH.TOKEN_EXPIRED }); 
        }
        return res.status(500).json({ error: messages.PASSWORD_RESET.PASSWORD_RESET_ERROR }); 
    }
}