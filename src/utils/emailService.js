import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text, html) => {
    try {
        // Configurar nodemailer con las credenciales de tu cuenta de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Nombre del servicio de correo a utilizar (Outlook, SMTP, etc.)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw error;
    }
};
