import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "../utils/db.js";
import { createOAuthStrategy } from "./oauthStrategy.js";

dotenv.config();

// facebook oauth
createOAuthStrategy(
	FacebookStrategy,
	"facebook",
	{
		clientID: process.env.FACEBOOK_API_KEY,
		clientSecret: process.env.FACEBOOK_API_SECRET,
		callbackURL: process.env.FACEBOOK_CALLBACK_URL,
		profileFields: ["id", "displayName", "emails", "photos", "name"],
		scope: ["email", "user_photos"],
	},
	pool
);

// google oauth
createOAuthStrategy(
	GoogleStrategy,
	"google",
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
	},
	pool
);

// authentication handlers
export const facebookAuth = passport.authenticate("facebook", {
	scope: ["email", "user_photos", "public_profile"],
	state: 'facebook',
});

export const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
	state: 'google',
});

export const authCallback = (req, res) => {
	if (req.user) {
		req.session.userId = req.user.id;
        req.session.accessToken = req.user.accessToken;
        return res.redirect(`http://localhost:3000/step1?provider=${req.query.state}`);
	}

	const errorMessage = req.query.error
		? "an account already exists with this email. please log in or use a different email."
		: "authentication failed.";
};

export const loginCallback = (req, res) => {
	if (req.user) {
	  req.session.userId = req.user.id;
	  return res.redirect("http://localhost:3000/home");
	} else {
	  return res.redirect("http://localhost:3000/login?error=login_failed");
	}
 };
  

export const logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			console.error("error during logout:", err);
			return res.status(500).json({ message: "error during logout" });
		}

		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.status(200).json({ message: "logout successful" });
		});
	});
};
