-- Run this in PostgreSQL to create your database structure

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    alibaba_id VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_gold BOOLEAN DEFAULT false,
    years_in_business INTEGER,
    response_time_hours INTEGER,
    rating DECIMAL(3,2),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    moq INTEGER,
    category VARCHAR(100),
    image_url TEXT,
    match_score INTEGER,
    alibaba_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    supplier_id VARCHAR(100),
    product_id INTEGER,
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    quantity INTEGER,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO suppliers (name, location, is_gold, years_in_business, rating) VALUES 
('Shenzhen TechMaster Electronics', 'Guangdong, China', true, 8, 4.9),
('Yiwu Fashion Accessories Co.', 'Zhejiang, China', true, 12, 4.7);

INSERT INTO products (supplier_id, name, price, moq, match_score, category) VALUES 
(1, 'Wireless Bluetooth Earbuds 5.3', 4.20, 100, 98, 'Electronics'),
(2, 'Phone Lanyard Crossbody', 0.85, 500, 85, 'Accessories');
