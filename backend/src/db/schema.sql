CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE cars (
  id UUID PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  pricing JSONB NOT NULL,
  image_url TEXT
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  driving_license_valid_until TIMESTAMP NOT NULL
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  car_id UUID REFERENCES cars(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL
);