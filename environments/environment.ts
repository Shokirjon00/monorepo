// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.tour.json`.
import packageJson from '../package.json';


// const DOMAIN = 'http://localhost:7088/';   //test
import { ENDPOINTS } from '../shared-core/src/endpoints';

const DOMAIN = 'http://10.10.202.229:1441/';   //test
const DOMAIN_CLIENT = 'http://10.10.202.226:1441/';   //test
// const DOMAIN = 'http://192.168.6.249:8084/';   //Mukhamedfiruzako
// const DOMAIN = 'http://192.168.118.86:7088/';   //<Bahromako

const FILESERVER = 'http://10.10.202.220:1440/';
export const environment = {
  isTest: true,
  production: false,
  domain: DOMAIN,
  apiUrl: DOMAIN + 'api/v1',
  apiUrlClient: DOMAIN_CLIENT + 'api/v1',
  apiUrlFile: FILESERVER + 'api/v1',
  apiFoodUrl: DOMAIN + 'service/api/merchant',
  api: ENDPOINTS,
  appVersion: packageJson.version + 'dev',
  mapbox: {
    accessToken: 'pk.eyJ1Ijoia3N3YW5pZTIxIiwiYSI6ImNsMndubHdtZTBucHYzY29hd215ZjhxcWQifQ.E-cXzkPVucduZpZZwqVaKQ',
  },
  captchaSiteKey: '6LeqgikrAAAAAAZxoIO6oKM8izQ5hPnEtHoAIasa',
  key: 'QG8+UEZdXVlNV0YmREJIKHw+dUs3PkgzIU5KUGVl',
  rabbitUrl: 'http://10.10.202.225:15672/#/',
  seqUrl: 'http://10.10.202.221:5341/',
  hangfireUrl: 'http://10.10.202.229:1441/em_hangfire',
  adminUrl: 'http://10.10.202.229:1441/swagger',
  clientUrl: 'http://10.10.202.226:1441/swagger',
  version: packageJson.version
};

