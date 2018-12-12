const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {

  entry: './src/index.js',

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-syntax-jsx',
              ['@babel/plugin-transform-react-jsx', {'pragma': 'dom'}]
            ],
          }
        }
      }
    ]
  },

  plugins: [
    new CleanPlugin(['dist']),
    new HtmlPlugin({
      title: 'Subjective Image Ranking Tool',
      minify: {
        collapseWhitespace: true,
        preserveLineBreaks: false
      }
    }),
    new webpack.DefinePlugin({
      IMAGES_PATH: JSON.stringify('../images/'),
      IMAGE_FILES: JSON.stringify(shuffle(require('fs').readdirSync('./images/').filter(e => e !== 'README.md')))
    })
  ],

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }

};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
