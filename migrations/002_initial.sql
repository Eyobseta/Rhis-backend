-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- USERS
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- RELATIONSHIPS
-- ================================
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Prevent duplicate relationships (A,B) and (B,A)
CREATE UNIQUE INDEX unique_relationship_pair
ON relationships (
    LEAST(user_one_id, COALESCE(user_two_id, user_one_id)),
    GREATEST(user_one_id, COALESCE(user_two_id, user_one_id))
);

-- ================================
-- CHECK-INS
-- ================================
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,

    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    conflict_level INTEGER CHECK (conflict_level >= 1 AND conflict_level <= 5),
    communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 5),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Fast dashboard queries
CREATE INDEX idx_checkins_user_created 
ON check_ins(user_id, created_at DESC);

CREATE INDEX idx_checkins_rel_created 
ON check_ins(relationship_id, created_at DESC);

-- ================================
-- EVENTS (FOR ADVANCED INSIGHTS)
-- ================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    type VARCHAR(50) NOT NULL, -- 'argument', 'positive', 'no_communication'
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    note TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_relationship_created 
ON events(relationship_id, created_at DESC);

-- ================================
-- OPTIONAL (FUTURE OPTIMIZATION)
-- DASHBOARD CACHE (NOT REQUIRED NOW)
-- ================================
CREATE TABLE relationship_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID UNIQUE REFERENCES relationships(id) ON DELETE CASCADE,

    health_score INTEGER,
    status VARCHAR(20),

    updated_at TIMESTAMP DEFAULT NOW()
);