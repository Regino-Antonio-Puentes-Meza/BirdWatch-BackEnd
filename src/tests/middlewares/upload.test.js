import uploadToAzure from '../../middlewares/upload.js';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import intoStream from 'into-stream';

jest.mock('multer');
jest.mock('into-stream', () => jest.fn(() => 'mock-stream'));

const mockUploadStream = jest.fn().mockResolvedValue({});
const mockBlockBlobClient = {
  uploadStream: mockUploadStream,
  url: 'https://mock.blob.core.windows.net/container/foto.jpg'
};

const mockContainerClient = {
  createIfNotExists: jest.fn().mockResolvedValue(),
  getBlockBlobClient: jest.fn(() => mockBlockBlobClient)
};

const mockBlobServiceClient = {
  getContainerClient: jest.fn(() => mockContainerClient)
};

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => mockBlobServiceClient)
  }
}));

describe('uploadToAzure', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      file: {
        buffer: Buffer.from('mockfile'),
        originalname: 'foto.jpg',
        mimetype: 'image/jpeg',
        size: 100
      },
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    // Simular multer().single()
    multer.mockReturnValue({
      single: jest.fn(() => (req, res, cb) => cb(null))
    });
  });

  it('debe subir una imagen correctamente y asignar la URL en req.body.imageUrl', async () => {
    await uploadToAzure(req, res, next);

    expect(mockBlobServiceClient.getContainerClient).toHaveBeenCalledWith('imagenes');
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalled();
    expect(mockBlockBlobClient.uploadStream).toHaveBeenCalled();
    expect(req.body.imageUrl).toBe('https://mock.blob.core.windows.net/container/foto.jpg');
    expect(next).toHaveBeenCalled();
  });

  it('debe retornar error si no se proporciona un archivo', async () => {
    req.file = null;

    await uploadToAzure(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No se ha recibido ningún archivo' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar error si multer lanza un error', async () => {
    // Simular error en multer
    multer.mockReturnValue({
      single: jest.fn(() => (req, res, cb) => cb(new Error('Multer failed')))
    });

    await uploadToAzure(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al subir el archivo' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar error si ocurre excepción genérica al subir a Azure', async () => {
    mockBlockBlobClient.uploadStream.mockImplementationOnce(() => {
      throw new Error('Azure Upload Error');
    });

    await uploadToAzure(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al subir la imagen' });
    expect(next).not.toHaveBeenCalled();
  });
});