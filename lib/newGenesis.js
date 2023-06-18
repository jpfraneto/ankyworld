const { addWorldsToDb } = require('./newCharacterGenerator');
const {
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

const BIG_BANG_SIZE = 88;
const WORLDS = 8;
const CHARACTERS_PER_WORLD = BIG_BANG_SIZE / WORLDS;
const NUMBER_OF_EACH_CHARACTER_PER_WORLD = 1;

let voidQueue = [];
let germinalQueue = [];
let embryonicQueue = [];
let fetalQueue = [];

let embryonicSemaphore = 2;
let voidSemaphore = 1;
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
];

const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];
console.log('ASLKCJASLCJA', characterTypes.length);

async function bigbangEvent() {
  console.log('Inside the big bang event function.');
  try {
    // Cleanup phase: remove all existing characters
    await prisma.character.deleteMany();
    console.log('Successfully removed all existing characters.');

    const worlds = await prisma.world.findMany({ include: { cities: true } });
    if (worlds.length === 0) {
      console.error('No worlds found in the database. They will be added now');
      await addWorldsToDb();
      console.log('Successfully added all the worlds.');
      return;
    }

    const CHARACTERS_PER_WORLD = Math.ceil(BIG_BANG_SIZE / worlds.length);
    let totalCharactersGenerated = 0;

    // Creation phase: generate new characters
    console.log(`Now the characters will be generated for each world`);
    for (const world of worlds) {
      for (let i = 0; i < characterTypes.length; i++) {
        for (let j = 0; j < NUMBER_OF_EACH_CHARACTER_PER_WORLD; j++) {
          const thisCharacterType = characterTypes[i];
          let character = {};

          const traitsResult = await getCharacterTraits(thisCharacterType);
          const randomCity = randomPick(world.cities);
          // Flatten the traits
          character.traits = {
            ...character,
            characterType: thisCharacterType,
            ...traitsResult.characterTraits,
            chakra: world.chakra,
            city: randomCity.name,
            cityMainActivity: randomCity.mainActivity,
          };
          character['worldId'] = world.id;
          character['state'] = 'VOID';
          character['worldCharacteristicsOfPeople'] =
            world.characteristicsOfPeople;
          totalCharactersGenerated++;
          console.log(
            'THE CHARACTER THAT IS GOING TO BE GENRATED IS: ',
            character
          );
          await prisma.character.create({
            data: character,
          });
        }
      }
    }
    console.log(
      `Successfully created ${totalCharactersGenerated} the characters across ${worlds.length} worlds.`
    );
  } catch (error) {
    console.error('Error during big bang:', error);
  }
}

// UNCOMMENT FOR GOING THROUGH THE BIG BANG EVENT
// bigbangEvent();
genesisForChakra(1);

async function generateCharacterStory(character) {
  console.log(
    'Inside the generate character story, the character is: ',
    character
  );
  const characterSystemMessage = await getCharacterSystemMessage(character);
  const characterUserContent = await getCharacterUserContent(character);
  console.log(
    'the characterSystemMessage and characterUserContent are done',
    characterSystemMessage,
    characterUserContent
  );

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

    console.log(
      'The completion answer is',
      completion.data.choices[0].message.content
    );

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

    console.log('the updated character is: ', updatedCharacter);

    germinalQueue.push(updatedCharacter);
  } catch (error) {
    console.log('There was an error in the generateCharacterStory function');
    console.log(error);
    console.log(error.response.data.error);
    return;
  }
}

async function requestCharacterImage(character) {
  console.log('inside the request character image function', character);
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
}

async function checkCharacterImage(character) {
  try {
    let image;
    // Wait loop until the image is upscaled.
    do {
      image = await fetchImage(character.imageId);
      if (!image || !image.upscaled_urls) {
        // Image is not yet ready, wait for 5 seconds before re-fetching.
        // You can adjust the waiting time as needed.
        await new Promise(resolve => setTimeout(resolve, 16180));
      }
    } while (!image || !image.upscaled_urls);

    // If the image has been upscaled, update the character's image URL and state in the database.
    let updatedCharacter = await prisma.character.update({
      where: {
        id: character.id,
      },
      data: {
        upscaledImageUrls: image.upscaled_urls,
        state: 'FETAL',
      },
    });

    // Add the updated character to the fetal queue.
    fetalQueue.push(updatedCharacter);
  } catch (error) {
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
    console.log('the response is: ', response);
    return response.data.data;
  } catch (error) {
    console.log('there was an error fetching imagineApi');
    return null;
  }
}

async function fetchImage(imageId) {
  const config = {
    headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
  };

  while (true) {
    const response = await axios.get(
      `http://164.90.252.239:8055/items/images/${imageId}`,
      config
    );
    console.log('Fetching from imagineAPI', response.data.data);
    if (
      response.data.data.status !== 'pending' &&
      response.data.data.status !== 'in-progress'
    ) {
      return response.data.data;
    }

    // Wait 10 seconds before trying again
    await new Promise(resolve => setTimeout(resolve, 11111));
  }
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
        state: 'VOID',
      },
      include: {
        world: true,
      },
    });
    voidQueue = characters;
    console.log(
      'the characters that were added to the voidqueue are: ',
      characters
    );

    startTheProcessOfBirthingCharacters();
  } catch (error) {
    console.log('The error is: ', error);
  }
}

async function startTheProcessOfBirthingCharacters() {
  console.log(
    'inside the startTheProcessOfBirthingCharacters function, the void queues first element is is: ',
    voidQueue[0]
  );
  let characterFlowIntervalId = setInterval(() => {
    if (
      ((voidQueue.length === germinalQueue.length) ===
        embryonicQueue.length) ===
      0
    )
      return clearInterval(characterFlowIntervalId);
    manageCharacterFlow();
  }, 10000);
}

async function manageCharacterFlow() {
  if (voidSemaphore > 0 && voidQueue.length > 0) {
    voidSemaphore--;
    let character = voidQueue.shift();
    console.log('IN HEREEEEo82173, THE CHARACTER IS: ', character);
    await generateCharacterStory(character).catch(handleError);
    voidSemaphore++;
  }

  if (germinalQueue.length > 0) {
    console.log('IN HERE, THE GERMINAL QUEUE IS: ', germinalQueue);
    let character = germinalQueue.shift();
    await requestCharacterImage(character).catch(handleError);
  }

  if (embryonicSemaphore > 0 && embryonicQueue.length > 0) {
    embryonicSemaphore--;
    console.log('IN AHLOJ h e r e, THE EMBRYONIC QUEUE IS: ', embryonicQueue);

    let character = embryonicQueue.shift();
    await checkCharacterImage(character).catch(handleError);
    embryonicSemaphore++;
  }

  if (fetalQueue.length > 0) {
    console.log('inside here, the fetal queue is: ', fetalQueue);
    let character = fetalQueue.shift();
    // Implement function to handle character in 'FETAL' state.
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handler
function handleError(err) {
  console.error('An error occurred:', err);
}

// Start the process flow, adjust intervals as per requirement
// const chraracterFlowInterval = setInterval(manageCharacterFlow, 5000);
// manageCharacterFlow();
// const voidInterval = setInterval(() => {
//   if (voidSemaphore > 0) {
//     manageCharacterFlow();
//   } else {
//     clearInterval(voidInterval);
//     console.log('No more characters on the void.');
//   }
// }, 30000);
// setInterval(() => {
//   if (embryonicSemaphore > 0) {
//     manageCharacterFlow();
//   }
// }, 10000);

module.exports = {
  generateCharacterStory,
  requestCharacterImage,
  checkCharacterImage,
  genesisForChakra,
};
