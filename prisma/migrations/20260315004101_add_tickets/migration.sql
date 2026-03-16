-- CreateTable
CREATE TABLE `tickets` (
    `id` VARCHAR(191) NOT NULL,
    `idTicket` VARCHAR(191) NOT NULL,
    `qtyOfMovementsNeeded` INTEGER NULL,
    `externalId` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `affectedDocumentId` VARCHAR(191) NULL,
    `requestBy` VARCHAR(191) NULL,
    `latestAgent` VARCHAR(191) NULL,
    `assignedAgent` VARCHAR(191) NULL,
    `supportFilePath` VARCHAR(191) NULL,
    `authorized` BOOLEAN NULL,
    `warehouseId` VARCHAR(191) NULL,
    `createdAtSource` DATETIME(3) NULL,
    `solvedAt` DATETIME(3) NULL,
    `type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tickets_idTicket_key`(`idTicket`),
    INDEX `tickets_status_idx`(`status`),
    INDEX `tickets_category_idx`(`category`),
    INDEX `tickets_warehouseId_idx`(`warehouseId`),
    INDEX `tickets_createdAtSource_idx`(`createdAtSource`),
    INDEX `tickets_solvedAt_idx`(`solvedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
