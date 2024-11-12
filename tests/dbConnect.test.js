import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dbConnect from '../src/config/dbConnect';

jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

dotenv.config();

describe('dbConnect', () => {
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;

    beforeAll(() => {
        console.error = jest.fn();
        console.log = jest.fn();
    });

    afterAll(() => {
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        global.mongoose = { conn: null, promise: null }; // Reinicia el caché antes de cada prueba
    });

    it('should throw an error if MONGODB_URI is not defined', async () => {
        delete process.env.MONGODB_URI; // Elimina la variable de entorno para esta prueba

        await expect(dbConnect()).rejects.toThrow('Por favor, define la variable MONGODB_URI');
    });

    it('should connect to the database and return the connection', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost/test'; // Define una URI válida
        mongoose.connect.mockResolvedValueOnce({}); // Simula una conexión exitosa

        const conn = await dbConnect();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
        expect(conn).toEqual({});
        expect(console.log).toHaveBeenCalledWith('Conectando a la base de datos');
    });

    it('should return cached connection if it exists', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost/test';
        const mockConnection = {};
        global.mongoose.conn = mockConnection; // Simula una conexión ya establecida

        const conn = await dbConnect();

        expect(conn).toBe(mockConnection);
        expect(mongoose.connect).not.toHaveBeenCalled(); // Asegúrate de que no se intente conectar nuevamente
    });

    it('should handle connection timeout error', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost/test';
        
        // Simula un error con código ETIMEOUT como instancia de Error
        const timeoutError = new Error('Connection timed out');
        timeoutError.code = 'ETIMEOUT'; // Agrega la propiedad code al error
        mongoose.connect.mockRejectedValueOnce(timeoutError); 

        await expect(dbConnect()).rejects.toThrow('Connection timed out'); // Asegúrate de que se lance un error

        expect(console.error).toHaveBeenCalledWith('Error de conexión: Tiempo de espera agotado.');
        expect(console.error).toHaveBeenCalledWith('Por favor, verifique que su IP pública esté configurada en MongoDB Atlas para permitir la conexión a la base de datos.');
    });

    it('should handle general connection errors', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost/test';
        
        // Simula un error genérico
        const errorMessage = 'Connection failed';
        mongoose.connect.mockRejectedValueOnce(new Error(errorMessage)); 

        await expect(dbConnect()).rejects.toThrow(errorMessage); // Verifica que se lance el error

        expect(console.error).toHaveBeenCalledWith('Error al conectar con la base de datos:', errorMessage);
    });
});