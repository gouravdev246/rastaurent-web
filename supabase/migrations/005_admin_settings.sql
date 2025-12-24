-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    is_ai_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own settings
IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_settings' AND policyname = 'Users can manage own settings'
) THEN
    CREATE POLICY "Users can manage own settings"
    ON admin_settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END IF;

-- Policy: Public can read settings (for customer app)
IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_settings' AND policyname = 'Public can read settings'
) THEN
    CREATE POLICY "Public can read settings"
    ON admin_settings
    FOR SELECT
    TO anon
    USING (true);
END IF;
