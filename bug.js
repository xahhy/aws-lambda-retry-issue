const AWS = require('aws-sdk');
const https = require('https');

const main = async () => {
  const agent = new https.Agent({ keepAlive: true, timeout: 10000 });
  const lambda = new AWS.Lambda({
    region: 'ap-southeast-2',
    maxRetries: 1,
    httpOptions: {
      timeout: 900000,
      agent,
    },
  });
  let result;
  try {
    console.time('Lambda Invoke');
    const request = lambda.invoke({
      FunctionName: 'error-handle',
      InvocationType: 'RequestResponse',
      Payload: '',
    });
    request
      .on('success', function(response) {
        console.log('Success!');
      })
      .on('retry', function(response) {
        console.log('Retry!', response);
      })
      .on('error', function(response) {
        console.log('Error!', response);
      });
    console.log('Start to send request');
    result = await request.promise();
  } catch (error) {
    console.log('Catch as error', error);
    result = error;
  }
  console.timeEnd('Lambda Invoke');
  console.log(result);
  return result;
};
(async function() {
  console.log('Anther Run!');
  while (true) {
    await main();
  }
})();
