import mongoose from "mongoose";
import Post from "../models/Post.js";
import UserModel from "../models/UserModel.js";
import dbConnect from '../config/dbConnect.js';

const handleError = (res, error, message = 'Error en la operación') => {
  console.error(message, error);
  res.status(500).json({ message, error: error.message });
};

// Crear una nueva publicación
export const createPost = async (req, res) => {
  const { userHandle, birdType, sightingLocation, sightingDate, camera, description, imageUrl } = req.body;

  try {
    await dbConnect();

    const newPost = new Post({
      userHandle,
      birdType,
      sightingLocation,
      sightingDate,
      camera,
      description,
      image: imageUrl, // Guardar la URL de la imagen
    });

    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
    console.log("Datos recibidos en backend:", req.body);
  } catch (error) {
    handleError(res, error, "Error al crear el post");
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id).populate('userId', 'nombre usuario');
    post ? res.status(200).json(post) : res.status(404).json({ message: 'Publicación no encontrada' });
  } catch (error) {
    handleError(res, error, "Error al obtener el post");
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (post.userId.equals(userId)) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    handleError(res, error, "Error al actualizar el post");
  }
};

export const getRandomPosts = async (req, res) => {
  const numberOfPosts = parseInt(req.query.limit) || 10; // Límite de publicaciones a obtener
  const prioritizeNew = Math.random() < 0.5; // 50% de probabilidad de priorizar las publicaciones más nuevas

  try {
    let posts;

    if (prioritizeNew) {
      // Priorizar las publicaciones más recientes
      posts = await Post.aggregate([
        { $sort: { sightingDate: -1 } }, // Ordenar por fecha de creación (más recientes primero)
        { $limit: numberOfPosts }    // Limitar el número de publicaciones
      ]);
    } else {
      // Seleccionar publicaciones completamente al azar
      posts = await Post.aggregate([
        { $sample: { size: numberOfPosts } } // Seleccionar publicaciones aleatorias
      ]);
    }

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error, "Error al obtener las publicaciones aleatorias");
  }
};

export const getPostsByDate = async (req, res) => {
  const numberOfPosts = parseInt(req.query.limit) || 10; // Límite de publicaciones a obtener

  try {
    await dbConnect();

    // Obtener publicaciones ordenadas por fecha de creación (más recientes primero)
    const posts = await Post.find()
      .sort({ sightingDate: -1 }) // Ordenar por fecha de creación en orden descendente
      .limit(numberOfPosts);   // Limitar el número de publicaciones

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error, "Error al obtener las publicaciones ordenadas por fecha");
  }
};


// Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(id);
    if (post.userId.equals(userId)) {
      await post.deleteOne();
      res.status(200).json("POst deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    handleError(res, error, "Error al eliminar el post");
  }
};

export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Unliked");
    }
  } catch (error) {
    handleError(res, error, "Error al dar like/unlike al post");
  }
};


export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
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

    const timelinePosts = [...currentUserPosts, ...followingPosts[0]?.followingPosts || []];
    timelinePosts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(timelinePosts);
    res
      .status(200)
      .json(currentUserPosts.concat(...followingPosts[0].followingPosts)
      .sort((a,b)=>{
          return b.createdAt - a.createdAt;
      })
      );
  } catch (error) {
    handleError(res, error, "Error al obtener la línea de tiempo de publicaciones");
  }
};