import jwt from 'jsonwebtoken';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { registerSchema } from '../validation/registerSchema.js';

// Clave secreta para firmar el token
const JWT_SECRET = process.env.JWT_SECRET || 'tuClaveSecretaJWT';

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

        // Generar token JWT
        const token = jwt.sign(
            { id: newUser._id, correoElectronico: newUser.correoElectronico }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,  // Devuelve el token al cliente
            user: {
                nombre: newUser.nombre,
                apellidos: newUser.apellidos,
                usuario: newUser.usuario,
                correoElectronico: newUser.correoElectronico,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}
