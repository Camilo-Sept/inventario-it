-- CreateTable
CREATE TABLE `device_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `assignedToUserId` VARCHAR(191) NOT NULL,
    `assignedByUserId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `assignedAt` DATETIME(3) NOT NULL,
    `returnedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `deliveryNotes` TEXT NULL,
    `devicePhotoPath` VARCHAR(191) NULL,
    `deliveryDocumentPath` VARCHAR(191) NULL,
    `policyDocumentPath` VARCHAR(191) NULL,
    `signaturePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `device_assignments_deviceId_idx`(`deviceId`),
    INDEX `device_assignments_assignedToUserId_idx`(`assignedToUserId`),
    INDEX `device_assignments_assignedByUserId_idx`(`assignedByUserId`),
    INDEX `device_assignments_warehouseId_idx`(`warehouseId`),
    INDEX `device_assignments_departmentId_idx`(`departmentId`),
    INDEX `device_assignments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_assignedByUserId_fkey` FOREIGN KEY (`assignedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_assignments` ADD CONSTRAINT `device_assignments_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
