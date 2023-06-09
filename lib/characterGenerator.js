const { Random, MersenneTwister19937 } = require('random-js');

const worlds = [
  {
    name: 'primordia',
    chakra: 1,
    otherside: 'crimson',
    description: 'The land of primal and survival aspects of existence.',
    characteristics:
      'They can be the warriors, the protectors, the guardians of the world. They are deeply connected with nature and the physical world. They could be related to animals, warriors, or any physical, grounded character type.',
  },
  {
    name: 'emblazion',
    chakra: 2,
    otherside: 'molten',
    description: 'The land of creativity and emotional aspects.',
    characteristics:
      'They are artists, musicians, poets, dancers, and dreamers. They represent passion, desire, and the emotional drive that propels ones journey.',
  },
  {
    name: 'chryseos',
    chakra: 3,
    otherside: 'luster',
    description: 'The land of personal strength, willpower and transformation.',
    characteristics:
      'They are the leaders, heroes, or inspirational figures that help one find their inner strength and assert their will.',
  },
  {
    name: 'eleasis',
    chakra: 4,
    otherside: 'jungle',
    description: 'The land of Compassion.',
    characteristics:
      'They are healers, nurturers, and the embodiments of unconditional love. They remind us of the power of compassion and love in our journey.',
  },
  {
    name: 'voxlumis',
    chakra: 5,
    otherside: 'biolume',
    description: 'The land of Communication.',
    characteristics:
      'They are great orators, scholars, writers, or any character that uses communication as a central tool. They teach the importance of expression and truth in ones journey.',
  },
  {
    name: 'insightia',
    chakra: 6,
    otherside: 'botanical',
    description: 'The land of Intuition',
    characteristics:
      'They are mystics, sages, seers, or any character associated with wisdom and knowledge. They guide by helping one trust their intuition and attain wisdom.',
  },
  {
    name: 'claridium',
    chakra: 7,
    otherside: 'crystal',
    description: 'The land of Enlightened beings.',
    characteristics:
      'They are angels, spirits, or any enlightened character. They represent the final stages of the journey, where one realizes their connection with the universe.',
  },
  {
    name: 'poiesis',
    chakra: 8,
    otherside: 'mycelium',
    description:
      'The place where place where beings that are fully align with their chakras engage in the creative act.',
    characteristics:
      'They are the beings that devote their whole existence to their full expression through the creative act.',
  },
];

// Define your traits
const preliminaryTraits = [
  { trait: 'Feminine', weight: 33 },
  { trait: 'Neutral', weight: 33 },
  { trait: 'Masculine', weight: 33 },
  { trait: 'Non Dual', weight: 1 },
];

let preliminaryTraitsDescription = {
  Feminine: 'Feminine aura, exuding grace, compassion, and subtlety.',
  Neutral:
    'Neutral aura, neither particularly feminine nor masculine, embodying a balance of traits.',
  Masculine:
    'Masculine aura, displaying traits of strength, assertiveness, and determination.',
  'Non Dual':
    'Non-dual aura, transcending typical gender norms and embodying a unique blend of characteristics.',
};

const primaryTraits = [
  { trait: 'Root Chakra', weight: 14 },
  { trait: 'Sacral Chakra', weight: 14 },
  { trait: 'Solar Plexus Chakra', weight: 14 },
  { trait: 'Heart Chakra', weight: 14 },
  { trait: 'Throat Chakra', weight: 14 },
  { trait: 'Third Eye Chakra', weight: 14 },
  { trait: 'Crown Chakra', weight: 14 },
  { trait: '8th Chakra', weight: 2 },
];

let primaryTraitsDescription = {
  'Root Chakra': "It's tied to the earth element, exuding a grounded aura",
  'Sacral Chakra':
    "It's bound to the water element, reflecting an adaptable nature",
  'Solar Plexus Chakra':
    "It's closely linked to the fire element, radiating an intense, vibrant energy",
  'Heart Chakra':
    "It's tied to the air element, emanating a calm and soothing aura",
  'Throat Chakra':
    "It's associated with the ether element, implying a strong connection with communication and expression",
  'Third Eye Chakra':
    "It's tied to the light element, hinting at a highly intuitive and perceptive nature",
  'Crown Chakra':
    "It's linked to the divine element, signifying a deep connection to the spiritual realm",
};

