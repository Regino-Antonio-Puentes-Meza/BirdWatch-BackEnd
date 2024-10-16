import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Relación con el usuario
    desc: { type: String, maxLength: 500 }, // Descripción de la publicación
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Referencias a los usuarios que dieron like
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Usuario que comentó
        comment: { type: String, required: true, maxLength: 300 }, // Comentario
        createdAt: { type: Date, default: Date.now } 
      }
    ],
    image: { type: String }, // Ruta o URL de la imagen
  },
  {
    timestamps: true, // Crea automáticamente las fechas de creación y actualización
  }
);

postSchema.methods.setImage = function setImage(image) {
  const { host, port } = require('../config').default;
  this.image = `${host}:${port}/public/${image}`;
};

const PostModel = mongoose.model("Posts", postSchema);
export default PostModel;
