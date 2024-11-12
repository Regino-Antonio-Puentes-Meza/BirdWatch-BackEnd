import express from 'express';
import request from 'supertest';
import uploadRoutes from '../src/routes/uploadRoutes'; 
import uploadToAzure from '../src/middlewares/upload';

// Mock del middleware de carga
jest.mock('../src/middlewares/upload');

const app = express();
app.use(express.json());
app.use('/upload', uploadRoutes); 

describe('Upload Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
    });

    it('should upload a file and return the image URL', async () => {
        const mockFileUrl = 'https://mock-url-to-azure.com/image.png';
        uploadToAzure.mockImplementation((req, res, next) => {
            req.body.imageUrl = mockFileUrl; 
        });

        const response = await request(app)
            .post('/upload/upFile')
            .attach('imagen', Buffer.from('file content'), 'test.png'); // Simular la carga de un archivo

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Imagen subida correctamente');
        expect(response.body.url).toBe(mockFileUrl);
    });

    it('should return an error if no image URL is obtained', async () => {
        uploadToAzure.mockImplementation((req, res, next) => {
            next(); // Llamar a next() sin establecer la URL de la imagen
        });

        const response = await request(app)
            .post('/upload/upFile')
            .attach('imagen', Buffer.from('file content'), 'test.png');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No se pudo obtener la URL de la imagen');
    });
});
