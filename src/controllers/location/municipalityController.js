// controllers/municipalityController.js
import Municipality from '../../models/location/Municipality.js';
import Department from '../../models/location/Department.js';
import dbConnect from '../../lib/dbConnect.js';

export const getMunicipalitiesByDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.departmentId, 10); // Asegúrate de que se esté convirtiendo correctamente

    if (isNaN(departmentId)) {
        return res.status(400).json({ message: 'Invalid department ID' });
    }

    try {
        const municipalities = await Municipality.find({ department: departmentId });
        res.json(municipalities);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los municipios', error });
    }
};

export const createMultipleMunicipalities = async (req, res) => {
  try {
    await dbConnect();

    const { municipalities } = req.body; // Array de nombres de municipios
    const departmentId = null;

    // Verificar que el departamento existe en la base de datos
    const departmentExists = await Department.findOne({ departmentId }); 
    if (!departmentExists) {
      return res.status(404).json({ message: 'El departamento no existe' });
    }

    const createdMunicipalities = [];
    for (const municipalityName of municipalities) {
      if (municipalityName !== 'Bucaramanga') { // Excluir Medellín
        // Verificar si el municipio ya existe en la base de datos
        const municipalityExists = await Municipality.findOne({ name: municipalityName, department: departmentId });
        if (!municipalityExists) {
          const newMunicipality = new Municipality({ name: municipalityName, department: departmentId });
          await newMunicipality.save();
          createdMunicipalities.push(newMunicipality);
        }
      }
    }

    return res.status(201).json({
      message: 'Municipios creados exitosamente',
      municipalities: createdMunicipalities,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
