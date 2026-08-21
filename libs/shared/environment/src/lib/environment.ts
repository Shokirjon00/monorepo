export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string;
}

export interface Environment {
  isTest: boolean;
  production: boolean;
  domain: string;
  apiUrl: string;
  apiUrlFile: string;
  api: any;
  appVersion: string;
  version: string;
  key: string;
  mapbox: { accessToken: string };

  rabbitUrl?: string;
  seqUrl?: string;
  hangfireUrl?: string;
  adminUrl?: string;
  clientUrl?: string;

  apiFoodUrl?: string;
  apiVersion?: string;
  captchaSiteKey?: string;
  firebase?: FirebaseConfig;

  [key: string]: unknown;
}
