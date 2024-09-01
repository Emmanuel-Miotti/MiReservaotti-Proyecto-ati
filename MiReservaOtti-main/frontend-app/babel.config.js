// module.exports = {
//   presets: ["@babel/preset-env", "@babel/preset-react"],
// };
module.exports = {
  presets: [
    'babel-preset-expo',
    '@babel/preset-flow', // Añadir este preset
  ],
  plugins: [
    '@babel/plugin-syntax-flow', // Añadir este plugin si solo quieres el soporte de parsing
  ],
};
