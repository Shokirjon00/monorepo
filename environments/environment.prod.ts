 import {ENDPOINTS} from '@core/endpoints';

const DOMAIN = 'https://merchadmin.eskhata.com/';
const FILESERVER = 'https://filestorage.eskhata.com/';
export const environment = {
  isTest: false,
  production: true,
  domain: DOMAIN,
  apiUrl: DOMAIN + 'api/v1',
  apiUrlFile: FILESERVER + 'api/v1',
  appVersion: require('../../package.json').version,
  api: ENDPOINTS,
  mapbox: {
    accessToken: 'pk.eyJ1Ijoia3N3YW5pZTIxIiwiYSI6ImNsMndubHdtZTBucHYzY29hd215ZjhxcWQifQ.E-cXzkPVucduZpZZwqVaKQ',
  },
  key: 'QG8+UEZdXVlNV0YmREJIKHw+dUs3PkgzIU5KUGVl',
  rabbitUrl: 'http://10.10.202.214:15672/#/queues',
  seqUrl: 'http://10.10.202.221:5341/',
  hangfireUrl: 'http://10.10.202.217:1440/em_hangfire',
  adminUrl: 'http://10.10.202.229:1441/swagger',
  clientUrl: 'http://10.10.202.226:1441/swagger',
  version: require('../../package.json').version
};
