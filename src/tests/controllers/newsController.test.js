import { createNews, getAllNews, getNewsById, updateNews, deleteNews } from '../../controllers/newsController.js';

import NewsModel from '../../models/News.js';
import messages from '../../utils/messages.js';

jest.mock('../../models/News.js');

describe('newsController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.clearAllMocks();
    });

    describe('createNews', () => {
        it('debe crear una noticia exitosamente', async () => {
            NewsModel.prototype.save = jest.fn().mockResolvedValue({});
            await createNews(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: messages.NEWS.NEWS_CREATED });
        });

        it('debe retornar 500 si ocurre un error al crear noticia', async () => {
            NewsModel.prototype.save = jest.fn().mockRejectedValue('error');
            await createNews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'error' });
        });
    });

    describe('getAllNews', () => {
        it('debe retornar todas las noticias', async () => {
            const fakeNews = [{ title: 'Noticia 1' }];
            NewsModel.find.mockResolvedValue(fakeNews);

            await getAllNews(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeNews);
        });

        it('debe retornar 500 si ocurre un error', async () => {
            NewsModel.find.mockRejectedValue('error');

            await getAllNews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'error' });
        });
    });

    describe('getNewsById', () => {
        it('debe retornar una noticia por id', async () => {
            req.params.id = '123';
            const fakeNews = { title: 'Noticia' };
            NewsModel.findById.mockResolvedValue(fakeNews);

            await getNewsById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeNews);
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '123';
            NewsModel.findById.mockRejectedValue('error');

            await getNewsById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'error' });
        });
    });

    describe('updateNews', () => {
        it('debe actualizar una noticia', async () => {
            req.params.id = '1';
            req.body = { title: 'Actualizado' };
            const updated = { _id: '1', title: 'Actualizado' };

            NewsModel.findByIdAndUpdate.mockResolvedValue(updated);

            await updateNews(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '1';
            NewsModel.findByIdAndUpdate.mockRejectedValue('error');

            await updateNews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith('error');
        });
    });

    describe('deleteNews', () => {
        it('debe eliminar una noticia', async () => {
            req.params.id = '1';
            NewsModel.findByIdAndDelete.mockResolvedValue({});

            await deleteNews(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: messages.NEWS.NEWS_DELETED });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = '1';
            NewsModel.findByIdAndDelete.mockRejectedValue('error');

            await deleteNews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith('error');
        });
    });
});