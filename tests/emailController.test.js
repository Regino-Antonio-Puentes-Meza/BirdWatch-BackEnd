import nodemailer from 'nodemailer';
import { sendEmail } from '../src/utils/emailService'; // Ajusta la ruta si es necesario

jest.mock('nodemailer'); // Mock de nodemailer

describe('Email Controller', () => {
    const mockTransporter = {
        sendMail: jest.fn(),
    };

    beforeEach(() => {
        nodemailer.createTransport.mockReturnValue(mockTransporter); // Simula el transportador
        jest.clearAllMocks(); // Limpia los mocks antes de cada test
    });

    it('should send an email successfully', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const text = 'Test text';
        const html = '<p>Test HTML</p>';

        await sendEmail(to, subject, text, html);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
    });

    it('should throw an error if sending fails', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const text = 'Test text';
        const html = '<p>Test HTML</p>';

        const errorMessage = 'Error sending email';
        mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage)); // Simula un error al enviar

        await expect(sendEmail(to, subject, text, html)).rejects.toThrow(errorMessage); // Verifica que se lance el error
    });

    it('should log an error if sending fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // Espía la consola para el logging

        const to = 'test@example.com';
        const subject = 'Test Subject';
        const text = 'Test text';
        const html = '<p>Test HTML</p>';

        const errorMessage = 'Error sending email';
        mockTransporter.sendMail.mockRejectedValue(new Error(errorMessage)); // Simula un error al enviar

        await expect(sendEmail(to, subject, text, html)).rejects.toThrow(errorMessage);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error al enviar correo:', expect.any(Error)); // Verifica que se haya registrado el error

        consoleErrorSpy.mockRestore(); // Restaura el comportamiento original de console.error
    });

    it('should handle missing email credentials', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const text = 'Test text';
        const html = '<p>Test HTML</p>';

        // Simula que las credenciales de email no están definidas
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        await expect(sendEmail(to, subject, text, html)).rejects.toThrow('Cannot read properties of undefined (reading \'USER\')');
    });
});