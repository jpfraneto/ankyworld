-- CreateTable
CREATE TABLE "TestCharacter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worldId" TEXT NOT NULL,
    "promptForMidjourney" TEXT,
    "characterName" TEXT,
    "nftNumber" INTEGER,
    "characterBackstory" TEXT,
    "imageId" TEXT,
    "upscaledImageUrls" TEXT[],
    "chosenImageUrl" TEXT,
    "readyToMint" BOOLEAN NOT NULL DEFAULT false,
    "completionResponse" TEXT,
    "state" "CharacterState" NOT NULL,
    "traits" JSONB,
    "worldCharacteristicsOfPeople" TEXT,

    CONSTRAINT "TestCharacter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestCharacter" ADD CONSTRAINT "TestCharacter_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
