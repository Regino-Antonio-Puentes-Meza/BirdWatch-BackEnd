import mongoose from 'mongoose';
import dbConnect from '../src/config/dbConnect'; // Ajusta la ruta según tu estructura de carpetas

jest.mock('mongoose'); // Mockear mongoose

describe('dbConnect', () => {

    const MONGODB_URI = process.env.MONGODB_URI;

    beforeAll(() => {
        process.env.MONGODB_URI = MONGODB_URI; // Configura la variable de entorno
    });

    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    });

    it('should connect to the database successfully', async () => {
        const mockConnection = { connection: { readyState: 1 } }; // Simulación de una conexión exitosa
        mongoose.connect.mockResolvedValue(mockConnection);

        const conn = await dbConnect();

        expect(mongoose.connect).toHaveBeenCalledWith(MONGODB_URI);
        expect(conn).toEqual(mockConnection); // Cambia toBe por toEqual para comparar objetos
    });

    it('should return cached connection if already connected', async () => {
        const mockConnection = { connection: { readyState: 1 } };
        global.mongoose = { conn: mockConnection, promise: null }; // Simular conexión existente

        const conn = await dbConnect();

        expect(conn).toEqual(mockConnection); // Verifica que se devuelva la conexión existente
        expect(mongoose.connect).not.toHaveBeenCalled(); // No debe llamar a connect
    });

    it('should throw an error if connection fails', async () => {
        const errorMessage = 'Error de conexión';
        mongoose.connect.mockRejectedValue(new Error(errorMessage));

        await expect(dbConnect()).rejects.toThrow(errorMessage);
        expect(mongoose.connect).toHaveBeenCalledWith(MONGODB_URI);
    });

    it('should handle connection timeout error', async () => {
        const error = { code: 'ETIMEOUT', message: 'Timeout error' };
        mongoose.connect.mockRejectedValue(error);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // Espiar console.error

        await expect(dbConnect()).rejects.toThrow(error);

        // Verificar que se haya llamado a mongoose.connect con el URI correcto
        expect(mongoose.connect).toHaveBeenCalledWith(MONGODB_URI);
        
        // Verificar que se haya registrado el mensaje de error correcto
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error de conexión: Tiempo de espera agotado.');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Por favor, verifique que su IP pública esté configurada en MongoDB Atlas para permitir la conexión a la base de datos.');

        consoleErrorSpy.mockRestore(); // Restaurar la implementación original de console.error
    });

    it('should log error message for other connection errors', async () => {
        const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
        mongoose.connect.mockRejectedValue(error);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // Espiar console.error

        await expect(dbConnect()).rejects.toThrow(error);

        // Verificar que se haya llamado a mongoose.connect con el URI correcto
        expect(mongoose.connect).toHaveBeenCalledWith(MONGODB_URI);
        
        // Verificar que se haya registrado el mensaje de error correcto
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error al conectar con la base de datos:', error.message);

        consoleErrorSpy.mockRestore(); // Restaurar la implementación original de console.error
    });
});