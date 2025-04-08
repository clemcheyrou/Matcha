import express from 'express';
import { getProfile, getAllUsersController, getPhotos, deletePhoto, addGender, saveGenderBio, saveOrientation, saveInterests, getUserProfile, updateUserProfileController, deleteUserController } from '../controllers/userController.js';
import { check } from 'express-validator';

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
    check('firstname').optional().isString().isLength({ max: 100 }),
    check('lastname').optional().isString().isLength({ max: 100 }),
    check('email').optional().isEmail().isLength({ max: 100 }),
    check('age').optional().isInt({ min: 0 }),
    check('gender').optional().isString().isLength({ max: 20 }),
    check('bio').optional().isString(),
    check('location').optional().isString().isLength({ max: 255 }),
    check('interests').optional().isArray(),
    check('profilePicture').optional().isString(),
], updateUserProfileController);

export default router;
