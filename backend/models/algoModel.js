import pool from "../utils/db.js";
import {getUserGender, getAllUsers} from "./userModel.js"

export async function findDefaultUsers (userId, pool, filters) {
    try {
		
		let values = [userId];
		let conditions = [
			"u.id <> $1",
			"m.user_1_id IS NULL",
			"m.user_2_id IS NULL",
			"b.blocked_user_id IS NULL"
		];

		const isPhotoQuery = `
			SELECT 1
			FROM photos p
			JOIN users u ON u.profile_photo_id = p.id
			WHERE u.id = $1
		`;
		const photoCheckResult = await pool.query(isPhotoQuery, [userId]);

		if (photoCheckResult.rows.length === 0)
			return [];

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
		//console.log("Requête SQL générée :", query);

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No profiles' });
        }

		//console.log('Profils récupérés :', result.rows);
		if (result.rows.length > 1)
		{
			const profilesWithSharedTags = await addSharedTagsScore(userId, result.rows, pool);
			
			const profilesDistances = await addDistanceScore(userId, profilesWithSharedTags, pool)
		
			const Finalprofiles = await addFameRating(profilesDistances, pool);
			
			Finalprofiles.sort((a, b) => {
                const scoreA = ((a.sharedTagCount || 0) * 0.3) + (a.fameRating * 0.3) + ((a.distance > 0 ? (1 / a.distance) : 0) * 0.6);
                const scoreB = ((b.sharedTagCount || 0) * 0.3) + (b.fameRating * 0.3) + ((b.distance > 0 ? (1 / b.distance) : 0) * 0.6);
                
                if (scoreA < scoreB) return 1;
                if (scoreA > scoreB) return -1;
                return 0;
            });

			// Finalprofiles.forEach(user => {
			// 	console.log(`ID: ${user.id}, Username: ${user.username}, Score: ${((user.sharedTagCount || 0) * 0.3) + (user.fameRating * 0.3) + ((user.distance > 0 ? (1 / user.distance) : 0) * 0.6)}`);
			// });
			return Finalprofiles;
		}
		
        return result.rows;
    } catch (error) {
        console.error('Error during profile recovery :', error);
        return [];
    }
};

export const getFameRating = async (userId, pool) => {

    const viewsResult = await pool.query('SELECT COUNT(*) AS views FROM profile_views WHERE user_id = $1', [userId]);
    const likesResult = await pool.query('SELECT COUNT(*) AS likes FROM likes WHERE liked_user_id = $1', [userId]);
    const blocksResult = await pool.query('SELECT COUNT(*) AS blocks FROM blocks WHERE blocked_user_id = $1', [userId]);
    const reportsResult = await pool.query('SELECT COUNT(*) AS reports FROM reports WHERE reported_user_id = $1', [userId]);
    const connectionsResult = await pool.query('SELECT COUNT(*) AS connections FROM user_connections WHERE user_id = $1', [userId]);

    const views = parseInt(viewsResult.rows[0].views || 0);
    const likes = parseInt(likesResult.rows[0].likes || 0);
    const blocks = parseInt(blocksResult.rows[0].blocks || 0);
    const reports = parseInt(reportsResult.rows[0].reports || 0);
    const connections = parseInt(connectionsResult.rows[0].connections || 0);


    let fameRating = (views * 0.4) + (likes * 0.5) + (connections * 0.4) - (blocks * 0.25) - (reports * 0.3);
    
	let normalized = (fameRating / 20) * 100;
    normalized = Math.max(normalized, 0);
    normalized = Math.min(normalized, 100);

	//console.log('Normalized value: ID = ',userId, "fame => ", normalized);
    return Math.round(normalized);
};

