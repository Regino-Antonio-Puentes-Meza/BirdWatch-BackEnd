import dbConnect from '../config/dbConnect.js';
import Bird from "../models/Bird.js";
import messages from '@/utils/messages.js';

// Crear una nueva especie de ave
export const createBird = async (req, res) => {
  try {
    const { commonName, scientificName, family, imageUrl } = req.body;


    try {
      
    } catch (error) {
      console.error(messages.DATABASE_CONNECTION_ERROR, error);
      return res.status(500).json({ error: messages.DATABASE_CONNECTION_ERROR });
    }


    const birdExists = await Bird.findOne({ scientificName });
    if (birdExists) {
      return res.status(400).json({ error: messages.BIRD_REGISTERED });
    }


    const newBird = new Bird({ commonName, scientificName, family, imageUrl });
    await newBird.save();

    return res.status(201).json({ error:messages.SPECIES_CREATED });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener todas las especies de aves
export const getAllBirds = async (req, res) => {
  try {
    const birds = await Bird.find(); // Asegúrate de que `Bird` es tu modelo correcto
    res.status(200).json(birds);
  } catch (error) {
    console.error(messages.GET_BIRDS_ERROR); // Esto te dará más información sobre el error
    res.status(500).json({ error: messages.GET_BIRDS_ERROR,  });
  }
};
// Obtener una especie de ave por su ID
export const getBirdById = async (req, res) => {
  const id = req.params.id;

  try {
    const bird = await Bird.findById(id); // Busca ave por su ID
    if (!bird) {
      return res.status(404).json({ error: messages.BIRD_NOT_FOUND });
    }
    res.status(200).json(bird);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar una especie de ave
export const updateBird = async (req, res) => {
  const id = req.params.id;
  const { commonName, scientificName, family, imageUrl } = req.body;

  try {
    const updatedBird = await Bird.findByIdAndUpdate(
      id,
      { commonName, scientificName, family, imageUrl },
      { new: true }
    );
    if (!updatedBird) {
      return res.status(404).json({ error: messages.BIRD_NOT_FOUND });
    }
    res.status(200).json(updatedBird);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar una especie de ave
export const deleteBird = async (req, res) => {
  const id = req.params.id;

  try {
    const deletedBird = await Bird.findByIdAndDelete(id); // Elimina ave por ID
    if (!deletedBird) {
      return res.status(404).json({ error: messages.BIRD_NOT_FOUND});
    }
    res.status(200).json({ erro: messages.SPECIES_DELETED });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};