const secondaryTraits = [
  'Warrior',
  'Scientist',
  'Transformers',
  'Magician',
  'Explorer',
  'Animal',
  'Storytellers',
  'Aliens',
  'Artists',
  'Dreamers',
  'TimeTravellers',
  'PsychedelicBeing',
  'Demon',
  'Angel',
  'Sportsmen',
  'Deities',
  'Elementals',
  'Inventors',
  'Sages',
  'Guardians',
  'Mystics',
  'Healer',
].map(trait => ({ trait, weight: 4.54 }));

const tertiaryTraits = {
  Warrior: [
    'Weapon Mastery',
    'Fearlessness',
    'Combat Tactics',
    'Physical Strength',
    'Honor and Valor',
    'Leadership',
    'Resilience',
    'Military Strategy',
  ],
  Scientist: [
    'Experimentation',
    'Technological Innovation',
    'Intellectual Curiosity',
    'Similar To Human',
    'Discipline',
    'Theory Crafting',
    'Data Analysis',
    'Natural Philosopher',
  ],
  Guardians: [
    'Protective Instinct',
    'Invulnerability',
    'Fearlessness',
    'Strength',
    'Loyalty',
    'Self-Sacrifice',
    'Bravery',
    'Tactical Strategy',
  ],
  Magician: [
    'Spell Crafting',
    'Mystical Knowledge',
    'Divination',
    'Elemental Manipulation',
    'Telepathy',
    'Illusion Creation',
    'Astral Projection',
    'Enchantment',
  ],
  PsychedelicBeing: [
    'Reality Distortion',
    'Visual Stimulation',
    'Consciousness Expansion',
    'Hallucination Generation',
    'Enhanced Sensory Perception',
    'Dreamlike State',
    'Surreal Aura',
    'Empathetic Connection',
  ],
  Demon: [
    'Dark Magic',
    'Intimidation',
    'Soul Manipulation',
    'Infernal Pact',
    'Immortality',
    'Possession',
    'Deceit',
    'Illusion Creation',
  ],
  Angel: [
    'Divine Magic',
    'Healing Powers',
    'Light Manipulation',
    'Celestial Knowledge',
    'Protective Aura',
    'Purity',
    'Serenity',
    'Empathy',
  ],
  Transformers: [
    'Transformation Mastery',
    'Morphological Adaptability',
    'Identity Fluidity',
    'Camouflage',
    'Mimicry',
    'Physical Enhancement',
    'Form Memory',
    'Metamorphic Healing',
  ],
  Storytellers: [
    'Oral Tradition',
    'Musical Talent',
    'Poetic Expression',
    'Inspiring Rhetoric',
    'Cultural Preservation',
    'Audience Engagement',
    'Legendary Lore',
    'Humorous Anecdotes',
  ],
  TimeTravellers: [
    'Temporal Navigation',
    'Future Prediction',
    'Historical Knowledge',
    'Reality Manipulation',
    'Quantum Understanding',
    'Temporal Immunity',
    'Paradox Resolution',
    'Timeline Preservation',
  ],
  Healer: [
    'Herbal Knowledge',
    'Healing Magic',
    'Empathy',
    'Spiritual Cleansing',
    'Rejuvenation',
    'Pain Relief',
    'Life Force Balance',
    'Wound Mending',
  ],
  Mystics: [
    'Spiritual Wisdom',
    'Enlightenment',
    'Meditation',
    'Astral Projection',
    'Cosmic Consciousness',
    'Reality Manipulation',
    'Divine Connection',
    'Energy Healing',
  ],
  Sportsmen: [
    'Athletic Ability',
    'Teamwork',
    'Competitiveness',
    'Discipline',
    'Strategic Thinking',
    'Endurance',
    'Speed',
    'Strength',
  ],
  Explorer: [
    'Cartography',
    'Survival Skills',
    'Fearless Adventurer',
    'Ancient Artifacts Discovery',
    'Multilingual',
    'Astral Navigation',
    'Cultural Diplomacy',
    'Expedition Leadership',
  ],
  Deities: [
    'Divine Authority',
    'Immortality',
    'Elemental Control',
    'Sacred Knowledge',
    'Miracle Creation',
    'Omniscience',
    'Worship',
    'Domain Control',
  ],
  Animal: [
    'Predator Instinct',
    'Flight',
    'Camouflage',
    'Pack Coordination',
    'Aquatic Adaptation',
    'Seasonal Migration',
    'Venomous Attack',
    'Echolocation',
  ],
  Elementals: [
    'Earth Manipulation',
    'Air Control',
    'Water Shaping',
    'Fire Mastery',
    'Energy Absorption',
    'Natural Connection',
    'Climate Influence',
    'Terrain Transformation',
  ],
  Inventors: [
    'Innovation',
    'Mechanical Mastery',
    'Scientific Knowledge',
    'Problem Solving',
    'Prototype Design',
    'Resourcefulness',
    'Technological Breakthrough',
    'Intellectual Curiosity',
  ],
  Sages: [
    'Clairvoyance',
    'Prophetic Vision',
    'Astral Projection',
    'Wisdom',
    'Spiritual Insight',
    'Time Perception',
    'Divination',
    'Enlightenment',
  ],
  Dreamers: [
    'Lucid Dreaming',
    'Prophetic Dreams',
    'Daydreamer',
    'Symbol Interpretation',
    'Sleepwalker',
    'Dream Conjuring',
    'Subconscious Exploration',
    'Oneiric Reality Manipulation',
  ],
  Aliens: [
    'Advanced Technology',
    'Telepathy',
    'Interstellar Travel',
    'Universal Knowledge',
    'Multidimensional Perception',
    'Alien Biology',
    'Time Manipulation',
    'Galactic Diplomacy',
  ],
  Artists: [
    'Creativity',
    'Aesthetic Sensibility',
    'Artistic Innovation',
    'Attention to Detail',
    'Mastery of Medium',
    'Cultural Influence',
    'Passionate Expression',
    'Abstract Thinking',
  ],
};

