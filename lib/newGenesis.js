const { addWorldsToDb } = require('./newCharacterGenerator');
const {
  typesOfCharacters,
  getCharacterTraits,
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

const WORLDS = 8;
const NUMBER_OF_EACH_CHARACTER_PER_WORLD = 1;

let voidQueue = [];
let germinalQueue = [];
let embryonicQueue = [];
let fetalQueue = [];
let failedQueue = [];

const characterTypes = [
  'normal',
  'evil',
  'god',
  'homeless',
  'legendary',
  'animal',
  'protector',
  'mystic',
  'artisan',
  'jester',
  'scholar',
  'explorer',
  'ascended',
  'forgotten',
  'nondualenergy',
  'mother',
  'psychedelicbeing',
];

const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];

async function restoreFromWhereItLeft() {
  const characters = await prisma.character.findMany();
  const voidedCharacters = characters.filter(x => x.state === 'VOID');
  const germinalCharacters = characters.filter(x => x.state === 'GERMINAL');
  const embrionicCharacters = characters.filter(x => x.state === 'EMBRYONIC');
  const fetalCharacters = characters.filter(x => x.state === 'FETAL');
  const failedCharacters = characters.filter(x => x.state === 'FAILED');

  console.log(
    voidedCharacters.length,
    germinalCharacters.length,
    embrionicCharacters.length,
    fetalCharacters.length,
    failedCharacters.length
  );
  voidedCharacters.forEach(x => {});
  failedCharacters.forEach(x => {
    console.log('requesting the image for character ', x.name);
    requestCharacterImage(x);
  });
  embrionicCharacters.forEach(x => {
    checkCharacterImage(x);
  });
}

// restoreFromWhereItLeft();

async function generateCharacterStory(character) {
  console.log('Inside the generate character story');
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

    console.log('the updated character is: ', updatedCharacter.id);

    germinalQueue.push(updatedCharacter);
  } catch (error) {
    console.log(
      'There was an error in the generateCharacterStory function, it will be pushed back into the voidQueue'
    );
    console.log(error);
    voidQueue.push(character);
    console.log(error.response.data.error);
    return;
  }
}

async function requestCharacterImage(character) {
  console.log('Inside the request character image function');
  try {
    const responseFromImagineApi = await fetchImageFromMidjourney(
      character.promptForMidjourney
    );

    // Update the character's state in the database, from GERMINAL to EMBRYONIC.
    let updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        imageId: responseFromImagineApi.id,
        state: 'EMBRYONIC',
        chosenImageUrl: 'https://s.mj.run/YLJMlMJbo70',
      },
    });
    embryonicQueue.push(updatedCharacter);
  } catch (error) {
    console.log('there was an error in the requestCahracterImage function');
    germinalQueue.push(character);
  }
}

let timer;

async function checkCharacterImage(character) {
  try {
    let image, updatedCharacter;
    // Wait loop until the image is upscaled.
    image = await fetchImage(character.imageId);
    if (image && image.status === 'failed') {
      updatedCharacter = await prisma.character.update({
        where: {
          id: character.id,
        },
        data: {
          state: 'FAILED',
        },
      });
      console.log('The characters image status is FAILED');

      failedQueue.push(updatedCharacter);
      return;
    }
    if (image && image.status === 'completed') {
      updatedCharacter = await prisma.character.update({
        where: {
          id: character.id,
        },
        data: {
          upscaledImageUrls: image.upscaled_urls,
          state: 'FETAL',
        },
      });
      console.log('The characters status was changed to FETAL');
      fetalQueue.push(updatedCharacter);
      return;
    }
  } catch (error) {
    embryonicQueue.push(character);
    console.log('The error is: ', error);
  }
}

async function fetchImageFromMidjourney(promptForMidjourney) {
  console.log(
    'inside the fetchimagefrommidjourney function, the prompt for midjourney is:',
    promptForMidjourney
  );
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
    console.log('The image was prompted to midjourney.');
    return response.data.data;
  } catch (error) {
    console.log('there was an error fetching imagineApi');
    return null;
  }
}

async function fetchImage(imageId, characterId) {
  const config = {
    headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
  };
  try {
    const response = await axios.get(
      `http://164.90.252.239:8055/items/images/${imageId}`,
      config
    );
    console.log('Fetched from imagineAPI', response.data.data);
    if (
      response.data.data.status !== 'pending' &&
      response.data.data.status !== 'in-progress'
    ) {
      return response.data.data;
    }
    if (response.data.data.status === 'failed') {
      updatedCharacter = await prisma.character.update({
        where: {
          id: characterId,
        },
        data: {
          state: 'FAILED',
        },
      });
      console.log(
        `The character ${character.id} was updated and moved to the failed state.`
      );
    }
  } catch (error) {}
}

async function genesisForChakra(number) {
  console.log(
    `Time to birth the characters for the world of the ${number} chakra`
  );

  try {
    const thisWorld = await prisma.world.findUnique({
      where: {
        chakra: +number,
      },
    });
    const characters = await prisma.character.findMany({
      where: {
        worldId: thisWorld.id,
      },
      include: {
        world: true,
      },
    });
    voidQueue = characters.filter(x => x.state === 'VOID');
    germinalQueue = characters.filter(x => x.state === 'GERMINAL');
    embryonicQueue = characters.filter(x => x.state === 'EMBRYONIC');
    fetalQueue = characters.filter(x => x.state === 'FETAL');
    failedQueue = characters.filter(x => x.state === 'FAILED');

    startTheProcessOfBirthingCharacters(number);
  } catch (error) {
    console.log('The error is: ', error);
  }
}

