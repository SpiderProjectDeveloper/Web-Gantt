import { _settings } from './settings.js'
import { _data } from './globals.js'
import { copyArrayOfObjects } from './utils.js'

export function initTableDimensions() { 
	// Handling table columns widths
	for( let col = 0 ; col < _data.table.length ; col++ ) { // Recalculating widths in symbols into widths in points 
		let add = _settings.tableColumnHMargin*2 + _settings.tableColumnTextMargin*2;
		_data.table[col].width = _data.table[col].width * _settings.tableMaxFontSize*0.5 + add;
	}
	_data.initialTable = []; // Saving table settings loaded from a local version of Spider Project
    copyArrayOfObjects( _data.table, _data.initialTable );
    
    
}