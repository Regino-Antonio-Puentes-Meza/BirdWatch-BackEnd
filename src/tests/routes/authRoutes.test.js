import request from 'supertest';
import app from '../../../app.js';

jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('Rutas de autenticación', () => {

  it('POST /login debe responder con error si faltan datos', async () => {
    const res = await request(app)
      .post('/login')
      .send({}); // Datos incompletos

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /register debe responder con error si faltan datos', async () => {
    const res = await request(app)
      .post('/register')
      .send({}); // Datos incompletos

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /forgot-password debe responder con error si falta el correo', async () => {
    const res = await request(app)
      .post('/forgot-password')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /reset-password debe responder con error si faltan datos', async () => {
    const res = await request(app)
      .post('/reset-password')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

});
