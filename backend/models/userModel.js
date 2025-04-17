import pool from "../utils/db.js";
import {
	getFameRating,
	findDefaultUsers,
	addSharedTagsScore
  } from './algoModel.js';
  

export const getAllUsers = async () => {
	const result = await pool.query("SELECT * FROM users");
	return result.rows;
};

export const getAllLikes = async () => {
	const result = await pool.query("SELECT * FROM likes");
	return result.rows;
};

export const getUserByEmail = async (email) => {
	const result = await pool.query("SELECT * FROM users WHERE email = $1", [
		email,
	]);
	return result.rows[0];
};

export const getUserByUsername = async (username) => {
	const result = await pool.query("SELECT * FROM users WHERE username = $1", [
		username,
	]);
	return result.rows[0];
};

export const getFameRatingByUserId = async (userId) => {

	const result = await pool.query('SELECT fame_rating FROM users WHERE id = $1', [
		userId,
	]);
	return result.rows[0].fame_rating;
} 

export const updateUserVerification = async (userId) => {
	const query = "UPDATE users SET is_verified = TRUE WHERE id = $1";
	await pool.query(query, [userId]);
};

export const getUserById = async (idView, userId) => {
	const query = `
		SELECT 
			u.*,
			p.url AS profile_photo,
			CASE WHEN b.user_id IS NOT NULL THEN true ELSE false END AS blocked_by_user,
			CASE WHEN r.user_id IS NOT NULL THEN true ELSE false END AS reported_by_user,
			6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) AS distance_km,
			COALESCE(ARRAY_AGG(DISTINCT ph.url) FILTER (WHERE ph.url IS NOT NULL), '{}') AS photos,
			CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS liked_by_user,
            CASE WHEN l2.user_id IS NOT NULL THEN true ELSE false END AS liked_by_other
		FROM 
			users u
		LEFT JOIN 
			photos p ON u.profile_photo_id = p.id
		LEFT JOIN 
			photos ph ON ph.user_id = u.id
		LEFT JOIN 
			blocks b ON b.user_id = $2 AND b.blocked_user_id = u.id
		LEFT JOIN 
			reports r ON r.user_id = $2 AND r.reported_user_id = u.id
		LEFT JOIN 
			likes l ON l.user_id = $2 AND l.liked_user_id = u.id
		LEFT JOIN 
			likes l2 ON l2.user_id = u.id AND l2.liked_user_id = $2
		LEFT JOIN 
			locations loc1 ON loc1.user_id = u.id
		LEFT JOIN 
			locations loc2 ON loc2.user_id = $2
		WHERE 
			u.id = $1
		GROUP BY 
			u.id, p.url, loc1.lat, loc1.lng, loc2.lat, loc2.lng, b.user_id, r.user_id, l.user_id, l2.user_id;
	`;

	const result = await pool.query(query, [idView, userId]);
	return result.rows[0];

};

