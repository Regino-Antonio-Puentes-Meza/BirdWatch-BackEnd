import { sendEmail } from '../../utils/emailService.js';
import messages from '../../utils/messages.js';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('sendEmail', () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('debe enviar un correo exitosamente', async () => {
    sendMailMock.mockResolvedValueOnce('ok');

    await expect(sendEmail(
      'destino@correo.com',
      'Asunto del correo',
      'Texto plano',
      '<p>HTML</p>'
    )).resolves.not.toThrow();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: 'destino@correo.com',
      subject: 'Asunto del correo',
      text: 'Texto plano',
      html: '<p>HTML</p>'
    });

    expect(console.log).toHaveBeenCalledWith('Correo enviado a destino@correo.com');
  });

  it('debe lanzar error si sendMail falla', async () => {
    const error = new Error('Falló el envío');
    sendMailMock.mockRejectedValueOnce(error);

    await expect(sendEmail(
      'destino@correo.com',
      'Asunto',
      'Texto',
      '<p>HTML</p>'
    )).rejects.toThrow('Falló el envío');

    expect(console.error).toHaveBeenCalledWith(messages.EMAIL_SERVICE.EMAIL_SEND_ERROR, error);
  });
});