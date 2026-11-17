/*
  Warnings:

  - You are about to drop the `auth_group_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user_user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `authtoken_token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth_group_permissions" DROP CONSTRAINT "auth_group_permissions_groupId_fkey";

-- DropForeignKey
ALTER TABLE "auth_group_permissions" DROP CONSTRAINT "auth_group_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "auth_user" DROP CONSTRAINT "auth_user_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "auth_user_groups" DROP CONSTRAINT "auth_user_groups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "auth_user_groups" DROP CONSTRAINT "auth_user_groups_uid_fkey";

-- DropForeignKey
ALTER TABLE "auth_user_user_permissions" DROP CONSTRAINT "auth_user_user_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "auth_user_user_permissions" DROP CONSTRAINT "auth_user_user_permissions_uid_fkey";

-- DropForeignKey
ALTER TABLE "authtoken_token" DROP CONSTRAINT "authtoken_token_uid_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_groupId_fkey";

-- AlterTable
ALTER TABLE "subscription" ALTER COLUMN "id" SET DEFAULT 'sub_' || gen_random_uuid();

-- DropTable
DROP TABLE "auth_group_permissions";

-- DropTable
DROP TABLE "auth_permission";

-- DropTable
DROP TABLE "auth_tenant";

-- DropTable
DROP TABLE "auth_user";

-- DropTable
DROP TABLE "auth_user_groups";

-- DropTable
DROP TABLE "auth_user_user_permissions";

-- DropTable
DROP TABLE "authtoken_token";

-- DropTable
DROP TABLE "invite";
