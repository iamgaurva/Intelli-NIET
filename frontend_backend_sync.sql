-- Sync script to align database with frontend + backend contract
USE campus_issue_db;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(80) UNIQUE AFTER email;

UPDATE users SET username = 'admin' WHERE email = 'admin@niet.co.in' AND (username IS NULL OR username = '');
UPDATE users SET username = 'faculty' WHERE email = 'teacher@niet.co.in' AND (username IS NULL OR username = '');

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS area_type VARCHAR(100) NULL AFTER custom_category,
    ADD COLUMN IF NOT EXISTS landmark VARCHAR(255) NULL AFTER area_type;

INSERT INTO issue_categories (category_name, description, is_active)
SELECT * FROM (
    SELECT 'Water / Plumbing', 'Frontend default category', 1 UNION ALL
    SELECT 'Electrical / Power', 'Frontend default category', 1 UNION ALL
    SELECT 'Furniture / Fixtures', 'Frontend default category', 1 UNION ALL
    SELECT 'Air Conditioning / Fan', 'Frontend default category', 1 UNION ALL
    SELECT 'Network / Internet', 'Frontend default category', 1 UNION ALL
    SELECT 'Projector / Mic', 'Frontend default category', 1 UNION ALL
    SELECT 'Cleanliness / Sanitation', 'Frontend default category', 1 UNION ALL
    SELECT 'Security / Lock Issue', 'Frontend default category', 1 UNION ALL
    SELECT 'Pest / Infestation', 'Frontend default category', 1 UNION ALL
    SELECT 'Structural / Civil', 'Frontend default category', 1 UNION ALL
    SELECT 'Fire Safety Equipment', 'Frontend default category', 1 UNION ALL
    SELECT 'Other', 'Frontend default category', 1
) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM issue_categories c
    WHERE LOWER(c.category_name) = LOWER(seed.category_name)
);
