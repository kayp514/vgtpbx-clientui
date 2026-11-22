/*
  Warnings:

  - You are about to drop the column `auth_user_id` on the `pbx_users` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `pbx_users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domainId,firebaseUid]` on the table `pbx_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domainId,email]` on the table `pbx_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domainId,username]` on the table `pbx_users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `pbx_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `domainId` on table `pbx_users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "pbx_users" DROP CONSTRAINT "pbx_users_auth_user_id_fkey";

-- DropIndex
DROP INDEX "pbx_users_auth_user_id_idx";

-- DropIndex
DROP INDEX "pbx_users_username_key";

-- AlterTable
ALTER TABLE "invite" ALTER COLUMN "id" SET DEFAULT 'inv_' || gen_random_uuid();

-- AlterTable
ALTER TABLE "pbx_users" DROP COLUMN "auth_user_id",
DROP COLUMN "disabled",
ADD COLUMN     "firebaseUid" VARCHAR(128),
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "homeTenantId" VARCHAR(128),
ADD COLUMN     "userType" VARCHAR(16) NOT NULL DEFAULT 'member',
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "domainId" SET NOT NULL;

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "id" SET DEFAULT 'sub_' || gen_random_uuid();

-- CreateIndex
CREATE INDEX "pbx_users_firebaseUid_idx" ON "pbx_users"("firebaseUid");

-- CreateIndex
CREATE INDEX "pbx_users_groupId_idx" ON "pbx_users"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "pbx_users_domainId_firebaseUid_key" ON "pbx_users"("domainId", "firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "pbx_users_domainId_email_key" ON "pbx_users"("domainId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "pbx_users_domainId_username_key" ON "pbx_users"("domainId", "username");

-- AddForeignKey
ALTER TABLE "pbx_users" ADD CONSTRAINT "pbx_users_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
