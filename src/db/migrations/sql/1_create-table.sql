CREATE TABLE profiles(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  firstName VARCHAR ( 50 ) NOT NULL,
  lastName VARCHAR ( 50 ),
  state VARCHAR ( 50 ) CONSTRAINT state_enums CHECK (state IN ('male', 'female', 'other'))
);

CREATE TABLE users(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR ( 50 ) UNIQUE NOT NULL,
  email VARCHAR ( 50 ) UNIQUE NOT NULL,
  role VARCHAR ( 50 ) CONSTRAINT role_enums CHECK (role IN ('admin', 'user')),
  dateCreated TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
  profileId INTEGER,
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE 
);

