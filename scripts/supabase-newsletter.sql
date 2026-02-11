-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' -- active, unsubscribed
);

-- RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow insert by anon (public subscription) with basic validation
CREATE POLICY "Public can subscribe" ON subscribers
    FOR INSERT 
    WITH CHECK (
        email IS NOT NULL AND 
        length(email) > 5 AND 
        email LIKE '%@%'
    );

-- Only admin can view
-- (We'll use service role key in API)
