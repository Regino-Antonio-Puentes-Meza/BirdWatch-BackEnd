import { getDepartments, createDepartment } from '../src/controllers/location/departmentController';
import dbConnect from '../src/config/dbConnect';
import Department from '../src/models/location/Department';

jest.mock('../src/config/dbConnect');
jest.mock('../src/models/location/Department');

describe('Department Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
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

    describe('getDepartments', () => {
        it('should return 200 and list of departments', async () => {
            const mockDepartments = [
                { departmentId: '1', name: 'HR' },
                { departmentId: '2', name: 'IT' },
            ];

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Department.find.mockResolvedValue(mockDepartments); // Simula que se obtuvieron los departamentos

            await getDepartments(req, res);

            expect(dbConnect).toHaveBeenCalled(); // Verifica que se intentó conectar a la base de datos
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDepartments);
        });

        it('should return 500 if there is a database error', async () => {
            const errorMessage = 'Error al conectar a la base de datos';
            dbConnect.mockRejectedValue(new Error(errorMessage)); // Simula un error de conexión

            await getDepartments(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener los departamentos", error: expect.any(Error) });
        });
    });

    describe('createDepartment', () => {
        it('should create a department successfully', async () => {
            const newDepartment = { departmentId: '3', name: 'Finance' };
            req.body = newDepartment;

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Department.findOne.mockResolvedValue(null); // Simula que no existe el departamento

            const savedDepartment = { ...newDepartment, _id: '1234567890abcdef' };
            Department.prototype.save = jest.fn().mockResolvedValue(savedDepartment); // Simula que el departamento se guarda correctamente

            await createDepartment(req, res);

            expect(dbConnect).toHaveBeenCalled(); // Verifica que se intentó conectar a la base de datos
            expect(Department.findOne).toHaveBeenCalledWith({ $or: [{ departmentId: newDepartment.departmentId }, { name: newDepartment.name }] });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Departamento creado exitosamente',
                department: savedDepartment,
            });
        });

        it('should return 400 if the department already exists', async () => {
            const existingDepartment = { departmentId: '1', name: 'HR' };
            req.body = existingDepartment;

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Department.findOne.mockResolvedValue(existingDepartment); // Simula que ya existe el departamento

            await createDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'El departamento ya está registrado' });
        });

        it('should return 500 if there is a server error', async () => {
            req.body = { departmentId: '3', name: 'Finance' };

            dbConnect.mockResolvedValue(); // Simula que la conexión se realizó correctamente
            Department.findOne.mockResolvedValue(null); // Simula que no existe el departamento

            // Simula un error al guardar el departamento
            Department.prototype.save.mockRejectedValue(new Error('Error al guardar el departamento'));

            await createDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error al guardar el departamento' });
        });

        it('should return 500 if there is a database connection error', async () => {
            const errorMessage = 'Error al conectar a la base de datos';
            dbConnect.mockRejectedValue(new Error(errorMessage)); // Simula un error de conexión

            await createDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error al conectar a la base de datos' });
        });
    });
});