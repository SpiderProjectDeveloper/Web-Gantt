import { _data, _globals } from './globals.js'
import { getCookie, deleteCookie } from './utils.js'
import { validateTopAndHeight, validateGanttLeft, moveColumnOfTable } from './helpers.js'

export function readCustomSettings() {
    // Reading cookies to init interface elements.
	for( let col = 0 ; col < _data.table.length ; col++ ) {
		let widthValue = getCookie( _data.table[col].ref + "Width", 'int' );
		if( widthValue ) {
			_data.table[col].width = widthValue;
		}
	}

	// Reading and assigning the positions of columns.
	let failed = false;
	for( let col = 0 ; col < _data.table.length ; col++ ) {
		let pos = getCookie( _data.table[col].ref + "Position", 'int' );
		if( pos == null ) {
			failed = true;
			break;			
		}
		if( pos >= _data.table.length ) {
			failed = true;
			break;
		}
	}
	if( !failed ) { // If all the positions for every column have been found in cookies...
		let moveTo = _data.table.length-1;
		for( let col = 0 ; col < _data.table.length ; col++ ) {
			for( let cookie = 0 ; cookie < _data.table.length ; cookie++ ) { // Searching for the column to be moved to 'moveTo' position...
				let pos = getCookie( _data.table[cookie].ref+"Position", 'int' );
				if( pos == moveTo ) {
          moveColumnOfTable( cookie, moveTo );                    
					moveTo -= 1;
					break;
				}
			}
    }
    //initDataHelpers();	
	} else { // Deleting all the cookies that stores positions of columns...
		for( let cookie = 0 ; cookie < _data.table.length ; cookie++ ) {
			let cname = _data.table[cookie].ref+"Position";
			if( getCookie(cname) != null ) {
				deleteCookie( cname );
			}
		}
  }

	// Reading and validating top and height saved in cookies
	let gvt = getCookie('ganttVisibleTop', 'float');
	let gvh = getCookie('ganttVisibleHeight', 'float');
	//if( gvh ) { console.log('GVH FOUND!!!!' + gvh);}
	if( gvt || gvh ) {
		if( !gvt ) { gvt = _globals.visibleTop; }
		if( !gvh ) { gvh = _globals.visibleHeight; }
		let validated = validateTopAndHeight( gvt, gvh );
		_globals.visibleTop = validated[0];
		_globals.visibleHeight = validated[1];
    }
    // Initializing horizontal zoom
    let gvw = getCookie('ganttVisibleWidth', 'float'); 	// Reading gantt width from cookies
    if( !gvw && _globals.secondsInPixel !== -1 ) {
        gvw = _globals.secondsInPixel * _globals.ganttSVGWidth; 		// Calculating gantt width out of scale
    }
    if( gvw > 60*60 && !(gvw >_data.visibleMaxWidth) ) {
        _globals.ganttVisibleWidth = gvw;
    }	

    let gvl = getCookie('ganttVisibleLeft', 'float');
    if( gvl ) {
        _globals.ganttVisibleLeft = validateGanttLeft(gvl);
    }    
}