-- CreateTable
CREATE TABLE `devices` (
    `id` VARCHAR(191) NOT NULL,
    `deviceCode` VARCHAR(191) NOT NULL,
    `deviceTypeId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `currentResponsibleUserId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `partNumber` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `cost` DECIMAL(12, 2) NULL,
    `purchaseDate` DATETIME(3) NULL,
    `wifiMac` VARCHAR(191) NULL,
    `bluetoothMac` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `phoneNumber` VARCHAR(191) NULL,
    `imei` VARCHAR(191) NULL,
    `iccid` VARCHAR(191) NULL,
    `simNumber` VARCHAR(191) NULL,
    `gmailAccount` VARCHAR(191) NULL,
    `gmailPasswordEncrypted` VARCHAR(191) NULL,
    `localPasswordEncrypted` VARCHAR(191) NULL,
    `teamviewerId` VARCHAR(191) NULL,
    `computerName` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `updatedByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `devices_deviceCode_key`(`deviceCode`),
    UNIQUE INDEX `devices_serialNumber_key`(`serialNumber`),
    INDEX `devices_deviceTypeId_idx`(`deviceTypeId`),
    INDEX `devices_brandId_idx`(`brandId`),
    INDEX `devices_warehouseId_idx`(`warehouseId`),
    INDEX `devices_currentResponsibleUserId_idx`(`currentResponsibleUserId`),
    INDEX `devices_departmentId_idx`(`departmentId`),
    INDEX `devices_createdByUserId_idx`(`createdByUserId`),
    INDEX `devices_updatedByUserId_idx`(`updatedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_deviceTypeId_fkey` FOREIGN KEY (`deviceTypeId`) REFERENCES `device_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_currentResponsibleUserId_fkey` FOREIGN KEY (`currentResponsibleUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
