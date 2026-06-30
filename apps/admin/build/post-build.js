const path = require('path');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
console.log('\nRunning post-build tasks');

const appVersion = require('../package.json').version;
const versionFilePath = path.join(__dirname + '/../dist/eskhata-merchant-web-admin/data-tour.json');
const src = `{"version": "${appVersion}"}`;

writeFile(versionFilePath, src)
  .then(() => console.log(`version.json was created`))
  .catch(err => console.log('Error with post build:', err));
