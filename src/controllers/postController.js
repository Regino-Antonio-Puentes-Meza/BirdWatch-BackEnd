import PostModel from "../models/Post.js";
import mongoose from "mongoose";
import UserModel from "../models/User.js";

// Creat new Post
import Post from '../models/Post.js';
import dbConnect from '../lib/dbConnect.js'; // Asegúrate de que la ruta sea correcta

// Crear una nueva publicación
export const createPost = async (req, res) => {
  const { userHandle, birdType, sightingLocation, sightingDate, camera, description, image } = req.body;
// Crear nueva publicación
export const createPost = async (req, res) => {
  const { userId, desc } = req.body;
  const image = req.file ? req.file.path : null; // Usamos la ruta de la imagen

  const newPost = new PostModel({
    userId,
    desc,
    image, // Almacena la URL o la ruta del archivo
  });

  try {
    await dbConnect();  // Asegúrate de que la conexión a la DB esté funcionando correctamente.

    const newPost = new Post({
      userHandle, // Cambiar userId por userHandle
      birdType,
      sightingLocation,
      sightingDate,
      camera,
      description,
      image
    });

    console.log("Datos recibidos en el backend:", req.body);

    const savedPost = await newPost.save();  // Aquí puede estar ocurriendo el error.
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error al crear el post:", error);
    res.status(500).json({
        message: 'Error al crear el post.',
        error: error.message // Asegúrate de enviar el mensaje de error completo
    });
  }
};

// Obtener una publicación por ID
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

// Actualizar una publicación
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

// Eliminar una publicación
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Dar o quitar like a una publicación
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
      res.status(200).json("Post unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Obtener las publicaciones del timeline (del usuario y sus seguidos)
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    // Publicaciones del usuario actual
    const currentUserPosts = await PostModel.find({ userId: userId });

    // Publicaciones de las personas que el usuario sigue
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts", // El nombre de la colección de publicaciones
          localField: "following", // Campo que indica a quiénes sigue el usuario
          foreignField: "userId", // Campo que relaciona las publicaciones con los usuarios seguidos
          as: "followingPosts", // Nombre del array con las publicaciones de los seguidos
        },
      },
      {
        $project: {
          followingPosts: 1, // Proyectar (incluir) las publicaciones de los seguidos
          _id: 0, // Excluir el campo _id del resultado
        },
      },
    ]);

    // Combinar las publicaciones del usuario y las de las personas que sigue
    const allPosts = currentUserPosts.concat(...followingPosts[0].followingPosts)
      .sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha de creación, descendente

    res.status(200).json(allPosts);
  } catch (error) {
    res.status(500).json(error);
  }
};
