import mongoose from 'mongoose';

// Definición del esquema para las especies de aves
const birdSchema = new mongoose.Schema({
    commonName: {
        type: String,
        required: true,  
        trim: true       
    },
    scientificName: {
        type: String,
        required: true,  
        trim: true
    },
    family: {
        type: String,
        required: true,  
        trim: true
    },
}, { timestamps: true });



const birdsModel = mongoose.models.Bird || mongoose.model('Bird', birdSchema);

export default birdsModel;