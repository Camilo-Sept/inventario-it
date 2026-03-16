/*
  Warnings:

  - You are about to drop the column `assignedToUserId` on the `device_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `currentResponsibleUserId` on the `devices` table. All the data in the column will be lost.
  - Added the required column `assignedToName` to the `device_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `device_assignments` DROP FOREIGN KEY `device_assignments_assignedToUserId_fkey`;

-- DropForeignKey
ALTER TABLE `devices` DROP FOREIGN KEY `devices_currentResponsibleUserId_fkey`;

-- DropIndex
DROP INDEX `device_assignments_assignedToUserId_idx` ON `device_assignments`;

-- DropIndex
DROP INDEX `devices_currentResponsibleUserId_idx` ON `devices`;

-- AlterTable
ALTER TABLE `device_assignments` DROP COLUMN `assignedToUserId`,
    ADD COLUMN `assignedToName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `devices` DROP COLUMN `currentResponsibleUserId`,
    ADD COLUMN `currentResponsibleName` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `device_assignments_assignedToName_idx` ON `device_assignments`(`assignedToName`);
