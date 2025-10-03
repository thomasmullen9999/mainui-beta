/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" VARCHAR(250) NOT NULL,
ADD COLUMN     "isActive" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "lastName" VARCHAR(250) NOT NULL,
ADD COLUMN     "password" VARCHAR(250) NOT NULL;
