const options = {
  host: 'lambda.ap-southeast-2.amazonaws.com',
  port: 443,
  method: 'POST',
  headers: {
    'User-Agent': 'aws-sdk-nodejs/2.528.0 darwin/v10.16.0 callback',
    'X-Amz-Invocation-Type': 'RequestResponse',
    'Content-Type': 'binary/octet-stream',
    'X-Amz-Content-Sha256':
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Content-Length': 0,
    Host: 'lambda.ap-southeast-2.amazonaws.com',
    'X-Amz-Date': '20190914T00048Z',
    Authorization:
      'AWS4-HMAC-SHA256 Credential=xxxx, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-invocation-type, Signature=xxxx',
  },
  path: '/2015-03-31/functions/error-handle/invocations',
};

const https = require('https');

const main = async() =>{
  const req = https.request(options, function(res) {
    console.log(res)
  })
  req.on('error', (e) => {
    console.error(e.message);
  });
  req.end();
}
main()