import { getMunicipalitiesByDepartment, createMultipleMunicipalities } from '../src/controllers/location/municipalityController';
import dbConnect from '../src/config/dbConnect';
import Municipality from '../src/models/location/Municipality';
import Department from '../src/models/location/Department';

jest.mock('../src/config/dbConnect');
jest.mock('../src/models/location/Municipality');
jest.mock('../src/models/location/Department');

describe('Municipality Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); // Limpiar mocks después de cada prueba
    });

    describe('getMunicipalitiesByDepartment', () => {
        it('should return 200 and a list of municipalities for a valid department ID', async () => {
            const mockMunicipalities = [
                { id: 1, name: 'Municipality A', department: 1 },
                { id: 2, name: 'Municipality B', department: 1 },
            ];

            req.params.departmentId = '1'; // Simular un ID de departamento válido
            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Municipality.find.mockResolvedValue(mockMunicipalities); // Simula que se obtuvieron los municipios

            await getMunicipalitiesByDepartment(req, res);

            expect(dbConnect).toHaveBeenCalled(); // Verifica que se intentó conectar a la base de datos
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMunicipalities);
        });

        it('should return 400 if the department ID is invalid', async () => {
            req.params.departmentId = 'invalid'; // Simular un ID no válido

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid department ID' });
        });

        it('should return 404 if no municipalities are found for the department ID', async () => {
            req.params.departmentId = '2'; // Simular un ID de departamento que no tiene municipios

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Municipality.find.mockResolvedValue([]); // Simula que no se encontraron municipios

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No municipalities found for this department' });
        });

        it('should return 500 if there is a database error', async () => {
            req.params.departmentId = '1'; // Simular un ID válido
            dbConnect.mockResolvedValue();
            Municipality.find.mockRejectedValue(new Error('Database error')); // Simula un error en la base de datos

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener los municipios', error: expect.any(Error) });
        });
    });

    describe('createMultipleMunicipalities', () => {
        it('should create multiple municipalities successfully', async () => {
            const newMunicipalities = ['Municipality C', 'Municipality D'];
            req.body.municipalities = newMunicipalities;
            req.body.departmentId = '1';

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Department.findOne.mockResolvedValue({ id: 1 }); // Simula que el departamento existe

            const savedMunicipality = { name: 'Municipality C', department: '1' };
            Municipality.prototype.save = jest.fn().mockResolvedValue(savedMunicipality); // Simula que el municipio se guarda correctamente

            await createMultipleMunicipalities(req, res);

            expect(dbConnect).toHaveBeenCalled(); // Verifica que se intentó conectar a la base de datos
            expect(Department.findOne).toHaveBeenCalledWith({ id: req.body.departmentId });
            expect(Municipality.prototype.save).toHaveBeenCalledTimes(newMunicipalities.length); // Verifica que se intentó guardar cada municipio
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Municipios creados exitosamente',
                municipalities: expect.any(Array),
            });
        });

        it('should return 404 if the department does not exist', async () => {
            req.body.municipalities = ['Municipality C'];
            req.body.departmentId = '999'; // Simular un ID de departamento no existente

            dbConnect.mockResolvedValue();
            Department.findOne.mockResolvedValue(null); // Simula que no existe el departamento

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'El departamento no existe' });
        });

        it('should return 500 if there is a server error during creation', async () => {
            req.body.municipalities = ['Municipality C'];
            req.body.departmentId = '1';

            dbConnect.mockResolvedValue();
            Department.findOne.mockResolvedValue({ id: 1 }); // Simula que el departamento existe

            Municipality.prototype.save.mockRejectedValue(new Error('Error al guardar el municipio')); // Simula un error al guardar

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error al guardar el municipio' });
        });
    });
});