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
			app.post('/.chat_read', (req, res) => {
			  	res.send( JSON.stringify( { 
					errcode:0, 
					buffer: [
						{ rowid: 1, user: "User", message: "a message", "datetime": 123456789012, icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD4UlEQVR42u3dyXakSBBFwYQvzz+XtlooByCC8MHuqtcFpueoT1c/HpIkSZIkSZIkSZIkSZIkSZIkSZJUpM0fgSL1fD5//vzzBoj0D44oSABRaCCroQCi8DhWIgFEKXCsgrJ7PKoOyoKo5ct+x5IAovRLMBMKICpxJs1CAohKfUeMhgKIyn1kj0QCiErhGA3Fr3kFowVRt/UYtSaAqDyOK0icWILUgqj7epxdE0DUDscRJICoJY5vofgGEchvIAOi1uvxKUAEByDSuW8QH+lqvR6ffpMFiOBwYknnsiCyHoAIjuM4nFiSBZH1OLcegAgOQATH+f+i0DeIZEFkPQARHENxOLEkCyLrAYjgGI7DiaWSOEYGiCqC9pdXy3rMxgGI4HBiSRZE1sP/gk1w3InDiSVZEFkPQASHE0tyYsl6BFkPQAQHIILDN4hkQWQ9ABEcQXA4sSQLIusBiOBwYkkWRNYjyHoAAgcYTix1/mt7AJGcWPLdAYjgCPc+OrEkC2I9rAcggsOJpVo4ogeIrIcTy3rAAQgccDixJAsi6wGI4HBiSWlxAGI95MSCw3pYEMmCKN96ZF0OQOCAAxA4IAn+DeI3La1BW5BvcVT4w7IevXBMBfLqgYIChxPLyaUibSsRWBPr0Q7I0QcKCRxOrA8vgbPLKdoCyJWH6oVID7rkJbBFwOHkclqVBjLjgXaFAodvECeX+izIHS9ylzWxHsWA3PlAqz8MOJxYl18gZ5fSLMjKl7XaTy/rUQxIhAda5SHB4cRychXB0bE9+0P1klmPMCdW9Jcx0wN0WhUDkuWBZniQcPgG8W2iPguS9YWL+JPPehQDUuA3RRsccDixgp9czr6CQCo9VC+o9Rh6YlV+oe5++E4rJ5Y1UZ8F6fQCzf5paT2KAen403XWSwGHBYEEjp4f6aAAogb/onDFywJHIyCgwNG53R+kHwoasCCdX5xvfzhYD0CcXHA4sfwBH0PgFLMg1uTNDwjrAQgkL140OAABpdkvGzTgG8RDkAWxJtYDkOkPBhI4nFgejiyINbEegEACh5YBAQUQQCCBAxBI4AAEFDhat3uwUoIFsSZ+yAACCRyAgAIIIJDAAQgkcACS74UABRBAIIEDEFDgAAQSOAABBRBAIIEDEEjgUF0glaEAAggkcAACChxZ2psA8YLJglRcE7gtiOCwIFYEDkBAAQQQSOAABBQ45CPdiykLkmZJIAUEFDicWE4uWRBrAiMgmo0EDkAggQMQUAABRMOgwAEIJHCkz695nUmyIHGWBChAQIEDEB2HAgggeoEEDunCt4kkSZIkSZIkSZIkSZIkSVX7BU50vGhqiex/AAAAAElFTkSuQmCC", imageId:10 } 
					] 
				} ) );
			});
			app.post('/.chat_update', (req, res) => {
			  	res.send( JSON.stringify( { 
					errcode:0
				} ) );
			});
			app.post('/.chat_write', (req, res) => {
  				res.send( JSON.stringify( { errcode:0, rowid:10, datetime:12345667890 } ) );
			});
			app.post('/.chat_remove', (req, res) => {
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