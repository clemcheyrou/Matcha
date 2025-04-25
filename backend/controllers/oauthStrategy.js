import passport from "passport";
import {
	createUserSocial,
	getUserByEmail,
	getUserById,
} from "../models/userModel.js";
import {getUserByUsername} from "../models/userModel.js"
import pool from "../utils/db.js";

export const createOAuthStrategy = (Strategy, provider, options) => {
	passport.use(
		new Strategy(options, async (access_token, refresh_token, profile, done) => {
			try {
				const email = profile.emails ? profile.emails[0]?.value : null;
				if (!email) return done(new Error("email not available"), null);

				let firstname = "";
				let lastname = "";

				if (profile.name) {
					firstname = profile.name.givenName || "";
					lastname = profile.name.familyName || "";
				}

				const baseUsername = `${firstname}.${lastname}`.toLowerCase();
				const username = await generateUniqueUsername(baseUsername);

				if (process.env.USE_DATABASE === "true") {
					const userMail = await getUserByEmail(email);
					const userUsername = await getUserByUsername(username);

					if (userMail) {
						if (userMail.auth_type !== provider) {
							return done(null);
						}
					}

					if (!userMail && !userUsername) {
						const newUser = await createUserSocial(
							username,
							email,
							firstname,
							lastname,
							provider
						);
						return done(null, { id: newUser.id, accessToken: access_token, profile });
					} else {
						await pool.query(`
							INSERT INTO user_connections (user_id, connected_at)
							VALUES ($1, CURRENT_TIMESTAMP);
						`, [userMail.id]);
						return done(null, { id: userMail.id, accessToken: access_token, profile });
					}
				}
			} catch (err) {
				console.error(`authentication error with ${provider}:`, err);
				return done(err);
			}
		})
	);

	passport.serializeUser((user, done) => {
		done(null, { id: user.id, accessToken: user.accessToken });
	});

	passport.deserializeUser(async (data, done) => {
		try {
			const user = await getUserById(data.id);

			if (!user) return done(new Error("user not found"));

			user.accessToken = data.accessToken;
			done(null, user);
		} catch (err) {
			done(err);
		}
	});
};

const generateUniqueUsername = async (baseUsername) => {
	let username = baseUsername.toLowerCase().replace(/\s+/g, '');
	let suffix = 0;
	let finalUsername = username;

	while (await getUserByUsername(finalUsername)) {
		suffix++;
		finalUsername = `${username}${suffix}`;
	}

	return finalUsername;
};