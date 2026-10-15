const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Needed for drizzle-orm migrations — allows Metro to bundle .sql files
config.resolver.assetExts.push('sql');

module.exports = config;
