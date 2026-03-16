-- CreateTable
CREATE TABLE `consumable_movements` (
    `id` VARCHAR(191) NOT NULL,
    `folio` VARCHAR(191) NOT NULL,
    `movementType` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `requestedByName` VARCHAR(191) NULL,
    `receivedByUserId` VARCHAR(191) NULL,
    `deliveredByUserId` VARCHAR(191) NOT NULL,
    `movementDate` DATETIME(3) NOT NULL,
    `signaturePath` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `consumable_movements_folio_key`(`folio`),
    INDEX `consumable_movements_warehouseId_idx`(`warehouseId`),
    INDEX `consumable_movements_departmentId_idx`(`departmentId`),
    INDEX `consumable_movements_receivedByUserId_idx`(`receivedByUserId`),
    INDEX `consumable_movements_deliveredByUserId_idx`(`deliveredByUserId`),
    INDEX `consumable_movements_createdByUserId_idx`(`createdByUserId`),
    INDEX `consumable_movements_movementType_idx`(`movementType`),
    INDEX `consumable_movements_movementDate_idx`(`movementDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_receivedByUserId_fkey` FOREIGN KEY (`receivedByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_deliveredByUserId_fkey` FOREIGN KEY (`deliveredByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consumable_movements` ADD CONSTRAINT `consumable_movements_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
