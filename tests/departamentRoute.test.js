import express from 'express';
import request from 'supertest';
import router from '../src/routes/location/departmentRoutes'; 
import { createDepartment, getDepartments } from '../src/controllers/location/departmentController';

// Mockear los controladores
jest.mock('../src/controllers/location/departmentController', () => ({
    createDepartment: jest.fn((req, res) => res.status(201).json({ message: 'Department created' })),
    getDepartments: jest.fn((req, res) => res.status(200).json([{ id: 1, name: 'HR' }, { id: 2, name: 'Finance' }])),
}));

const app = express();
app.use(express.json());
app.use('/api/departments', router); // Usa el enrutador que has creado

describe('Department API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a department successfully', async () => {
        const response = await request(app)
            .post('/api/departments/')
            .send({ name: 'HR' });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Department created');
    });

    it('should get all departments', async () => {
        const response = await request(app).get('/api/departments/');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: 'HR' }, { id: 2, name: 'Finance' }]);
    });
});