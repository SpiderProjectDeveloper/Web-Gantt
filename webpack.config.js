// webpack.config.js
// var BomPlugin = require('webpack-utf8-bom');
const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000,
		setup(app) {
			//app.get('/bundle.js', (req, res) => {
			//	  res.sendFile(path.resolve(__dirname, 'dist/bundle.js'));
			//});
			app.get('/.gantt_data', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/data.php'));
			});
			app.get('/.get_project_props', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/get_project_props.json'));
			});
			app.post('/.save_gantt', (req, res) => {
				res.send( JSON.stringify( { errcode:0 } ) );
			});
		}
  },
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