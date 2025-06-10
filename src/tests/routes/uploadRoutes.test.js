import request from 'supertest';
import express from 'express';
import uploadRoutes from '../../routes/uploadRoutes.js';
import messages from '../../utils/messages.js';

// Crea una app de prueba solo con esta ruta
const app = express();
app.use(express.json());
app.use('/api/upload', uploadRoutes);

// Mock del middleware uploadToAzure
jest.mock('../../middlewares/upload.js', () =>
  (req, res, next) => {
    // simula que ya se subió el archivo a Azure
    req.file = { url: 'https://fake.blob.core.windows.net/container/image.jpg' };
    next();
  }
);

describe('POST /api/upload/upFile', () => {
  it('debe retornar 200 si imageUrl está presente en el body', async () => {
    const response = await request(app)
      .post('/api/upload/upFile')
      .send({ imageUrl: 'https://fake.blob.core.windows.net/container/image.jpg' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: messages.UPLOAD.IMAGE_UPLOAD,
      url: 'https://fake.blob.core.windows.net/container/image.jpg'
    });
  });

  it('debe retornar 400 si no se incluye imageUrl', async () => {
    const response = await request(app)
      .post('/api/upload/upFile')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: messages.UPLOAD.IMAGE_URL_NOT_FOUND
    });
  });
});
