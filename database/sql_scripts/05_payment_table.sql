CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(20) DEFAULT 'CARD',
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES `order`(order_id)
        ON DELETE CASCADE
);
