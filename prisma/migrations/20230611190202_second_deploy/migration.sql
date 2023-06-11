-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chakra" INTEGER NOT NULL,
    "otherside" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "preliminaryDescription" TEXT NOT NULL,
    "chakraDescription" TEXT NOT NULL,
    "animalOrGodString" TEXT,
    "worldId" TEXT NOT NULL,
    "promptForMidjourney" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "characterBackstory" TEXT NOT NULL,
    "imageId" TEXT,
    "imageUrl" TEXT,
    "upscaledImageUrls" TEXT[],
    "chosenImageUrl" TEXT,
    "readyToMint" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
