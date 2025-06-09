import NewsModel from '../models/News.js';
import messages from '@/utils/messages.js'; 

// Crear una nueva noticia
export const createNews = async (req, res) => {
    const newNews = new NewsModel(req.body);

    try {
        await newNews.save();
        res.status(200).json({ message: messages.NEWS.NEWS_CREATED }); 
    } catch (error) {
        console.error( error); 
        res.status(500).json({ error }); 
    }
};

// Obtener todas las noticias
export const getAllNews = async (req, res) => {
    try {
        const news = await NewsModel.find();
        res.status(200).json(news);
    } catch (error) {
        console.error( error); 
        res.status(500).json({ error });
};
}
// Obtener una noticia por ID
export const getNewsById = async (req, res) => {
    const id = req.params.id;

    try {
        const news = await NewsModel.findById(id);
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ error }); 
    }
};

// Actualizar una noticia
export const updateNews = async (req, res) => {
    const id = req.params.id;

    try {
        const updatedNews = await NewsModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.status(200).json(updatedNews);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Eliminar una noticia
export const deleteNews = async (req, res) => {
    const id = req.params.id;

    try {
        const deletedNews = await NewsModel.findByIdAndDelete(id);
        res.status(200).json({ message: messages.NEWS.NEWS_DELETED }); 
    } catch (error) {
        res.status(500).json(error);
    }
};