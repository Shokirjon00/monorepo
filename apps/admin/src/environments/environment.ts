// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.tour.json`.

import { ENDPOINTS } from '@core/endpoints';

// const DOMAIN = 'http://localhost:7088/';   //test
const DOMAIN = 'http://10.10.202.229:1441/';   //test
// const DOMAIN = 'http://192.168.6.249:8084/';   //Mukhamedfiruzako
// const DOMAIN = 'http://192.168.118.86:7088/';   //<Bahromako

const FILESERVER = 'http://10.10.202.220:1440/';
export const environment = {
  isTest: true,
  production: false,
  domain: DOMAIN,
  apiUrl: DOMAIN + 'api/v1',
  apiUrlFile: FILESERVER + 'api/v1',
  api: ENDPOINTS,
  appVersion: require('../../../../package.json').version + 'dev',
  mapbox: {
    accessToken: 'pk.eyJ1Ijoia3N3YW5pZTIxIiwiYSI6ImNsMndubHdtZTBucHYzY29hd215ZjhxcWQifQ.E-cXzkPVucduZpZZwqVaKQ',
  },
  key: 'QG8+UEZdXVlNV0YmREJIKHw+dUs3PkgzIU5KUGVl',
  rabbitUrl: 'http://10.10.202.225:15672/#/',
  seqUrl: 'http://10.10.202.221:5341/',
  hangfireUrl: 'http://10.10.202.229:1441/em_hangfire',
  adminUrl: 'http://10.10.202.229:1441/swagger',
  clientUrl: 'http://10.10.202.226:1441/swagger',
  version: require('../../../../package.json').version
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
