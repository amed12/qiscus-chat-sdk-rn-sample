module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./app'],
        alias: {
          components: './app/components',
          screens: './app/screens',
          utils: './app/utils',
          qiscus: './app/qiscus',
          assets: './assets',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
};
