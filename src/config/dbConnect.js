import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor, define la variable MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('Conectando a la base de datos');
      return mongoose;
    }).catch((error) => {
      if (error.code === 'ETIMEOUT') {
        console.error('Error de conexión: Tiempo de espera agotado.');
        console.error('Por favor, verifique que su IP pública esté configurada en MongoDB Atlas para permitir la conexión a la base de datos.');
      } else {
        console.error('Error al conectar con la base de datos:', error.message);
      }
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;