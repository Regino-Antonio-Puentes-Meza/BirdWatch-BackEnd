import request from 'supertest';
import express from 'express';
import userRouter from '../src/routes/userRoutes'; // Asegúrate de que la ruta sea correcta

const app = express();

// Middleware para manejar el cuerpo de las solicitudes
app.use(express.json());
app.use('/api/users', userRouter); // Usa el router en tu aplicación

describe('User Routes', () => {
    // Aquí puedes crear algunos usuarios para usar en las pruebas si es necesario
    let userId;

    // Prueba para obtener un usuario
    it('should get a user by id', async () => {
        const res = await request(app).get('/api/users/1'); // Cambia '1' por un ID válido
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', 1); // Asegúrate de que el cuerpo de respuesta tenga el formato esperado
    });

    // Prueba para actualizar un usuario
    it('should update a user by id', async () => {
        const updatedUserData = {
            name: 'Updated User', // Cambia estos campos según tu modelo
            email: 'updated@example.com',
        };
        const res = await request(app).put('/api/users/1').send(updatedUserData); // Cambia '1' por un ID válido
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated User'); // Verifica la respuesta
    });

    // Prueba para eliminar un usuario
    it('should delete a user by id', async () => {
        const res = await request(app).delete('/api/users/1'); // Cambia '1' por un ID válido
        expect(res.statusCode).toEqual(204); // Se espera un 204 No Content
    });

    // Prueba para seguir a un usuario
    it('should follow a user', async () => {
        const res = await request(app).put('/api/users/1/follow'); // Cambia '1' por un ID válido
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'You are now following the user.');
    });

    // Prueba para dejar de seguir a un usuario
    it('should unfollow a user', async () => {
        const res = await request(app).put('/api/users/1/unfollow'); // Cambia '1' por un ID válido
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'You are no longer following the user.');
    });
});
