import { _texts, _icons } from './texts.js';
import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { displayConfirmationBox } from './boxes.js';
import { updateChatIconsInTable } from './drawtable.js'


// Verifying the project has not been changed by another user
export function ifSynchronized( scheduleNext = true, init = null ) {
	if( init !== null ) {
		_globals.dataChanged = init;
		_globals.dataSynchronized = 1;
		if( scheduleNext ) {
			setTimeout( ifSynchronized, _globals.synchronizationRate );
		}	
		return;
	}

	let xhttpProps = new XMLHttpRequest();
	xhttpProps.onreadystatechange = function() {
		if (xhttpProps.readyState == 4 ) {
			if( xhttpProps.status == 200 ) {
				let errorParsingProps = false;
				let props;	
				try {
					props = JSON.parse( xhttpProps.responseText );
				} catch(e) {
					errorParsingProps = true;
				}
				if( !errorParsingProps ) {
					if( 'project' in props ) {
						if( _globals.dataChanged === null ) {
							_globals.dataChanged = props.project.dataChanged;
							_globals.dataSynchronized = 1;
						} else { 	// The project has been changed by another user
							if( (typeof(props.project.dataChanged) === 'undefined') || props.project.dataChanged === _globals.dataChanged ) {
								_globals.dataSynchronized = 1;
							} else {
								_globals.dataSynchronized = 0;
								displayDataChangedConfirmationBox();
							} 
						}
						if( scheduleNext && _globals.dataSynchronized === 1 ) {
							setTimeout( ifSynchronized, _globals.synchronizationRate );
						}					
						displaySynchronizedStatus();

						if( _globals.chatPort && 'activities' in props) {
							updateChatIconsInTable( props.activities );
						}
						return;
					}
				}
			}
			_globals.dataSynchronized = -1;
			displaySynchronizedStatus();
			if( scheduleNext ) {
				setTimeout( ifSynchronized, _globals.synchronizationRate );
			}	
		}
	} 
	xhttpProps.open( 'GET', '/.get_project_last_updates?'+_globals.projectId, true );
	xhttpProps.send();
}


export function displaySynchronizedStatus() {
	let container = document.getElementById('synchronizedDiv');
	let icon = document.getElementById('synchronizedIcon');

	if( !('editables' in _data) || _data.editables.length == 0 ) {
		icon.setAttribute('src',_icons.synchronizationUnapplied); // _globals.iconEmpty
		container.title = _texts[_globals.lang].synchronizationUnappliedMessage;
		return;		
	} 

	if( _globals.dataSynchronized == -1 ) {
		icon.setAttribute('src', _icons.notSynchronized);
		container.title = _texts[_globals.lang].noConnectionWithServerMessage;
	} else if( _globals.dataSynchronized == 0 ) {
		icon.setAttribute('src', _icons.notSynchronized);
		container.title = _texts[_globals.lang].unsynchronizedMessage;
	} else {
		icon.setAttribute('src',_icons.synchronized); // _globals.iconEmpty
		container.title = _texts[_globals.lang].synchronizedMessage;
	}
}


function displayDataChangedConfirmationBox( firstFailed = false ) {
	let msg = _texts[_globals.lang].unsynchronizedMessage;
	if( firstFailed ) {
		msg += '<br/><br/><i>'+_texts[_globals.lang].serverDoesNotRespondMessage + '</i>'; 
	}
	displayConfirmationBox( msg, 
		function() { 
			let xhttpClose = new XMLHttpRequest(); 	// Send a "close project" message first
			xhttpClose.onreadystatechange = function() {
				if (xhttpClose.readyState == 4 ) {
					if( xhttpClose.status == 200 ) { // When 
						window.location.reload();	
					} else {
						displayDataChangedConfirmationBox(true);
					}
				}
			}									
			xhttpClose.open( 'GET', '/.close_project?'+_globals.projectId, true );
			xhttpClose.send();
		});
}