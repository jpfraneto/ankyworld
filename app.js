require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
const cron = require('node-cron');
const async = require('async');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./lib/prismaClient');
const bodyParser = require('body-parser');
// const genesis = require('./lib/genesis');
const { genesisForChakra } = require('./lib/newGenesis');

app.set('view engine', 'ejs');

// const runNewChakra = async () => {
//   console.log('Inside the run new chakra');
//   genesisForChakra(2);
//   for (let i = 3; i < 9; i++) {
//     setTimeout(() => {
//       console.log(
//         `Inside the set timeout. Now the genesis for the chakra number ${i} will start`
//       );
//       genesisForChakra(i);
//     }, i * 1800000);
//   }
// };
// runNewChakra();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello, welcome to the Anky NFTs server!');
});

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
    });
    res.render('characters', { characters });
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).send('Error getting characters');
  }
});

app.get('/api/characters', async (req, res) => {
  const fetalCharacters = await prisma.character.findMany({
    where: {
      state: 'FETAL',
    },
    orderBy: {
      createdAt: 'asc',
    },
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

app.put('/characters/:id', async (req, res) => {
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
