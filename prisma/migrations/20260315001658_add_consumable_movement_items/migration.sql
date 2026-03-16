-- CreateTable
CREATE TABLE `consumable_movement_items` (
    `id` VARCHAR(191) NOT NULL,
    `movementId` VARCHAR(191) NOT NULL,
    `consumableItemId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `itemNameSnapshot` VARCHAR(191) NOT NULL,
    `itemCodeSnapshot` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consumable_movement_items_movementId_idx`(`movementId`),
    INDEX `consumable_movement_items_consumableItemId_idx`(`consumableItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consumable_movement_items` ADD CONSTRAINT `consumable_movement_items_movementId_fkey` FOREIGN KEY (`movementId`) REFERENCES `consumable_movements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_movement_items` ADD CONSTRAINT `consumable_movement_items_consumableItemId_fkey` FOREIGN KEY (`consumableItemId`) REFERENCES `consumable_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
