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
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;