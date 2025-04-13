import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from './utils/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    const errorMessage = 'file format is not valid, only JPEG, PNG, and GIF are allowed.';
    console.warn(`File rejected: ${errorMessage}`);
}
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: 'no file download' });

  const fileUrl = `/uploads/${req.file.filename}`;
  const userId = req.session.userId;

  if (!userId)
    return res.status(401).json({ message: 'user not authenticated' });
  
  const checkPhotosQuery = 'SELECT id FROM photos WHERE user_id = $1';
  const checkPhotosValues = [userId];
  
  pool.query(checkPhotosQuery, checkPhotosValues, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'error' });
    }
  
    const hasPhotos = result.rows.length > 0;
  
    const photoType = hasPhotos ? 'normal' : 'profil';
    
    const insertPhotoQuery = 'INSERT INTO photos (user_id, url, type) VALUES ($1, $2, $3) RETURNING id';
    const insertPhotoValues = [userId, fileUrl, photoType];
  
    pool.query(insertPhotoQuery, insertPhotoValues, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'error' });
      }
  
      const newPhotoId = result.rows[0].id;
  
      if (!hasPhotos) {
        const updateUserQuery = 'UPDATE users SET profile_photo_id = $1 WHERE id = $2';
        const updateUserValues = [newPhotoId, userId];
  
        pool.query(updateUserQuery, updateUserValues, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'error updating profile photo' });
          }
  
          res.status(200).json({
            message: 'profile photo successfully updated',
            profile_picture_url: fileUrl,
          });
        });
      } else {
        res.status(200).json({
          message: 'normal photo successfully added',
          url: fileUrl,
        });
      }
    });
  });
});

router.post('/upload-image', upload.single('image'), async (req, res) => {
  const imageUrl = req.body.imageUrl;

  if (!imageUrl) {
    return res.status(400).json({ message: 'L\'URL de l\'image est manquante' });
  }

  try {
    https.get(imageUrl, (imageResponse) => {
      const chunks = [];
	  const contentType = imageResponse.headers['content-type'];
		if (!['image/jpeg', 'image/png', 'image/gif'].includes(contentType)) {
		  console.warn(`type MIME invalide (${contentType})`);
		  return res.status(400).json({ message: 'type d\'image non autorisé.' });
		}
      imageResponse.on('data', (chunk) => {
        chunks.push(chunk);
      });

      imageResponse.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);
        const newFilePath = path.join(__dirname, 'uploads', `${Date.now()}.jpg`);
        fs.writeFileSync(newFilePath, imageBuffer);

        const userId = req.session.userId;
        if (!userId) {
          return res.status(401).json({ message: 'Utilisateur non authentifié' });
        }

        const checkPhotosQuery = 'SELECT id FROM photos WHERE user_id = $1';
        const checkPhotosValues = [userId];

        pool.query(checkPhotosQuery, checkPhotosValues, (err, result) => {
          if (err) {
            console.error('Erreur lors de la vérification des photos de l\'utilisateur:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la vérification des photos.' });
          }

          const hasPhotos = result.rows.length > 0;
          const fileUrl = `/uploads/${path.basename(newFilePath)}`;
          const photoType = hasPhotos ? 'normal' : 'profil';

          const insertPhotoQuery = 'INSERT INTO photos (user_id, url, type) VALUES ($1, $2, $3) RETURNING id';
          const insertPhotoValues = [userId, fileUrl, photoType];

          pool.query(insertPhotoQuery, insertPhotoValues, (err, result) => {
            if (err) {
              console.error('Erreur lors de l\'insertion de la photo:', err);
              return res.status(500).json({ message: 'Erreur serveur lors de l\'insertion de la photo.' });
            }

            const newPhotoId = result.rows[0].id;

            if (!hasPhotos) {
              const updateUserQuery = 'UPDATE users SET profile_photo_id = $1 WHERE id = $2';
              const updateUserValues = [newPhotoId, userId];

              pool.query(updateUserQuery, updateUserValues, (err, result) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour de la photo de profil:', err);
                  return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la photo de profil.' });
                }

                res.status(200).json({
                  message: 'Photo de profil ajoutée avec succès !',
                  profile_picture_url: fileUrl,
                });
              });
            } else {
              res.status(200).json({
                message: 'Photo normale ajoutée avec succès !',
                url: fileUrl,
              });
            }
          });
        });
      });

      imageResponse.on('error', (error) => {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        res.status(500).json({ message: 'Erreur serveur lors du téléchargement de l\'image.' });
      });
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du téléchargement de l\'image' });
  }
});

export default router;
