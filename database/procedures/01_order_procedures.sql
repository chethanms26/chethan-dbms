USE scm_portal;

-- ======================================================
-- 1. PLACE_ORDER
-- ======================================================
DROP PROCEDURE IF EXISTS place_order;
DELIMITER $$

CREATE PROCEDURE place_order(
    IN p_customer_id INT,
    IN p_priority VARCHAR(20),
    OUT p_order_id INT
)
BEGIN
    INSERT INTO `order` 
        (customer_id, status, priority, order_date, payment_status, total_amount)
    VALUES 
        (p_customer_id, 'Pending', p_priority, NOW(), 'Pending', 0);

    SET p_order_id = LAST_INSERT_ID();
END$$

DELIMITER ;


-- ======================================================
-- 2. ADD_ORDER_ITEM
-- ======================================================
DROP PROCEDURE IF EXISTS add_order_item;
DELIMITER $$

CREATE PROCEDURE add_order_item(
    IN p_order_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(12,2);

    -- Get unit price of the product
    SELECT unit_price INTO v_price
    FROM product
    WHERE product_id = p_product_id;

    -- Insert the line item
    INSERT INTO order_line (order_id, product_id, quantity, price)
    VALUES (p_order_id, p_product_id, p_quantity, v_price);

    -- Recalculate order total
    UPDATE `order`
    SET total_amount = (
        SELECT IFNULL(SUM(quantity * price), 0)
        FROM order_line
        WHERE order_id = p_order_id
    )
    WHERE order_id = p_order_id;
END$$

DELIMITER ;
USE scm_portal;

-- ======================================================
-- 1. PLACE_ORDER
-- ======================================================
DROP PROCEDURE IF EXISTS place_order;
DELIMITER $$

CREATE PROCEDURE place_order(
    IN p_customer_id INT,
    IN p_priority VARCHAR(20),
    OUT p_order_id INT
)
BEGIN
    INSERT INTO `order` 
        (customer_id, status, priority, order_date, payment_status, total_amount)
    VALUES 
        (p_customer_id, 'Pending', p_priority, NOW(), 'Pending', 0);

    SET p_order_id = LAST_INSERT_ID();
END$$

DELIMITER ;


-- ======================================================
-- 2. ADD_ORDER_ITEM
-- ======================================================
DROP PROCEDURE IF EXISTS add_order_item;
DELIMITER $$

CREATE PROCEDURE add_order_item(
    IN p_order_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(12,2);

    -- Get unit price of the product
    SELECT unit_price INTO v_price
    FROM product
    WHERE product_id = p_product_id;

    -- Insert the line item
    INSERT INTO order_line (order_id, product_id, quantity, price)
    VALUES (p_order_id, p_product_id, p_quantity, v_price);

    -- Recalculate order total
    UPDATE `order`
    SET total_amount = (
        SELECT IFNULL(SUM(quantity * price), 0)
        FROM order_line
        WHERE order_id = p_order_id
    )
    WHERE order_id = p_order_id;
END$$

DELIMITER ;