export const getUserGender = async (userId) => {
    const query = `
        SELECT gender
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.gender;
};

export const findUsersByPreference = async (userId, filters) => {

	const users = await pool.query('SELECT id FROM users');
	for (const user of users.rows) {
		const fame = await getFameRating(user.id, pool);
		await pool.query('UPDATE users SET fame_rating = $1 WHERE id = $2', [fame, user.id]);
	}

    let orderByClause = "";
    let values = [userId];
    let conditions = [
        "u.id <> $1",
        "m.user_1_id IS NULL",
        "m.user_2_id IS NULL",
        "b.blocked_user_id IS NULL"
    ];

    let paramIndex = 2;

    if (filters.genderPreference === "Man" || filters.genderPreference === "Woman") {
        conditions.push(`u.gender = $${paramIndex}`);
        values.push(filters.genderPreference);
        paramIndex++;
    }

    const isPhotoQuery = `
        SELECT 1
        FROM photos p
        JOIN users u ON u.profile_photo_id = p.id
        WHERE u.id = $1
    `;
    const photoCheckResult = await pool.query(isPhotoQuery, [userId]);

    if (photoCheckResult.rows.length === 0)
        return [];

    if (filters.ageRange && filters.ageRange.length === 2) {
		conditions.push(`u.age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(filters.ageRange[0], filters.ageRange[1]);
        paramIndex += 2;
		
    }

	let flagFiltreTags = false;
	if (filters.tags && filters.tags.length > 0) {
		const tagArray = filters.tags.map(tag => `'${tag}'`).join(", ");
		flagFiltreTags = true;
	}

    if (filters.locationRange && filters.locationRange.length === 2) {
        conditions.push(`6371 * acos( cos(radians(loc1.lat)) * cos(radians(loc2.lat)) * cos(radians(loc2.lng) - radians(loc1.lng)) + sin(radians(loc1.lat)) * sin(radians(loc2.lat)) ) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        values.push(filters.locationRange[0], filters.locationRange[1]);
        paramIndex += 2;
    }

	if (filters.fameRange && filters.fameRange.length === 2) {
		conditions.push(`u.fame_rating BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
		values.push(filters.fameRange[0], filters.fameRange[1]);
		paramIndex += 2;
	}
	
	const userGender = await getUserGender(userId);

    let otherPref = '';
    if (filters.genderPreference === "Man") {
		if (userGender === 'Woman')
			otherPref = `
				u.gender = 'Man' AND u.orientation IN (0, 2)
			`;
		if (userGender === 'Man')
			otherPref = `
				u.gender = 'Man' AND u.orientation IN (1, 2)
		`;
    }
	else if (filters.genderPreference === "Woman") {
		if (userGender === 'Man')
			otherPref = `
				u.gender = 'Man' AND u.orientation IN (0, 2)
			`;
		if (userGender === 'Woman')
			otherPref = `
				u.gender = 'Woman' AND u.orientation IN (1, 2)
		`;
	}
	else {
		if (userGender === 'Man')
			otherPref = `
				u.gender = 'Man' AND u.orientation IN (1, 2)
				OR u.gender = 'Woman' AND u.orientation IN (0, 2)
			`;
		if (userGender === 'Woman')
			otherPref = `
				u.gender = 'Woman' AND u.orientation IN (1, 2)
				OR u.gender = 'Man' AND u.orientation IN (0, 2)
		`;	
	}
    if (otherPref) {
        conditions.push(otherPref);
    }

    let query = `
		SELECT 
			u.id,
			u.username,
			u.orientation,
			u.firstname,
			u.lastname,
			u.age, 
			u.gender, 
			u.bio, 
			u.interests,
			u.is_connected,
			u.last_connected_at,
			u.fame_rating,
			p.url AS profile_photo,
			6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) AS distance_km,
			CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS liked_by_user,
			CASE WHEN l2.user_id IS NOT NULL THEN true ELSE false END AS liked_by_other
		FROM 
			users u
		LEFT JOIN photos p ON u.profile_photo_id = p.id
		LEFT JOIN matches m ON (m.user_1_id = u.id AND m.user_2_id = $1) OR (m.user_1_id = $1 AND m.user_2_id = u.id)
		LEFT JOIN likes l ON l.user_id = $1 AND l.liked_user_id = u.id
		LEFT JOIN likes l2 ON l2.user_id = u.id AND l2.liked_user_id = $1
		LEFT JOIN blocks b ON b.user_id = $1 AND b.blocked_user_id = u.id
		LEFT JOIN locations loc1 ON loc1.user_id = u.id
		LEFT JOIN locations loc2 ON loc2.user_id = $1
		WHERE ${conditions.join(" AND ")}
	`;

	console.log("filters.sortBy ", filters.sortBy, " | filters.tags.length = ", filters.tags.length);
    if (filters.sortBy != "pertinent") {
        if (filters.sortBy === "tag") {
			const result = await pool.query(query, values);
			const sortByCommunTags = await addSharedTagsScore(userId, result.rows, pool);
			return sortByCommunTags;

        } else if (filters.sortBy === "ageAsc") {
            orderByClause = "ORDER BY u.age ASC";
        } else if (filters.sortBy === "ageDesc") {
            orderByClause = "ORDER BY u.age DESC";
        } else if (filters.sortBy === "loc") {
            orderByClause = "ORDER BY distance_km ASC";
        } else if (filters.sortBy === "popAsc") {
            orderByClause = "ORDER BY u.fame_rating ASC";
        } else if (filters.sortBy === "popDesc") {
            orderByClause = "ORDER BY u.fame_rating DESC";
        }
		query += orderByClause;

		const result = await pool.query(query, values);
		return result.rows;
    }
	const isNoFiltersApplied = 
    (filters.ageRange[0] === 0 && filters.ageRange[1] === 100) &&
    (filters.locationRange[0] === 0 && filters.locationRange[1] === 1000) &&
    (filters.fameRange[0] === 0 && filters.fameRange[1] === 100) &&
    (!filters.tags || filters.tags.length === 0) && filters.sortBy === "pertinent" 
	&& !flagFiltreTags;

	if (isNoFiltersApplied) {
		const matchs = await findDefaultUsers(userId, pool, filters);
		return matchs;
	}

    query += orderByClause;

    const result = await pool.query(query, values);
	
	if (flagFiltreTags === true) {
		let users = result.rows;
		const tagsCount = filters.tags.length;
		let matchingUsers = [];
	
		users = users.filter(user => {
			if (!user.interests || user.interests.length === 0) return false;
	
			const matchCount = user.interests.filter(tag => filters.tags.includes(tag)).length;
			//console.log(`Utilisateur ${user.username}: Nombre de correspondances de tags: ${matchCount}`);
			if (matchCount === tagsCount) {
				matchingUsers.push(user);
				return true;
			}
			return false;
		});
		//console.log("Utilisateurs correspondants:", matchingUsers);
		return matchingUsers;
	}
    return result.rows;
};

