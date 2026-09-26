ALTER TABLE `Product` ADD COLUMN `productOptions` TEXT NULL;
ALTER TABLE `OrderItem` ADD COLUMN `selectedOption` VARCHAR(200) NULL;
