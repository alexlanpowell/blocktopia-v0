module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Environment variables (MUST be first for proper loading)
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }],
      'react-native-reanimated/plugin',
      // expo-router is already included in babel-preset-expo (SDK 50+)
    ],
  };
};

