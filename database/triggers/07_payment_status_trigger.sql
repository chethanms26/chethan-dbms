DELIMITER $$

-- Create trigger to update order payment status
CREATE TRIGGER trg_order_paid_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    IF UPPER(NEW.status) IN ('SUCCESS', 'COMPLETED') THEN
        UPDATE `order`
        SET payment_status = 'Paid',
            status = 'Paid'
        WHERE order_id = NEW.order_id;
    END IF;
END $$

DELIMITER ;
