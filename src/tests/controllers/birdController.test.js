import { createBird, getAllBirds, getBirdById, updateBird, deleteBird } from '../../controllers/birdController.js';

import Bird from '../../models/Bird.js';
import messages from '../../utils/messages.js';

jest.mock('../../models/Bird.js');

describe('birdController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.clearAllMocks();
    });

    describe('createBird', () => {
        it('debe crear una nueva ave', async () => {
            req.body = {
                commonName: 'Gavilán',
                scientificName: 'Buteo platypterus',
                family: 'Accipitridae',
                imageUrl: 'url.jpg'
            };

            Bird.findOne.mockResolvedValue(null);
            Bird.prototype.save = jest.fn().mockResolvedValue({});

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.SPECIES_CREATED });
        });

        it('debe retornar 400 si el ave ya existe', async () => {
            req.body.scientificName = 'Buteo platypterus';
            Bird.findOne.mockResolvedValue({});

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.BIRD_REGISTERED });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            Bird.findOne.mockRejectedValue(new Error('DB error'));

            await createBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
        });
    });

    describe('getAllBirds', () => {
        it('debe retornar todas las aves', async () => {
            Bird.find.mockResolvedValue([{ commonName: 'Gavilán' }]);

            await getAllBirds(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ commonName: 'Gavilán' }]);
        });

        it('debe retornar error 500 si falla la consulta', async () => {
            Bird.find.mockRejectedValue(new Error('DB error'));

            await getAllBirds(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.GET_BIRDS_ERROR });
        });
    });

    describe('getBirdById', () => {
        it('debe retornar un ave por id', async () => {
            req.params.id = '1';
            Bird.findById.mockResolvedValue({ _id: '1', commonName: 'Gavilán' });

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ _id: '1', commonName: 'Gavilán' });
        });

        it('debe retornar 404 si no encuentra el ave', async () => {
            req.params.id = '1';
            Bird.findById.mockResolvedValue(null);

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.BIRD_NOT_FOUND });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '1';
            Bird.findById.mockRejectedValue(new Error('DB error'));

            await getBirdById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
        });
    });

    describe('updateBird', () => {
        it('debe actualizar un ave', async () => {
            req.params.id = '1';
            req.body = { commonName: 'Águila' };

            Bird.findByIdAndUpdate.mockResolvedValue({ _id: '1', commonName: 'Águila' });

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ _id: '1', commonName: 'Águila' });
        });

        it('debe retornar 404 si el ave no existe', async () => {
            req.params.id = '1';
            Bird.findByIdAndUpdate.mockResolvedValue(null);

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.BIRD_NOT_FOUND });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '1';
            Bird.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

            await updateBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
        });
    });

    describe('deleteBird', () => {
        it('debe eliminar un ave', async () => {
            req.params.id = '1';
            Bird.findByIdAndDelete.mockResolvedValue({ _id: '1' });

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.SPECIES_DELETED });
        });

        it('debe retornar 404 si el ave no existe', async () => {
            req.params.id = '1';
            Bird.findByIdAndDelete.mockResolvedValue(null);

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: messages.BIRD.BIRD_NOT_FOUND });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '1';
            Bird.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

            await deleteBird(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
        });
    });
});
