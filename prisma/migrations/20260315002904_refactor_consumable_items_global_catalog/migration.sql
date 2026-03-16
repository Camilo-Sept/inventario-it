/*
  Warnings:

  - You are about to drop the column `warehouseId` on the `consumable_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `consumable_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `consumable_items` DROP FOREIGN KEY `consumable_items_warehouseId_fkey`;

-- DropIndex
DROP INDEX `consumable_items_warehouseId_idx` ON `consumable_items`;

-- DropIndex
DROP INDEX `consumable_items_warehouseId_name_key` ON `consumable_items`;

-- AlterTable
ALTER TABLE `consumable_items` DROP COLUMN `warehouseId`;

-- CreateTable
CREATE TABLE `consumable_stock` (
    `id` VARCHAR(191) NOT NULL,
    `consumableItemId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `currentStock` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `lastMovementAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `consumable_stock_warehouseId_idx`(`warehouseId`),
    UNIQUE INDEX `consumable_stock_consumableItemId_warehouseId_key`(`consumableItemId`, `warehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `consumable_items_name_key` ON `consumable_items`(`name`);

-- AddForeignKey
ALTER TABLE `consumable_stock` ADD CONSTRAINT `consumable_stock_consumableItemId_fkey` FOREIGN KEY (`consumableItemId`) REFERENCES `consumable_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_stock` ADD CONSTRAINT `consumable_stock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
