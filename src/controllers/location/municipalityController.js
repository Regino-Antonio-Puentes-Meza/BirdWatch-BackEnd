// controllers/municipalityController.js
import Municipality from '../../models/location/Municipality.js';
import Department from '../../models/location/Department.js';
import dbConnect from '../../lib/dbConnect.js';

export const getMunicipalitiesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;  // Obtenemos el id del departamento
    const municipalities = await Municipality.find({ department: departmentId });
    res.status(200).json(municipalities);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los municipios", error });
  }
};

export const createMunicipality = async (req, res) => {
  try {
    const {  name, departmentId } = req.body; // Cambiar a departmentId

    await dbConnect();

    const departmentExists = await Department.findOne({ departmentId });
    if (!departmentExists) {
      return res.status(404).json({ message: 'El departamento no existe' });
    }

    const newMunicipality = new Municipality({ name, department: departmentId });
    await newMunicipality.save();

    return res.status(201).json({
      message: 'Municipio creado exitosamente',
      municipality: newMunicipality,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
