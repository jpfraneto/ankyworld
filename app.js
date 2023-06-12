require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./lib/prismaClient');
const { generateCharacter } = require('./lib/characterGenerator');
const { one, two } = require('./lib/messages');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser');
const { newGenerateCharacter } = require('./lib/newCharacterGenerator');
const { faker } = require('@faker-js/faker');

app.set('view engine', 'ejs');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

const configuration = new Configuration({
  organization: 'org-jky0txWAU8ZrAAF5d14VR12J',
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// function generateMockCharacter() {
//   const character = {
//     id: faker.string.uuid(),
//     preliminaryDescription: faker.lorem.paragraph(),
//     chakraDescription: faker.lorem.paragraph(),
//     animalOrGodString: faker.word.noun(),
//     worldId: faker.string.uuid(),
//     promptForMidjourney: faker.lorem.paragraph(),
//     characterName: faker.person.firstName(),
//     characterBackstory: faker.lorem.paragraph(),
//     imageId: faker.string.uuid(),
//     imageUrl: faker.image.url(),
//     upscaledImageUrls: Array.from({ length: 4 }, () => faker.image.url()),
//     chosenImageUrl: null,
//     readyToMint: false,
//   };
//   console.log('the character is: ', character);
//   return character;
// }

// function generateMockCharacters(count) {
//   return Array.from({ length: count }, generateMockCharacter);
// }

// const recurrentCharacterGeneration = async character => {
//   const prevCharacterActiveChakra = 'third';
//   const thisCharacterActiveChakra = 'fourth';
//   const messages = [
//     {
//       role: 'system',
//       content: `You are Anky, a representation of God, and you are in charge of crafting the most epic adventure that humanity has witnessed. For this, your mission is to use the story of the character that you are going to receive next, and use it to craft the story of another character, which is soul bonded to this one.

//       The main guiding principle of this world that you are building is the hero's journey, the journey towards the self that every human navigates in his life.

//       The spinal chord of the story is the chakra system, and the character that you will receive has active the ${prevCharacterActiveChakra} chakra. This one should have inside its story the ${thisCharacterActiveChakra}, and that will determine its personality.

//       It is very important that you follow this structure for the response, I want a javascript object, with each of the following elements as a property of it:

//        1. 'characterName': Give a unique name for the new character.
//        2. 'characterBackstory': The biography of the new character that is less than 4 paragraphs long.
//        3. 'promptForMidjourney': A graphical description of the new generated character. Less than 333 characters. Use the elements of the message prompt for creating the description. Make it graphical and cartoonish, and don't include the name here, only references to how the new character looks. This is the new character, not the old one.`,
//     },
//     {
//       role: 'user',
//       content: `Phoenix was a young orphan boy who grew up on the streets. He learned to fend for himself and became a skilled pickpocket, surviving on his own wits. One day, he stole a mysterious gemstone from an old man and was cursed with a burning sensation in his chest that wouldn\'t go away. The only way to break the curse was to find the gemstone\'s rightful owner.'
//     }
//     `,
//     },
//   ];

//   const completion = await openai.createChatCompletion({
//     model: 'gpt-3.5-turbo',
//     messages: messages,
//   });
//   if (completion.data) {
//     console.log(completion.data.choices[0].message.content);
//   } else {
//     console.log('there was an error');
//   }
// };

// const fetchImage = async imageId => {
//   const config = {
//     headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
//   };

//   while (true) {
//     const response = await axios.get(
//       `http://164.90.252.239:8055/items/images/${imageId}`,
//       config
//     );

//     if (
//       response.data.data.status !== 'pending' &&
//       response.data.data.status !== 'in-progress'
//     ) {
//       return response.data.data;
//     }

//     // Wait 10 seconds before trying again
//     await new Promise(resolve => setTimeout(resolve, 10000));
//   }
// };

let generateCharacters = 1;

createNewNft();
const intervalID = setInterval(async () => {
  try {
    if (generateCharacters > 100) return clearInterval(intervalID);
    const newNftCreation = await createNewNft();
    console.log(
      'The new NFT character was created, this is the info that the function returned: ',
      newNftCreation
    );
  } catch (error) {
    console.log('There was an error inside the setInterval', error);
  }
}, 33333);

async function createNewNft() {
  const character = newGenerateCharacter();
  console.log(
    'inside the createNewNft function, the character is: ',
    character
  );
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Anky, the representation of the inner child of a human, an unparalleled creator in a vast universe, birthing characters from a description of diverse traits. Your task is to craft the story of a character in the fictional world of your imagination.

        This world is called Ankycosm. You will get the information of the character in the prompt below.

        Create a valid JSON object following this exact format:

        {"characterName":"Give a unique name for the character, in a language that you come up with.",
        "characterBackstory":"Write a biography of the character that is less than 4 paragraphs long."}

        The JSON object:`,
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
          character.chakraDescription
        }.

        The main description of it is ${character.preliminaryDescription}.

        ${character.animalOrGodOrNone && character.animalOrGodString}.`,
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
    const dataCharacter = JSON.parse(dataResponse.trim());

    console.log('OUT HERE. ', dataCharacter, character);

    // const config = {
    //   headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
    // };

    // const bodyParameters = {
    //   prompt: character.promptForMidjourney,
    // };

    // const response = await axios.post(
    //   'http://164.90.252.239:8055/items/images',
    //   bodyParameters,
    //   config
    // );

    // const imageId = response.data.data.id;

    let world = await prisma.world.findFirst({
      where: { chakra: character.world.chakra },
    });

    console.log('the world is:', world);

    // // Create new character in database
    let newCharacter = await prisma.character.create({
      data: {
        completionResponse: completion.data.choices[0].message.content,
        preliminaryDescription: character.preliminaryDescription,
        chakraDescription: character.chakraDescription,
        animalOrGodString: character.animalOrGodString,
        promptForMidjourney: character.promptForMidjourney,
        characterName: dataCharacter.characterName,
        characterBackstory: dataCharacter.characterBackstory,
        world: {
          connect: {
            id: world.id,
          },
        },
      },
    });

    console.log(
      'Inside the function, the new character was generated in the db'
    );

    return newCharacter;

    // const image = await fetchImage(imageId);

    // if (image.url) {
    //   newCharacter = await prisma.character.update({
    //     where: { id: newCharacter.id },
    //     data: { imageUrl: image.url },
    //   });
    // }

    // console.log('the process ended.');

    // return {
    //   generatedCharacter: dataCharacter,
    //   characterData: character,
    //   image: image,
    // };
  } catch (error) {
    console.log('there was an error creating the character', error);
    console.log('HEREEEEE', error.response.data);
  }
}

const extractCharacter = str => {
  // Replace single quotes with double quotes, and remove line breaks
  const sanitizedStr = str.replace(/'/g, '"').replace(/\r?\n|\r/g, ' ');

  // Regex pattern to match the object
  const pattern = /{[^}]+}/g;

  // Search for the pattern
  const match = sanitizedStr.match(pattern);

  // If a match is found
  if (match) {
    // Since there might be more than one match, loop through them
    for (let i = 0; i < match.length; i++) {
      // Try to parse the string as JSON, in case it's the correct object
      try {
        const obj = JSON.parse(match[i]);
        // If the object has the right properties, return it
        if (obj.characterName && obj.characterBackstory) {
          return obj;
        }
      } catch (e) {
        // If it can't be parsed as JSON, just continue with the loop
        continue;
      }
    }
  }

  // If no suitable object is found, return null or another suitable default value
  return null;
};

// createNewNft();

// cron.schedule('*/5 * * * * *', createNFT);

app.get('/nfter', async (req, res) => {});

app.get('/', (req, res) => {
  res.send('Hello, welcome to the Anky NFTs server!');
});

app.get('/prompt', async (req, res) => {
  const config = {
    headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
  };

  const bodyParameters = {
    prompt: `https://s.mj.run/YLJMlMJbo70, the profile picture of a Cartoon. An aurora serpent, a serpentine being that glows with a captivating luminescence, resembling the aurora borealis. It entwines itself in patterns and shapes that amplify its owner's melodic, harmonic language, enhancing the profound depth of their communication.`,
  };
  const response = await axios.post(
    'http://164.90.252.239:8055/items/images',
    bodyParameters,
    config
  );
  console.log('IN HERE', response);
});

app.get('/image', async (req, res) => {
  console.log(req.query);
  const config = {
    headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
  };
  const resp = await axios.get(
    `http://164.90.252.239:8055/items/images/${req.query.id}`,
    config
  );
  console.log(resp);
  console.log(resp.data.data.upscaled_urls);
});

app.get('/anky', async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are in charge of writing the description of a random character in a fictional world filled of wonder and awe. This is going to be the world on which children will be educated in the coming years, using fun as the vehicle for the deeper experience of life. Please make the description not more than 333 characters`,
      },
      { role: 'user', content: '' },
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });
    console.log('the completion is: ', completion);

    const newTester = await prisma.tester.create({
      data: {
        text: completion.data.choices[0].message.content,
      },
    });

    res.status(200).json({
      imagePromptForMidjourney:
        `https://s.mj.run/YLJMlMJbo70, The profile picture of a cartoon. ` +
        completion.data.choices[0].message.content,
      bio: completion.data.choices[0].message.content,
    });
  } catch (error) {
    console.log('There was another error in this thing.', error);

    if (error.response) {
      console.log(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.log('THE ERROR IS: ', error);
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      });
    }
  }
});