async function newGenesisForChakra(number) {
  console.log(
    `Time to birth the characters for the world of the ${number} chakra`
  );

  try {
    const thisWorld = await prisma.world.findUnique({
      where: {
        chakra: +number,
      },
    });
    const voidIntervalId = setInterval(async () => {
      const response = await processVoid(thisWorld.id);
      if (response.message) {
        clearInterval(voidIntervalId);
      }
    }, 22222);

    const germinalIntervalId = setInterval(async () => {
      const response = await processGerminal(thisWorld.id);
      if (response.message) {
        clearInterval(germinalIntervalId);
      }
    }, 44444); ///THIS IS THE NUMBER THAT NEEDS TO BE ADJUSTED EACH TIME. HOW CAN THAT HAPPEN? IS IT WITH A TIMEOUT?

    const embryonicIntervalId = setInterval(async () => {
      const response = await processEmbryonic(thisWorld.id);
      if (response.message) {
        clearInterval(embryonicIntervalId);
      }
    }, 44444); // THIS NUMBER ALSO NEEDS TO BE ADJUSTED IN RELATIONSHIP TO THE AMOUNT OF SUCCESSFULL QUERIES TO IMAGINE API
  } catch (error) {
    console.log('The error is: ', error);
  }
}

async function newGenerateCharacterStory(character) {
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
      'The story was generated and the characters state is now GERMINAL'
    );
  } catch (error) {
    console.log('There was an error in the generateCharacterStory function.');
    console.log(error);
    return;
  }
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
  if (!voidCharacter) return { message: 'No more characters' };
  newGenerateCharacterStory(voidCharacter);
}

async function newRequestCharacterImage(character) {
  console.log(
    'Inside the new request character image function, the character is: ',
    character.nftNumber
  );
  try {
    if (!character.promptForMidjourney) {
      console.log(
        'The character doesnt have a prompt for midjourney, it will be sent back to the void'
      );
      await prisma.character.update({
        where: { id: character.id },
        data: {
          state: 'VOID',
        },
      });
      return;
    }
    const responseFromImagineApi = await fetchImageFromMidjourney(
      character.promptForMidjourney
    );

    // Update the character's state in the database, from GERMINAL to EMBRYONIC.
    let updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        imageId: responseFromImagineApi.id,
        state: 'EMBRYONIC',
        chosenImageUrl: 'https://s.mj.run/YLJMlMJbo70',
      },
    });
    console.log(
      'The image was requested and the characters state is now EMBRYONIC'
    );
  } catch (error) {
    console.log('there was an error in the requestCahracterImage function');
    germinalQueue.push(character);
  }
}

async function processGerminal(worldId) {
  const germinalCharacter = await prisma.character.findFirst({
    where: {
      worldId: worldId,
      state: 'GERMINAL',
    },
    include: {
      world: true,
    },
  });
  if (!germinalCharacters)
    return { message: 'No more characters in the germinal state' };
  newRequestCharacterImage(germinalCharacter);
}

async function newGetImageInformation(character) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
    };
    const response = await axios.get(
      `http://164.90.252.239:8055/items/images/${character.imageId}`,
      config
    );
    console.log('Fetching from imagineAPI', response.data.data);
    if (
      response.data.data.status !== 'pending' &&
      response.data.data.status !== 'in-progress'
    ) {
      return response.data.data;
    }
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
  if (!embryonicCharacter)
    return { message: 'No more characters in the embryonic state' };
  newGetImageInformation(embryonicCharacter);
}

let TIME_IN_BETWEEN_CHARACTER_GENERATION = 22222;

async function startTheProcessOfBirthingCharacters(chakra) {
  console.log('inside the startTheProcessOfBirthingCharacters function');

  let characterFlowIntervalId = setInterval(() => {
    manageCharacterFlow(chakra);
  }, TIME_IN_BETWEEN_CHARACTER_GENERATION);
}

async function manageCharacterFlow(chakraNumber) {
  // This function will be called each TIME_IN_BETWEEN_CHARACTER_GENERATION seconds.
  const world = await prisma.world.findUnique({
    where: { chakra: chakraNumber },
  });
  const voidCharacter = await prisma.character.findFirst({
    where: {
      worldId: world.id,
      state: 'VOID',
    },
    include: {
      world: true,
    },
  });
  if (voidCharacter)
    await generateCharacterStory(voidCharacter).catch(handleError);
  else {
    console.log('There are no more germinal characters');
  }

  // const germinalCharacter = await prisma.character.findFirst({
  //   where: {
  //     worldId: world.id,
  //     state: 'GERMINAL',
  //   },
  //   include: {
  //     world: true,
  //   },
  // });
  // if (germinalCharacter)
  //   await newRequestCharacterImage(germinalCharacter).catch(handleError);
  // else {
  //   console.log('There are no more germinal characters');
  // }

  // const embrionicCharacter = await prisma.character.findFirst({
  //   where: {
  //     worldId: world.id,
  //     state: 'EMBRYONIC',
  //   },
  //   include: {
  //     world: true,
  //   },
  // });
  // if (embrionicCharacter)
  //   await checkCharacterImage(germinalCharacter).catch(handleError);
  // else {
  //   console.log('There are no more embrionic characters');
  // }

  // if (fetalQueue.length > 0) {
  //   console.log('inside here, the fetal queue is: ', fetalQueue);
  //   let fetalcharacter = fetalQueue.shift();
  //   // The only way on which the fetal queue is emptied is by having people play with it in the front end.
  // }

  // if (failedQueue.length > 0) {
  //   let failedcharacter = failedQueue.shift();
  //   await requestCharacterImage(failedcharacter).catch(handleError);
  // }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handler
function handleError(err) {
  console.error('An error occurred:', err);
}

module.exports = {
  generateCharacterStory,
  requestCharacterImage,
  checkCharacterImage,
  genesisForChakra,
  newRequestCharacterImage,
};
