/*
  Warnings:

  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "users_role_type" AS ENUM ('MANAGER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "users_role_type" NOT NULL;
