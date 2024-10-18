import PostModel from "../models/Post.js";
import mongoose from "mongoose";
import UserModel from "../models/User.js";

// Creat new Post
import Post from '../models/Post.js';
import dbConnect from '../lib/dbConnect.js'; // Asegúrate de que la ruta sea correcta

// Crear una nueva publicación
export const createPost = async (req, res) => {
  const { userId, birdType, sightingLocation, sightingDate, camera, description, image } = req.body;

  try {
    await dbConnect();  // Asegúrate de que la conexión a la DB esté funcionando correctamente.

    const newPost = new Post({
      userId,
      birdType,
      sightingLocation,
      sightingDate,
      camera,
      description,
      image
    });

    const savedPost = await newPost.save();  // Aquí puede estar ocurriendo el error.
    res.status(201).json(savedPost);
  } catch (error) {
    // Esto te ayudará a saber cuál es el error exacto
    res.status(500).json({ message: error.message });
  }
};

// Get a post

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    await dbConnect();
    const post = await PostModel.findById(id).populate('userId', 'nombre usuario'); // Popula los campos 'nombre' y 'usuario' del usuario
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Publicación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("POst deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get Timeline POsts
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res
      .status(200)
      .json(currentUserPosts.concat(...followingPosts[0].followingPosts)
      .sort((a,b)=>{
          return b.createdAt - a.createdAt;
      })
      );
  } catch (error) {
    res.status(500).json(error);
  }
};