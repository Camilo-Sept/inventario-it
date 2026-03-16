-- CreateTable
CREATE TABLE `device_maintenance` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `maintenanceDate` DATETIME(3) NOT NULL,
    `maintenanceType` VARCHAR(191) NOT NULL,
    `deviceSnapshotType` VARCHAR(191) NULL,
    `deviceSnapshotBrand` VARCHAR(191) NULL,
    `deviceSnapshotSerial` VARCHAR(191) NULL,
    `failureDescription` TEXT NULL,
    `solutionDescription` TEXT NULL,
    `notes` TEXT NULL,
    `fixedBy` VARCHAR(191) NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `device_maintenance_deviceId_idx`(`deviceId`),
    INDEX `device_maintenance_warehouseId_idx`(`warehouseId`),
    INDEX `device_maintenance_userId_idx`(`userId`),
    INDEX `device_maintenance_departmentId_idx`(`departmentId`),
    INDEX `device_maintenance_createdByUserId_idx`(`createdByUserId`),
    INDEX `device_maintenance_maintenanceType_idx`(`maintenanceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `device_maintenance` ADD CONSTRAINT `device_maintenance_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_maintenance` ADD CONSTRAINT `device_maintenance_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_maintenance` ADD CONSTRAINT `device_maintenance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_maintenance` ADD CONSTRAINT `device_maintenance_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_maintenance` ADD CONSTRAINT `device_maintenance_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
