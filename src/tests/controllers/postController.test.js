import { createPost, getPost, updatePost, likePost, deletePost, getPostsByDate, getTimelinePosts  } from '../../controllers/postController.js';
import Post from '../../models/Post.js';
import messages from '../../utils/messages.js';
import dbConnect from '../../config/dbConnect.js';
import mongoose from 'mongoose';
import UserModel from '../../models/UserModel.js';

jest.mock('../../models/UserModel.js');
jest.mock('../../models/Post.js');
jest.mock('../../config/dbConnect.js', () => jest.fn());

describe('postController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('debe crear una publicación exitosamente', async () => {
      req.body = {
        userHandle: 'usuario1',
        birdType: 'Gavilán',
        sightingLocation: 'Montaña',
        sightingDate: '2024-01-01',
        camera: 'Canon',
        description: 'Hermosa ave',
        imageUrl: 'http://url.com/ave.jpg'
      };
      Post.prototype.save = jest.fn().mockResolvedValue({ _id: '123', ...req.body });

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userHandle: 'usuario1' }));
    });

    it('debe manejar error al crear post', async () => {
      Post.prototype.save = jest.fn().mockRejectedValue(new Error('DB error'));

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: messages.POST.POST_CREATE_ERROR
      }));
    });
  });

  describe('getPost', () => {
    it('debe retornar una publicación si existe', async () => {
      req.params.id = '123';
      const post = { _id: '123', userId: '1' };
      Post.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(post) });

      await getPost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('debe retornar 404 si no existe', async () => {
      req.params.id = '123';
      Post.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await getPost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe manejar errores', async () => {
      req.params.id = '123';
      Post.findById.mockReturnValue({ populate: jest.fn().mockRejectedValue('error') });

      await getPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: messages.POST.POST_GET_ERROR
      }));
    });
  });

  describe('updatePost', () => {
    it('debe actualizar el post si el userId coincide', async () => {
      req.params.id = '123';
      req.body.userId = 'user123';

      const mockPost = {
        userId: { equals: jest.fn().mockReturnValue(true) },
        updateOne: jest.fn()
      };

      Post.findById.mockResolvedValue(mockPost);

      await updatePost(req, res);

      expect(mockPost.updateOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(messages.POST.POST_UPDATED);
    });

    it('debe retornar 403 si el userId no coincide', async () => {
      req.params.id = '123';
      req.body.userId = 'otroUser';

      const mockPost = {
        userId: { equals: jest.fn().mockReturnValue(false) }
      };

      Post.findById.mockResolvedValue(mockPost);

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.ACTION_FORBIDDEN);
    });

    it('debe manejar errores al actualizar', async () => {
      req.params.id = '123';
      Post.findById.mockRejectedValue(new Error('error'));

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: messages.POST.POST_UPDATE_ERROR
      }));
    });
  });

  describe('likePost', () => {
    it('debe agregar un like si el usuario no ha dado like', async () => {
      req.params.id = 'post123';
      req.body.userId = 'userABC';

      const mockPost = {
        likes: [],
        save: jest.fn(),
      };

      Post.findById.mockResolvedValue(mockPost);

      await likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        likes: 1,
        liked: true
      });
    });

    it('debe quitar el like si el usuario ya lo había dado', async () => {
      req.params.id = 'post123';
      req.body.userId = 'userABC';

      const mockPost = {
        likes: ['userABC'],
        save: jest.fn(),
      };

      Post.findById.mockResolvedValue(mockPost);

      await likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toEqual({
        likes: 0,
        liked: false
      });
    });

    it('debe manejar error si el post no existe', async () => {
      Post.findById.mockResolvedValue(null);
      req.params.id = 'post123';
      req.body.userId = 'userABC';

      await likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe manejar errores inesperados', async () => {
      Post.findById.mockRejectedValue(new Error('Error de DB'));

      req.params.id = 'post123';
      req.body.userId = 'userABC';

      await likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: messages.POST.LIKE_HANDLE_ERROR
      });
    });
  });

  describe('deletePost', () => {
    it('debe eliminar el post si userId coincide', async () => {
      req.params.id = '123';
      req.body.userId = 'user123';
      const mockPost = {
        userId: { equals: jest.fn().mockReturnValue(true) },
        deleteOne: jest.fn()
      };

      Post.findById.mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(mockPost.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(messages.POST.POST_DELETED);
    });

    it('debe retornar 403 si userId no coincide', async () => {
      req.params.id = '123';
      req.body.userId = 'otro';

      const mockPost = {
        userId: { equals: jest.fn().mockReturnValue(false) }
      };

      Post.findById.mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(messages.USER.ACTION_FORBIDDEN);
    });

    it('debe manejar error al eliminar post', async () => {
      Post.findById.mockRejectedValue(new Error('error'));

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: messages.POST.POST_DELETE_ERROR
      }));
    });
  });

  describe('getPostsByDate', () => {
    it('debe retornar posts formateados con likes y comments', async () => {
      req.query.userId = 'user123';
      Post.find.mockResolvedValue([
        {
          toObject: () => ({ id: 1, likes: ['user123'], comments: ['comentario'] }),
          likes: ['user123'],
          comments: ['comentario']
        }
      ]);

      await getPostsByDate(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{
        id: 1,
        likes: 1,
        likedByUser: true,
        comments: ['comentario']
      }]);
    });

    it('debe manejar errores en getPostsByDate', async () => {
      await expect(getPostsByDate(req, res)).resolves.not.toThrow();

      await getPostsByDate(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: messages.POST.POSTS_FETCH_ERROR });
    });
  });

  describe('getTimelinePosts', () => {
    it('debe retornar publicaciones del usuario y de los seguidos', async () => {
      req.params.id = 'user123';

      const currentPosts = [{ createdAt: 5 }, { createdAt: 10 }];
      const followingPosts = { followingPosts: [{ createdAt: 20 }] };

      Post.find.mockResolvedValue(currentPosts);
      UserModel.aggregate.mockResolvedValue([followingPosts]);

      await getTimelinePosts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { createdAt: 20 },
        { createdAt: 10 },
        { createdAt: 5 }
      ]);
    });

    it('debe manejar errores al obtener la línea de tiempo', async () => {
      Post.find.mockRejectedValue(new Error('error'));

      await getTimelinePosts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: messages.POST.TIMELINE_POSTS_ERROR
      }));
    });
  });
});