CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    bio TEXT,
    interests TEXT[],
    onboarding BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT FALSE,
    last_connected_at TIMESTAMP,
    auth_type VARCHAR(20) DEFAULT 'local',
    oauth_token TEXT,
    orientation INTEGER CHECK (orientation IN (0, 1, 2)),
    profile_photo_id INTEGER,
	location BOOLEAN DEFAULT FALSE,
    fame_rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    lat DECIMAL(9, 6),
    lng DECIMAL(9, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE photos ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_profile_photo FOREIGN KEY (profile_photo_id) 
REFERENCES photos(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    liked_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (user_id, liked_user_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_liked_user FOREIGN KEY (liked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blocked_user FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    reported_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_report UNIQUE (user_id, reported_user_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user_1_id INT NOT NULL,
    user_2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_match UNIQUE (user_1_id, user_2_id),
    CONSTRAINT fk_user1 FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user2 FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_match_pair CHECK (user_1_id < user_2_id)
);

CREATE INDEX idx_likes_user_liked_user ON likes (user_id, liked_user_id);
CREATE INDEX idx_matches_user1_user2 ON matches (user_1_id, user_2_id);

DO $$
DECLARE 
    i INT := 1;
    firstnames_men TEXT[] := ARRAY['Alex', 'Bob', 'Charles', 'David', 'Lucas', 'Maxime', 'Nathan', 'Thomas', 'Leo', 'Arthur'];
    firstnames_women TEXT[] := ARRAY['Emma', 'Sophie', 'Chloe', 'Camille', 'Manon', 'Jade', 'Lina', 'Louise', 'Gabrielle', 'Camille'];
    lastnames TEXT[] := ARRAY['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefevre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'];
    all_interests TEXT[] := ARRAY['Vegan', 'Geek', 'Piercing', 'Music', 'Gaming', 'Fitness', 'Travel', 'Books', 'Movies', 'Art'];
    user_interests TEXT[];
    firstname TEXT;
    lastname TEXT;
    username TEXT;
    email TEXT;
    password TEXT;
    gender TEXT;
    orientation INT;
    bio TEXT := 'test bio';
    lat_base FLOAT[] := ARRAY[48.8566, 48.8570, 48.8580, 48.8590, 48.8600];
    lng_base FLOAT[] := ARRAY[2.3522, 2.3500, 2.3488, 2.3470, 2.3460];
    lat FLOAT;
    lng FLOAT;
    loc_index INT;
    user_id INT;
    interest_count INT;
BEGIN
    FOR i IN 1..500 LOOP

        IF i % 2 = 0 THEN
            gender := 'Man';
            firstname := firstnames_men[1 + (random() * (array_length(firstnames_men, 1) - 1))::INT];
        ELSE
            gender := 'Woman';
            firstname := firstnames_women[1 + (random() * (array_length(firstnames_women, 1) - 1))::INT];
        END IF;

        lastname := lastnames[1 + (random() * (array_length(lastnames, 1) - 1))::INT];
        username := lower(firstname || '_' || lastname || '_' || i);
        email := username || '@example.com';
        password := 'password' || i;
        orientation := i % 3;

        interest_count := 2 + (random() * 4)::INT;
        user_interests := ARRAY(SELECT unnest(all_interests) ORDER BY random() LIMIT interest_count);

        INSERT INTO users (username, firstname, lastname, email, password, age, gender, bio, interests, auth_type, oauth_token, orientation)
        VALUES (
            username, firstname, lastname, email, password,
            18 + (i % 40), gender, bio, user_interests,
            'local', NULL, orientation
        )
        RETURNING id INTO user_id;

        IF gender = 'Man' THEN
            INSERT INTO photos (url, type, user_id) 
            VALUES 
                ('/uploads/photo_6.jpg', 'default', user_id),
                ('/uploads/photo_7.jpg', 'default', user_id),
                ('/uploads/photo_8.jpg', 'default', user_id),
                ('/uploads/photo_9.jpg', 'default', user_id),
                ('/uploads/photo_10.jpg', 'default', user_id);
        ELSE
            INSERT INTO photos (url, type, user_id) 
            VALUES 
                ('/uploads/photo_1.jpg', 'default', user_id),
                ('/uploads/photo_2.jpg', 'default', user_id),
                ('/uploads/photo_3.jpg', 'default', user_id),
                ('/uploads/photo_4.jpg', 'default', user_id),
                ('/uploads/photo_5.jpg', 'default', user_id);
        END IF;

        UPDATE users
        SET profile_photo_id = (
            SELECT id FROM photos 
            WHERE photos.user_id = users.id
            ORDER BY id ASC
            LIMIT 1
        )
        WHERE users.id = user_id;

        loc_index := (i % 5) + 1;
        lat := lat_base[loc_index] + ((random() - 0.5) / 1000);
        lng := lng_base[loc_index] + ((random() - 0.5) / 1000);

        INSERT INTO locations (user_id, lat, lng)
        VALUES (user_id, lat, lng);
    END LOOP;
END $$;


INSERT INTO reports (user_id, reported_user_id)
VALUES (1, 2);

CREATE TABLE IF NOT EXISTS chat (
    id SERIAL PRIMARY KEY,
    user_1_id INT NOT NULL,
    user_2_id INT NOT NULL,
    CONSTRAINT fk_user1 FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user2 FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    message TEXT,
    author_id INT NOT NULL,
    conversation_id INT NOT NULL,
	audio_path TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    media_url TEXT,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES chat(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    sender_id INT,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE profile_views (
    id SERIAL PRIMARY KEY,
    viewer_id INT REFERENCES users(id),
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_view CHECK (viewer_id <> user_id)
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  heure TIME NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  invitation_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_connections (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);