// server.js
const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
// the __dirname is the current directory from where the script is running

// app.use(express.static(__dirname + '/public/'));
// send the user to index html page inspite of the url

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.get('/bundle.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist/bundle.js'));
});

			app.get('/.gantt_data', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/data.php'));
			});
			app.get('/.check_gantt_synchro', (req, res) => {
				res.send( JSON.stringify( { synchronized:1 } ) );
			});
			app.post('/.save_gantt', (req, res) => {
				res.send( JSON.stringify( { errcode:0 } ) );
			});

app.get('/server.php', (req, res) => {
	if( req.query.action == 'check_synchronization' ) {
  		res.send( JSON.stringify( { synchronized:1 } ) );
	} else if( req.query.action == 'check_lock' ) {
  		res.send( JSON.stringify( { locked:1, ganttmtime:111111111111 } ) );
	} else if( req.query.action == 'lock' ) {
  		res.send( JSON.stringify( { locked:1, ganttmtime:111111111111 } ) );
	} else if( req.query.action == 'unlock' ) {
  		res.send( JSON.stringify( { locked:0, ganttmtime:111111111111 } ) );
	}  
});

app.post('/server.php', (req, res) => {
	if( req.query.action == 'store_user_data' ) {
  		res.send( JSON.stringify( { errorCode:0 } ) );
	}
});

app.listen(port);