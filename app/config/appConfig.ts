/**
 * Application Configuration
 * Centralized config for app-wide constants
 */

interface QiscusConfig {
  appId: string;
  channelId: number;
}

interface ApiConfig {
  multichannel: string;
  qismo: string;
}

interface StorageConfig {
  userKey: string;
}

interface DebugConfig {
  enableLogging: boolean;
}

interface AppConfiguration {
  qiscus: QiscusConfig;
  api: ApiConfig;
  storage: StorageConfig;
  debug: DebugConfig;
}

export const APP_CONFIG: AppConfiguration = {
  // Qiscus Multichannel Configuration
  qiscus: {
    appId: 'your-app-id',
    channelId: 0,
  },

  // API Configuration
  api: {
    multichannel: 'https://multichannel.qiscus.com/api/v2/qiscus',
    qismo: 'https://qismo.qiscus.com',
  },

  // Storage Configuration
  storage: {
    userKey: 'qiscus',
  },

  // Debug Configuration
  debug: {
    enableLogging: true,
  },
};

export default APP_CONFIG;
