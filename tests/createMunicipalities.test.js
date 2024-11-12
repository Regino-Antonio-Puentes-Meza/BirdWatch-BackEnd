// Ajusta la ruta si es necesario
import Municipality from '../src/models/location/Municipality'; 
import Department from '../src/models/location/Department';
import dbConnect from '../src/config/dbConnect'; 

jest.mock('../src/models/location/Municipality'); 
jest.mock('../src/models/location/Department'); 
jest.mock('../src/config/dbConnect'); 

describe('Municipality Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {
                departmentId: '',
            },
            body: {
                municipalities: [],
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMunicipalitiesByDepartment', () => {
        it('should return 400 if departmentId is not a number', async () => {
            req.params.departmentId = 'invalid_id';

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid department ID' });
        });

        it('should return 200 and municipalities if departmentId is valid', async () => {
            const mockMunicipalities = [
                { id: 1, name: 'Municipio1', department: 1 },
                { id: 2, name: 'Municipio2', department: 1 },
            ];
            req.params.departmentId = '1'; // Simula un departmentId válido

            Municipality.find.mockResolvedValue(mockMunicipalities); // Simula la respuesta del método find

            await getMunicipalitiesByDepartment(req, res);

            expect(res.json).toHaveBeenCalledWith(mockMunicipalities);
        });

        it('should return 500 if there is a database error', async () => {
            req.params.departmentId = '1'; // Simula un departmentId válido

            Municipality.find.mockRejectedValue(new Error('Database error')); // Simula un error en la consulta

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener los municipios', error: expect.any(Error) });
        });
    });

    describe('createMultipleMunicipalities', () => {
        it('should return 404 if the department does not exist', async () => {
            req.body.municipalities = ['Municipio1', 'Municipio2'];
            dbConnect.mockResolvedValue(); // Simula una conexión exitosa
            Department.findOne.mockResolvedValue(null); // Simula que el departamento no existe

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'El departamento no existe' });
        });

        it('should create municipalities and return 201', async () => {
            req.body.municipalities = ['Municipio1', 'Municipio2'];
            dbConnect.mockResolvedValue(); // Simula una conexión exitosa
            Department.findOne.mockResolvedValue({ departmentId: 1 }); // Simula que el departamento existe

            Municipality.findOne.mockResolvedValue(null); // Simula que los municipios no existen
            const saveMock = jest.fn().mockResolvedValue(); // Mock del método save
            Municipality.mockImplementation(() => ({ save: saveMock })); // Simula la creación de un nuevo municipio

            await createMultipleMunicipalities(req, res);

            expect(saveMock).toHaveBeenCalledTimes(2); // Deben haberse creado dos municipios
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Municipios creados exitosamente',
                municipalities: expect.any(Array), // Verifica que la respuesta contenga un array
            });
        });

        it('should exclude Bucaramanga and not create it', async () => {
            req.body.municipalities = ['Bucaramanga', 'Municipio2'];
            dbConnect.mockResolvedValue(); // Simula una conexión exitosa
            Department.findOne.mockResolvedValue({ departmentId: 1 }); // Simula que el departamento existe

            Municipality.findOne.mockResolvedValue(null); // Simula que los municipios no existen
            const saveMock = jest.fn().mockResolvedValue(); // Mock del método save
            Municipality.mockImplementation(() => ({ save: saveMock })); // Simula la creación de un nuevo municipio

            await createMultipleMunicipalities(req, res);

            expect(saveMock).toHaveBeenCalledTimes(1); // Solo se debe crear un municipio
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Municipios creados exitosamente',
                municipalities: expect.any(Array), // Verifica que la respuesta contenga un array
            });
        });

        it('should return 500 if there is a server error', async () => {
            req.body.municipalities = ['Municipio1', 'Municipio2'];
            dbConnect.mockResolvedValue(); // Simula una conexión exitosa
            Department.findOne.mockResolvedValue({ departmentId: 1 }); // Simula que el departamento existe
            Municipality.findOne.mockResolvedValue(null); // Simula que los municipios no existen

            const errorMessage = 'Error al guardar el municipio';
            Municipality.prototype.save.mockRejectedValue(new Error(errorMessage)); // Simula un error al guardar

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });
});
