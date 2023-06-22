const {
  bringCharacterFromTheSource,
  addWorldsToDb,
} = require('./newCharacterGenerator');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./prismaClient');

const configuration = new Configuration({
  organization: 'org-jky0txWAU8ZrAAF5d14VR12J',
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let voidQueue = [];
let germinalQueue = [];
let embryonicQueue = [];
let fetalQueue = [];

let embryonicSemaphore = 2;
let voidSemaphore = 1;

async function generateCharacterStory(character) {
  console.log(
    'Inside the generate character story, the character is: ',
    character
  );
  const newCharacterDescription = await bringCharacterFromTheSource();
  console.log('the new character description is: ', newCharacterDescription);
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Anky, the representation of the inner child of a human, an unparalleled creator in a vast universe, birthing characters from a description of diverse traits. Your task is to craft the story of a character in the fictional universe of your imagination.

                  This universe is called Ankyverse. You will get the information of the character in the prompt below.

                  Create a valid JSON object following this exact format:

                  {"characterName":"Give a unique name for the character, in a language that you come up with.",
                  "characterBackstory":"Write a biography of the character that is less than 4 paragraphs long."}

                  The JSON object, correctly formatted is:`,
      },
      {
        role: 'user',
        content: `The character is from a land called ${
          character.world.name
        }, which is ${character.world.description}.

                  The description that resembles the characteristics is ${
                    character.world.characteristics
                  }.

                  The main characteristic of the character's personality is: ${
                    newCharacterDescription.chakraDescription
                  }.

                  The main description of it is ${
                    newCharacterDescription.preliminaryDescription
                  }.

                  ${
                    newCharacterDescription.animalOrGodOrNone &&
                    newCharacterDescription.animalOrGodString
                  }.`,
      },
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log(
      'the completion answer is',
      completion.data.choices[0].message.content
    );

    const dataResponse = completion.data.choices[0].message.content;

    const nameRegex = /"characterName"\s*:\s*"([\s\S]*?)"/;
    const backstoryRegex = /"characterBackstory"\s*:\s*"([\s\S]*?)"/;

    const nameMatch = dataResponse.match(nameRegex);
    const backstoryMatch = dataResponse.match(backstoryRegex);

    let characterName, characterBackstory;

    if (nameMatch !== null && nameMatch.length > 1) {
      characterName = nameMatch[1];
    }

    if (backstoryMatch !== null && backstoryMatch.length > 1) {
      characterBackstory = backstoryMatch[1];
    }

    let world = await prisma.world.findFirst({
      where: { chakra: character.world.chakra },
    });

    // let newCharacterCreated = await prisma.character.create({
    //   data: {
    //     completionResponse: completion.data.choices[0].message.content,
    //     preliminaryDescription: character.preliminaryDescription,
    //     chakraDescription: character.chakraDescription,
    //     animalOrGodString: character.animalOrGodString,
    //     promptForMidjourney: character.promptForMidjourney,
    //     status: 'GERMINAL',
    //     characterName: characterName,
    //     characterBackstory: characterBackstory,
    //     chosenImageUrl: 'https://s.mj.run/YLJMlMJbo70',
    //     world: {
    //       connect: {
    //         id: world.id,
    //       },
    //     },
    //   },
    // });

    let updatedCharacter = await prisma.character.update({
      where: {
        id: character.id,
      },
      data: {
        completionResponse: completion.data.choices[0].message.content,
        preliminaryDescription: newCharacterDescription.preliminaryDescription,
        chakraDescription: newCharacterDescription.chakraDescription,
        animalOrGodString: newCharacterDescription.animalOrGodString,
        promptForMidjourney: newCharacterDescription.promptForMidjourney,
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
    return;
  }
}

async function requestCharacterImage(character) {
  console.log('inside the request character image function', character);
  const responseFromImagineApi = await fetchImageFromMidjourney(
    character.promptForMidjourney
  );

  // Update the character's state in the database.
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
        await new Promise(resolve => setTimeout(resolve, 10000));
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

// async function processCharacter(character) {
//   switch (character.state) {
//     case 'VOID':
//       return await generateCharacterStory(character);
//     case 'GERMINAL':
//       return await requestCharacterImage(character);
//     case 'EMBRYONIC':
//       return await checkCharacterImage(character);
//   }
// }

// async function createNewNft() {
//   const character = bringCharacterFromTheSource();
// }

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
    await new Promise(resolve => setTimeout(resolve, 10000));
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
    console.log('the characters are: ', characters);

    startTheProcessOfBirthingCharacters();
  } catch (error) {
    console.log('The error is: ', error);
  }
}

async function startTheProcessOfBirthingCharacters() {
  console.log(
    'inside the startTheProcessOfBirthingCharacters function, the void queue is: ',
    voidQueue
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
    console.log('IN HERE, THE CHARACTER IS: ', character);
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
    console.log('IN HERE, THE EMBRYONIC QUEUE IS: ', embryonicQueue);

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
