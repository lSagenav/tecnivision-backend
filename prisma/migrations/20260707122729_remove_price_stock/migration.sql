/*
  Warnings:

  - You are about to drop the column `total` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `orderitem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `total`;

-- AlterTable
ALTER TABLE `OrderItem` DROP COLUMN `price`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `price`,
    DROP COLUMN `stock`;