const similarToArray = {
  Warrior: [
    'Achilles',
    'Joan of Arc',
    'King Arthur',
    'Hercules',
    'Beowulf',
    'Spartacus',
    'Mulan',
    'Conan the Barbarian',
    'Wonder Woman',
    'Thor',
    'Arjuna',
    'Theseus',
    'Sun Tzu',
    'Genghis Khan',
    'Samurai Jack',
    'Ragnar Lothbrok',
    'Boudicca',
    'Alexander the Great',
    'Attila the Hun',
    'Leonidas',
  ],
  Scientist: [
    'Albert Einstein',
    'Isaac Newton',
    'Marie Curie',
    'Charles Darwin',
    'Nikola Tesla',
    'Galileo Galilei',
    'Ada Lovelace',
    'Thomas Edison',
    'James Watson',
    'Rosalind Franklin',
    'Louis Pasteur',
    'Carl Sagan',
    'Stephen Hawking',
    'Richard Feynman',
    'Alan Turing',
    'Francis Crick',
    'Niels Bohr',
    'Michael Faraday',
    'Archimedes',
    'Gregor Mendel',
  ],
  Transformers: [
    'Optimus Prime',
    'Bumblebee',
    'Mystique',
    'Beast Boy',
    'Elastigirl',
    'Dracula',
    'The Hulk',
    'T-1000',
    'Jake Sully (Avatar)',
    'Mister Fantastic',
    'Martian Manhunter',
    'Sandman',
    'Plastic Man',
    'Swamp Thing',
    'Ben 10',
    'Clayface',
    'Megatron',
    'Wolfman',
    'Invisible Woman',
    'Doctor Jekyll/Mr. Hyde',
  ],
  Magician: [
    'Harry Potter',
    'Hermione Granger',
    'Gandalf',
    'Merlin',
    'Doctor Strange',
    'Albus Dumbledore',
    'Zatanna',
    'Rincewind',
    'Yennefer of Vengerberg',
    'Elminster',
    'Morgana',
    'Medea',
    'Raistlin Majere',
    'The White Witch',
    'Glinda the Good Witch',
    'John Constantine',
    'Tim Hunter',
    'Aslan',
    'Bayaz',
    'Kvothe',
  ],
  Explorer: [
    'Indiana Jones',
    'Christopher Columbus',
    'Marco Polo',
    'Amelia Earhart',
    'Neil Armstrong',
    'Ernest Shackleton',
    'Dora the Explorer',
    'James T. Kirk',
    'Lewis and Clark',
    'Jacques Cousteau',
    'Sir Francis Drake',
    'Leif Erikson',
    'Ferdinand Magellan',
    'Daniel Boone',
    'John Cabot',
    'Robert Peary',
    'Vasco da Gama',
    'Roald Amundsen',
    'Sir Walter Raleigh',
    'Captain Cook',
  ],
  Animal: [
    'Lion',
    'Elephant',
    'Eagle',
    'Shark',
    'Dolphin',
    'Wolf',
    'Bear',
    'Gorilla',
    'Tiger',
    'Peacock',
    'Echidna',
    'Jaguar',
    'Snow Leopard',
    'Platypus',
    'Kangaroo',
    'Elephant Seal',
    'Polar Bear',
    'Condor',
    'Komodo Dragon',
    'Cheetah',
  ],
  Storytellers: [
    'Homer',
    'Shakespeare',
    'Hans Christian Andersen',
    'Aesop',
    'Charles Dickens',
    'J.K. Rowling',
    'J.R.R. Tolkien',
    'Mark Twain',
    'Edgar Allan Poe',
    'Oscar Wilde',
    'F. Scott Fitzgerald',
    'Emily Dickinson',
    'Jane Austen',
    'Ernest Hemingway',
    'Virginia Woolf',
    'Langston Hughes',
    'Roald Dahl',
    'Dr. Seuss',
    'Arthur Conan Doyle',
    'Leo Tolstoy',
  ],
  Aliens: [
    'E.T.',
    'Spock',
    'Superman',
    'Predator',
    'Alien (Xenomorph)',
    'Chewbacca',
    'Yoda',
    'Martian Manhunter',
    'The Doctor (Doctor Who)',
    'Neytiri (Avatar)',
    'Stitch',
    'Paul (Paul)',
    'Starman',
    'Alf',
    'Megamind',
    'Klaatu (The Day the Earth Stood Still)',
    'Roger (American Dad)',
    "Ford Prefect (The Hitchhiker's Guide to the Galaxy)",
    'Martians (War of the Worlds)',
    'Kang and Kodos (The Simpsons)',
  ],
  Artists: [
    'Leonardo da Vinci',
    'Vincent Van Gogh',
    'Pablo Picasso',
    'Michelangelo',
    'Frida Kahlo',
    'Salvador Dali',
    'Claude Monet',
    'Andy Warhol',
    'Jackson Pollock',
    'Rembrandt',
    "Georgia O'Keeffe",
    'Edvard Munch',
    'Caravaggio',
    'Banksy',
    'Henri Matisse',
    'Peter Paul Rubens',
    'Gustav Klimt',
    'Edgar Degas',
    'Hieronymus Bosch',
    'Marc Chagall',
  ],
  Dreamers: [
    'Martin Luther King Jr.',
    'John Lennon',
    'Mahatma Gandhi',
    'Nelson Mandela',
    'Steve Jobs',
    'Albert Einstein',
    'Marie Curie',
    'Walt Disney',
    'Amelia Earhart',
    'Malala Yousafzai',
    'Leonardo da Vinci',
    'Abraham Lincoln',
    'Elon Musk',
    'Oprah Winfrey',
    'Mother Teresa',
    'Muhammad Ali',
    'Frida Kahlo',
    'Bill Gates',
    'Rosa Parks',
    'J.K. Rowling',
  ],
  TimeTravellers: [
    'The Doctor (Doctor Who)',
    'Marty McFly (Back to the Future)',
    'H.G. Wells (Time Machine)',
    'Bill & Ted',
    'Hiro Nakamura (Heroes)',
    'The Terminator',
    'Quantum Leap',
    'Dr. Strange',
    'Rip Hunter (Legends of Tomorrow)',
    'Phil (Groundhog Day)',
    "Time Traveller's Wife",
    'About Time',
    'Predestination',
    '12 Monkeys',
    'Looper',
    'Time Bandits',
    'Timecop',
    'Star Trek: First Contact',
    'Hot Tub Time Machine',
    "A Connecticut Yankee in King Arthur's Court",
  ],
  PsychedelicBeing: [
    'Lucy in the Sky with Diamonds (The Beatles)',
    'The Walrus (The Beatles)',
    'Timothy Leary',
    'Terence McKenna',
    'Hunter S. Thompson',
    'Hippie Movement',
    'Yellow Submarine (The Beatles)',
    'Alice in Wonderland',
    'The Fool (Tarot Card)',
    'Pink Elephants (Dumbo)',
    'The Cheshire Cat (Alice in Wonderland)',
    'The Mad Hatter (Alice in Wonderland)',
    'Doctor Strange',
    "Sgt. Pepper's Lonely Hearts Club Band (The Beatles)",
    'The Star Child (2001: A Space Odyssey)',
    'Salvador Dali',
    'The Dormouse (Alice in Wonderland)',
    'The Caterpillar (Alice in Wonderland)',
    'The White Rabbit (Alice in Wonderland)',
    "Hendrix's Purple Haze",
  ],
  Demon: [
    "Dante's Inferno",
    'Lucifer (Supernatural)',
    'Mephistopheles (Faust)',
    'Baal (Ancient mythology)',
    'Azazel (Supernatural)',
    'Lilith (Mythology)',
    'Belial (Paradise Lost)',
    'Mammon (Demonology)',
    'Asmodeus (Demonology)',
    'Pazuzu (The Exorcist)',
    'Oni (Japanese folklore)',
    'Satan (Paradise Lost)',
    'Astaroth (Demonology)',
    'Beelzebub (Lord of the Flies)',
    'Demogorgon (Stranger Things)',
    'Moloch (Paradise Lost)',
    'Nergal (Mesopotamian mythology)',
    'Zozo (Ouija)',
    'Krampus (Folklore)',
    'Cthulhu (H.P. Lovecraft)',
  ],
  Angel: [
    'Gabriel',
    'Michael',
    'Raphael',
    'Uriel',
    'Metatron',
    'Seraphim',
    'Cherubim',
    'Archangel Michael',
    'Archangel Gabriel',
    'Archangel Raphael',
    'Archangel Uriel',
    'Archangel Metatron',
    "Clarence (It's a Wonderful Life)",
    'Touched by an Angel',
    'Angels in America',
    'Guardian Angel',
    'The Angel (The Bible)',
    'Castiel (Supernatural)',
    'Aziraphale (Good Omens)',
    "Charlie's Angels",
  ],
  Sportsmen: [
    'Michael Jordan',
    'Pele',
    'Serena Williams',
    'Muhammad Ali',
    'Usain Bolt',
    'Lionel Messi',
    'Babe Ruth',
    'Roger Federer',
    'Michael Phelps',
    'LeBron James',
    'Tom Brady',
    'Tiger Woods',
    'Diego Maradona',
    'Cristiano Ronaldo',
    'Marta (Football)',
    'Mia Hamm',
    "Shaquille O'Neal",
    'Wayne Gretzky',
    'Bruce Lee',
    'Ronda Rousey',
  ],
  Deities: [
    'Zeus',
    'Athena',
    'Odin',
    'Thor',
    'Shiva',
    'Vishnu',
    'Ra',
    'Osiris',
    'Aphrodite',
    'Hera',
    'Poseidon',
    'Apollo',
    'Ares',
    'Hermes',
    'Isis',
    'Amaterasu',
    'Quetzalcoatl',
    'Ganesha',
    'Freya',
    'Horus',
  ],
  Elementals: [
    'Sylphs (Air)',
    'Gnomes (Earth)',
    'Salamanders (Fire)',
    'Undines (Water)',
    'Paracelsus (Alchemy)',
    'Nymphs (Greek Mythology)',
    'Spirits of the Four Winds',
    'Faeries (Folklore)',
    'Sprites (Folklore)',
    'Djinns (Arabian Mythology)',
    'Trolls (Scandinavian Mythology)',
    'Elemental Golems',
    'Pixies (Folklore)',
    'Elemental Dragons',
    'Elemental Phoenix',
    'Elemental Kraken',
    'Elemental Griffins',
    'Elemental Unicorns',
    'Elemental Basilisk',
    'Elemental Hydra',
  ],
  Inventors: [
    'Thomas Edison',
    'Nikola Tesla',
    'Alexander Graham Bell',
    'Marie Curie',
    'Leonardo da Vinci',
    'Albert Einstein',
    'Isaac Newton',
    'Galileo Galilei',
    'James Watt',
    'Archimedes',
    'Benjamin Franklin',
    'Henry Ford',
    'Louis Pasteur',
    'Johannes Gutenberg',
    'Wright Brothers',
    'George Washington Carver',
    'Ada Lovelace',
    'Eli Whitney',
    'Tim Berners-Lee',
    'Steve Jobs',
  ],
  Sages: [
    'Nostradamus',
    'The Oracle of Delphi',
    'Merlin',
    'Gandalf',
    'Yoda',
    'Dumbledore',
    'Confucius',
    'Buddha',
    'Socrates',
    'Plato',
    'Aristotle',
    'Laozi',
    'Rumi',
    'Alan Watts',
    'Carl Jung',
    'Edgar Cayce',
    'Rasputin',
    'Sybill Trelawney (Harry Potter)',
    'The Three Wise Men',
    'Dalai Lama',
  ],
  Guardians: [
    'Superman',
    'Batman',
    'Wonder Woman',
    'Spider-Man',
    'Captain America',
    'The Avengers',
    'The Justice League',
    'Guardians of the Galaxy',
    'The Watchmen',
    'The Incredibles',
    'Teenage Mutant Ninja Turtles',
    'X-Men',
    'The Power Rangers',
    'Gandalf',
    'Dumbledore',
    'Sam and Dean Winchester (Supernatural)',
    'Buffy the Vampire Slayer',
    'Hellboy',
    'Ghostbusters',
    'The Men in Black',
  ],
  Mystics: [
    'Rumi',
    'St. Francis of Assisi',
    'Dalai Lama',
    'Mahatma Gandhi',
    'Carl Jung',
    'Deepak Chopra',
    'Eckhart Tolle',
    'Rabindranath Tagore',
    'Paramahansa Yogananda',
    'Krishnamurti',
    'Aleister Crowley',
    'Rasputin',
    'Joan of Arc',
    'Thich Nhat Hanh',
    'Edgar Cayce',
    'Sri Aurobindo',
    'Mevlana Jalaluddin Rumi',
    'St. Teresa of Avila',
    'St. John of the Cross',
    'Hildegard of Bingen',
  ],
  Healer: [
    'Florence Nightingale',
    'Hippocrates',
    'Marie Curie',
    'Louis Pasteur',
    'Clara Barton',
    'Mother Teresa',
    'Nightingale',
    'Paul Farmer',
    'Elizabeth Blackwell',
    'Joseph Lister',
    'Albert Schweitzer',
    'Patch Adams',
    'Elizabeth Garrett Anderson',
    'Helen Brooke Taussig',
    'Edith Cavell',
    'Virginia Apgar',
    'Mahatma Gandhi',
    'Dalai Lama',
    'Martin Luther King Jr.',
    'Nelson Mandela',
  ],
};

