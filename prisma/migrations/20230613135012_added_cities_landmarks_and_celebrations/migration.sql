/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Character` table. All the data in the column will be lost.
  - Added the required column `state` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `characteristicsOfPeople` to the `World` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CharacterState" AS ENUM ('VOID', 'GERMINAL', 'EMBRYONIC', 'FETAL', 'BIRTHED');

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "imageUrl",
ADD COLUMN     "state" "CharacterState" NOT NULL,
ALTER COLUMN "preliminaryDescription" DROP NOT NULL,
ALTER COLUMN "chakraDescription" DROP NOT NULL,
ALTER COLUMN "promptForMidjourney" DROP NOT NULL,
ALTER COLUMN "characterName" DROP NOT NULL,
ALTER COLUMN "characterBackstory" DROP NOT NULL;

-- AlterTable
ALTER TABLE "World" ADD COLUMN     "characteristicsOfPeople" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "associatedLandmark" TEXT NOT NULL,
    "mainActivity" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Landmark" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "Landmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Celebration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "Celebration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Landmark" ADD CONSTRAINT "Landmark_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celebration" ADD CONSTRAINT "Celebration_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
