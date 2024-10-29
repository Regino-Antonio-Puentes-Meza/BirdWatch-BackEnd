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
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, 
    desc: { 
      type: String, 
      maxLength: 500 
    }, 
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }], 
    comments: [
      {
        userId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User' 
        }, 
        comment: { 
          type: String, 
          required: true, 
          maxLength: 300 
        }, 
        createdAt: { 
          type: Date, 
          default: Date.now 
        }
      }
    ]
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

// Método para establecer la URL de la imagen
postSchema.methods.setImage = function setImage(image) {
  const { host, port } = require('../config').default;
  this.image = `${host}:${port}/public/${image}`;
};

const Post = mongoose.model('Post', postSchema);

export default Post;
