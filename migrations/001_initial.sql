CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_one_id, user_two_id)
);

CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    conflict_level INTEGER CHECK (conflict_level >= 1 AND conflict_level <= 5),
    communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 5),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_check_ins_user_created ON check_ins(user_id, created_at);