app.get('/nfts', async (req, res) => {
  try {
    const nfts = await prisma.nFT.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(nfts);
  } catch (error) {
    console.error('Error getting testers:', error);
    res.status(500).send('Error getting testers');
  }
});

app.get('/testers', async (req, res) => {
  try {
    const testers = await prisma.tester.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(testers);
  } catch (error) {
    console.error('Error getting testers:', error);
    res.status(500).send('Error getting testers');
  }
});

// app.get('/characters', async (req, res) => {
//   try {
//     const characters = await prisma.character.findMany({
//       where: {
//         readyToMint: false,
//       },
//       orderBy: {
//         createdAt: 'asc',
//       },
//     });
//     res.render('characters', { characters });
//   } catch (error) {
//     console.error('Error getting characters:', error);
//     res.status(500).send('Error getting characters');
//   }
// });

app.get('/characters', async (req, res) => {
  try {
    // Replace with actual database query once the DB connection is available
    const characters = generateMockCharacters(80);
    const charactersCount = characters.filter(
      character => !character.readyToMint
    ).length;
    res.render('characters', { characters });
  } catch (error) {
    console.error('Error getting characters count:', error);
    res.status(500).send('Error getting characters count');
  }
});

app.put('/characters/:id', async (req, res) => {
  try {
    // Without a real DB, we can't actually persist the changes. Just pretend the update is successful.
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).send('Error updating character');
  }
});

// app.put('/characters/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { chosenImageUrl, readyToMint } = req.body;
//     await prisma.character.update({
//       where: {
//         id,
//       },
//       data: {
//         chosenImageUrl,
//         readyToMint,
//       },
//     });
//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Error updating character:', error);
//     res.status(500).send('Error updating character');
//   }
// });

app.get('/characters/not-ready', async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      where: {
        readyToMint: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    res.json(characters);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).send('Error getting characters');
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
