import dbConnect from '../config/dbConnect.js';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService.js'; // Importa el servicio de envío de correos
import messages from '@/utils/messages.js'; 

//Recuperar contraseña
export async function forgotPassword(req, res) {
    try {
        const { correoElectronico } = req.body;

        await dbConnect();

        const user = await User.findOne({ correoElectronico });
        if (!user) {
            return res.status(400).json({ error: messages.USER.USER_NOT_FOUND }); 
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
        const html = `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</<a href="${resetLink}">${resetLink}</a>`;

        // Llamar a la función `sendEmail` para enviar el correo
        await sendEmail(correoElectronico, subject, text, html);

        return res.status(200).json({ error: messages.PASSWORD_RESET.PASSWORD_RESET_LINK }); 
    } catch (error) {
        console.error(messages.PASSWORD_RESET.PASSWORD_RECOVERY_ERROR, error); 
        return res.status(500).json({ error: messages.PASSWORD_RESET.PASSWORD_RECOVERY_ERROR }); 
    }
}