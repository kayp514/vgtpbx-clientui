/*
  Warnings:

  - A unique constraint covering the columns `[firebaseTenantId]` on the table `pbx_domains` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firebaseTenantId` to the `pbx_domains` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_domainId_fkey";

-- AlterTable
ALTER TABLE "invite" ALTER COLUMN "id" SET DEFAULT 'inv_' || gen_random_uuid();

-- AlterTable
ALTER TABLE "pbx_domains" ADD COLUMN     "firebaseTenantId" VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "id" SET DEFAULT 'sub_' || gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "pbx_domains_firebaseTenantId_key" ON "pbx_domains"("firebaseTenantId");
