const express = require('express');
const app = express();
const port = 3000;
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./lib/prismaClient');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const configuration = new Configuration({
  organization: 'org-jky0txWAU8ZrAAF5d14VR12J',
  apiKey: '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',
});

const openai = new OpenAIApi(configuration);

const createNFT = async () => {
  console.log('inside the createNFT function');
  try {
    const messages = [
      {
        role: 'system',
        content: `You are in charge of writing the description of a random character in a fictional world filled with wonder and awe. This is going to be the world in which children will be educated in the coming years, using fun as the vehicle for the deeper experience of life. Please make the description no more than 333 characters.`,
      },
      { role: 'user', content: 'Create a character' },
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log(
      'the completion answer is: ',
      completion.data.choices[0].message.content
    );

    const imageUrl =
      'https://media.discordapp.net/attachments/1054830741042774016/1115644141049745428/kithkui_The_profile_picture_of_a_cartoon._Meet_Zephyr_a_mischie_694fa1e7-d47a-49df-be9e-19b79079759c.png';
    const newNFT = await prisma.nFT.create({
      data: {
        prompt: completion.data.choices[0].message.content,
        imageUrl: imageUrl,
      },
    });

    console.log('New NFT created:', newNFT);
  } catch (error) {
    console.error('Error creating NFT:', error);
  }
};

cron.schedule('*/5 * * * * *', createNFT);

app.get('/', (req, res) => {
  res.send('Hello, welcome to the Anky NFTs server!');
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

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
