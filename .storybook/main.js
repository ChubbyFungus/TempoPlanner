const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook'
  ],

  framework: '@storybook/react-vite',

  docs: {
    autodocs: true
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  },

  staticDirs: ['../public'],

  viteFinal: async (config) => {
    // Exclude model files from being processed
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.rollupOptions.external = [
      /models\/.*\.(glb|gltf|obj|fbx|3ds|bin|usdz)$/,
      /3ds_models\/.*/,
      /appliances\/.*/
    ];

    // Add a plugin to handle model file imports
    config.plugins = config.plugins || [];
    config.plugins.push({
      name: 'ignore-model-files',
      resolveId(source) {
        if (source.match(/\.(glb|gltf|obj|fbx|3ds|bin|usdz)$/)) {
          return path.resolve(__dirname, '../public/mock-model.js');
        }
        return null;
      }
    });

    // Exclude model files from being copied
    config.build.assetsInclude = (assetPath) => {
      return !assetPath.match(/\.(glb|gltf|obj|fbx|3ds|bin|usdz)$/);
    };

    return config;
  }
}; 