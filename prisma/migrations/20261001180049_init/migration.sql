-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "ExportApplication" (
    "applicationNumber" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "submittedAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "consigneeName" TEXT NOT NULL,
    "consigneeAddress" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "goodsDescription" TEXT NOT NULL,
    "grossWeight" TEXT NOT NULL,
    "netWeight" TEXT NOT NULL,
    "vesselAndVoyage" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "nxpNumber" TEXT NOT NULL,
    "shipmentDate" TEXT NOT NULL,
    "fumigationDate" TEXT,
    "fumigant" TEXT,
    "standardPack" TEXT,
    "packagingCondition" TEXT,
    "moistureContent" TEXT,
    "grade" TEXT,
    "estimatedValue" TEXT,
    "vessel" TEXT,
    "voyage" TEXT,
    "billOfLadingNumber" TEXT,
    "billOfLadingDate" TEXT,
    "portOfLoading" TEXT,
    CONSTRAINT "ExportApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificateData" (
    "applicationNumber" TEXT NOT NULL PRIMARY KEY,
    "issuedAt" TEXT,
    "issuedBy" TEXT,
    "exporterOrganization" TEXT,
    "exporterAddress" TEXT,
    "consigneeName" TEXT,
    "consigneeAddress" TEXT,
    "goodsDescription" TEXT,
    "hsCode" TEXT,
    "fumigationDate" TEXT,
    "fumigant" TEXT,
    "standardPack" TEXT,
    "grossWeight" TEXT,
    "netWeight" TEXT,
    "shipmentDate" TEXT,
    "grade" TEXT,
    "packagingCondition" TEXT,
    "nxpNumber" TEXT,
    "estimatedValue" TEXT,
    "moistureContent" TEXT,
    "vessel" TEXT,
    "voyage" TEXT,
    "destination" TEXT,
    "billOfLadingNumber" TEXT,
    "billOfLadingDate" TEXT,
    "portOfLoading" TEXT,
    CONSTRAINT "CertificateData_applicationNumber_fkey" FOREIGN KEY ("applicationNumber") REFERENCES "ExportApplication" ("applicationNumber") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNumber" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "levelLabel" TEXT NOT NULL,
    "levelOrder" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "staffRoleId" TEXT NOT NULL,
    "decidedAt" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ApprovalDecision_applicationNumber_fkey" FOREIGN KEY ("applicationNumber") REFERENCES "ExportApplication" ("applicationNumber") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "system" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "StaffAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "active" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "StaffAccount_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    CONSTRAINT "Session_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "requiredApprovals" INTEGER NOT NULL DEFAULT 1,
    "slaDays" INTEGER NOT NULL DEFAULT 1,
    "required" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ApprovalLevel_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificateFieldConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "detail" TEXT NOT NULL DEFAULT '',
    "at" TEXT NOT NULL,
    "ip" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE INDEX "Applicant_email_idx" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "ExportApplication_applicantId_idx" ON "ExportApplication"("applicantId");

-- CreateIndex
CREATE INDEX "ExportApplication_submittedAt_idx" ON "ExportApplication"("submittedAt");

-- CreateIndex
CREATE INDEX "ApprovalDecision_applicationNumber_idx" ON "ApprovalDecision"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalDecision_applicationNumber_levelId_staffId_key" ON "ApprovalDecision"("applicationNumber", "levelId", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAccount_email_key" ON "StaffAccount"("email");

-- CreateIndex
CREATE INDEX "StaffAccount_roleId_idx" ON "StaffAccount"("roleId");

-- CreateIndex
CREATE INDEX "Session_staffId_idx" ON "Session"("staffId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditEvent_at_idx" ON "AuditEvent"("at");

-- CreateIndex
CREATE INDEX "AuditEvent_entityId_idx" ON "AuditEvent"("entityId");