export async function addSharedTagsScore (userId, users, pool) {
	try {
		const currentUserInterestsResult = await pool.query(
			'SELECT interests FROM users WHERE id = $1',
			[userId]
		);
		const currentUserTags = currentUserInterestsResult.rows[0]?.interests || [];

		const enrichedUsers = users.map(user => {

			const userTags = user.interests || [];
			const sharedTags = userTags.filter(tag => currentUserTags.includes(tag));

			const sharedTagCount = sharedTags.length;

			return {
				...user,
				sharedTags,
				sharedTagCount
			};
		});

		enrichedUsers.sort((a, b) => b.sharedTagCount - a.sharedTagCount);
		
		return enrichedUsers;

	} catch (err) {
		console.error("Erreur dans addSharedTagsScore:", err);
		return users;
	}
};

export async function addDistanceScore(userId, users, pool) {
	try {

		const userLocRes = await pool.query(
			`SELECT lat, lng FROM locations WHERE user_id = $1`,
			[userId]
		);
		const userLoc = userLocRes.rows[0];

		if (!userLoc) {
			console.warn("No location found");
			return users;
		}

		const usersWithDistance = [];

		for (const user of users) {
			const targetLocRes = await pool.query(
				`SELECT lat, lng FROM locations WHERE user_id = $1`,
				[user.id]
			);
			const targetLoc = targetLocRes.rows[0];

			if (!targetLoc) {
				console.warn(`No location found for user ${user.id}`);
				continue;
			}

			const distance = await calculateDistance(parseFloat(userLoc.lat), parseFloat(userLoc.lng), parseFloat(targetLoc.lat), parseFloat(targetLoc.lng));
			
			usersWithDistance.push({
				...user,
				distance
			});
		}

		usersWithDistance.sort((a, b) => a.distance - b.distance);

		return usersWithDistance;

	} catch (err) {
		console.error("Error in addDistanceScore:", err);
		return users;
	}
};

export async function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

export async function addFameRating (users, pool)  {
	try {
		const FameUsers = [];

		for (const user of users) {
			const result = await pool.query(
				'SELECT fame_rating FROM users WHERE id = $1',
				[user.id]
			);

			const fameRating = result.rows[0]?.fame_rating || 0;

			FameUsers.push({
				...user,
				fameRating,
			});
		}

		FameUsers.sort((a, b) => b.fameRating - a.fameRating);

		return FameUsers;

	} catch (err) {
		console.error("Error in addFameRating:", err);
		return users;
	}
};

export async function getUsersByAgeRange (users, pool, minAge, maxAge, userId) {

	try {
		const userIds = users.map(user => user.id);

		if (userIds.length === 0) {
			return [];
		}
	
		const query = `
			SELECT 
			u.id,
			u.username,
			u.orientation,
			u.firstname,
			u.lastname,
			u.age, 
			u.gender, 
			u.interests,
			u.is_connected,
			u.fame_rating,
			u.last_connected_at,
			p.url AS profile_photo,
			6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) AS distance_km,
			CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS liked_by_user,
			CASE WHEN l2.user_id IS NOT NULL THEN true ELSE false END AS liked_by_other
			FROM users u
			LEFT JOIN photos p ON u.profile_photo_id = p.id
			LEFT JOIN matches m ON (m.user_1_id = u.id AND m.user_2_id =$4) OR (m.user_1_id = $4 AND m.user_2_id = u.id)
			LEFT JOIN likes l ON l.user_id = $4 AND l.liked_user_id = u.id
			LEFT JOIN likes l2 ON l2.user_id = u.id AND l2.liked_user_id = $4
			LEFT JOIN blocks b ON b.user_id = $4 AND b.blocked_user_id = u.id
			LEFT JOIN locations loc1 ON loc1.user_id = u.id
			LEFT JOIN locations loc2 ON loc2.user_id = $4
			WHERE u.id <> $4
			AND u.id = ANY($1::int[])
			AND age BETWEEN $2 AND $3
		`;
		const values = [userIds, minAge, maxAge, userId];
	
		const result = await pool.query(query, values);

		return result.rows;

	} catch (error) {
	  console.error('Error getUsersByAgeRange : ', error);
	  throw error;
	}
};

