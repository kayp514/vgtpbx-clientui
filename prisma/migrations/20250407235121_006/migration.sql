/*
  Warnings:

  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth_user" DROP CONSTRAINT "auth_user_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pbx_domains" DROP CONSTRAINT "pbx_domains_tenantId_fkey";

-- DropTable
DROP TABLE "tenants";

-- CreateTable
CREATE TABLE "auth_tenant" (
    "id" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "logo" VARCHAR(255),
    "plan" VARCHAR(20) NOT NULL DEFAULT 'basic',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth_tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tenant_name_key" ON "auth_tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tenant_domain_key" ON "auth_tenant"("domain");

-- AddForeignKey
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "auth_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbx_domains" ADD CONSTRAINT "pbx_domains_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "auth_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
