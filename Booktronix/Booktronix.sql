CREATE DATABASE booktronix;
USE booktronix;

CREATE TABLE users (

id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(50),
last_name VARCHAR(50),
email VARCHAR(100),
password VARCHAR(100),
last_login TIMESTAMP NULL DEFAULT NULL

);


CREATE TABLE books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authors VARCHAR(255),
    thumbnail VARCHAR(512),
    price DECIMAL(8,2),
    rating DECIMAL(3,2),
    description TEXT,
    genre VARCHAR(100),
    published_date DATE
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(8,2),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE orders (
    order_number VARCHAR(50) PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2),
    status VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50),
    book_id VARCHAR(50),
    quantity INT,
    price DECIMAL(8,2),

    FOREIGN KEY (order_number) REFERENCES orders(order_number),
    FOREIGN KEY (book_id) REFERENCES books(id)
);



USE booktronix;
SELECT * FROM users;