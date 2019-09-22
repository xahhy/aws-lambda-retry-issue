const { promisify } = require('util');
const sleep = promisify(setTimeout);

exports.handler = async (event, context) => {
  console.log(JSON.stringify(context));
  const time = 330000;
  await sleep(time);
  throw Error('Failed');
};
