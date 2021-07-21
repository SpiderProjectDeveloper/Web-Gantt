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
  		res.send( JSON.stringify( { errorCode: 0 } ) );
	}
});


app.get('/.chat_read', (req, res) => {
  	res.send( JSON.stringify( { 
		errcode:0, 
		buffer: [
			{ rowid: 1, user: "user2", message: "a message", "datetime": 123456789012, icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD4UlEQVR42u3dyXakSBBFwYQvzz+XtlooByCC8MHuqtcFpueoT1c/HpIkSZIkSZIkSZIkSZIkSZIkSZJUpM0fgSL1fD5//vzzBoj0D44oSABRaCCroQCi8DhWIgFEKXCsgrJ7PKoOyoKo5ct+x5IAovRLMBMKICpxJs1CAohKfUeMhgKIyn1kj0QCiErhGA3Fr3kFowVRt/UYtSaAqDyOK0icWILUgqj7epxdE0DUDscRJICoJY5vofgGEchvIAOi1uvxKUAEByDSuW8QH+lqvR6ffpMFiOBwYknnsiCyHoAIjuM4nFiSBZH1OLcegAgOQATH+f+i0DeIZEFkPQARHENxOLEkCyLrAYjgGI7DiaWSOEYGiCqC9pdXy3rMxgGI4HBiSRZE1sP/gk1w3InDiSVZEFkPQASHE0tyYsl6BFkPQAQHIILDN4hkQWQ9ABEcQXA4sSQLIusBiOBwYkkWRNYjyHoAAgcYTix1/mt7AJGcWPLdAYjgCPc+OrEkC2I9rAcggsOJpVo4ogeIrIcTy3rAAQgccDixJAsi6wGI4HBiSWlxAGI95MSCw3pYEMmCKN96ZF0OQOCAAxA4IAn+DeI3La1BW5BvcVT4w7IevXBMBfLqgYIChxPLyaUibSsRWBPr0Q7I0QcKCRxOrA8vgbPLKdoCyJWH6oVID7rkJbBFwOHkclqVBjLjgXaFAodvECeX+izIHS9ylzWxHsWA3PlAqz8MOJxYl18gZ5fSLMjKl7XaTy/rUQxIhAda5SHB4cRychXB0bE9+0P1klmPMCdW9Jcx0wN0WhUDkuWBZniQcPgG8W2iPguS9YWL+JPPehQDUuA3RRsccDixgp9czr6CQCo9VC+o9Rh6YlV+oe5++E4rJ5Y1UZ8F6fQCzf5paT2KAen403XWSwGHBYEEjp4f6aAAogb/onDFywJHIyCgwNG53R+kHwoasCCdX5xvfzhYD0CcXHA4sfwBH0PgFLMg1uTNDwjrAQgkL140OAABpdkvGzTgG8RDkAWxJtYDkOkPBhI4nFgejiyINbEegEACh5YBAQUQQCCBAxBI4AAEFDhat3uwUoIFsSZ+yAACCRyAgAIIIJDAAQgkcACS74UABRBAIIEDEFDgAAQSOAABBRBAIIEDEEjgUF0glaEAAggkcAACChxZ2psA8YLJglRcE7gtiOCwIFYEDkBAAQQQSOAABBQ45CPdiykLkmZJIAUEFDicWE4uWRBrAiMgmo0EDkAggQMQUAABRMOgwAEIJHCkz695nUmyIHGWBChAQIEDEB2HAgggeoEEDunCt4kkSZIkSZIkSZIkSZIkSVX7BU50vGhqiex/AAAAAElFTkSuQmCC", imageId:10 } 
		] 
	} ) );
});

app.post('/.chat_write', (req, res) => {
  	res.send( JSON.stringify( { errcode:0, rowid:10, datetime:12345667890 } ) );
});

app.listen(port);