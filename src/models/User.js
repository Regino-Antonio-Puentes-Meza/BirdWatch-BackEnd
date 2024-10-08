import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    correoElectronico: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
