import dbConnect from '../lib/dbConnect.js';
import Bird from "../models/Bird.js";

// Crear una nueva especie de ave
export const createBird = async (req, res) => {
  try {
    const { commonName, scientificName, family, imageUrl } = req.body;


    try {
      await dbConnect();
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      return res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }


    const birdExists = await Bird.findOne({ scientificName });
    if (birdExists) {
      return res.status(400).json({ message: 'El ave ya está registrada' });
    }


    const newBird = new Bird({ commonName, scientificName, family, imageUrl });
    await newBird.save();

    return res.status(201).json({ message: 'Especie de ave creada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener todas las especies de aves
export const getAllBirds = async (req, res) => {
  try {
    await dbConnect();
    const birds = await Bird.find(); // Asegúrate de que `Bird` es tu modelo correcto
    res.status(200).json(birds);
  } catch (error) {
    console.error('Error al obtener aves:', error); // Esto te dará más información sobre el error
    res.status(500).json({ message: 'Error al obtener aves', error: error.message });
  }
};
// Obtener una especie de ave por su ID
export const getBirdById = async (req, res) => {
  const id = req.params.id;

  try {
    await dbConnect();
    const bird = await Bird.findById(id); // Busca ave por su ID
    if (!bird) {
      return res.status(404).json({ message: 'Ave no encontrada' });
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
    await dbConnect();
    const updatedBird = await Bird.findByIdAndUpdate(
      id,
      { commonName, scientificName, family, imageUrl },
      { new: true }
    );
    if (!updatedBird) {
      return res.status(404).json({ message: 'Ave no encontrada' });
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
    await dbConnect();
    const deletedBird = await Bird.findByIdAndDelete(id); // Elimina ave por ID
    if (!deletedBird) {
      return res.status(404).json({ message: 'Ave no encontrada' });
    }
    res.status(200).json({ message: 'Especie de ave eliminada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};