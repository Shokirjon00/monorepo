import {ENDPOINTS} from '@core/endpoints';
import { version } from '../../../../package.json';

const DOMAIN = 'https://cab.eskhata.com/';
const FILESERVER = 'https://filestorage.eskhata.com/';
export const environment = {
  isTest: false,
  production: true,
  domain: DOMAIN,
  apiFoodUrl: DOMAIN + 'service/api/merchant',
  apiUrl: DOMAIN + 'api/v1',
  api: ENDPOINTS,
  apiUrlFile: FILESERVER + 'api/v1',
  apiVersion: 'v1',
  appVersion: version + 'dev',
  mapbox: {
    accessToken: 'pk.eyJ1IjoiYnJhc2thbSIsImEiOiJja3NqcXBzbWoyZ3ZvMm5ybzA4N2dzaDR6In0.RUAYJFnNgOnn80wXkrV9ZA',
  },
  captchaSiteKey: '6LeqgikrAAAAAAZxoIO6oKM8izQ5hPnEtHoAIasa',
  key: 'N9ZFwBNR0vtC95aW7P17XrIgAEV6qvy1dg2dadgz',
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
