/*
  Warnings:

  - A unique constraint covering the columns `[chakra]` on the table `World` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "World_chakra_key" ON "World"("chakra");
