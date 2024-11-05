import express from 'express';
import request from 'supertest';
import birdRoutes from '../src/routes/birdsRoutes'; // Asegúrate de que la ruta sea correcta
import * as birdController from '../src/controllers/birdController';

// Mock de los métodos del controlador
jest.mock('../src/controllers/birdController');

const app = express();
app.use(express.json());
app.use('/birds', birdRoutes); // Usa el router que exportaste

describe('Bird Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
    });

    it('should create a new bird', async () => {
        const newBird = { name: 'Sparrow', species: 'Passeridae' };

        birdController.createBird.mockImplementation((req, res) => {
            res.status(201).json({ message: 'Bird created', bird: newBird });
        });

        const response = await request(app)
            .post('/birds/create')
            .send(newBird);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Bird created');
        expect(response.body.bird).toEqual(newBird);
    });

    it('should get all birds', async () => {
        const birds = [{ id: 1, name: 'Sparrow', species: 'Passeridae' }];

        birdController.getAllBirds.mockImplementation((req, res) => {
            res.status(200).json(birds);
        });

        const response = await request(app).get('/birds/');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(birds);
    });

    it('should get a bird by ID', async () => {
        const bird = { id: 1, name: 'Sparrow', species: 'Passeridae' };

        birdController.getBirdById.mockImplementation((req, res) => {
            res.status(200).json(bird);
        });

        const response = await request(app).get('/birds/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(bird);
    });

    it('should update a bird by ID', async () => {
        const updatedBird = { name: 'Updated Sparrow', species: 'Passeridae' };

        birdController.updateBird.mockImplementation((req, res) => {
            res.status(200).json({ message: 'Bird updated', bird: updatedBird });
        });

        const response = await request(app)
            .put('/birds/1')
            .send(updatedBird);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Bird updated');
        expect(response.body.bird).toEqual(updatedBird);
    });

    it('should delete a bird by ID', async () => {
        birdController.deleteBird.mockImplementation((req, res) => {
            res.status(204).send(); // No content
        });

        const response = await request(app).delete('/birds/1');

        expect(response.status).toBe(204);
    });
});
