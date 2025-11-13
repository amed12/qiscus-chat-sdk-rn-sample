/**
 * Application Configuration
 * Centralized config for app-wide constants
 */

export const APP_CONFIG = {
  // Qiscus Multichannel Configuration
  qiscus: {
    appId: 'obbbw-qh0w3g85jirurwg',
    channelId: 126308,
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
