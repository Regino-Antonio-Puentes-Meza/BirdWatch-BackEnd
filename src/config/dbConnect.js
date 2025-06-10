import mongoose from 'mongoose';
import dotenv from 'dotenv';
import messages from '@/utils/messages.js'; 
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {

  throw new Error(messages.DATABASE.MONGODB_URI_UNDEFINED);
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
      console.log(messages.DATABASE.DATABASE_CONNECTING); 
      return mongoose;
    }).catch((error) => {
      if (error.code === 'ETIMEOUT') {
        console.error(messages.DATABASE.CONNECTION_TIMEOUT_ERROR); 
        console.error(messages.DATABASE.CHECK_IP_PUBLIC_ATLAS); 
      } else {
        console.error(messages.DATABASE.DATABASE_CONNECTION_ERROR, error.message); 
      }
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;