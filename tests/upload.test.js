import express from 'express';
import request from 'supertest';
import uploadToAzure from '../src/middlewares/upload'; // Ajusta la ruta según sea necesario
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';

// Mock de Azure Blob Storage
jest.mock('@azure/storage-blob', () => {
    return {
        BlobServiceClient: {
            fromConnectionString: jest.fn().mockReturnValue({
                getContainerClient: jest.fn().mockReturnValue({
                    createIfNotExists: jest.fn(),
                    getBlockBlobClient: jest.fn().mockReturnValue({
                        uploadStream: jest.fn(),
                        url: 'https://fakeurl.com/blob'
                    })
                })
            })
        }
    };
});

const app = express();
app.use(express.json());
app.post('/upload', uploadToAzure, (req, res) => {
    res.status(200).json({ imageUrl: req.body.imageUrl });
});

// Simulación de un error específico de Azure
class AzureError extends Error {}

// Pruebas
describe('Upload to Azure Middleware', () => {
    it('should upload a file and return the blob URL', async () => {
        const response = await request(app)
            .post('/upload')
            .attach('imagen', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

        expect(response.status).toBe(200);
        expect(response.body.imageUrl).toBe('https://fakeurl.com/blob');
    });

    it('should return an error if no file is provided', async () => {
        const response = await request(app).post('/upload');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No se ha recibido ningún archivo');
    });

    it('should return an error if there is an upload error', async () => {
        // Simula un error en el middleware multer
        multer.memoryStorage = jest.fn().mockImplementation(() => ({
            single: jest.fn((fieldName) => (req, res, next) => {
                next(new Error('Multer error'));
            }),
        }));

        const response = await request(app)
            .post('/upload')
            .attach('imagen', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Error al subir el archivo');
    });

    it('should handle Azure errors correctly', async () => {
        // Simula un error de Azure durante la subida
        const blockBlobClientMock = {
            uploadStream: jest.fn().mockImplementation(() => {
                throw new AzureError('Simulated Azure error');
            }),
            url: 'https://fakeurl.com/blob'
        };

        const containerClientMock = {
            createIfNotExists: jest.fn(),
            getBlockBlobClient: jest.fn().mockReturnValue(blockBlobClientMock)
        };

        BlobServiceClient.fromConnectionString.mockReturnValueOnce({
            getContainerClient: jest.fn().mockReturnValue(containerClientMock)
        });

        const response = await request(app)
            .post('/upload')
            .attach('imagen', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Error de Azure');
    });

    it('should handle general errors correctly', async () => {
        // Simula un error general durante la subida
        const blockBlobClientMock = {
            uploadStream: jest.fn().mockImplementation(() => {
                throw new Error('Simulated general error');
            }),
            url: 'https://fakeurl.com/blob'
        };

        const containerClientMock = {
            createIfNotExists: jest.fn(),
            getBlockBlobClient: jest.fn().mockReturnValue(blockBlobClientMock)
        };

        BlobServiceClient.fromConnectionString.mockReturnValueOnce({
            getContainerClient: jest.fn().mockReturnValue(containerClientMock)
        });

        const response = await request(app)
            .post('/upload')
            .attach('imagen', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Error al subir la imagen');
    });
});