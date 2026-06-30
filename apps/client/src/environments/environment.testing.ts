import {ENDPOINTS} from '@core/endpoints';
import { version } from '../../../../package.json';

const DOMAIN = 'http://10.10.202.226:1441/';
// const DOMAIN = 'https://cab.eskhata.tj/';
const FILESERVER = 'http://10.10.202.220:1440/';
export const environment = {
  isTest: true,
  production: true,
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
