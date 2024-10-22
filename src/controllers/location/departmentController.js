// controllers/departmentController.js
import dbConnect from '../../lib/dbConnect.js';
import Department from '../../models/location/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los departamentos", error });
  }
};

export const createDepartment = async (req, res) => {
    try {
      const { _id, name } = req.body; // Ahora recibimos el ID y el nombre
  
      // Conectar a la base de datos
      try {
        await dbConnect();
      } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        return res.status(500).json({ error: 'Error al conectar a la base de datos' });
      }
  
      // Verificar si el departamento ya existe por nombre o ID
      const departmentExists = await Department.findOne({ 
        $or: [{ _id }, { name }] 
      });
  
      if (departmentExists) {
        return res.status(400).json({ 
          message: 'El departamento ya está registrado' 
        });
      }
  
      // Crear y guardar el nuevo departamento
      const newDepartment = new Department({ _id, name });
      await newDepartment.save();
  
      return res.status(201).json({
        message: 'Departamento creado exitosamente',
        department: newDepartment
      });
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };