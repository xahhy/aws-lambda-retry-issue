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
    let needHeartBeat = true;
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
    /**
     * According to the experiment:
     * Node.js/Linux has a maximum timeout 300 seconds for ideal connection even keep-alive
     * is enabled. After 300 seconds, Node.js will send a [FIN, ACK] package following
     * a [SYN] package to the lambda server. And then lambda server response with a [Encrypted Alert]
     * package. This will cause a "socket hang up" error by reading -4095 from response.
     *
     * app_1  | STREAM 1: readableAddChunk null
     * app_1  | STREAM 1: onEofChunk
     * app_1  | STREAM 1: emitReadable_ false 0 true
     * app_1  | STREAM 1: flow true
     * app_1  | STREAM 1: read undefined
     * app_1  | STREAM 1: endReadable false
     * app_1  | STREAM 1: read 0
     * app_1  | STREAM 1: endReadable false
     * app_1  | STREAM 1: endReadableNT false 0
     * app_1  | NET 1: destroy
     * app_1  | NET 1: close
     * app_1  | NET 1: close handle
     *
     * This means if any connection do not send any data to the server within 300 seconds,
     * The client side will timeout and close the connection. This will cause a 'socket hang up' error
     *
     * The solution for this is to send a HeartBeat package to the server regularly before we get response back.
     *
     * For aws-sdk, after invoke lambda().invoke(), it returns back a request object. But the request.httpRequest.stream
     * will not be assigned until we called request.send(). For the async style calling. aws-sdk called request.send()
     * within the promise itself. So we need someway to send HeartBeat package during waiting the promise.
     */
    const timer = setInterval(() => {
      console.log(new Date().toISOString());
      if (needHeartBeat) {
        const stream = request.httpRequest.stream;
        stream.finished = false;
        stream.write(Buffer.from(new Array(1)), 'utf-8');
        stream.finished = true;
        console.log('HeartBeat');
      }
    }, 10000);
    console.log('Start');
    result = await request.promise();
    needHeartBeat = false;
    clearInterval(timer);
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
