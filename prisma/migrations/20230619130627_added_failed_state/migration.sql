/*
  Warnings:

  - You are about to drop the column `animalOrGodString` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `chakraDescription` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `preliminaryDescription` on the `Character` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "CharacterState" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "animalOrGodString",
DROP COLUMN "chakraDescription",
DROP COLUMN "preliminaryDescription";
