import mongoose from "mongoose";
import Post from "../models/Post.js";
import UserModel from "../models/UserModel.js";
import dbConnect from '../config/dbConnect.js';
import messages from "@/utils/messages.js";

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
    console.log(messages.SERVER.DATA_RECEIVED_BACKEND, req.body); 
  } catch (error) {
    handleError(res, error, messages.POST.POST_CREATE_ERROR); }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id).populate('userId', 'nombre usuario');
    post ? res.status(200).json(post) : res.status(404).json({ error: messages.POST.POST_NOT_FOUND }); 
  } catch (error) {
    handleError(res, error, messages.POST.POST_GET_ERROR); 
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
      res.status(200).json(messages.POST.POST_UPDATED); 
    } else {
      res.status(403).json(messages.USER.ACTION_FORBIDDEN); 
    }
  } catch (error) {
    handleError(res, error, messages.POST.POST_UPDATE_ERROR); 
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
        { $limit: numberOfPosts }       // Limitar el número de publicaciones
      ]);
    } else {
      // Seleccionar publicaciones completamente al azar
      posts = await Post.aggregate([
        { $sample: { size: numberOfPosts } } // Seleccionar publicaciones aleatorias
      ]);
    }

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error, messages.POST.RANDOM_POSTS_ERROR); 
  }
};

export const getPostsByDate = async (req, res) => {
  const userId = req.query.userId; // ID del usuario actual (puedes pasarlo como query o token)

  try {
    const posts = await Post.find().sort({ sightingDate: -1 });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      comments: post.comments || [], // Asegúrate de que comments sea un array
      likes: post.likes.length, // Número total de likes
      likedByUser: post.likes.includes(userId), // Verifica si el usuario actual ya dio like
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error(messages.POST.POSTS_FETCH_ERROR, error); 
    res.status(500).json({ error: messages.POST.POSTS_FETCH_ERROR }); 
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
      res.status(200).json(messages.POST.POST_DELETED); 
    } else {
      res.status(403).json(messages.USER.ACTION_FORBIDDEN); 
    }
  } catch (error) {
    handleError(res, error, messages.POST.POST_DELETE_ERROR); 
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params; // ID del post
  const { userId } = req.body; // ID del usuario que da el like

  try {
      const post = await Post.findById(id);

      if (!post) {
          return res.status(404).json({ error: messages.POST.POSTS_FETCH_ERROR }); 
      }

      let liked = false;

      // Verificar si el usuario ya dio like
      if (!post.likes.includes(userId)) {
          post.likes.push(userId);
          liked = true;
      } else {
          post.likes = post.likes.filter((id) => id !== userId);
      }

      await post.save();

      res.status(200).json({
          likes: post.likes.length,
          liked,
      });
  } catch (error) {
      console.error(messages.POST.LIKE_HANDLE_ERROR, error); 
      res.status(500).json({ error: messages.POST.LIKE_HANDLE_ERROR }); 
  }
};


export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await Post.find({ userId: userId });
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
    handleError(res, error, messages.POST.TIMELINE_POSTS_ERROR); 
  }
};
