import express from 'express';
import request from 'supertest';
import postRoutes from '../src/routes/postRoutes'; 
import * as postController from '../src/controllers/postController';

// Mock de los métodos del controlador
jest.mock('../src/controllers/postController');

const app = express();
app.use(express.json());
app.use('/posts', postRoutes); // Usa el router que exportaste

describe('Post Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
    });

    it('should create a new post', async () => {
        const newPost = { title: 'New Post', content: 'Content of the new post' };

        postController.createPost.mockImplementation((req, res) => {
            res.status(201).json({ message: 'Post created', post: newPost });
        });

        const response = await request(app)
            .post('/posts/')
            .send(newPost);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Post created');
        expect(response.body.post).toEqual(newPost);
    });

    it('should get a post by ID', async () => {
        const post = { id: 1, title: 'First Post', content: 'Content of the first post' };

        postController.getPost.mockImplementation((req, res) => {
            res.status(200).json(post);
        });

        const response = await request(app).get('/posts/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(post);
    });

    it('should update a post by ID', async () => {
        const updatedPost = { title: 'Updated Post', content: 'Updated content' };

        postController.updatePost.mockImplementation((req, res) => {
            res.status(200).json({ message: 'Post updated', post: updatedPost });
        });

        const response = await request(app)
            .put('/posts/1')
            .send(updatedPost);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post updated');
        expect(response.body.post).toEqual(updatedPost);
    });

    it('should delete a post by ID', async () => {
        postController.deletePost.mockImplementation((req, res) => {
            res.status(204).send(); // No content
        });

        const response = await request(app).delete('/posts/1');

        expect(response.status).toBe(204);
    });

    it('should like a post', async () => {
        postController.likePost.mockImplementation((req, res) => {
            res.status(200).json({ message: 'Post liked' });
        });

        const response = await request(app).put('/posts/1/like');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post liked');
    });

    it('should get timeline posts', async () => {
        const timelinePosts = [
            { id: 1, title: 'First Post', content: 'Content of the first post' },
            { id: 2, title: 'Second Post', content: 'Content of the second post' }
        ];

        postController.getTimelinePosts.mockImplementation((req, res) => {
            res.status(200).json(timelinePosts);
        });

        const response = await request(app).get('/posts/1/timeline');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(timelinePosts);
    });
});
