-- database/sql_scripts/07_payment_status_trigger.sql
DROP TRIGGER IF EXISTS trg_order_paid_after_payment;
DELIMITER $$
CREATE TRIGGER trg_order_paid_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    -- backend inserts status = 'SUCCESS'
    IF NEW.status = 'SUCCESS' THEN
        UPDATE `order`
        SET payment_status = 'Paid'
        WHERE order_id = NEW.order_id;
    END IF;
END $$
DELIMITER ;
