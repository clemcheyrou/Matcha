CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100),
    age INT CHECK (age >= 18),
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

INSERT INTO users (username, firstname, lastname, email, password, age, gender, bio, interests, auth_type, oauth_token, orientation)
VALUES 
    ('alice123','Alice', 'Dupont', 'alice@example.com', 'password123', 25, 'Woman', 'test bio', ARRAY['Vegan', 'Fitness', 'Travel'], 'local', NULL, 1),
    ('Bob21', 'Bob', 'Martin','bob@example.com', 'password456', 30, 'Man', 'test bio', ARRAY['Books', 'Art', 'Piercing'], 'local', NULL, 2),
    ('Charlie5', 'Charlie', 'Bordereau','charlie@example.com', NULL, 28, 'Woman', 'test bio', ARRAY['Music', 'Gaming', 'Travel'], 'google', 'oauth_token_example', 0),
    ('David90','David', 'Herman','david@example.com', NULL, 35, 'Man', 'test bio', ARRAY['Movies', 'Fitness'], 'facebook', 'oauth_token_example2', 1),
    ('Emma67','Emma', 'Laurent','emma@example.com', NULL, 29, 'Woman', 'test bio', ARRAY['Movies'], 'apple', 'oauth_token_example3', 2)
ON CONFLICT DO NOTHING;

DO $$ 
DECLARE 
    i INT := 1;
BEGIN
    FOR i IN 1..5 LOOP
        INSERT INTO photos (url, type, user_id) 
        VALUES 
            ('/uploads/photo_1.jpg', 'default', i),
            ('/uploads/photo_2.jpg', 'default', i),
            ('/uploads/photo_3.jpg', 'default', i),
            ('/uploads/photo_4.jpg', 'default', i),
            ('/uploads/photo_5.jpg', 'default', i);
    END LOOP;

END $$;

WITH photo_ids AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS row_num FROM photos WHERE type = 'default'
)

UPDATE users
SET profile_photo_id = (
    SELECT id FROM photo_ids WHERE row_num = users.id % (SELECT COUNT(*) FROM photo_ids) + 1
);

INSERT INTO locations (user_id, lat, lng)
VALUES 
    ((SELECT id FROM users WHERE email = 'alice@example.com'), 48.8566, 2.3522),
    ((SELECT id FROM users WHERE email = 'bob@example.com'), 48.8570, 2.3500),
    ((SELECT id FROM users WHERE email = 'charlie@example.com'), 48.8580, 2.3488),
    ((SELECT id FROM users WHERE email = 'david@example.com'), 48.8590, 2.3470),
    ((SELECT id FROM users WHERE email = 'emma@example.com'), 48.8600, 2.3460);

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
