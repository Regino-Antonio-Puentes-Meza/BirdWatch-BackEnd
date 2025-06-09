import dbConnect from '../../config/dbConnect.js';
import Department from '../../models/location/Department.js';
import messages from '@/utils/messages.js';

export const getDepartments = async (req, res) => {
  try {
    await dbConnect(); // Asegurarse de que haya conexión con la base de datos
    const departments = await Department.find(); // Obtener todos los departamentos
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: messages.GET_DEPARTMENTS_ERROR});
  }
};

export const createDepartment = async (req, res) => {
    try {
      const { departmentId, name } = req.body; // Ahora recibimos el ID y el nombre
  
      // Conectar a la base de datos
      try {
        await dbConnect();
      } catch (error) {
        console.error(messages.DATABASE_CONNECTION_ERROR, error);
        return res.status(500).json({ error: messages.DATABASE_CONNECTION_ERROR });
      }
  
      // Verificar si el departamento ya existe por nombre o ID
      const departmentExists = await Department.findOne({ 
        $or: [{ departmentId }, { name }] 
      });
  
      if (departmentExists) {
        return res.status(400).json({ error: messages.DEPARTMENT_ALREADY_REGISTERED});
      }
  
      // Crear y guardar el nuevo departamento
      const newDepartment = new Department({ departmentId, name });
      await newDepartment.save();
  
      return res.status(201).json({
        error: messages.DEPARTMENT_CREATED,
        department: newDepartment
      });
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };