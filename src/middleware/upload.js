import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import intoStream from 'into-stream';
import dotenv from 'dotenv';

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Conexión al Azure Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = 'imagenes';

const uploadToAzure = async (req, res, next) => {
    await upload.single('imagen')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'Error al subir el archivo' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se ha recibido ningún archivo' });
            }

            const containerClient = blobServiceClient.getContainerClient(containerName);
            await containerClient.createIfNotExists();

            const blobName = `${Date.now()}-${req.file.originalname}`; // Genera un nombre único
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const stream = intoStream(req.file.buffer);
            const options = { blobHTTPHeaders: { blobContentType: req.file.mimetype } };
            await blockBlobClient.uploadStream(stream, req.file.size, undefined, options);

            const blobUrl = blockBlobClient.url; // Obtiene la URL del blob
            res.json({ message: 'Imagen subida con éxito', url: blobUrl }); // Devuelve la URL en la respuesta
        } catch (error) {
            if (error instanceof AzureError) {
                console.error('Error de Azure:', error);
                res.status(500).json({ error: 'Error de Azure' });
            } else {
                console.error('Error al subir la imagen:', error);
                res.status(500).json({ error: 'Error al subir la imagen' });
            }
        }
    });
};

export default uploadToAzure;
