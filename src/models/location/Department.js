import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
    {
        deartmentId: {
            type: Number,  
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: false }
);

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;
