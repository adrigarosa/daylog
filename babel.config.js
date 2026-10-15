module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@db': './src/db',
            '@screens': './src/screens',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@stores': './src/stores',
            '@services': './src/services',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@repositories': './src/repositories',
            '@t': './src/types',
          },
        },
      ],
      // Reanimated 4.x no requiere plugin de Babel (cambió en v4 vs v2/v3)
      // Se re-evalúa en Fase 6 si se añaden worklets personalizados
    ],
  };
};
