const { addWorldsToDb } = require('./newCharacterGenerator');
const {
  getCharacterSystemMessage,
  getCharacterUserContent,
} = require('./ankyGenerationMessagesForTraits');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./prismaClient');

const configuration = new Configuration({
  organization: 'org-jky0txWAU8ZrAAF5d14VR12J',
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let MINIMUM_RUNS = 3;
let TARGET_GERM_TIME = 44444;
let TARGET_IMAGE_TIME = 44444;
let ADJUSTMENT_AMOUNT = 555;
let GERMINAL_AWAIT_TIME = 44444;
let EMBRYONIC_AWAIT_TIME = 44444;

async function initiateCharacterGenesisForChakra(number) {
  console.log(
    `Initiating character genesis for the world of the ${number} chakra`
  );

  try {
    const thisWorld = await prisma.world.findUnique({
      where: {
        chakra: +number,
      },
    });
    console.log('Inside here, the world is: ', thisWorld);

    // Start the processing of VOID, GERMINAL, and EMBRYONIC characters concurrently.
    Promise.all([
      processVoidCharacters(thisWorld.id, 22222), ///GOOD
      processGerminalCharacters(thisWorld.id, GERMINAL_AWAIT_TIME), ///GOOD
      processEmbryonicCharacters(thisWorld.id, EMBRYONIC_AWAIT_TIME), ///
    ])
      .then(() => console.log('All processes completed'))
      .catch(error => console.error(`Error in concurrent processes: ${error}`));
  } catch (error) {
    console.log('The error is: ', error);
  }
}

async function generateCharacterStory(character) {
  const characterSystemMessage = await getCharacterSystemMessage(character);
  const characterUserContent = await getCharacterUserContent(character);

  try {
    const messages = [
      {
        role: 'system',
        content: characterSystemMessage,
      },
      {
        role: 'user',
        content: characterUserContent,
      },
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log('The call to chatgtp was successful');

    const dataResponse = completion.data.choices[0].message.content;

    const nameRegex = /"characterName"\s*:\s*"([\s\S]*?)"/;
    const backstoryRegex = /"characterBackstory"\s*:\s*"([\s\S]*?)"/;
    const promptForMidjourneyRegex = /"promptForMidjourney"\s*:\s*"([\s\S]*?)"/;

    const nameMatch = dataResponse.match(nameRegex);
    const backstoryMatch = dataResponse.match(backstoryRegex);
    const promptForMidjourneyMatch = dataResponse.match(
      promptForMidjourneyRegex
    );

    let characterName, characterBackstory, promptForMidjourney;

    if (nameMatch !== null && nameMatch.length > 1) {
      characterName = nameMatch[1];
    }

    if (backstoryMatch !== null && backstoryMatch.length > 1) {
      characterBackstory = backstoryMatch[1];
    }

    if (
      promptForMidjourneyMatch !== null &&
      promptForMidjourneyMatch.length > 1
    ) {
      promptForMidjourney = `https://s.mj.run/YLJMlMJbo70, The profile picture of a cartoon. ${promptForMidjourneyMatch[1]}`;
    }

    let world = await prisma.world.findFirst({
      where: { chakra: character.world.chakra },
    });

    // Update the character in the database from VOID to GERMINAL
    let updatedCharacter = await prisma.character.update({
      where: {
        id: character.id,
      },
      data: {
        completionResponse: completion.data.choices[0].message.content,
        promptForMidjourney: promptForMidjourney,
        state: 'GERMINAL',
        characterName: characterName,
        characterBackstory: characterBackstory,
        chosenImageUrl: 'https://s.mj.run/YLJMlMJbo70',
      },
    });
    console.log(
      "The character was updated from VOID to GERMINAL. It's id is: ",
      character.id
    );
  } catch (error) {
    console.log('There was an error in the generateCharacterStory function.');
    console.log(error);
    return;
  }
}

async function processVoidCharacters(worldId, interval) {
  const response = await processVoid(worldId);
  if (response && response.message) {
    return;
  }
  setTimeout(() => processVoidCharacters(worldId, interval), interval);
}

async function processVoid(worldId) {
  const voidCharacter = await prisma.character.findFirst({
    where: {
      worldId: worldId,
      state: 'VOID',
    },
    include: {
      world: true,
    },
  });
  if (!voidCharacter) return { message: 'There are no more void characters' };
  generateCharacterStory(voidCharacter);
}

async function fetchImageFromMidjourney(promptForMidjourney) {
  console.log('Inside the fetchimagefrommidjourney function.');
  if (!promptForMidjourney)
    return console.log('there is no prompt for midjourney!');
  try {
    const config = {
      headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
    };

    const response = await axios.post(
      `http://164.90.252.239:8055/items/images`,
      { prompt: promptForMidjourney },
      config
    );
    console.log(
      'Inside the fetchImageFromMidjourney function, the image id is: ',
      response.data.data.id
    );
    return response.data.data;
  } catch (error) {
    console.log('there was an error fetching imagineApi');
    return null;
  }
}

async function requestCharacterImage(character, worldId) {
  console.log('Inside the new request character image function');
  try {
    const responseFromImagineApi = await fetchImageFromMidjourney(
      character.promptForMidjourney
    );
    if (responseFromImagineApi.id) {
      // Update the character's state in the database, from GERMINAL to EMBRYONIC.
      let updatedCharacter = await prisma.character.update({
        where: { id: character.id },
        data: {
          imageId: responseFromImagineApi.id,
          state: 'EMBRYONIC',
          chosenImageUrl: 'https://s.mj.run/YLJMlMJbo70',
        },
      });
      setTimeout(
        () => processGerminalCharacters(worldId, GERMINAL_AWAIT_TIME),
        GERMINAL_AWAIT_TIME
      );
    } else {
      console.log('There was an error prompting imagineAPI');
    }
  } catch (error) {
    console.log(
      'There was an error in the requestCharacterImage function, this was the error:'
    );
    console.log(error);
  }
}

async function processGerminalCharacters(worldId, interval) {
  try {
    // Check the number of EMBRYONIC characters in the database
    const countEmbryonicCharacters = await prisma.character.count({
      where: { state: 'EMBRYONIC', worldId: worldId },
    });

    if (countEmbryonicCharacters > 20) {
      // If there are more than 20 EMBRYONIC characters, wait for 30 seconds before making a new request
      setTimeout(() => processGerminalCharacters(worldId, interval), interval);
    } else {
      // If there are 20 or fewer EMBRYONIC characters, proceed with the GERMINAL to EMBRYONIC transition
      const germinalCharacter = await prisma.character.findFirst({
        where: { worldId: worldId, state: 'GERMINAL' },
        include: { world: true },
      });
      console.log(
        'In here, the germinal characters id is: ',
        germinalCharacter.id
      );

      if (!germinalCharacter)
        return { message: 'No more characters in the germinal state' };
      requestCharacterImage(germinalCharacter, worldId);
    }
  } catch (error) {
    console.log('Error in processGerminalCharacters: ', error);
  }
}

async function processEmbryonicCharacters(worldId, interval) {
  const response = await processEmbryonic(worldId);

  if (response && response.message) {
    return;
  }
  setTimeout(
    () => processEmbryonicCharacters(worldId, GERMINAL_AWAIT_TIME),
    GERMINAL_AWAIT_TIME
  );
}

async function getImageInformation(character, worldId) {
  console.log(
    'Inside the get Image information function, with this characters id',
    character.id
  );
  try {
    const config = {
      headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
    };
    const response = await axios.get(
      `http://164.90.252.239:8055/items/images/${character.imageId}`,
      config
    );
    let updatedCharacter;
    if (response.data.data.status === 'completed') {
      console.log(
        'the character generation is complete for for ',
        character.id
      );
      updatedCharacter = await prisma.character.update({
        where: { id: character.id },
        data: {
          state: 'FETAL',
          upscaledImageUrls: response.data.data.upscaled_urls,
        },
      });
    } else if (response.data.data.status === 'failed') {
      console.log('the character generation failed for ', character.id);
      updatedCharacter = await prisma.character.update({
        where: { id: character.id },
        data: {
          state: 'FAILED',
        },
      });
    }
    setTimeout(() => {
      processEmbryonic(worldId);
    }, GERMINAL_AWAIT_TIME);
  } catch (error) {
    console.log('There was an error in the newGetImageInformation function');
    console.log(error);
  }
}

async function processEmbryonic(worldId) {
  const embryonicCharacter = await prisma.character.findFirst({
    where: {
      worldId: worldId,
      state: 'EMBRYONIC',
    },
    include: {
      world: true,
    },
  });
  console.log(
    'inside the process embryonic, the id is: ',
    embryonicCharacter.id
  );
  if (!embryonicCharacter)
    return { message: 'No more characters in the embryonic state' };
  getImageInformation(embryonicCharacter, worldId);
}

module.exports = {
  initiateCharacterGenesisForChakra,
};