export const getAllUserPhotos = async (userId) => {
	try {
		const query =
			"SELECT id, url, created_at FROM photos WHERE user_id = $1";
		const values = [userId];
		const result = await pool.query(query, values);

		return result.rows || [];
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des photos de l'utilisateur:",
			error
		);
		throw error;
	}
};

export const addUserGender = async (gender, userId) => {
	try {
		const query = `
      UPDATE users
      SET gender = $1
      WHERE id = $2
      RETURNING *;
    `;

		const result = await pool.query(query, [gender, userId]);

		if (result.rowCount === 0) {
			return null;
		}

		return result.rows[0];
	} catch (error) {
		console.error("Error updating gender:", error);
		throw error;
	}
};

export const createUser = async (username, lastname, firstname, email, hashedPassword, age, gender) => {
    const query = `
        INSERT INTO users (username, lastname, firstname, email, password, age, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `;
    const values = [username, lastname, firstname, email, hashedPassword, age, gender];

    const result = await pool.query(query, values);
    return result.rows[0].id;
};

export const deleteUser = async (userId) => {
	const query = "DELETE FROM users WHERE id = $1 RETURNING id";
	const values = [userId];

	const result = await pool.query(query, values);
	return result.rowCount > 0;
};

export const createUserSocial = async (username, email, firstname, lastname, provider) => {
	const query = `
	  INSERT INTO users (username, email, firstname, lastname, password, auth_type, is_verified)
	  VALUES ($1, $2, $3, $4, $5, $6, true)
	  RETURNING id, created_at;
	`;
	const { rows } = await pool.query(query, [username, email, firstname, lastname, null, provider]);
	return rows[0];
};


export const findPhotoByIdAndUser = async (photoId, userId) => {
	const query = "SELECT id, type FROM photos WHERE id = $1 AND user_id = $2";
	const values = [photoId, userId];
	const result = await pool.query(query, values);
	return result.rows[0];
};

export const deletePhotoByIdAndUser = async (photoId, userId) => {
	const query = "DELETE FROM photos WHERE id = $1 AND user_id = $2";
	const values = [photoId, userId];
	await pool.query(query, values);
};

export const findNextUserPhoto = async (userId) => {
	const query = `
    SELECT id FROM photos 
    WHERE user_id = $1 
    ORDER BY created_at ASC LIMIT 1
  `;
	const values = [userId];
	const result = await pool.query(query, values);
	return result.rows[0]?.id || null;
};

export const updateUserProfilePhoto = async (userId, photoId) => {
	const query = "UPDATE users SET profile_photo_id = $1 WHERE id = $2";
	const values = [photoId, userId];
	await pool.query(query, values);
};

