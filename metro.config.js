const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add expo-router support
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;

