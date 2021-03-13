import { _texts, _icons } from './texts.js';
import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';

export function ifSynchronizedCheck( scheduleNext = true ) {
	let xmlhttpDownload = new XMLHttpRequest();

	xmlhttpDownload.onreadystatechange = function() {
	    if (this.readyState == 4 ) {
	    	if( this.status == 200 ) {
				let errorParsingDownloadData = false;
				let downloadedData;
				try {
					downloadedData = JSON.parse(this.responseText);
				} catch(e) {
					errorParsingDownloadData = true;
				}
				if( !errorParsingDownloadData && ('synchronized' in downloadedData) ) {
					_globals.dataSynchronized = parseInt( downloadedData.synchronized );
					if( isNaN(_globals.dataSynchronized) ) {
						_globals.dataSynchronized = 0;
					} else if (_globals.dataSynchronized != 1 ) {
						_globals.dataSynchronized = 0;
					}
				} else {
					_globals.dataSynchronized = 1;
        		}
			} else {
				_globals.dataSynchronized = -1;
			}
        	displaySynchronizedStatus();
			if( scheduleNext ) {
		    	setTimeout( ifSynchronizedCheck, 30000 );
			}
	    } 
	};
	xmlhttpDownload.open( 'GET', _settings.urlIsSynchronized, true );
	xmlhttpDownload.send();
}


export function displaySynchronizedStatus() {
	let container = document.getElementById('toolboxSynchronizedDiv');
	let icon = document.getElementById('toolboxSynchronizedIcon');

	if( !('editables' in _data) || _data.editables.length == 0 ) {
		icon.setAttribute('src',_icons.synchronizationUnapplied); // _globals.iconEmpty
		container.title = _texts[_globals.lang].synchronizationUnappliedMessage;
		return;		
	} 

	if( _globals.dataSynchronized != null ) {
		if( _globals.dataSynchronized == -1 ) {
			icon.setAttribute('src', _icons.notSynchronized);
			container.title = _texts[_globals.lang].errorUserData;
		} else if( _globals.dataSynchronized == 0 ) {
			icon.setAttribute('src', _icons.notSynchronized);
			container.title = _texts[_globals.lang].unsynchronizedMessage;
		} else {
			icon.setAttribute('src',_icons.synchronized); // _globals.iconEmpty
			container.title = _texts[_globals.lang].synchronizedMessage;
		}
	}
} 

