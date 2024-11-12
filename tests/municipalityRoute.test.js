import express from 'express';
import request from 'supertest';
import router from '../src/routes/location/municipalityRoutes'; 
import { getMunicipalitiesByDepartment, createMultipleMunicipalities } from '../src/controllers/location/municipalityController';
// Mockear los controladores
jest.mock('../src/controllers/location/municipalityController.js', () => ({
    getMunicipalitiesByDepartment: jest.fn((req, res) => {
        const { departmentId } = req.params;
        if (departmentId === '1') {
            return res.status(200).json([{ id: 1, name: 'Municipality A' }, { id: 2, name: 'Municipality B' }]);
        }
        return res.status(404).json({ message: 'Department not found' });
    }),
    createMultipleMunicipalities: jest.fn((req, res) => res.status(201).json({ message: 'Municipalities created' })),
}));

const app = express();
app.use(express.json());
app.use('/api/municipalities', router); // Usa el enrutador que has creado

describe('Municipality API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get municipalities by department ID', async () => {
        const response = await request(app).get('/api/municipalities/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: 'Municipality A' }, { id: 2, name: 'Municipality B' }]);
    });

    it('should return 404 for a department not found', async () => {
        const response = await request(app).get('/api/municipalities/999');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Department not found');
    });

    it('should create multiple municipalities successfully', async () => {
        const response = await request(app)
            .post('/api/municipalities/multiple')
            .send([{ name: 'Municipality C' }, { name: 'Municipality D' }]);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Municipalities created');
    });
});