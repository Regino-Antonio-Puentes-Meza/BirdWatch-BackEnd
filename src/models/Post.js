import mongoose from 'mongoose';
const postSchema = new mongoose.Schema(
  {
    userHandle: { 
      type: String, 
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
    likes: {
      type: [String], // Array de IDs de usuarios que dieron "like"
      default: [], // Por defecto, no tiene likes
    }
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;