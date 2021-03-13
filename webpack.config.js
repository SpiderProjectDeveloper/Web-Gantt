// webpack.config.js
// var BomPlugin = require('webpack-utf8-bom');
const path = require('path');

module.exports = {
  entry: [
    './src/index.js',
  ],
  optimization: {
    minimize: true,
  },
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
			{
				loader: 'style-loader',
			}, 
			{
				loader: 'css-loader',
			}
        ]
      },
      {
        test: /\.html$/,
        loader: "html-loader",
		options: {
			attributes: false,
		},
      }
    ]
  }
};