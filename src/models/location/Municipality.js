// models/Municipality.js
import mongoose from 'mongoose';

const MunicipalitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: Number, // Este debe coincidir con el tipo del departamento
        required: true
    }
}, { timestamps: false });

const Municipality = mongoose.model('Municipality', MunicipalitySchema);
export default Municipality;