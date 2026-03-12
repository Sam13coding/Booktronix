-- ============================================
-- BOOKTRONIX - DATA RETRIEVAL QUERIES
-- ============================================

-- 1. ALL REGISTERED USERS
SELECT id, first_name, last_name, email 
FROM users 
ORDER BY id;

-- 2. USERS WITH ORDERS (Active Users)
SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, COUNT(o.order_number) as total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.order_number IS NOT NULL
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY u.id;

-- 3. ALL USERS WITH THEIR ORDERS DETAILS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    o.order_number,
    o.total,
    o.status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
ORDER BY u.id, o.order_number;

-- 4. DETAILED USER ORDERS WITH ITEMS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    o.order_number,
    o.total,
    o.status,
    b.title as book_title,
    oi.quantity,
    oi.price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.order_number = oi.order_number
LEFT JOIN books b ON oi.book_id = b.id
ORDER BY u.id, o.order_number;

-- 5. USERS WITHOUT ANY ORDERS (Registered but Never Ordered)
SELECT u.id, u.first_name, u.last_name, u.email
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.order_number IS NULL
ORDER BY u.id;

-- 6. ORDER STATISTICS BY USER
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(o.order_number) as total_orders,
    SUM(o.total) as total_spent,
    MAX(o.order_number) as latest_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY total_spent DESC;
