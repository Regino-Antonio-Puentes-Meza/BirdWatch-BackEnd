import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { registerSchema } from '../validation/registerSchema.js';

// Manejo de inicio de sesión
export async function login(req, res) {
    try {
        const { correoElectronico, contrasena } = req.body;

        try {
            await dbConnect();
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            return res.status(500).json({ error: 'Error al conectar a la base de datos' });
        }

        const user = await User.findOne({ correoElectronico });
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Devolver datos del usuario junto con el mensaje de éxito
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            nombre: user.nombre,  // Incluye el nombre del usuario
            apellidos: user.apellidos, // También puedes incluir otros campos
            usuario: user.usuario,
            correoElectronico: user.correoElectronico,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Manejo de registro
export async function register(req, res) {
    try {
        const body = req.body;

        // Validar datos
        await registerSchema.validate(body);
        const { nombre, apellidos, usuario, isOrnitologo, correoElectronico, contrasena } = body;

        await dbConnect();

        const userExists = await User.findOne({ $or: [{ correoElectronico }, { usuario }] });
        if (userExists) {
            let message = userExists.correoElectronico === correoElectronico
                ? 'El correo ya está registrado'
                : 'El usuario ya está registrado';
            return res.status(400).json({ message });
        }



        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUser = new User({ nombre, apellidos, usuario, isOrnitologo, correoElectronico, contrasena: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}