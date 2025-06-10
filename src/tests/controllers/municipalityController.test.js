import { getMunicipalitiesByDepartment, createMultipleMunicipalities } from '../../controllers/location/municipalityController.js';
import Municipality from '../../models/location/Municipality.js';
import Department from '../../models/location/Department.js';
import dbConnect from '../../config/dbConnect.js';
import messages from '../../utils/messages.js';

jest.mock('../../models/location/Municipality.js');
jest.mock('../../models/location/Department.js');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('municipalityController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks(); 
        dbConnect.mockResolvedValue();  
        req = {
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });


    describe('getMunicipalitiesByDepartment', () => {
        it('debe retornar municipios si el departamentoId es válido', async () => {
            req.params.departmentId = '5';
            const mockMunicipalities = [{ name: 'Municipio 1' }, { name: 'Municipio 2' }];
            Municipality.find.mockResolvedValue(mockMunicipalities);

            await getMunicipalitiesByDepartment(req, res);

            expect(res.json).toHaveBeenCalledWith(mockMunicipalities);
        });

        it('debe retornar 400 si el departmentId no es un número', async () => {
            req.params.departmentId = 'abc';

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: messages.LOCATION.MUNICIPALITY.INVALID_MUNICIPALITY_ID
            });
        });

        it('debe retornar error si falla la consulta', async () => {
            req.params.departmentId = '1';
            Municipality.find.mockRejectedValue(new Error('DB error'));

            await getMunicipalitiesByDepartment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: messages.LOCATION.MUNICIPALITY.GET_MUNICIPALITIES_ERROR
            });
        });
    });

    describe('createMultipleMunicipalities', () => {
        it('debe crear municipios si no existen y el departamento existe', async () => {
            req.body.municipalities = ['Floridablanca', 'Girón', 'Bucaramanga'];

            Department.findOne.mockResolvedValue({ departmentId: null });

            Municipality.findOne.mockResolvedValue(null);
            Municipality.mockImplementation(({ name }) => ({
                name,
                department: null,
                save: jest.fn().mockResolvedValue({ name, department: null })
            }));

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: messages.LOCATION.MUNICIPALITY.MUNICIPALITIES_CREATED_SUCCESS,
                municipalities: expect.arrayContaining([
                    expect.objectContaining({ name: 'Floridablanca' }),
                    expect.objectContaining({ name: 'Girón' })
                ])
            });
        });

        it('debe retornar 404 si el departamento no existe', async () => {
            req.body.municipalities = ['Cali'];
            Department.findOne.mockResolvedValue(null);

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: messages.LOCATION.DEPARTMENT.DEPARTMENT_NOT_FOUND
            });
        });

        it('debe retornar 500 si ocurre un error inesperado', async () => {
            req.body.municipalities = ['Cali'];
            Department.findOne.mockResolvedValue({ departmentId: null });
            Municipality.findOne.mockRejectedValue(new Error('DB error'));

            await createMultipleMunicipalities(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'DB error'
            });
        });
    });
});