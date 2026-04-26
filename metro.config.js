// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow Metro to bundle binary asset types used by MapLibre (PBF font files)
config.resolver.assetExts.push('pbf');

module.exports = config;
