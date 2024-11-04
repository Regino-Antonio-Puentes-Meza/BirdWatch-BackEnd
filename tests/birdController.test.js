import { createBird, getAllBirds, getBirdById, updateBird, deleteBird } from '../src/controllers/birdController';
import Bird from '../src/models/Bird.js';
import dbConnect from '../src/config/dbConnect.js';

jest.mock('../src/models/Bird.js');
jest.mock('../src/config/dbConnect.js');

describe('Bird Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBird', () => {
        it('should return 500 if there is a database connection error', async () => {
            dbConnect.mockRejectedValue(new Error('Connection error'));

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error al conectar a la base de datos' });
        });

        it('should return 400 if the bird already exists', async () => {
            dbConnect.mockResolvedValue();
            req.body = {
                commonName: 'Sparrow',
                scientificName: 'Passer domesticus',
                family: 'Passeridae',
                imageUrl: 'http://example.com/sparrow.jpg',
            };
            Bird.findOne.mockResolvedValue({}); // Simula que el ave ya existe

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'El ave ya está registrada' });
        });

        it('should create a bird and return 201', async () => {
            dbConnect.mockResolvedValue();
            req.body = {
                commonName: 'Sparrow',
                scientificName: 'Passer domesticus',
                family: 'Passeridae',
                imageUrl: 'http://example.com/sparrow.jpg',
            };
            Bird.findOne.mockResolvedValue(null); // Simula que el ave no existe
            Bird.prototype.save = jest.fn().mockResolvedValue(); // Simula que se guarda correctamente

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Especie de ave creada exitosamente' });
        });
    });

    describe('getAllBirds', () => {
        it('should return all birds and status 200', async () => {
            const mockBirds = [{ commonName: 'Sparrow' }, { commonName: 'Robin' }];
            Bird.find.mockResolvedValue(mockBirds); // Simula que se obtienen las aves

            await getAllBirds(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBirds);
        });

        it('should return 500 on error', async () => {
            Bird.find.mockRejectedValue(new Error('Database error')); // Simula un error

            await getAllBirds(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener aves', error: 'Database error' });
        });
    });

    describe('getBirdById', () => {
        it('should return 404 if the bird is not found', async () => {
            req.params.id = 'nonexistentId';
            Bird.findById.mockResolvedValue(null); // Simula que no se encuentra el ave

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ave no encontrada' });
        });

        it('should return the bird if found', async () => {
            req.params.id = 'existingId';
            const mockBird = { commonName: 'Sparrow' };
            Bird.findById.mockResolvedValue(mockBird); // Simula que se encuentra el ave

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBird);
        });

        it('should return 500 on error', async () => {
            req.params.id = 'someId';
            Bird.findById.mockRejectedValue(new Error('Database error')); // Simula un error

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('updateBird', () => {
        it('should return 404 if the bird is not found', async () => {
            req.params.id = 'nonexistentId';
            req.body = { commonName: 'Sparrow' };
            Bird.findByIdAndUpdate.mockResolvedValue(null); // Simula que no se encuentra el ave

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ave no encontrada' });
        });

        it('should update the bird and return the updated bird', async () => {
            req.params.id = 'existingId';
            req.body = { commonName: 'Sparrow' };
            const mockUpdatedBird = { commonName: 'Sparrow', family: 'Passeridae' };
            Bird.findByIdAndUpdate.mockResolvedValue(mockUpdatedBird); // Simula que se actualiza correctamente

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedBird);
        });

        it('should return 500 on error', async () => {
            req.params.id = 'someId';
            req.body = { commonName: 'Sparrow' };
            Bird.findByIdAndUpdate.mockRejectedValue(new Error('Database error')); // Simula un error

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('deleteBird', () => {
        it('should return 404 if the bird is not found', async () => {
            req.params.id = 'nonexistentId';
            Bird.findByIdAndDelete.mockResolvedValue(null); // Simula que no se encuentra el ave

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ave no encontrada' });
        });

        it('should delete the bird and return a success message', async () => {
            req.params.id = 'existingId';
            Bird.findByIdAndDelete.mockResolvedValue({}); // Simula que se elimina correctamente

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Especie de ave eliminada exitosamente' });
        });

        it('should return 500 on error', async () => {
            req.params.id = 'someId';
            Bird.findByIdAndDelete.mockRejectedValue(new Error('Database error')); // Simula un error

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});
