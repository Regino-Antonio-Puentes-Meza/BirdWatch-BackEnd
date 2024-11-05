import express from 'express';
import request from 'supertest';
import multer from 'multer';
import uploadToAzure from '../src/middlewares/upload'; // Ajusta la ruta según tu estructura
import { BlobServiceClient } from '@azure/storage-blob';
import intoStream from 'into-stream';

jest.mock('@azure/storage-blob'); // Simulamos la biblioteca de Azure

const app = express();
app.use(express.json());

// Configuración de multer para pruebas
const multerMock = multer.memoryStorage();
const upload = multer({ storage: multerMock });

app.post('/upload', upload.single('imagen'), uploadToAzure, (req, res) => {
    res.status(200).json({ imageUrl: req.body.imageUrl });
});

// Simulación de Azure Blob Storage
const mockUploadStream = jest.fn();
const mockGetBlockBlobClient = jest.fn(() => ({
    uploadStream: mockUploadStream,
    url: 'http://mock-url.com/blob',
}));

const mockCreateIfNotExists = jest.fn();
const mockGetContainerClient = jest.fn(() => ({
    createIfNotExists: mockCreateIfNotExists,
    getBlockBlobClient: mockGetBlockBlobClient,
}));

BlobServiceClient.fromConnectionString.mockReturnValue({
    getContainerClient: mockGetContainerClient,
});

describe('Upload to Azure Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
    });

    it('should upload a file to Azure and return the image URL', async () => {
        const fileBuffer = Buffer.from('mock image data'); // Simula un archivo
        const response = await request(app)
            .post('/upload')
            .attach('imagen', {
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                data: fileBuffer,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('imageUrl', 'http://mock-url.com/blob');
        expect(mockGetContainerClient).toHaveBeenCalled(); // Verifica que se haya llamado a obtener el cliente del contenedor
        expect(mockCreateIfNotExists).toHaveBeenCalled(); // Verifica que se haya creado el contenedor si no existe
        expect(mockGetBlockBlobClient).toHaveBeenCalledWith(expect.any(String)); // Verifica que se haya llamado a obtener el bloque del blob
        expect(mockUploadStream).toHaveBeenCalled(); // Verifica que se haya llamado a uploadStream
    });

    it('should return an error if no file is provided', async () => {
        const response = await request(app).post('/upload');

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'No se ha recibido ningún archivo');
    });

    it('should return an error if upload fails', async () => {
        mockUploadStream.mockRejectedValue(new Error('Upload failed'));

        const fileBuffer = Buffer.from('mock image data');
        const response = await request(app)
            .post('/upload')
            .attach('imagen', {
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                data: fileBuffer,
            });

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al subir la imagen');
    });

    it('should return an error if Azure creates the container fails', async () => {
        mockCreateIfNotExists.mockRejectedValue(new Error('Azure create container failed'));

        const fileBuffer = Buffer.from('mock image data');
        const response = await request(app)
            .post('/upload')
            .attach('imagen', {
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                data: fileBuffer,
            });

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al subir la imagen'); // Este mensaje podría ser ajustado según lo que manejes en el catch
    });
    
    it('should return an error if getting the block blob client fails', async () => {
        mockGetBlockBlobClient.mockImplementationOnce(() => {
            throw new Error('Get block blob client failed');
        });

        const fileBuffer = Buffer.from('mock image data');
        const response = await request(app)
            .post('/upload')
            .attach('imagen', {
                filename: 'test-image.jpg',
                contentType: 'image/jpeg',
                data: fileBuffer,
            });

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al subir la imagen'); // Este mensaje podría ser ajustado según lo que manejes en el catch
    });
});
