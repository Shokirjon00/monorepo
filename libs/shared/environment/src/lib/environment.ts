/**
 * Shared shape of the runtime environment object used by both the admin and
 * client applications. Common fields are required; app-specific fields are
 * optional so each app can keep its own values while sharing one contract.
 */
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
  // --- common to both apps ---
  isTest: boolean;
  production: boolean;
  domain: string;
  apiUrl: string;
  apiUrlFile: string;
  /** Endpoint map; shape is app-specific, so kept loose here. */
  api: any;
  appVersion: string;
  version: string;
  key: string;
  mapbox: { accessToken: string };

  // --- admin-specific (optional) ---
  rabbitUrl?: string;
  seqUrl?: string;
  hangfireUrl?: string;
  adminUrl?: string;
  clientUrl?: string;

  // --- client-specific (optional) ---
  apiFoodUrl?: string;
  apiVersion?: string;
  captchaSiteKey?: string;
  firebase?: FirebaseConfig;

  // allow additional app-specific keys without breaking the contract
  [key: string]: unknown;
}
