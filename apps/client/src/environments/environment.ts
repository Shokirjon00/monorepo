import { Environment } from "@eskhata/environment";
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ENDPOINTS } from '@core/endpoints';
import { version } from '../../../../package.json';

const DOMAIN = 'http://10.10.202.226:1441/'
// const DOMAIN = 'http://localhost:7011/'
// const DOMAIN = 'http://192.168.6.249:7011/';
// const DOMAIN = 'http://192.168.6.218:8086/';  //Bahromako

const FILESERVER = 'http://10.10.202.220:1440/';

export const environment: Environment = {
  isTest: true,
  production: false,
  domain: DOMAIN,
  apiFoodUrl: DOMAIN + 'service/api/merchant',
  apiUrl: DOMAIN + 'api/v1',
  api: ENDPOINTS,
  apiUrlFile: FILESERVER + 'api/v1',
  apiVersion: 'v1',
  appVersion: version + 'dev',
  mapbox: {
    accessToken: 'pk.eyJ1Ijoia3N3YW5pZTIxIiwiYSI6ImNsMndubHdtZTBucHYzY29hd215ZjhxcWQifQ.E-cXzkPVucduZpZZwqVaKQ',
  },
  captchaSiteKey: '6LeqgikrAAAAAAZxoIO6oKM8izQ5hPnEtHoAIasa',
  key: 'QG8+UEZdXVlNV0YmREJIKHw+dUs3PkgzIU5KUGVl',
  version: version,
  firebase: {
    apiKey: "AIzaSyAIVrRmIaMxL2AMsCnsO3Eo7IOPoiXriPg",
    authDomain: "eskhata-merchant-production.firebaseapp.com",
    projectId: "eskhata-merchant-production",
    storageBucket: "eskhata-merchant-production.firebasestorage.app",
    messagingSenderId: "834742183227",
    appId: "1:834742183227:web:640dbdd3e0f1d608af031e",
    measurementId: "G-6NCDVLQ73S",
    vapidKey: 'BMH9X5k6jWWCSsAvufiLGOO5pVot1WfCjxk9TOzbTFRbGjltFXmMr6wxP5lC5FpQSTEWyPXfjDFRRCNwIPS-vj8',
  },
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
