/*
  Warnings:

  - You are about to drop the column `description` on the `consumable_items` table. All the data in the column will be lost.
  - You are about to alter the column `minimumStock` on the `consumable_items` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(12,2)`.
  - You are about to drop the column `deliveredByUserId` on the `consumable_movements` table. All the data in the column will be lost.
  - You are about to drop the column `receivedByUserId` on the `consumable_movements` table. All the data in the column will be lost.
  - You are about to drop the column `requestedByName` on the `consumable_movements` table. All the data in the column will be lost.
  - You are about to drop the `consumable_stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `consumable_movements` DROP FOREIGN KEY `consumable_movements_deliveredByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `consumable_movements` DROP FOREIGN KEY `consumable_movements_receivedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `consumable_movements` DROP FOREIGN KEY `consumable_movements_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `consumable_stock` DROP FOREIGN KEY `consumable_stock_consumableItemId_fkey`;

-- DropForeignKey
ALTER TABLE `consumable_stock` DROP FOREIGN KEY `consumable_stock_warehouseId_fkey`;

-- DropIndex
DROP INDEX `consumable_movements_deliveredByUserId_idx` ON `consumable_movements`;

-- DropIndex
DROP INDEX `consumable_movements_receivedByUserId_idx` ON `consumable_movements`;

-- AlterTable
ALTER TABLE `consumable_items` DROP COLUMN `description`,
    ADD COLUMN `currentStock` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `info` TEXT NULL,
    ADD COLUMN `initialStock` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `maximumStock` DECIMAL(12, 2) NULL,
    ADD COLUMN `photoPath` VARCHAR(191) NULL,
    MODIFY `minimumStock` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `consumable_movements` DROP COLUMN `deliveredByUserId`,
    DROP COLUMN `receivedByUserId`,
    DROP COLUMN `requestedByName`,
    ADD COLUMN `deliveredByName` VARCHAR(191) NULL,
    ADD COLUMN `documentPath` VARCHAR(191) NULL,
    ADD COLUMN `employeeName` VARCHAR(191) NULL,
    MODIFY `warehouseId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `consumable_stock`;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
