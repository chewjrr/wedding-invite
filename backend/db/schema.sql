-- backend/db/schema.sql
CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at DESC);