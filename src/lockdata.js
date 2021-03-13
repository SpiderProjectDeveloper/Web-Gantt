import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts, _icons } from './texts.js';
import { displayConfirmationBox } from './boxes.js';

export  function lockData( locked=null, success_fn=null, error_fn=null ) {
	if( _globals.lockDataDisabled === null ) {
		if( _data.noEditables ) {
			_globals.lockDataDisabled = true;		// ... disabling this tool
			_globals.lockDataDiv.style.cursor = 'default';
			_globals.lockDataIcon.style.cursor = 'default';
			_globals.lockDataIcon.style.border = '0';			
			_globals.lockDataDiv.title = _texts[_globals.lang].readOnlyModeText;
			_globals.lockDataIcon.setAttribute('src',_icons.notLocked);
		} else {
			_globals.lockDataDisabled = false;			
		}
	}
	if( _globals.lockDataDisabled ) {
		return;
	}

	if( !_globals.lockDataDiv.onclick ) {
		_globals.lockDataDiv.onclick = function(e) { 
			lockData( !_globals.lockDataOn, lockDataSuccessFunction, lockDataErrorFunction ); 
		};	
	}

	if( success_fn === null ) {
		success_fn = function(statusData) { return; }
	}
	if( error_fn === null ) {
		error_fn = function(errorMessage) { return; }
	}

	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 ) {
			//console.log( `received=${_globals.lockDataRequestReceived} processing=${_globals.lockDataProcessingRequest}` );			
	    	if( this.status == 200 ) {
				//console.log( 'The site has been accessed and the file has been read!' );
				let errorParsingStatusData = false;
				let statusData;
				try {
					statusData = JSON.parse(this.responseText);
				} catch(e) {
					errorParsingStatusData = true;
				}
				if( errorParsingStatusData || !('locked' in statusData) || !('ganttmtime' in statusData) ) {
					error_fn( _texts[_globals.lang].statusErrorMessage );
        		} else {
        			success_fn( statusData );
        		}
			} else if( _globals.lockDataRequestReceived && _globals.lockDataProcessingRequest ) {
				console.log( 'The site has been accessed but the file hasn\'t been found!' );
				error_fn( _texts[_globals.lang].statusErrorMessage );
			} else {
				console.log( 'Error occured!' );				
				error_fn( _texts[_globals.lang].noConnectionWithServerMessage );
			}
			return;
	    } else if( this.readyState == 0 ) {
			//console.log( 'Request not initialized.' );			
	    } else if( this.readyState == 1 ) {
			//console.log( 'Connection established.' );			
	    	_globals.lockDataConnectionEstablished = true;
	    } else if( this.readyState == 2 ) {
			//console.log( 'Request received.' );			
	    	_globals.lockDataRequestReceived = true;
	    } else if( this.readyState == 3 ) {
			//console.log( 'Processing request.' );			
	    	_globals.lockDataProcessingRequest = true;
		}
	};

	//displayMessageBox( _texts[_globals.lang].waitWhileLockingMessage );
	
	_globals.lockDataDisabled = true; // To prevent from doubling requests...

    let action = '';
	if( locked !== null ) {
		if( locked ) {
			action='lock';
		} else {
			action='unlock';
		}
	} else {
        action='check_lock';
    }
    let url = _settings.urlLockWithoutAction + action;
	xhttp.open( 'GET', url, true );
	xhttp.send();
}


export function lockDataSuccessFunction( statusData ) {
	let errorMessage = null;

	let ganttmtime = statusData.ganttmtime; 		// Data ("gantt.php") modification time.
	if( _globals.ganttMTime < 0 ) {							// If not set yet...
		_globals.ganttMTime = ganttmtime;					// ...setting it.
	} 
		
	if( _globals.ganttMTime != ganttmtime ) { 				// If modification time differs from that of the data loaded... 
		_globals.lockDataIcon.setAttribute('src',_icons.notLocked);      // ... it means to editing allowed from now on ...
		_globals.lockDataOn = false;
		_globals.lockDataDisabled = true; 
		errorMessage = _texts[_globals.lang].serverDataChangedMessage; 		// ... it means the user must reload the data.
	} else {
		let locked = parseInt( statusData.locked );
		if( locked == 1 ) {
			_globals.lockDataIcon.setAttribute('src',_icons.locked);
			_globals.lockDataOn = true; 
			_globals.lockDataDisabled = false; 
		} else {
			_globals.lockDataIcon.setAttribute('src',_icons.notLocked);
			_globals.lockDataOn = false; 
			_globals.lockDataDisabled = false; 
		}
		_globals.lockDataDiv.style.cursor = 'pointer';
		_globals.lockDataIcon.style.cursor = 'pointer';
	}
	lockDataSetStyling( errorMessage );
}


export function lockDataErrorFunction( errorMessage ) {
	_globals.lockDataDisabled = false;
	_globals.lockDataOn = false;
	_globals.lockDataIcon.setAttribute('src',_icons.notLocked);
	lockDataSetStyling( errorMessage );
}


function lockDataSetStyling( errorMessage = null ) {
	if( !_globals.lockDataOn ) {
		if( _globals.lockDataDisabled ) { // Disabled means no lock/unlock is allowed
			if( errorMessage !== null ) { 					// Read ok, but modification time differs...
				_globals.lockDataDiv.setAttribute( 'title', errorMessage );
			} 
			_globals.lockDataDiv.style.cursor = 'default';
			_globals.lockDataIcon.style.cursor = 'default';
			_globals.lockDataDiv.onclick = null;
		} else {
			_globals.lockDataDiv.setAttribute( 'title', _texts[_globals.lang].dataNotLockedTitle );
		}
	} else {
		_globals.lockDataDiv.setAttribute( 'title', _texts[_globals.lang].dataLockedTitle );
	}
	if( errorMessage !== null ) {
		displayConfirmationBox( errorMessage );
	}
}