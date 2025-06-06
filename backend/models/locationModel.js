import pool from "../utils/db.js";
import { getUserGender } from "./userModel.js";

export const updateLocation = async (userId, lat, lng) => {
  const checkLocationQuery = `
	  SELECT id FROM locations WHERE user_id = $1
	`;

  const { rows } = await pool.query(checkLocationQuery, [userId]);

  if (rows.length > 0) {
    const updateLocationQuery = `
		UPDATE locations
		SET lat = $1, lng = $2
		WHERE user_id = $3
		RETURNING id, user_id, lat, lng, created_at
	  `;
    const { rows: updatedRows } = await pool.query(updateLocationQuery, [lat, lng, userId]);
    return updatedRows[0];
  } else {
    const insertLocationQuery = `
		INSERT INTO locations (user_id, lat, lng)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, lat, lng, created_at
	  `;
    const { rows: insertedRows } = await pool.query(insertLocationQuery, [userId, lat, lng]);
    return insertedRows[0];
  }
};

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
  const userGender = await getUserGender(userId);

  let otherPref = '';
  let conditions = [
    "b.blocked_user_id IS NULL"
  ];

  if (genderPreference === "Man") {
    if (userGender === 'Woman')
      otherPref = `
				u.gender = 'Man' AND u.orientation IN (0, 2)
			`;
    if (userGender === 'Man')
      otherPref = `
				u.gender = 'Man' AND u.orientation IN (1, 2)
		`;
  }
  else if (genderPreference === "Woman") {
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


  const query = `
    SELECT 
      u.id, 
      u.username, 
      l.lat, 
      l.lng
    FROM 
      users u
    JOIN 
      locations l ON u.id = l.user_id
      LEFT JOIN blocks b ON b.user_id = $1 AND b.blocked_user_id = u.id
	  WHERE ${conditions.join(" AND ")}
    `;

  const result = await pool.query(query, [userId]);

  const peopleLocations = result.rows.map(person => ({
    id: person.id,
    username: person.username,
    lat: parseFloat(person.lat),
    lng: parseFloat(person.lng),
    isCurrentUser: person.id === userId
  }));

  return peopleLocations;
};