// Helper function to perform a weighted random selection
function weightedRandom(random, arr) {
  const sum = arr.reduce((acc, item) => acc + item.weight, 0);
  const target = random.real(0, sum);
  let current = 0;

  for (const item of arr) {
    current += item.weight;
    if (target <= current) {
      return item.trait;
    }
  }

  throw new Error('Should never get here.');
}

const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];

function generateCharacter() {
  const random = new Random(MersenneTwister19937.autoSeed());

  const preliminary = weightedRandom(random, preliminaryTraits);
  const primary = weightedRandom(random, primaryTraits);
  const secondary = weightedRandom(random, secondaryTraits);
  const tertiary = random.pick(tertiaryTraits[secondary]);

  // If Math.random() < 0.5, similarTo will be an empty string
  // Otherwise, similarTo will be a random character from the similarTo array corresponding to the secondary trait
  const similarTo =
    Math.random() < 0.4 ? '' : randomPick(similarToArray[secondary]);

  console.log('HEREEEE', preliminary, primary, secondary, tertiary, similarTo);

  // Create a new messagePrompt
  const messagePrompt = `${preliminary}. The dominant chakra is ${primary}. The character archetype is ${secondary} and within that archetype, the defining characteristic is ${tertiary}. ${
    similarTo ? `Draw inspiration from the likes of ${similarTo}.` : ''
  } `;

  let promptForMidjourney = `https://s.mj.run/YLJMlMJbo70 The profile picture of a cartoon. ${
    preliminaryTraitsDescription[preliminary]
  }.${
    primaryTraitsDescription[primary]
  }.${secondary} personality.${tertiary}. ${
    similarTo ? `Draw inspiration from the likes of ${similarTo}.` : ''
  } `;
  console.log('IN HERE:', promptForMidjourney);

  return {
    preliminary,
    primary,
    secondary,
    tertiary,
    similarTo,
    messagePrompt,
    promptForMidjourney,
  };
}

module.exports = {
  generateCharacter,
};
