import express from 'express';
import request from 'supertest';
import newsRoutes from '../src/routes/newsRoutes'; // Asegúrate de que la ruta sea correcta
import * as newsController from '../src/controllers/newsController';

// Mock de los métodos del controlador
jest.mock('../src/controllers/newsController');

const app = express();
app.use(express.json());
app.use('/news', newsRoutes); // Usa el router que exportaste

describe('News Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
    });

    it('should create a new news article', async () => {
        const newArticle = { title: 'New Article', content: 'Content of the new article' };

        newsController.createNews.mockImplementation((req, res) => {
            res.status(201).json({ message: 'News article created', article: newArticle });
        });

        const response = await request(app)
            .post('/news/')
            .send(newArticle);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('News article created');
        expect(response.body.article).toEqual(newArticle);
    });

    it('should get all news articles', async () => {
        const articles = [{ id: 1, title: 'First Article', content: 'Content of the first article' }];

        newsController.getAllNews.mockImplementation((req, res) => {
            res.status(200).json(articles);
        });

        const response = await request(app).get('/news/');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(articles);
    });

    it('should get a news article by ID', async () => {
        const article = { id: 1, title: 'First Article', content: 'Content of the first article' };

        newsController.getNewsById.mockImplementation((req, res) => {
            res.status(200).json(article);
        });

        const response = await request(app).get('/news/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(article);
    });

    it('should update a news article by ID', async () => {
        const updatedArticle = { title: 'Updated Article', content: 'Updated content' };

        newsController.updateNews.mockImplementation((req, res) => {
            res.status(200).json({ message: 'News article updated', article: updatedArticle });
        });

        const response = await request(app)
            .put('/news/1')
            .send(updatedArticle);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('News article updated');
        expect(response.body.article).toEqual(updatedArticle);
    });

    it('should delete a news article by ID', async () => {
        newsController.deleteNews.mockImplementation((req, res) => {
            res.status(204).send(); // No content
        });

        const response = await request(app).delete('/news/1');

        expect(response.status).toBe(204);
    });
});
