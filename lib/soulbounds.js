const prisma = require('./prismaClient');

async function addSoulbound(characterId1, characterId2) {
  const count1 = await prisma.soulbound.count({
    where: { characterFromId: characterId1 },
  });
  const count2 = await prisma.soulbound.count({
    where: { characterFromId: characterId2 },
  });

  if (count1 >= 7 || count2 >= 7) {
    throw new Error('One or both characters already have 7 soulbounds.');
  }

  await prisma.soulbound.create({
    data: {
      characterFromId: characterId1,
      characterToId: characterId2,
    },
  });

  await prisma.soulbound.create({
    data: {
      characterFromId: characterId2,
      characterToId: characterId1,
    },
  });
}

async function addSoulbounds() {
  // Get all characters
  const characters = await prisma.character.findMany();

  for (let character of characters) {
    const availableCharacters = characters.filter(c => c.id !== character.id); // Remove current character from the available pool

    // Get the first 7 characters that are not soulbound to the current character
    for (let i = 0; i < 7; i++) {
      // Find a character that is not already soulbound to the current character
      const soulboundCharacter = availableCharacters.find(
        c =>
          !character.soulboundsTo.some(sb => sb.characterToId === c.id) &&
          !character.soulboundsFrom.some(sb => sb.characterFromId === c.id)
      );

      if (!soulboundCharacter) {
        throw new Error(
          `Failed to find a soulbound for character with id ${character.id}`
        );
      }

      // Remove the chosen character from the available pool
      availableCharacters = availableCharacters.filter(
        c => c.id !== soulboundCharacter.id
      );

      // Add the soulbound
      await addSoulbound(character.id, soulboundCharacter.id);
    }
  }
}
