import express from 'express';
import { getProfile, getAllUsersController, getPhotos, deletePhoto, addGender, saveGenderBio, saveOrientation, saveInterests, getUserProfile, updateUserProfileController, deleteUserController } from '../controllers/userController.js';
import { check } from 'express-validator';
import pool from '../utils/db.js';

const router = express.Router();

router.get('/', getAllUsersController);
router.get('/profile', getProfile);
router.delete("/:id", deleteUserController);
router.get('/profile/:userId', getUserProfile);
router.get('/gender', addGender);
router.get('/photos', getPhotos);
router.patch("/save-gender-bio", saveGenderBio);
router.patch("/save-orientation", saveOrientation);
router.patch("/save-interests", saveInterests);
router.delete('/photos/:photoId', deletePhoto);
router.patch('/profile', [
    check('name').optional().isString().isLength({ max: 100 }),
    check('email').optional().isEmail().isLength({ max: 100 }),
    check('age').optional().isInt({ min: 0 }),
    check('gender').optional().isString().isLength({ max: 20 }),
    check('bio').optional().isString(),
    check('location').optional().isString().isLength({ max: 255 }),
    check('interests').optional().isArray(),
    check('profilePicture').optional().isString(),
], updateUserProfileController);

//router.get('/likes', async (req, res) => {
//	try {
//	  const result = await pool.query(
//		`SELECT l2.user_id AS liked_by_user, l2.liked_user_id AS liked_user, l2.is_dislike
//		 FROM likes l2
//		 WHERE l2.is_dislike = FALSE`
//	  );
  
//	  if (result.rows.length > 0) {
//		res.status(200).json(result.rows);
//	  } else {
//		res.status(404).json({ message: 'Aucun like trouvé.' });
//	  }
//	} catch (err) {
//	  console.error('Erreur lors de la récupération des likes:', err);
//	  res.status(500).json({ message: 'Erreur interne du serveur.' });
//	}
//  });

export default router;
