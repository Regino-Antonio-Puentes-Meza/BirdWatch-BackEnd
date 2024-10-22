import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userHandle: { // Cambiar userId a userHandle
    type: String, // Cambiar de ObjectId a String si deseas almacenar el handle directamente
    required: true
  },
  birdType: {
    type: String,
    required: true
  },
  sightingLocation: {
    type: String,
    required: true
  },
  sightingDate: {
    type: Date,
    required: true
  },
  camera: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
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
});

const Post = mongoose.model('Post', postSchema);

export default Post;
postSchema.methods.setImage = function setImage(image) {
  const { host, port } = require('../config').default;
  this.image = `${host}:${port}/public/${image}`;
};

const PostModel = mongoose.model("Posts", postSchema);
export default PostModel;
