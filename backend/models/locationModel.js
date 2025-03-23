import pool from "../utils/db.js";

// export const updateLocation = async (userId, lat, lng) => {
//     const query = `
//       UPDATE locations
//       SET lat = $1, lng = $2
//       WHERE user_id = $3
//       RETURNING id, lat, lng, created_at
//     `
//     const values = [userId, lat, lng];

//     const { rows } = await pool.query(query, values);
//     const updateUserQuery = `
//         UPDATE users
//         SET location = true
//         WHERE id = $1`;
//     await pool.query(updateUserQuery, [userId]);

//     return rows[0];
// };

export const createLocation = async (userId, lat, lng) => {
  const query = `
    INSERT INTO locations (user_id, lat, lng)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, lat, lng, created_at
  `;
  const values = [userId, lat, lng];

  const { rows } = await pool.query(query, values);

  const updateUserQuery = `
    UPDATE users
    SET location = true
    WHERE id = $1
  `;
  await pool.query(updateUserQuery, [userId]);

  return rows[0];
};

export const getAllUsersLocations = async (userId, genderPreference) => {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      l.lat, 
      l.lng
    FROM 
      users u
    JOIN 
      locations l ON u.id = l.user_id
	WHERE 
    	u.gender = $1
    `;

  const result = await pool.query(query, [genderPreference]);

  const peopleLocations = result.rows.map(person => ({
    id: person.id,
    name: person.name,
    lat: parseFloat(person.lat),
    lng: parseFloat(person.lng),
    isCurrentUser: person.id === userId
  }));

  return peopleLocations;
};
