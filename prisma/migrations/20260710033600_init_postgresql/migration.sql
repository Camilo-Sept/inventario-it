-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "module" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "deviceTypeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "currentResponsibleName" TEXT,
    "departmentId" TEXT,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT,
    "partNumber" TEXT,
    "description" TEXT,
    "invoiceNumber" TEXT,
    "cost" DECIMAL(12,2),
    "purchaseDate" TIMESTAMP(3),
    "wifiMac" TEXT,
    "bluetoothMac" TEXT,
    "qrCode" TEXT,
    "barcode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "phoneNumber" TEXT,
    "imei" TEXT,
    "iccid" TEXT,
    "simNumber" TEXT,
    "gmailAccount" TEXT,
    "gmailPasswordEncrypted" TEXT,
    "localPasswordEncrypted" TEXT,
    "teamviewerId" TEXT,
    "computerName" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_assignments" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "assignedToName" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "departmentId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deliveryNotes" TEXT,
    "devicePhotoPath" TEXT,
    "deliveryDocumentPath" TEXT,
    "policyDocumentPath" TEXT,
    "signaturePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_maintenance" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "userId" TEXT,
    "departmentId" TEXT,
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "deviceSnapshotType" TEXT,
    "deviceSnapshotBrand" TEXT,
    "deviceSnapshotSerial" TEXT,
    "failureDescription" TEXT,
    "solutionDescription" TEXT,
    "notes" TEXT,
    "fixedBy" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumable_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" TEXT,
    "photoPath" TEXT,
    "unit" TEXT NOT NULL,
    "initialStock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minimumStock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maximumStock" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumable_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumable_movements" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "warehouseId" TEXT,
    "departmentId" TEXT,
    "employeeName" TEXT,
    "deliveredByName" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "signaturePath" TEXT,
    "documentPath" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumable_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumable_movement_items" (
    "id" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "consumableItemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "itemNameSnapshot" TEXT NOT NULL,
    "itemCodeSnapshot" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumable_movement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "idTicket" TEXT NOT NULL,
    "qtyOfMovementsNeeded" INTEGER,
    "externalId" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "category" TEXT,
    "affectedDocumentId" TEXT,
    "requestBy" TEXT,
    "latestAgent" TEXT,
    "assignedAgent" TEXT,
    "supportFilePath" TEXT,
    "authorized" BOOLEAN,
    "warehouseId" TEXT,
    "createdAtSource" TIMESTAMP(3),
    "solvedAt" TIMESTAMP(3),
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_sequences" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_entityName_entityId_idx" ON "audit_logs"("entityName", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_branchId_idx" ON "warehouses"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_branchId_name_key" ON "warehouses"("branchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "device_types_name_key" ON "device_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "device_types_code_key" ON "device_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceCode_key" ON "devices"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serialNumber_key" ON "devices"("serialNumber");

-- CreateIndex
CREATE INDEX "devices_deviceTypeId_idx" ON "devices"("deviceTypeId");

-- CreateIndex
CREATE INDEX "devices_brandId_idx" ON "devices"("brandId");

-- CreateIndex
CREATE INDEX "devices_warehouseId_idx" ON "devices"("warehouseId");

-- CreateIndex
CREATE INDEX "devices_departmentId_idx" ON "devices"("departmentId");

-- CreateIndex
CREATE INDEX "devices_createdByUserId_idx" ON "devices"("createdByUserId");

-- CreateIndex
CREATE INDEX "devices_updatedByUserId_idx" ON "devices"("updatedByUserId");

-- CreateIndex
CREATE INDEX "device_assignments_deviceId_idx" ON "device_assignments"("deviceId");

-- CreateIndex
CREATE INDEX "device_assignments_assignedToName_idx" ON "device_assignments"("assignedToName");

-- CreateIndex
CREATE INDEX "device_assignments_assignedByUserId_idx" ON "device_assignments"("assignedByUserId");

-- CreateIndex
CREATE INDEX "device_assignments_warehouseId_idx" ON "device_assignments"("warehouseId");

-- CreateIndex
CREATE INDEX "device_assignments_departmentId_idx" ON "device_assignments"("departmentId");

-- CreateIndex
CREATE INDEX "device_assignments_status_idx" ON "device_assignments"("status");

-- CreateIndex
CREATE INDEX "device_maintenance_deviceId_idx" ON "device_maintenance"("deviceId");

-- CreateIndex
CREATE INDEX "device_maintenance_warehouseId_idx" ON "device_maintenance"("warehouseId");

-- CreateIndex
CREATE INDEX "device_maintenance_userId_idx" ON "device_maintenance"("userId");

-- CreateIndex
CREATE INDEX "device_maintenance_departmentId_idx" ON "device_maintenance"("departmentId");

-- CreateIndex
CREATE INDEX "device_maintenance_createdByUserId_idx" ON "device_maintenance"("createdByUserId");

-- CreateIndex
CREATE INDEX "device_maintenance_maintenanceType_idx" ON "device_maintenance"("maintenanceType");

-- CreateIndex
CREATE UNIQUE INDEX "consumable_items_code_key" ON "consumable_items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "consumable_items_name_key" ON "consumable_items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "consumable_movements_folio_key" ON "consumable_movements"("folio");

-- CreateIndex
CREATE INDEX "consumable_movements_warehouseId_idx" ON "consumable_movements"("warehouseId");

-- CreateIndex
CREATE INDEX "consumable_movements_departmentId_idx" ON "consumable_movements"("departmentId");

-- CreateIndex
CREATE INDEX "consumable_movements_createdByUserId_idx" ON "consumable_movements"("createdByUserId");

-- CreateIndex
CREATE INDEX "consumable_movements_movementType_idx" ON "consumable_movements"("movementType");

-- CreateIndex
CREATE INDEX "consumable_movements_movementDate_idx" ON "consumable_movements"("movementDate");

-- CreateIndex
CREATE INDEX "consumable_movement_items_movementId_idx" ON "consumable_movement_items"("movementId");

-- CreateIndex
CREATE INDEX "consumable_movement_items_consumableItemId_idx" ON "consumable_movement_items"("consumableItemId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_idTicket_key" ON "tickets"("idTicket");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_category_idx" ON "tickets"("category");

-- CreateIndex
CREATE INDEX "tickets_warehouseId_idx" ON "tickets"("warehouseId");

-- CreateIndex
CREATE INDEX "tickets_createdAtSource_idx" ON "tickets"("createdAtSource");

-- CreateIndex
CREATE INDEX "tickets_solvedAt_idx" ON "tickets"("solvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "app_sequences_code_key" ON "app_sequences"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "device_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_maintenance" ADD CONSTRAINT "device_maintenance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_maintenance" ADD CONSTRAINT "device_maintenance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_maintenance" ADD CONSTRAINT "device_maintenance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_maintenance" ADD CONSTRAINT "device_maintenance_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_maintenance" ADD CONSTRAINT "device_maintenance_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_movements" ADD CONSTRAINT "consumable_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_movements" ADD CONSTRAINT "consumable_movements_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_movements" ADD CONSTRAINT "consumable_movements_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_movement_items" ADD CONSTRAINT "consumable_movement_items_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "consumable_movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumable_movement_items" ADD CONSTRAINT "consumable_movement_items_consumableItemId_fkey" FOREIGN KEY ("consumableItemId") REFERENCES "consumable_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

