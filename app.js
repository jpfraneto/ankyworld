require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const cron = require('node-cron');
const async = require('async');
const fs = require('fs');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./lib/prismaClient');
const bodyParser = require('body-parser');
const { genesisForChakra } = require('./lib/newGenesis');
const { initiateCharacterGenesisForChakra } = require('./lib/finalGenesis');

app.set('view engine', 'ejs');

// initiateCharacterGenesisForChakra(2);

async function getCharactersInformation() {
  console.log('inside here');
  const world = await prisma.world.findUnique({ where: { chakra: 2 } });
  const characters = await prisma.character.findMany({
    where: { worldId: world.id },
  });
  const voidCharacters = characters.filter(x => x.state === 'VOID');
  const embrionicCharacters = characters.filter(x => x.state === 'EMBRYONIC');
  const germinalCharacters = characters.filter(x => x.state === 'GERMINAL');
  const fetalCharacters = characters.filter(x => x.state === 'FETAL');
  const birthedCharacters = characters.filter(x => x.state === 'BIRTHED');
  const failedCharacters = characters.filter(x => x.state === 'FAILED');
  console.log('void', voidCharacters.length);
  console.log('embrionic', embrionicCharacters.length);
  console.log('germinal', germinalCharacters.length);
  console.log('fetal', fetalCharacters.length);
  console.log('birthed', birthedCharacters.length);
  console.log('failed', failedCharacters.length);
}

// async function findBirthedCharacters() {
//   const world = await prisma.world.findUnique({ where: { chakra: 1 } });
//   const characters = await prisma.character.findMany({
//     where: { worldId: world.id, state: 'BIRTHED' },
//   });

//   console.log('The birthed characters are: ', characters);
// }

// findBirthedCharacters();
genesisForChakra(2);
// getCharactersInformation();

let pendingOnes = 0;

// async function checkIfImageWasGenerated(imageId) {
//   const config = {
//     headers: { Authorization: `Bearer ${process.env.IMAGINE_API_KEY}` },
//   };

//   const response = await axios.get(
//     `http://164.90.252.239:8055/items/images/${imageId}`,
//     config
//   );
//   if (
//     response.data.data.status !== 'pending' &&
//     response.data.data.status !== 'in-progress'
//   ) {
//     console.log('Here goes one for updating.');
//     return response.data.data;
//   } else {
//     pendingOnes++;
//   }
// }

// async function updateEmbryonicCharacters() {
//   console.log('in here');
//   const world = await prisma.world.findUnique({ where: { chakra: 1 } });
//   const characters = await prisma.character.findMany({
//     where: { worldId: world.id },
//   });
//   const embryonicCharacters = characters.filter(x => x.state === 'EMBRYONIC');
//   console.log(
//     'doing this for all the embryonic characters, which are',
//     embryonicCharacters.length
//   );
//   const updatePromises = embryonicCharacters.map(async character => {
//     const image = await checkIfImageWasGenerated(character.imageId);
//     if (image && image.upscaled_urls) {
//       let updatedCharacter = await prisma.character.update({
//         where: {
//           id: character.id,
//         },
//         data: {
//           upscaledImageUrls: image.upscaled_urls,
//           state: 'FETAL',
//         },
//       });
//       console.log('The character was updated and moved to the fetal state.');
//     }
//   });

//   console.log('THe pending ones are: ', pendingOnes);

//   // Use Promise.all to wait for all updates to complete.
//   return Promise.all(updatePromises);
// }

//updateEmbryonicCharacters();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello, welcome to the Anky NFTs server!');
});

// app.get('/tweet', async (req, res) => {
//   const form = new FormData();
//   form.append('media', fs.createReadStream('./aaaa.png'));

//   const mediaUploadResponse = await client.v2.mediaUpload(form);
//   const mediaId = mediaUploadResponse.media_id;
//   const tweetText = 'Testing things out.';
//   const tweetResponse = await client.v2.tweet(`${tweetText}`, {
//     media_ids: mediaId,
//   });
//   console.log('Tweet sent:', tweetResponse);
// });

app.get('/characters', async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      where: {
        readyToMint: false,
        state: 'FETAL',
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20,
    });
    res.render('characters', { characters });
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).send('Error getting characters');
  }
});

app.get('/api/characters', async (req, res) => {
  const fetalCharacters = await prisma.testCharacter.findMany({
    where: {
      readyToMint: false,
      state: 'FETAL',
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 20,
  });
  res.json({ fetalCharacters });
});

app.get('/characters/ready', async (req, res) => {
  try {
    const readyCharacters = await prisma.character.findMany({
      where: {
        readyToMint: true,
        state: 'BIRTHED',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    console.log('THE BIRTHED CHARACTERS ARE: ', readyCharacters);
    res.render('individualCharacter', { readyCharacters });
  } catch (error) {
    console.log(error);
    console.error('Error getting characters:', error);
    res.status(500).send('Error getting characters');
  }
});

app.put('/api/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { chosenImageUrl, readyToMint } = req.body;
    console.log(
      'inside here, ready to update this character: ',
      id,
      chosenImageUrl
    );
    await prisma.character.update({
      where: {
        id,
      },
      data: {
        chosenImageUrl,
        readyToMint,
        state: 'BIRTHED',
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).send('Error updating character');
  }
});

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
