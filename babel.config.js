module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Environment variables (MUST be first for proper loading)
      // ['module:react-native-dotenv'] removed - using expo-constants instead
      'react-native-reanimated/plugin',
      // expo-router is already included in babel-preset-expo (SDK 50+)
    ],
  };
};