export async function getUsersByLocRange(users, pool, minLoc, maxLoc, userId) {

	try {
		const userIds = users.map(user => user.id);

		if (userIds.length === 0) {
			return [];
		}
	
		const query = `
			SELECT 
			u.id,
			u.username,
			u.orientation,
			u.firstname,
			u.lastname,
			u.age, 
			u.gender, 
			u.interests,
			u.is_connected,
			u.fame_rating,
			u.last_connected_at,
			p.url AS profile_photo,
			6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) AS distance_km,
			CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS liked_by_user,
			CASE WHEN l2.user_id IS NOT NULL THEN true ELSE false END AS liked_by_other
			FROM users u
			LEFT JOIN photos p ON u.profile_photo_id = p.id
			LEFT JOIN matches m ON (m.user_1_id = u.id AND m.user_2_id =$4) OR (m.user_1_id = $4 AND m.user_2_id = u.id)
			LEFT JOIN likes l ON l.user_id = $4 AND l.liked_user_id = u.id
			LEFT JOIN likes l2 ON l2.user_id = u.id AND l2.liked_user_id =$4
			LEFT JOIN blocks b ON b.user_id = $4 AND b.blocked_user_id = u.id
			LEFT JOIN locations loc1 ON loc1.user_id = u.id
			LEFT JOIN locations loc2 ON loc2.user_id =$4
			WHERE u.id <>$4
			AND u.id = ANY($1::int[])
			AND 6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) BETWEEN $2 AND $3
		`;
		const values = [userIds, minLoc, maxLoc, userId];
	
		const result = await pool.query(query, values);

		return result.rows;

	} catch (error) {
	  console.error('Error getUsersByLocRange : ', error);
	  throw error;
	}
};  

export async function getUsersByFameRatingRange(users, pool, minFame, maxFame, userId) {

	try {
		const userIds = users.map(user => user.id);

		if (userIds.length === 0) {
			return [];
		}
	
		const query = `
			SELECT 
			u.id,
			u.username,
			u.orientation,
			u.firstname,
			u.lastname,
			u.age, 
			u.gender, 
			u.interests,
			u.fame_rating,
			u.is_connected,
			u.last_connected_at,
			p.url AS profile_photo,
			6371 * acos(
				cos(radians(loc1.lat)) * cos(radians(loc2.lat)) *
				cos(radians(loc2.lng) - radians(loc1.lng)) +
				sin(radians(loc1.lat)) * sin(radians(loc2.lat))
			) AS distance_km,
			CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS liked_by_user,
			CASE WHEN l2.user_id IS NOT NULL THEN true ELSE false END AS liked_by_other
			FROM users u
			LEFT JOIN photos p ON u.profile_photo_id = p.id
			LEFT JOIN matches m ON (m.user_1_id = u.id AND m.user_2_id =$4) OR (m.user_1_id = $4 AND m.user_2_id = u.id)
			LEFT JOIN likes l ON l.user_id = $4 AND l.liked_user_id = u.id
			LEFT JOIN likes l2 ON l2.user_id = u.id AND l2.liked_user_id =$4
			LEFT JOIN blocks b ON b.user_id = $4 AND b.blocked_user_id = u.id
			LEFT JOIN locations loc1 ON loc1.user_id = u.id
			LEFT JOIN locations loc2 ON loc2.user_id =$4
			WHERE u.id <>$4
			AND u.id = ANY($1::int[])
			AND u.fame_rating BETWEEN $2 AND $3
		`;
		const values = [userIds, minFame, maxFame, userId];
	
		const result = await pool.query(query, values);

		//console.log("fAME = ", result.rows);
		return result.rows;

	} catch (error) {
	  console.error('Error getUsersByFameRatingRange : ', error);
	  throw error;
	}
}; 

  


