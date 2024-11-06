import {
    createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts
} from '../src/controllers/postController';
import Post from '../src/models/Post.js';
import UserModel from '../src/models/UserModel.js';
import mongoose from 'mongoose';

jest.mock('../src/models/Post.js');
jest.mock('../src/models/UserModel.js');

describe('Post Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userHandle: 'testUser',
                birdType: 'sparrow',
                sightingLocation: 'Central Park',
                sightingDate: '2024-11-01',
                camera: 'Nikon D3500',
                description: 'A beautiful sparrow sighted in the park.',
                userId: '60d5f484c8a7c6d4b6a6c5a3', // ID ficticio de un usuario
            },
            params: {
                id: '60d5f484c8a7c6d4b6a6c5a2' // ID ficticio de una publicación
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new post successfully', async () => {
        const savedPost = { ...req.body, _id: '60d5f484c8a7c6d4b6a6c5a2' };
        Post.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(savedPost)
        }));

        await createPost(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(savedPost);
    });

    it('should handle error while creating a post', async () => {
        const errorMessage = 'Error al crear el post';
        Post.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(new Error(errorMessage))
        }));

        await createPost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear el post', error: expect.any(String) });
    });

    it('should get a post by ID successfully', async () => {
        const post = { ...req.body, _id: req.params.id };
        Post.findById.mockResolvedValue(post);

        await getPost(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 404 if post is not found', async () => {
        Post.findById.mockResolvedValue(null);

        await getPost(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Publicación no encontrada' });
    });

    it('should update a post successfully', async () => {
        const post = { userId: mongoose.Types.ObjectId(req.body.userId), updateOne: jest.fn() };
        Post.findById.mockResolvedValue(post);

        await updatePost(req, res);

        expect(post.updateOne).toHaveBeenCalledWith({ $set: req.body });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("Post Updated");
    });

    it('should return 403 if userId does not match for updating', async () => {
        const post = { userId: mongoose.Types.ObjectId('60d5f484c8a7c6d4b6a6c5a1') }; // ID diferente

        Post.findById.mockResolvedValue(post);

        await updatePost(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Action forbidden");
    });

    it('should handle error while updating a post', async () => {
        const post = { userId: mongoose.Types.ObjectId(req.body.userId), updateOne: jest.fn().mockRejectedValue(new Error('Error al actualizar')) };

        Post.findById.mockResolvedValue(post);

        await updatePost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error al actualizar el post', error: expect.any(String) });
    });

    it('should delete a post successfully', async () => {
        const post = { userId: mongoose.Types.ObjectId(req.body.userId), deleteOne: jest.fn() };

        Post.findById.mockResolvedValue(post);

        await deletePost(req, res);

        expect(post.deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("POst deleted successfully");
    });

    it('should return 403 if userId does not match for deleting', async () => {
        const post = { userId: mongoose.Types.ObjectId('60d5f484c8a7c6d4b6a6c5a1') }; // ID diferente

        Post.findById.mockResolvedValue(post);

        await deletePost(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Action forbidden");
    });

    it('should handle error while deleting a post', async () => {
        const errorMessage = 'Error al eliminar el post';

        Post.findById.mockRejectedValue(new Error(errorMessage));

        await deletePost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error al eliminar el post', error: errorMessage });
    });

    it('should like a post successfully', async () => {
        const post = { likes: [], updateOne: jest.fn() };

        Post.findById.mockResolvedValue(post);

        await likePost(req, res);

        expect(post.updateOne).toHaveBeenCalledWith({ $push: { likes: req.body.userId } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("Post liked");
    });

    it('should unlike a post successfully', async () => {
        const post = { likes: [req.body.userId], updateOne: jest.fn() };

        Post.findById.mockResolvedValue(post);

        await likePost(req, res);

        expect(post.updateOne).toHaveBeenCalledWith({ $pull: { likes: req.body.userId } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("Post Unliked");
    });

    it('should get timeline posts successfully', async () => {
        const userId = req.params.id;
        const currentUserPosts = [{ _id: '60d5f484c8a7c6d4b6a6c5a2', userId }];
        const followingPosts = [{ _id: '60d5f484c8a7c6d4b6a6c5a3', userId }];

        Post.find.mockResolvedValue(currentUserPosts);
        UserModel.aggregate.mockResolvedValue([{ followingPosts }]);

        await getTimelinePosts(req, res);

        // Verifica que se devuelvan los posts en el orden correcto
        const expectedPosts = [...currentUserPosts, ...followingPosts].sort((a, b) => b.createdAt - a.createdAt);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expectedPosts);
    });

    it('should handle error while getting timeline posts', async () => {
        const errorMessage = 'Error al obtener la línea de tiempo de publicaciones';

        UserModel.aggregate.mockRejectedValue(new Error(errorMessage));

        await getTimelinePosts(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener la línea de tiempo de publicaciones', error: errorMessage });
    });
});