export const updateGenderBio = async (userId, gender, bio, age) => {
	const query = `
    UPDATE users
    SET gender = $1, bio = $2, age = $3
    WHERE id = $4
    RETURNING id, gender, bio, age;
  `;
	const values = [gender, bio, age, userId];
	const result = await pool.query(query, values);
	return result.rows[0];
};

export const updateOrientation = async (userId, orientation) => {
	const query = `
    UPDATE users
    SET orientation = $1
    WHERE id = $2;
  `;
	const values = [orientation, userId];
	const result = await pool.query(query, values);
};

export const updateInterests = async (userId, interests) => {
	const query = `
    UPDATE users
    SET interests = $1,
        onboarding = TRUE
    WHERE id = $2;
  `;
	const values = [interests, userId];
	await pool.query(query, values);
};

export const findUsersInMatch = async (userId) => {
	const query = `
	  SELECT 
		u.id, 
		u.username,
		u.firstname,
		u.lastname, 
		u.age, 
		u.gender, 
		u.bio, 
		u.interests, 
		u.location,
		u.is_connected,
		p.url AS profile_photo,
		EXISTS (
		  SELECT 1 FROM likes WHERE user_id = $1 AND liked_user_id = u.id
		) AS liked_by_user
	  FROM 
		users u
	  LEFT JOIN 
		photos p ON u.profile_photo_id = p.id
	  LEFT JOIN 
		matches m ON (m.user_1_id = u.id AND m.user_2_id = $1) OR (m.user_1_id = $1 AND m.user_2_id = u.id)
	  LEFT JOIN blocks b ON b.user_id = $1 AND b.blocked_user_id = u.id 
	  WHERE 
		(m.user_1_id = $1 OR m.user_2_id = $1)
		AND b.blocked_user_id IS NULL
	  GROUP BY 
		u.id, p.url;
	`;
	const result = await pool.query(query, [userId]);
	return result.rows;
};
 
export const updateUserProfile = async (userId, updates) => {
	const fieldsToUpdate = [];
	const values = [];

	const userWithNewEmail = await getUserByEmail(updates.email);
	if (userWithNewEmail && userWithNewEmail.id !== userId) {
		return res.status(409).json({ message: "email_exists" });
	}

	if (updates.firstname) {
		fieldsToUpdate.push("firstname = $" + (fieldsToUpdate.length + 1));
		values.push(updates.firstname);
	}

	if (updates.lastname) {
		fieldsToUpdate.push("lastname = $" + (fieldsToUpdate.length + 1));
		values.push(updates.lastname);
	}

	if (updates.email) {
		fieldsToUpdate.push("email = $" + (fieldsToUpdate.length + 1));
		values.push(updates.email);
	}

	if (updates.age !== undefined) {
		fieldsToUpdate.push("age = $" + (fieldsToUpdate.length + 1));
		values.push(updates.age);
	}
	if (updates.sexualPreference !== undefined) {
		fieldsToUpdate.push("orientation = $" + (fieldsToUpdate.length + 1));
		values.push(updates.sexualPreference);
	}
	if (updates.gender) {
		fieldsToUpdate.push("gender = $" + (fieldsToUpdate.length + 1));
		values.push(updates.gender);
	}
	if (updates.biography) {
		fieldsToUpdate.push("bio = $" + (fieldsToUpdate.length + 1));
		values.push(updates.biography);
	}
	if (updates.location) {
		fieldsToUpdate.push("location = $" + (fieldsToUpdate.length + 1));
		values.push(updates.location);
	}
	if (updates.interests) {
		fieldsToUpdate.push("interests = $" + (fieldsToUpdate.length + 1));
		values.push(updates.interests);
	}
	if (updates.profilePicture) {
		fieldsToUpdate.push(
			"profile_photo_id = $" + (fieldsToUpdate.length + 1)
		);
		values.push(updates.profilePicture);
	}

	if (fieldsToUpdate.length === 0) {
		throw new Error("No fields to update");
	}

	const query = `
      UPDATE users
      SET ${fieldsToUpdate.join(", ")}
      WHERE id = $${fieldsToUpdate.length + 1}
      RETURNING *;
  `;

	values.push(userId);

	const result = await pool.query(query, values);

	if (result.rowCount === 0) {
		throw new Error("User not found");
	}
	console.log(result.rows[0])
	return result.rows[0];
};
