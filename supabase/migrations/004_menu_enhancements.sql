-- Add tags and pairings to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pairings JSONB DEFAULT '[]';

-- Update RLS if needed (usually already covered by user_id owner policies)
COMMENT ON COLUMN menu_items.tags IS 'JSON array of searchable keywords (e.g., ["spicy", "vegan"])';
COMMENT ON COLUMN menu_items.pairings IS 'JSON array of menu item IDs recommended to pair with this item';
