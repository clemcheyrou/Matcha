import express from "express";
import passport from "passport";
import {
	register,
	login,
	logout,
	handleEmailConfirmation,
	sendPasswordResetEmail,
	resetPassword,
} from "../controllers/authController.js";
import { authCallback, facebookAuth, googleAuth } from "../controllers/auth.js";

const router = express.Router();

// auth classic
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/confirm-email", handleEmailConfirmation);
router.post("/forgot-password", sendPasswordResetEmail);
router.post("/reset-password", resetPassword);

// facebook
router.get("/facebook", facebookAuth);
router.get("/facebook/login", facebookAuth);
router.get(
	"/facebook/callback",
	passport.authenticate("facebook", {
		failureRedirect: "http://localhost:3000/register?error=email_exists",
	}),
	authCallback
);

// google
router.get("/google", googleAuth);
router.get("/google/login", googleAuth);
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "http://localhost:3000/register?error=email_exists",
	}),
	authCallback
);

// facebook photos
router.get("/facebook/photos", async (req, res) => {
	const accessToken = req.session?.accessToken;

	if (!accessToken) {
		return res
			.status(401)
			.json({ message: "not authorized, missing token" });
	}

	try {
		const response = await fetch(
			`https://graph.facebook.com/me/photos?fields=id,created_time,images&access_token=${accessToken}`
		);
		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: "facebook api error", details: error });
	}
});

export default router;
