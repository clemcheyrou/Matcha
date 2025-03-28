import passport from "passport";
import {
	createUserSocial,
	getUserByEmail,
	getUserById,
} from "../models/userModel.js";

export const createOAuthStrategy = (Strategy, provider, options) => {
	passport.use(
		new Strategy(options, async (access_token, refresh_token, profile, done) => {
			console.log("access Token: ", access_token);
			try {
				const email = profile.emails ? profile.emails[0]?.value : null;
				if (!email) return done(new Error("email not available"), null);

				if (process.env.USE_DATABASE === "true") {
					const user = await getUserByEmail(email);

					if (!user) {
						console.log("user not found...");
						const newUser = await createUserSocial(
							profile.displayName,
							email,
							provider
						);
						return done(null, { id: newUser.id, accessToken: access_token, profile });
					} else {
						console.log("user already exists, authenticating...");
						return done(null, { id: user.id, accessToken: access_token, profile });
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
