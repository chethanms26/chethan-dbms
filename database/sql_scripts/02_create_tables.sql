CREATE TABLE company(
company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
type VARCHAR(50),
address VARCHAR(255),
contact VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier(
supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
address VARCHAR(255),
contact VARCHAR(100),
phone_number VARCHAR(15),
company_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE customer(
customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
address VARCHAR(255),
email VARCHAR(100) UNIQUE NOT NULL,
phone_number VARCHAR(15),
company_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE warehouse(
warehouse_id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
address VARCHAR(255),
location VARCHAR(100),
capacity INT CHECK(capacity>0),
company_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

CREATE TABLE product(
product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
description TEXT,
category VARCHAR(50),
unit_price DECIMAL(10,2) CHECK(unit_price>0),
manufacturer VARCHAR(100),
availability BOOLEAN DEFAULT TRUE,
supplier_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE
);

CREATE TABLE inventory(
product_id BIGINT NOT NULL,
warehouse_id BIGINT NOT NULL,
quantity INT DEFAULT 0 CHECK(quantity>=0),
reorder_level INT DEFAULT 10,
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY(product_id,warehouse_id),
FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE CASCADE,
FOREIGN KEY(warehouse_id) REFERENCES warehouse(warehouse_id) ON DELETE CASCADE
);

CREATE TABLE `order`(
order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
total_amount DECIMAL(10,2) DEFAULT 0.00,
status VARCHAR(20) DEFAULT 'Pending' CHECK(status IN('Pending','Processing','Shipped','Delivered','Cancelled')),
priority VARCHAR(10) DEFAULT 'Medium' CHECK(priority IN('Low','Medium','High')),
customer_id BIGINT NOT NULL,
retailer_id BIGINT,
FOREIGN KEY(customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT
);

CREATE TABLE order_line(
orderline_id BIGINT AUTO_INCREMENT PRIMARY KEY,
order_id BIGINT NOT NULL,
product_id BIGINT NOT NULL,
quantity INT CHECK(quantity>0),
price DECIMAL(10,2) CHECK(price>0),
FOREIGN KEY(order_id) REFERENCES `order`(order_id) ON DELETE CASCADE,
FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE RESTRICT
);

CREATE TABLE shipment(
shipment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
order_id BIGINT UNIQUE NOT NULL,
status VARCHAR(20) DEFAULT 'Preparing' CHECK(status IN('Preparing','In Transit','Delivered')),
carrier VARCHAR(100),
company_id BIGINT,
tracking_number VARCHAR(50) UNIQUE,
estimated_arrival DATE,
actual_arrival DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(order_id) REFERENCES `order`(order_id) ON DELETE CASCADE,
FOREIGN KEY(company_id) REFERENCES company(company_id) ON DELETE SET NULL
);

CREATE TABLE payment(
payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
order_id BIGINT NOT NULL,
amount DECIMAL(10,2) CHECK(amount>0),
type VARCHAR(20),
method VARCHAR(20) CHECK(method IN('Credit Card','Debit Card','UPI','Cash','Net Banking')),
status VARCHAR(20) DEFAULT 'Pending' CHECK(status IN('Pending','Completed','Failed')),
payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(order_id) REFERENCES `order`(order_id) ON DELETE RESTRICT
);

CREATE TABLE `transaction`(
transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
payment_id BIGINT NOT NULL,
date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
type VARCHAR(20),
amount DECIMAL(10,2),
remarks TEXT,
FOREIGN KEY(payment_id) REFERENCES payment(payment_id) ON DELETE CASCADE
);

CREATE TABLE inventory_alert_log(
alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT NOT NULL,
warehouse_id BIGINT NOT NULL,
quantity INT,
reorder_level INT,
alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(product_id,warehouse_id) REFERENCES inventory(product_id,warehouse_id)
);

CREATE TABLE product_price_history(
history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT NOT NULL,
old_price DECIMAL(10,2),
new_price DECIMAL(10,2),
change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
changed_by VARCHAR(50) DEFAULT 'SYSTEM',
FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

CREATE TABLE db_user(
user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
name VARCHAR(100) NOT NULL,
role ENUM('ADMIN','CUSTOMER','SUPPLIER') NOT NULL,
customer_id BIGINT UNIQUE,
supplier_id BIGINT UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL,
FOREIGN KEY(supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
);
