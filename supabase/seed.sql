-- Seed IT Products
INSERT INTO it_products (name, category, description, price, image_url, in_stock) VALUES
  (
    'MacBook Pro 16" M3 Max',
    'Laptops',
    'Apple M3 Max chip, 36GB RAM, 1TB SSD. Perfect for development and creative work.',
    3499.00,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    true
  ),
  (
    'Dell XPS 15',
    'Laptops',
    'Intel Core i7, 32GB RAM, 512GB SSD. High-performance Windows laptop.',
    1899.00,
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
    true
  ),
  (
    'ThinkPad X1 Carbon',
    'Laptops',
    'Intel Core i5, 16GB RAM, 256GB SSD. Lightweight and durable business laptop.',
    1399.00,
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    true
  ),
  (
    'LG UltraWide 34" Monitor',
    'Monitors',
    '34-inch curved ultrawide display, 3440x1440 resolution, USB-C connectivity.',
    599.00,
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    true
  ),
  (
    'Dell U2723DE Monitor',
    'Monitors',
    '27-inch 4K monitor with IPS panel and USB-C hub.',
    449.00,
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400',
    true
  ),
  (
    'Samsung 27" Curved Monitor',
    'Monitors',
    '27-inch Full HD curved monitor, 75Hz refresh rate.',
    249.00,
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=400',
    true
  ),
  (
    'Logitech MX Master 3S',
    'Accessories',
    'Premium wireless mouse with precise tracking and customizable buttons.',
    99.00,
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    true
  ),
  (
    'Keychron K8 Pro Keyboard',
    'Accessories',
    'Wireless mechanical keyboard with hot-swappable switches.',
    119.00,
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    true
  ),
  (
    'Sony WH-1000XM5 Headphones',
    'Accessories',
    'Premium noise-cancelling wireless headphones for focused work.',
    399.00,
    'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
    true
  ),
  (
    'Anker USB-C Hub',
    'Accessories',
    '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.',
    49.00,
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
    true
  ),
  (
    'JetBrains All Products Pack',
    'Software',
    'Annual license for all JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.).',
    649.00,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    true
  ),
  (
    'Adobe Creative Cloud',
    'Software',
    'Annual subscription to Adobe Creative Cloud All Apps.',
    599.00,
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
    true
  ),
  (
    'Microsoft 365 Business',
    'Software',
    'Annual subscription including Office apps, Teams, OneDrive.',
    149.00,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    true
  ),
  (
    'Slack Premium',
    'Software',
    'Annual Slack Premium subscription for team collaboration.',
    96.00,
    'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400',
    true
  ),
  (
    'Ergonomic Office Chair',
    'Furniture',
    'Herman Miller Aeron chair - ergonomic design for all-day comfort.',
    1395.00,
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
    true
  );

-- Note: Test user accounts will be created through Supabase Auth UI
-- You'll need to manually create these users in Supabase:
-- 1. employee@test.com (password: Test123456!) - role: employee
-- 2. manager@test.com (password: Test123456!) - role: manager
