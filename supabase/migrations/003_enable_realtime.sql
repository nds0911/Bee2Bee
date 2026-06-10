-- Enable real-time for it_products table
ALTER PUBLICATION supabase_realtime ADD TABLE it_products;

-- Note: You may need to manually enable real-time in the Supabase dashboard:
-- 1. Go to Database → Replication
-- 2. Enable "it_products" table for real-time
