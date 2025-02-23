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
  }
}; 