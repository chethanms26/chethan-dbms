DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2),
    method VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_order 
        FOREIGN KEY (order_id) REFERENCES `order`(order_id)
        ON DELETE CASCADE
);
