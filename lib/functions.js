import { nanoid } from 'nanoid';

let functions;

functions.getRandomString = () => {
  console.log('in here');
  return nanoid(8);
};

module.export = functions;
