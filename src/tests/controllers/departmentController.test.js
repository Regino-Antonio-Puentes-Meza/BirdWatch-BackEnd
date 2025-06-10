import { getDepartments, createDepartment } from '../../controllers/location/departmentController.js';
import Department from '../../models/location/Department.js';
import dbConnect from '../../config/dbConnect.js';
import messages from '../../utils/messages.js';

jest.mock('../../models/location/Department.js');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('departmentController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getDepartments', () => {
    it('debe devolver una lista de departamentos', async () => {
      const mockDepartments = [{ name: 'Antioquia' }];
      Department.find.mockResolvedValue(mockDepartments);

      await getDepartments(req, res);

      expect(dbConnect).toHaveBeenCalled();
      expect(Department.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });

    it('debe manejar errores al obtener departamentos', async () => {
      Department.find.mockRejectedValue(new Error('DB Error'));

      await getDepartments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: messages.LOCATION.DEPARTMENT.GET_DEPARTMENTS_ERROR });
    });
  });

  describe('createDepartment', () => {
    it('debe crear un nuevo departamento si no existe', async () => {
      req.body = { departmentId: '05', name: 'Antioquia' };
      Department.findOne.mockResolvedValue(null);
      Department.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ departmentId: '05', name: 'Antioquia' }),
      }));

      await createDepartment(req, res);

      expect(dbConnect).toHaveBeenCalled();
      expect(Department.findOne).toHaveBeenCalledWith({
        $or: [{ departmentId: '05' }, { name: 'Antioquia' }],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: messages.LOCATION.DEPARTMENT.DEPARTMENT_CREATED,
        department: expect.any(Object),
      });
    });

    it('debe rechazar si el departamento ya existe', async () => {
      req.body = { departmentId: '05', name: 'Antioquia' };
      Department.findOne.mockResolvedValue({ name: 'Antioquia' });

      await createDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: messages.LOCATION.DEPARTMENT.DEPARTMENT_ALREADY_REGISTERED,
      });
    });

    it('debe manejar error en conexión con la base de datos', async () => {
      dbConnect.mockRejectedValueOnce(new Error('Connection failed'));

      req.body = { departmentId: '05', name: 'Antioquia' };

      await createDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: messages.DATABASE.DATABASE_CONNECTION_ERROR,
      });
    });

    it('debe manejar errores internos en createDepartment', async () => {
      req.body = { departmentId: '05', name: 'Antioquia' };
      Department.findOne.mockRejectedValue(new Error('Unexpected error'));

      await createDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unexpected error',
      });
    });
  });
});