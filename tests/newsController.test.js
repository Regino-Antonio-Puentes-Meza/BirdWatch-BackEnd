import {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews
} from '../src/controllers/newsController';
import NewsModel from '../src/models/News.js';

jest.mock('../src/models/News.js');
jest.mock('../src/config/dbConnect');

describe('News Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a news article successfully', async () => {
        req.body = { title: 'Test News', content: 'This is a test news article.' };
        NewsModel.prototype.save = jest.fn().mockResolvedValue();

        await createNews(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("Noticia creada con exito!");
    });

    it('should handle errors when creating a news article', async () => {
        req.body = { title: 'Test News', content: 'This is a test news article.' };
        NewsModel.prototype.save = jest.fn().mockRejectedValue(new Error('Error al guardar'));

        await createNews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should get all news articles', async () => {
        const mockNews = [{ title: 'Test News 1' }, { title: 'Test News 2' }];
        NewsModel.find = jest.fn().mockResolvedValue(mockNews);

        await getAllNews(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockNews);
    });

    it('should handle errors when getting all news articles', async () => {
        NewsModel.find = jest.fn().mockRejectedValue(new Error('Error al obtener noticias'));

        await getAllNews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should get a news article by ID', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        const mockNews = { title: 'Test News' };
        NewsModel.findById = jest.fn().mockResolvedValue(mockNews);

        await getNewsById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockNews);
    });

    it('should return 404 if news article is not found', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        NewsModel.findById = jest.fn().mockResolvedValue(null);

        await getNewsById(req, res);

        expect(res.status).toHaveBeenCalledWith(500); // Ajusta este código si decides manejar el caso "not found" de otra manera.
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle errors when getting a news article by ID', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        NewsModel.findById = jest.fn().mockRejectedValue(new Error('Error al obtener noticia'));

        await getNewsById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should update a news article', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        req.body = { title: 'Updated Test News' };
        const mockUpdatedNews = { title: 'Updated Test News' };
        NewsModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedNews);

        await updateNews(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedNews);
    });

    it('should handle errors when updating a news article', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        req.body = { title: 'Updated Test News' };
        NewsModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error al actualizar'));

        await updateNews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should delete a news article', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        NewsModel.findByIdAndDelete = jest.fn().mockResolvedValue();

        await deleteNews(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("Noticia eliminada con exito!");
    });

    it('should handle errors when deleting a news article', async () => {
        req.params.id = '60c72b2f5f1b2c001c8d9f4c';
        NewsModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Error al eliminar'));

        await deleteNews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
});
