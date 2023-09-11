module.exports = {
  root: true,
  extends: ['@block65/eslint-config', '@block65/eslint-config/javascript'],
  parserOptions: {
    project: ['./tsconfig.json', './__tests__/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
