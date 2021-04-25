import { drawTableHeader, drawTableContent, drawTableScroll } from './drawtable.js';
import { drawGantt, drawGanttHScroll, drawVerticalScroll } from './drawgantt.js';
import { drawTimeScale } from './drawtimescale.js';
import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts, _icons } from './texts.js';
import { setCookie, createRect, dateIntoSpiderDateString, spacesToPadNameAccordingToHierarchy, 
    getElementPosition, moveElementInsideArrayOfObjects, digitsOnly } from './utils.js';

export function drawAll() {
	drawTableHeader(true);
	drawTableContent(true);
	drawGantt(true);
	drawTimeScale();
	drawTableScroll( true );
	drawGanttHScroll( true );
	drawVerticalScroll( true );			
	drawVerticalSplitter( true );	
}


export function setNewColumnWidth( columnNumber, newColumnWidth ) {
	if( newColumnWidth < _settings.minTableColumnWidth ) {
		newColumnWidth = _settings.minTableColumnWidth;
	}
	_data.table[columnNumber].width = newColumnWidth;
	setCookie( _data.table[columnNumber].ref + "Width", _data.table[columnNumber].width );
	drawTableHeader();
	drawTableContent();
	drawTableScroll();	
}


export function drawVerticalSplitter( init=false ) {
	if( init ) {
		while (_globals.verticalSplitterSVG.hasChildNodes()) {
			_globals.verticalSplitterSVG.removeChild(_globals.verticalSplitterSVG.lastChild);
		}		
		_globals.verticalSplitterSVG.setAttributeNS(null,'cursor','col-resize');	
		_globals.verticalSplitterSVGBkgr = createRect( 0, 0, _globals.verticalSplitterSVGWidth, _globals.verticalSplitterSVGHeight, 
			{ strokeWidth:1, stroke:_settings.verticalSplitterStrokeColor, fill:_settings.verticalSplitterBkgrColor } ); 
		_globals.verticalSplitterSVG.appendChild( _globals.verticalSplitterSVGBkgr );					
	}
}

export function setVerticalSplitterWidth( op ) {
	if( _globals.setVerticalSplitterWidthOp === op ) {
		return;
	}
	if( op === 1 ) {
		_globals.verticalSplitterSVG.setAttributeNS( null, 'width', _settings.verticalSplitterMoveWidth ); 
		_globals.verticalSplitterSVGBkgr.setAttributeNS( null, 'width', _settings.verticalSplitterMoveWidth ); 
	} else if( op === -1 ) {
		_globals.verticalSplitterSVG.setAttributeNS( null, 'width', _settings.verticalSplitterWidth ); 
		_globals.verticalSplitterSVGBkgr.setAttributeNS( null, 'width', _settings.verticalSplitterWidth ); 
	}
	let curX = parseInt(_globals.verticalSplitterSVG.getAttributeNS(null,'x'));
	let newX = curX - op * Math.floor((_settings.verticalSplitterMoveWidth - _settings.verticalSplitterWidth)/2);
	_globals.verticalSplitterSVG.setAttributeNS( null, 'x', newX );
	_globals.setVerticalSplitterWidthOp = op;
}


export function setVerticalScrollSVGThick( op ) {
	if( _globals.setVerticalScrollSVGThickOp === op ) {
		return;
	}
	if( op === 1 ) {
		_globals.verticalScrollSVG.setAttributeNS( null, 'width', _settings.verticalScrollSlideThick ); 
		_globals.verticalScrollSVGBkgr.setAttributeNS( null, 'width', _settings.verticalScrollSlideThick ); 
		_globals.verticalScrollSVGSlider.setAttributeNS( null, 'width', _settings.verticalScrollSlideThick ); 
	} else if( op === -1 ) {
		_globals.verticalScrollSVG.setAttributeNS( null, 'width', _settings.verticalScrollThick ); 
		_globals.verticalScrollSVGBkgr.setAttributeNS( null, 'width', _settings.verticalScrollThick ); 
		_globals.verticalScrollSVGSlider.setAttributeNS( null, 'width', _settings.verticalScrollThick ); 
	}
	let curX = parseInt(_globals.verticalScrollSVG.getAttributeNS(null,'x'));
	let newX = curX - op * (_settings.verticalScrollSlideThick - _settings.verticalScrollThick);
	_globals.verticalScrollSVG.setAttributeNS( null, 'x', newX );
	_globals.setVerticalScrollSVGThickOp = op;
}


export function setGanttHScrollSVGThick( op ) {
	if( _globals.setGanttHScrollSVGThickOp === op ) {
		return;
	}
	if( op === 1 ) {
		_globals.ganttHScrollSVG.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
		_globals.ganttHScrollSVGBkgr.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
		_globals.ganttHScrollSVGSlider.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
	} else if( op === -1 ) {
		_globals.ganttHScrollSVG.setAttributeNS( null, 'height', _settings.scrollThick ); 
		_globals.ganttHScrollSVGBkgr.setAttributeNS( null, 'height', _settings.scrollThick ); 
		_globals.ganttHScrollSVGSlider.setAttributeNS( null, 'height', _settings.scrollThick ); 
	}
	let curY = parseInt(_globals.ganttHScrollSVG.getAttributeNS(null,'y'));
	let newY = curY - op*(_settings.scrollSlideThick - _settings.scrollThick);
	_globals.ganttHScrollSVG.setAttributeNS( null, 'y', newY );
	_globals.setGanttHScrollSVGThickOp = op;
}


export function setTableScrollSVGThick( op ) {
	if( _globals.setTableScrollSVGThickOp === op ) {
		return;
	}
	if( op === 1 ) {
		_globals.tableScrollSVG.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
		_globals.tableScrollSVGBkgr.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
		_globals.tableScrollSVGSlider.setAttributeNS( null, 'height', _settings.scrollSlideThick ); 
	} else if( op === -1 ) {
		_globals.tableScrollSVG.setAttributeNS( null, 'height', _settings.scrollThick ); 
		_globals.tableScrollSVGBkgr.setAttributeNS( null, 'height', _settings.scrollThick ); 
		_globals.tableScrollSVGSlider.setAttributeNS( null, 'height', _settings.scrollThick ); 
	}
	let curY = parseInt(_globals.tableScrollSVG.getAttributeNS(null,'y'));
	let newY = curY - op*(_settings.scrollSlideThick - _settings.scrollThick);
	_globals.tableScrollSVG.setAttributeNS( null, 'y', newY );
	_globals.setTableScrollSVGThickOp = op;
}


export function formatTitleTextContent( i, html=false ) {
	let textContent = "";
	let endl = ( !html ) ? "\r\n" : "<br/>";

	let op = _data.activities[i].Name;
	if( html ) {
		op = "<b>" + op + "</b>" + endl;
	} else {
		op = op + endl + "---------------------------------------" + endl;
	}
	textContent = op;

	let statusText;
	if( _data.activities[i].status == 0 ) {
		statusText = _texts[_globals.lang].status0;
	} else if( _data.activities[i].status < 100 ) {
		statusText = _data.activities[i].status + "%";
	} else {
		statusText = _texts[_globals.lang].status100;				
	}
	textContent += "[ " + statusText + " ]" + endl + endl;

	for( let col=1 ; col < _data.table.length ; col++ ) {
		if( _data.table[col].hidden ) {
			continue;
		}		
		if( _data.table[col].ref === 'Name' ) {
			continue;
		}
		if( _data.table[col].type === 'signal' ) {
			continue;
		}
		let ref = _data.table[col].ref;

		let content = _data.activities[i][ref];
		if( _data.refSettings[ref].type === 'datetime' ) {
			content = dateIntoSpiderDateString( content, (_data.table[col].format === 0) );
		}
		let name = _data.table[col].name;
		if( html ) {
			name = "<span style='color:#7f7f7f;'>" + name + "</span>";
		}
		if( typeof(content) === 'undefined' || content == null ) {
			continue;
		}
		textContent += name + ": " + content + endl;
	}	
	return textContent;
}


export function validateGanttLeft( left ) {
	let maxLeft = getGanttMaxLeft(); 
	if( left > maxLeft ) {
		left = maxLeft;
	}
	if( left < _data.visibleMin ) {
		left = _data.visibleMin;
	}
	return left;
}


export function validateTopAndHeight( top, height ) {
	let minVisibleHeight = calcMinVisibleHeight();
	let maxVisibleHeight = calcMaxVisibleHeight();
	let newVisibleHeight;
	if( height < minVisibleHeight ) {
		newVisibleHeight = minVisibleHeight;
	} else if( height > maxVisibleHeight ) {
		newVisibleHeight = maxVisibleHeight;
	} else {
		newVisibleHeight = height;
	}
	if( top < 0 ) {
		top = 0;
	}
	let newVisibleTop = (top + newVisibleHeight) <= _globals.notHiddenOperationsLength ? top : Math.max(0,_globals.notHiddenOperationsLength - newVisibleHeight);
	//console.log(`top=${top}, newVisibleTop=${newVisibleTop}, _globals.notHiddenOperationsLength=${_globals.notHiddenOperationsLength}, newVisibleHeight=${newVisibleHeight}`);
	return [newVisibleTop, newVisibleHeight ]	
}


export function getGanttMaxLeft() {
	let maxLeft = _data.visibleMax - _globals.ganttVisibleWidth * (1.0 - _settings.ganttVisibleWidthExtra);
	return maxLeft; 	
}


export function initDataHelpers() {
	_data.table = [];
	// Adding a column for expanding rows if required
	if( _data.table.length === 0 ) {
			_data.table.push({ 
					ref:"expandColumn", name:"[]", type:null, widthsym:2, hidden:0, format:null, editable:false 
			});
	}
	for( let col = 0 ; col < _data.fields.length ; col++ ) {
			if( 'hidden' in _data.fields[col] && _data.fields[col].hidden === 1 ) {
					continue;
			}
			let editable = ('editable' in _data.fields[col] && _data.fields[col].editable===1);
			let widthsym = ('widthsym' in _data.fields[col]) ? _data.fields[col].widthsym : null;
			_data.table.push({
					ref: _data.fields[col].Code, name:_data.fields[col].Name, 
					type:_data.fields[col].Type, format: _data.fields[col].format,
					editable: editable, widthsym: widthsym
			});
	}
	// Creating editables for better data handling 
	_data.editables = [];     
	for( let col = 0 ; col < _data.table.length ; col++ ) {
			if( 'editable' in _data.table[col] && _data.table[col].editable ) {
					_data.editables.push({ 
							ref: _data.table[col].ref, name:_data.table[col].name, 
							type:_data.table[col].type, format: _data.table[col].format 
					});
			}
	}
			
	// Creating refSettings for better data handling
	_data.refSettings = {}; 
	for( let col = 0 ; col < _data.table.length ; col++ ) {
			let o = { column: col, type: _data.table[col].type, format: _data.table[col].format, name: _data.table[col].name, editableType: null };
			for( let ie = 0 ; ie < _data.editables.length ; ie++ ) { 	// Is editable?
					if( _data.editables[ie].ref === _data.table[col].ref ) {
							o.editableType = _data.editables[ie].type;
					}
			}
			_data.refSettings[ _data.table[col].ref ] = o;
	}

	// Handling table columns widths
	for( let col = 0 ; col < _data.table.length ; col++ ) { // Recalculating widths in symbols into widths in points 
    let add = _settings.tableColumnHMargin*2 + _settings.tableColumnTextMargin*2;
    let isWid = ('widthsym' in _data.table[col] && _data.table[col].widthsym !== null );
		_data.table[col].width = (isWid) ? (_data.table[col].widthsym * _settings.tableMaxFontSize*0.5 + add) : 5;
	}
}


export function initLayoutCoords() {
	//let htmlStyles = window.getComputedStyle(document.querySelector("html"));
	let headerHeight = parseInt( _globals.htmlStyles.getPropertyValue('--header-height') );
	//let toolboxTableHeight = parseInt( _globals.htmlStyles.getPropertyValue('--toolbox-table-height') );

	_globals.pageHelp.style.width = _globals.innerWidth + 'px';
	_globals.pageHelp.style.height = (_globals.innerHeight - headerHeight - 4).toString() + 'px';

	_globals.containerDivHeight = _globals.innerHeight - headerHeight - _settings.scrollThick; // - toolboxTableHeight;
	_globals.containerDiv.style.width = _globals.innerWidth + 'px';
    _globals.containerDiv.style.height = _globals.containerDivHeight + 'px';
	_globals.containerDivX = _settings.containerHPadding;
	_globals.containerDivY = headerHeight;
	_globals.containerDivWidth = _globals.innerWidth - _settings.containerHPadding*2;
	_globals.containerDiv.style.padding=`0px ${_settings.containerHPadding}px 0px ${_settings.containerHPadding}px`;

	_globals.containerSVG.setAttributeNS(null, 'x', 0 );
	_globals.containerSVG.setAttributeNS(null, 'y', 0 ); 
	_globals.containerSVG.setAttributeNS(null, 'width', _globals.containerDivWidth ); // _globals.innerWidth-1  );
	_globals.containerSVG.setAttributeNS(null, 'height', _globals.containerDivHeight ); 

	// Table Header
	_globals.tableHeaderSVG.setAttributeNS(null, 'x', 0 );
	_globals.tableHeaderSVG.setAttributeNS(null, 'y', 0 ); 
	_globals.tableHeaderSVGWidth = Math.floor(_globals.containerDivWidth * _globals.verticalSplitterPosition);
	_globals.tableHeaderSVG.setAttributeNS(null, 'width', _globals.tableHeaderSVGWidth ); // _globals.innerWidth * 0.1 );
	_globals.tableHeaderSVGHeight = Math.floor(_globals.containerDivHeight * 0.07);
	_globals.tableHeaderSVG.setAttributeNS(null, 'height', _globals.tableHeaderSVGHeight ); 
    _globals.tableHeaderSVG.setAttribute('viewBox', `${_globals.tableViewBoxLeft} 0 ${_globals.tableHeaderSVGWidth} ${_globals.tableHeaderSVGHeight}`);
	// Table Content
	_globals.tableContentSVG.setAttributeNS(null, 'x', 0 );
	_globals.tableContentSVG.setAttributeNS(null, 'y', _globals.tableHeaderSVGHeight ); 
	_globals.tableContentSVGWidth = _globals.tableHeaderSVGWidth;
	_globals.tableContentSVG.setAttributeNS(null, 'width', _globals.tableContentSVGWidth ); // _globals.innerWidth * 0.1 );
	_globals.tableContentSVGHeight = _globals.containerDivHeight - _globals.tableHeaderSVGHeight - _settings.scrollThick;
	_globals.tableContentSVG.setAttributeNS(null, 'height', _globals.tableContentSVGHeight ); 
    _globals.tableContentSVG.setAttribute('viewBox', `${_globals.tableViewBoxLeft} ${_globals.tableViewBoxTop} ${_globals.tableContentSVGWidth} ${_globals.tableContentSVGHeight}`);
    //console.log(`wih = ${_globals.innerHeight}, divh=${_globals.containerDivHeight}, th=${_globals.tableHeaderSVGHeight}, tc=${_globals.tableContentSVGHeight}`);
	
	// Vertical Splitter
	_globals.verticalSplitterSVG.setAttributeNS(null, 'x', _globals.tableContentSVGWidth );
	_globals.verticalSplitterSVG.setAttributeNS(null, 'y', 0 ); 
	_globals.verticalSplitterSVGWidth = _settings.verticalSplitterWidth; //_containerDivWidth * 0.005;
	_globals.verticalSplitterSVG.setAttributeNS(null, 'width', _globals.verticalSplitterSVGWidth ); // _globals.innerWidth * 0.9 );
	_globals.verticalSplitterSVGHeight = _globals.containerDivHeight - _settings.scrollThick;
	_globals.verticalSplitterSVG.setAttributeNS(null, 'height', _globals.containerDivHeight ); //_globals.innerHeight/2 ); 

	// Gantt chart
	_globals.ganttSVG.setAttributeNS(null, 'x', _globals.tableContentSVGWidth + _globals.verticalSplitterSVGWidth );
	_globals.ganttSVG.setAttributeNS(null, 'y', _globals.tableHeaderSVGHeight ); 
	_globals.ganttSVGWidth = _globals.containerDivWidth - (_globals.tableContentSVGWidth + _globals.verticalSplitterSVGWidth) - _settings.verticalScrollThick;
	if( _globals.ganttSVGWidth < 0 ) {
		_globals.ganttSVGWidth = 0;
	}
	_globals.ganttSVG.setAttributeNS(null, 'width', _globals.ganttSVGWidth ); // _globals.innerWidth * 0.9 );
	_globals.ganttSVGHeight = _globals.tableContentSVGHeight;
	if( _globals.ganttSVGHeight < 0 ) {
		_globals.ganttSVGHeight = 0;
	}
	_globals.ganttSVG.setAttributeNS(null, 'height', _globals.ganttSVGHeight ); //_globals.innerHeight/2 );
    _globals.ganttSVG.setAttribute('viewBox', `${_globals.ganttViewBoxLeft} ${_globals.ganttViewBoxTop} ${_globals.ganttSVGWidth} ${_globals.ganttSVGHeight}`);

	// Time scale
	_globals.timeSVG.setAttributeNS(null, 'x', _globals.tableContentSVGWidth + _globals.verticalSplitterSVGWidth );
	_globals.timeSVG.setAttributeNS(null, 'y', 0 ); 
	_globals.timeSVGWidth = _globals.ganttSVGWidth;
	_globals.timeSVG.setAttributeNS(null, 'width', _globals.timeSVGWidth ); // _globals.innerWidth * 0.9 );
	_globals.timeSVGHeight = _globals.tableHeaderSVGHeight;
	_globals.timeSVG.setAttributeNS(null, 'height', _globals.timeSVGHeight ); //_globals.innerHeight/2 );

	// Table scrolling tool
	_globals.tableScrollSVG.setAttributeNS(null, 'x', 0 )
	_globals.tableScrollSVG.setAttributeNS(null, 'y', _globals.tableHeaderSVGHeight + _globals.tableContentSVGHeight ); 
	_globals.tableScrollSVGWidth = _globals.tableHeaderSVGWidth;
	_globals.tableScrollSVG.setAttributeNS(null, 'width', _globals.tableContentSVGWidth ); // _globals.innerWidth * 0.1 );
	_globals.tableScrollSVGHeight = _settings.scrollThick;
	_globals.tableScrollSVG.setAttributeNS(null, 'height', _settings.scrollThick ); 

    //console.log("containerdivheight="+_globals.containerDivHeight);
    //console.log("h="+_globals.tableHeaderSVGHeight);
    //console.log("c="+_globals.tableContentSVGHeight);
    //console.log("h+c="+ (_globals.tableHeaderSVGHeight + _globals.tableContentSVGHeight));

    // Gantt horizontal scrolling tool
	_globals.ganttHScrollSVG.setAttributeNS(null, 'x', _globals.tableContentSVGWidth + _globals.verticalSplitterSVGWidth )
	_globals.ganttHScrollSVG.setAttributeNS(null, 'y', _globals.tableHeaderSVGHeight + _globals.tableContentSVGHeight ); 
	_globals.ganttHScrollSVGWidth = _globals.ganttSVGWidth;
	_globals.ganttHScrollSVG.setAttributeNS(null, 'width', _globals.ganttHScrollSVGWidth );
	_globals.ganttHScrollSVGHeight = _settings.scrollThick;
	_globals.ganttHScrollSVG.setAttributeNS(null, 'height', _settings.scrollThick ); 

	// Vertical scrolling tool
	_globals.verticalScrollSVG.setAttributeNS(null, 'x', _globals.tableContentSVGWidth + _globals.verticalSplitterSVGWidth + _globals.ganttSVGWidth )
	_globals.verticalScrollSVG.setAttributeNS(null, 'y', _globals.tableHeaderSVGHeight ); 
	_globals.verticalScrollSVGWidth = _settings.verticalScrollThick;
	_globals.verticalScrollSVG.setAttributeNS(null, 'width', _globals.verticalScrollSVGWidth );
	_globals.verticalScrollSVGHeight = _globals.ganttSVGHeight; // _containerDivHeight;
	_globals.verticalScrollSVG.setAttributeNS(null, 'height', _globals.verticalScrollSVGHeight ); 
}


export function calcNotHiddenOperationsLength() {
	let numVisible = 0;
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		if( _data.meta[i].visible ) {
			numVisible += 1;
		}
	}
	_globals.notHiddenOperationsLength = numVisible;
}

export function calcMinVisibleHeight() {
	return _settings.minNumberOfOperationsOnScreen; // THE CODE USED BEFORE: (_globals.notHiddenOperationsLength > 5) ? 5.0 : _globals.notHiddenOperationsLength;	
}


export function calcMaxVisibleHeight() {
	let maxOp = _settings.maxNumberOfOperationsOnScreen;
	let minOp = _settings.minNumberOfOperationsOnScreen;
	return (_globals.notHiddenOperationsLength >= maxOp) ? maxOp : (_globals.notHiddenOperationsLength > minOp) ? _globals.notHiddenOperationsLength : minOp;

}


export function displayXZoomFactor( zoomFactor=null ) {
	if( zoomFactor === null ) {
		zoomFactor = _data.visibleMaxWidth / _globals.ganttVisibleWidth;
	} 
	_globals.zoomHorizontallyInput.value = Math.floor(zoomFactor*100.0 + 0.5);
	setCookie("ganttVisibleLeft",_globals.ganttVisibleLeft);
	setCookie("ganttVisibleWidth",_globals.ganttVisibleWidth);
}

export function displayYZoomFactor( zoomFactor=null ) {
	if( zoomFactor === null ) {
		zoomFactor = _globals.notHiddenOperationsLength / _globals.visibleHeight;
	}
	_globals.zoomVerticallyInput.value = Math.floor(zoomFactor*100.0 + 0.5);
	setCookie("ganttVisibleTop",_globals.visibleTop);
	setCookie("ganttVisibleHeight",_globals.visibleHeight);
}


export function displayLinksStatus( setStatus = null ) {
	if( _globals.displayLinksDisabled === null ) {

		let disable = false;
		if( !( 'links' in _data ) ) {
			disable = true;
		} else {
			if( _data.links.length == 0 ) {
				disable = true;
			}
		}
		if( disable ) {
			_globals.displayLinksDisabled = true;
			_globals.displayLinksIcon.setAttribute('src',_icons.notDisplayLinks);
			_globals.displayLinksDiv.style.cursor = 'default';
			_globals.displayLinksIcon.style.cursor = 'default';
            _globals.displayLinksIcon.style.border = '0';
			_globals.displayLinksDiv.onclick = null;
			_globals.displayLinksDiv.title = _texts[_globals.lang].noLinksExportedTitle; 
		} else {
			_globals.displayLinksDisabled = false;
		}
	}
	if( _globals.displayLinksDisabled === true ) {
		return;
	}

	if( setStatus !== null ) {
		_globals.displayLinksOn = setStatus;
	}

	if( _globals.displayLinksOn === true ) {
		_globals.displayLinksIcon.setAttribute('src', _icons.displayLinks);
		_globals.displayLinksDiv.title = _texts[_globals.lang].notDisplayLinksTitle;
		setCookie('displayLinks', 1);
	} else if( _globals.displayLinksOn === false ) {
		_globals.displayLinksIcon.setAttribute('src', _icons.notDisplayLinks);
		_globals.displayLinksDiv.title = _texts[_globals.lang].displayLinksTitle;
		setCookie('displayLinks', 0);
	}
	if( !_globals.displayLinksDiv.onclick ) {
		_globals.displayLinksDiv.onclick = function() { _globals.displayLinksOn = !_globals.displayLinksOn; displayLinksStatus(); drawGantt(); };				   
	}
} 


export function displayTitlesPositioning( setTitlesPositioning = null, hide=false ) {
	if( setTitlesPositioning !== null ) {
		_globals.titlesPositioning = setTitlesPositioning;
	}

	if( !hide ) {
		if( _globals.titlesPositioning === 'r') {
			_globals.titlesPositioningIcon.setAttribute('src',_icons.titlesRight);
			_globals.titlesPositioningIcon.title = _texts[_globals.lang].titlesRightTitle; 
			_globals.titlesPositioningDiv.title = _texts[_globals.lang].titlesRightTitle; 
			_globals.titlesPositioningDiv.style.cursor = 'pointer';
			_globals.titlesPositioningIcon.style.cursor = 'pointer';
			_globals.titlesPositioningDiv.onclick = function() { 
				displayTitlesPositioning( 'a' ); 
				drawGantt(); 
			};
		} else if( _globals.titlesPositioning === 'a' ) {
			_globals.titlesPositioningIcon.setAttribute('src',_icons.titlesAbove);
			_globals.titlesPositioningIcon.title = _texts[_globals.lang].titlesAboveTitle;		 
			_globals.titlesPositioningDiv.title = _texts[_globals.lang].titlesAboveTitle; 
			_globals.titlesPositioningDiv.style.cursor = 'pointer';
			_globals.titlesPositioningIcon.style.cursor = 'pointer';
			_globals.titlesPositioningDiv.onclick = function() { 
				displayTitlesPositioning( 'r' ); 
				drawGantt(); 
			};
		}
	} else {
		_globals.titlesPositioningIcon.setAttribute('src',_icons.titlesHidden);
		_globals.titlesPositioningIcon.title = _texts[_globals.lang].titlesHiddenTitle;				 
		_globals.titlesPositioningDiv.title = _texts[_globals.lang].titlesHiddenTitle; 
		_globals.titlesPositioningDiv.style.cursor = 'default';
		_globals.titlesPositioningIcon.style.cursor = 'default';
		_globals.titlesPositioningDiv.onclick = null;
	}
} 


export function isEditable( name ) {
	for( let iE=0 ; iE < _data.editables.length ; iE++ ) {
		let ref = _data.editables[iE].ref;
		if( ref == name ) {
			return _data.editables[iE].type;
		}
	}
	return null;
}


export function setVisibleTopAndHeightAfterExpand() {
	let oldNotHiddenOperations = _globals.notHiddenOperationsLength;
	calcNotHiddenOperationsLength();
	let newVisibleHeight = _globals.visibleHeight * _globals.notHiddenOperationsLength / oldNotHiddenOperations;
	let topAndHeight = validateTopAndHeight( _globals.visibleTop, newVisibleHeight );
	_globals.visibleTop = topAndHeight[0];
	_globals.visibleHeight = topAndHeight[1];
}


export function timeToScreen( timeInSeconds, absoluteMin=true ) {
	let availableSVGWidth = _globals.ganttSVGWidth - _settings.ganttChartLeftMargin - _settings.ganttChartRightMargin;
	let min;
	if( absoluteMin ) {
		min = _data.visibleMin;
	} else {
		min = _globals.ganttVisibleLeft;
	}
	return Math.floor( _settings.ganttChartLeftMargin + (timeInSeconds - min) * availableSVGWidth / _globals.ganttVisibleWidth + 0.5); 
}


export function timeToScreenInt( timeInSeconds ) {
	let x = timeToScreen(timeInSeconds);
	return Math.floor(x+0.5); 
}


export function operToScreen( n ) {
	return Math.floor( n * _globals.ganttSVGHeight / (_globals.visibleHeight+0.5) + 0.5); 
} 



export function calculateHorizontalZoomByVerticalZoom( top, height ) {
	let th = validateTopAndHeight( top, height );
	let newVisibleHeight = th[1]; // (_globals.notHiddenOperationsLength < height) ? _globals.notHiddenOperationsLength : height;
	let newVisibleTop = th[0]; (top + newVisibleHeight) <= _globals.notHiddenOperationsLength ? top : (_globals.notHiddenOperationsLength - newVisibleHeight);
	
	let newVisibleLeft, newVisibleWidth;
	if( _globals.notHiddenOperationsLength > height ) {		
		let min = _data.activities[0].displayStartInSeconds;
		let max = _data.activities[0].displayFinInSeconds;
		for( let i = 1 ; i < newVisibleHeight ; i++ ) {
			let d = _data.activities[i];
			if( d.displayStartInSeconds < min ) {
				min = d.displayStartInSeconds;
			} 
			if( d.displayFinInSeconds > max ) {
				max = d.displayFinInSeconds;
			}

		}
		newVisibleLeft = min;
		newVisibleWidth = max - min;
	} else {		
		newVisibleLeft = _data.visibleMin;
		newVisibleWidth = _data.visibleMaxWidth;
	}
	return [ newVisibleTop, newVisibleHeight, newVisibleLeft, newVisibleWidth ];
}


export function zoomReadable(e) {
	zoomR( false );
}

export function zoom100(e) {
	zoomR( true );
}

export function zoomXYR( e, zoomIn, xOnly=false ) {
	let zoomFactorChange;
	if( zoomIn ) {
		zoomFactorChange = _settings.zoomFactor;
	} else {
		zoomFactorChange = -_settings.zoomFactor;
	}
	let x = (e.clientX - _globals.ganttSVG.getAttributeNS(null,'x')); // To calculate x-location of click
	zoomX( zoomFactorChange,  x / _globals.ganttSVGWidth );
	if( !xOnly ) {
		let y = e.clientY - getElementPosition(_globals.containerDiv).y - _globals.ganttSVG.getAttributeNS(null,'y'); // To calculate y-location of click
		zoomY( zoomFactorChange, y / _globals.ganttSVGHeight );	
	} 

	drawTimeScale();
	drawGantt();
	drawGanttHScroll();	
	if( !xOnly ) {
		drawTableContent();		
		drawVerticalScroll();
	}
}

export function zoomR( zoomH100 = true ) {
	if( zoomH100 ) {
		let th = validateTopAndHeight( 0, _settings.maxNumberOfOperationsOnScreen );
		_globals.visibleTop = th[0];
		_globals.visibleHeight = th[1];
		_globals.ganttVisibleLeft = _data.visibleMin;
		_globals.ganttVisibleWidth = _data.visibleMaxWidth;

	} else {
		let newZoom = calculateHorizontalZoomByVerticalZoom( 0, _settings.readableNumberOfOperations );
		_globals.visibleTop = newZoom[0];
		_globals.visibleHeight = newZoom[1];
		_globals.ganttVisibleLeft = newZoom[2];
		_globals.ganttVisibleWidth = newZoom[3];
	}

	displayXZoomFactor();
	displayYZoomFactor();

	drawGantt(true);
	drawTimeScale();
	drawGanttHScroll();	
	drawTableContent(true);		
	drawVerticalScroll();
}


// **** ZOOM Section

export function zoomX100() {
	_globals.ganttVisibleLeft = _data.visibleMin;
	_globals.ganttVisibleWidth = _data.visibleMaxWidth;
	_globals.zoomHorizontallyInput.value = 100;
	setCookie("ganttVisibleLeft",_globals.ganttVisibleLeft);
	setCookie("ganttVisibleWidth",_globals.ganttVisibleWidth);	
}

export function zoomX( zoomFactorChange, centerOfZoom=0.5 ) {
	let currentZoomFactor = _data.visibleMaxWidth / _globals.ganttVisibleWidth;

	let newZoomFactor;
	if( typeof(zoomFactorChange) == 'string' ) { // Changing logarithmically...
		if( zoomFactorChange === '+' ) {
			newZoomFactor = currentZoomFactor * (1.0 + _settings.zoomFactor);
		} else {
			newZoomFactor = currentZoomFactor / (1.0 + _settings.zoomFactor);			
		}
	} else { // Changing incrementally...
		newZoomFactor = currentZoomFactor + zoomFactorChange;
	}

	if( newZoomFactor < _settings.minXZoomFactor ) {
		newZoomFactor = _settings.minXZoomFactor;
	}

	let maxZoomFactor = _data.visibleMaxWidth / _settings.minSecondsZoomed;
	if( newZoomFactor > maxZoomFactor ) {
		newZoomFactor = maxZoomFactor;
	}

	if( centerOfZoom < 0.1 ) {
		centerOfZoom = 0.0;
	} else if( centerOfZoom > 0.9 ) {
		centerOfZoom = 1.0;
	}
	let newWidth = _data.visibleMaxWidth / newZoomFactor;
	let newLeft; //				
	if( newZoomFactor < 1.0 ) {
		newLeft = _data.visibleMin;
	} else {
		newLeft = _globals.ganttVisibleLeft - (newWidth - _globals.ganttVisibleWidth) * centerOfZoom;
		if( newLeft < _data.visibleMin ) {
			newLeft = _data.visibleMin;
		} else if( newLeft + newWidth > _data.visibleMax && !(newZoomFactor < 1.0) ) {
			newLeft = _data.visibleMax - newWidth; //_data.visibleMin;
		}
	}
	_globals.ganttVisibleLeft = newLeft;
	_globals.ganttVisibleWidth = newWidth;
	displayXZoomFactor( newZoomFactor );
}

export function zoomXR( factorChange, centerOfZoom=0.5 ) { // Zoom and redraw
	zoomX( factorChange, centerOfZoom );		
	drawGantt();
	drawTimeScale();
	drawGanttHScroll();	
}


export function zoomY100() {
	_globals.visibleTop = 0;
	_globals.visibleHeight = _globals.notHiddenOperationsLength; // _data.activities.length;
	_globals.zoomVerticallyInput.value = 100;
	setCookie("ganttVisibleTop",_globals.visibleTop);
	setCookie("ganttVisibleHeight",_globals.visibleHeight);
} 

export function moveY( positionChange ) {
	if( _globals.notHiddenOperationsLength <= _globals.visibleHeight ) { 	// If content does not go beyond the screen by height - returning immediately...
		return;
	}          
	let newY = _globals.visibleTop + positionChange;
	if( newY < 0 ) {
		newY = 0;
	} else if( newY + _globals.visibleHeight > _globals.notHiddenOperationsLength ) {
		newY = _globals.notHiddenOperationsLength - _globals.visibleHeight;
	}
	_globals.visibleTop = newY;
	setCookie("ganttVisibleTop",_globals.visibleTop);
}

export function moveYR( positionChange ) {
	moveY( positionChange );
	drawGantt(false,true);
	drawTableContent(false,true);
	drawVerticalScroll();
}



export function zoomY( zoomFactorChange, centerOfZoom=0.5 ) {
	let currentZoomFactor = _globals.notHiddenOperationsLength / _globals.visibleHeight;
	let minVisibleHeight = calcMinVisibleHeight();
	let maxZoomFactor = _globals.notHiddenOperationsLength / minVisibleHeight;
	let maxVisibleHeight = calcMaxVisibleHeight();
	let minZoomFactor = _globals.notHiddenOperationsLength / maxVisibleHeight;

	let newZoomFactor;
	if( typeof(zoomFactorChange) == 'string' ) { // Changing logarthmically...
		if( zoomFactorChange === '+' ) {
			newZoomFactor = currentZoomFactor * (1.0 + _settings.zoomFactor);
		} else {
			newZoomFactor = currentZoomFactor / (1.0 + _settings.zoomFactor);			
		}
	} else { // Changing incrementally...
		newZoomFactor = currentZoomFactor + zoomFactorChange;
	}

	if( newZoomFactor > maxZoomFactor ) { 
		newZoomFactor = maxZoomFactor;
	}
	if( newZoomFactor < minZoomFactor ) { 
		newZoomFactor = minZoomFactor;
	}
	
	let newHeight = _globals.notHiddenOperationsLength / newZoomFactor;
	
	if( centerOfZoom < 0.1 ) {
		centerOfZoom = 0.0;
	} else if ( centerOfZoom > 0.9 ) {
		centerOfZoom = 1.0;
	} 
	let newY = _globals.visibleTop - (newHeight - _globals.visibleHeight) * centerOfZoom;	
	if( newY < 0 ) {
		newY = 0;
	} else if( newY + newHeight > _globals.notHiddenOperationsLength ) {
		newY = 0;
	}
	_globals.visibleTop = newY;
	_globals.visibleHeight = newHeight;
	displayYZoomFactor( newZoomFactor );
}


export function zoomYR( factorChange, centerOfZoom=0.5, setZoomFactor=null ) {
	zoomY( factorChange, centerOfZoom, setZoomFactor );		
	drawTableContent();
	drawTimeScale();
	drawGantt();
	drawVerticalScroll();	
}

function moveX( positionChange ) {
	_globals.ganttVisibleLeft = validateGanttLeft(_globals.ganttVisibleLeft + positionChange);
	setCookie("ganttVisibleLeft",_globals.ganttVisibleLeft);
}

export function moveXR( positionChange ) {
	moveX( positionChange );
	drawGantt(false,true);
	//drawGantt(true,false);
	drawTimeScale();
	drawGanttHScroll();
}


export function expandToLevel( level=null, redraw=false ) {
	if( level === null ) {
		level = _maxExpandableLevel;
	} 
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		// console.log(`level=${_data.activities[i].Level}, parents=${_data.meta[i].parents.length}`);
		if( _data.meta[i].parents.length < level-1 ) {
			_data.meta[i].expanded = true;
			_data.meta[i].visible = true;
		} else if( _data.meta[i].parents.length == level-1 ) {
			_data.meta[i].expanded = false;
			_data.meta[i].visible = true;
		} else {
			_data.meta[i].expanded = false;
			_data.meta[i].visible = false;
		}
	}
	if( redraw ) {
		setVisibleTopAndHeightAfterExpand();
		drawTableContent();
		drawGantt(true);
		displayYZoomFactor();
		drawVerticalScroll();
		drawGanttHScroll();	

	}
}


export function getFormatForTableCellAndValue( i, ref ) {
    let r = { value: '', fontStyle: 'normal', fontWeight: 'normal' };

    if( typeof(_data.activities[i][ref]) === 'undefined' || _data.activities[i][ref] === null || _data.activities[i][ref] === '' ) {
		return r;
	} 
	r.value = _data.activities[i][ref];

    if( _data.refSettings[ref].type === 'signal' ) {
        return r;
    }

    if( ref === "Level" ) { // To display no 'teams' or 'assignments' (phases only). 
        if( typeof(r.value) === 'string' && r.value.length > 0 && !digitsOnly(r.value) ) {
            r.value = '';
        }   
        return r;
    }

	if( ref == 'Name') {
		let hrh = _data.meta[i].parents.length;
        r.value = spacesToPadNameAccordingToHierarchy(hrh) + r.value;
        if( typeof(_data.activities[i].Level) === 'number' ) { // If it is a phase...
            r.fontWeight = 'bold'; // ... making it bold.
        }
    } else { 
        if( _data.refSettings[ref].type === 'float' || _data.refSettings[ref].type === 'int' ) {
            r.value = formatNumberStringForTable( r.value, _data.refSettings[ref].type, _data.refSettings[ref].format );
        } else if( _data.refSettings[ref].type === 'datetime' ) {
            r.value = dateIntoSpiderDateString( r.value, (_data.refSettings[ref].format === 0) );
        }
    }    
    if( typeof(r.value) === 'undefined' ) {
        r.value = '';
    } else if( r.value === null ) {
        r.value = '';
    }

    return r;
}

export function moveColumnOfTable( from, to ) {
  moveElementInsideArrayOfObjects( _data.table, from, to );
}


function calcPhaseCoords( rectStart, rectTop, rectWidth, rectHeight, brackets=0 ) {
	let phaseBracketHeight = rectHeight * _settings.ganttRectBracketRelHeight;
	let thick = (rectWidth+rectWidth > _settings.ganttRectBracketThick) ? _settings.ganttRectBracketThick : 1;
	let rectEnd = rectStart + rectWidth;
	let rectBottom = rectTop + rectHeight;
	let phaseCoords;
	if( brackets == 0 ) { // Both brackets
		phaseCoords = rectStart+" "+rectTop+" "+rectEnd+" "+rectTop+" "+rectEnd+" "+rectBottom;
		phaseCoords += " "+(rectEnd - thick)+" "+(rectBottom-phaseBracketHeight);
		phaseCoords += " "+(rectStart + thick)+" "+(rectBottom-phaseBracketHeight)+" "+rectStart+" "+rectBottom;		
	} else if( brackets == 1 ) {  // Only right bracket
		phaseCoords = rectStart+" "+rectTop+" "+rectEnd+" "+rectTop+" "+rectEnd+" "+rectBottom;
		phaseCoords += " "+(rectEnd - thick)+" "+(rectBottom-phaseBracketHeight);
		phaseCoords += " "+rectStart+" "+(rectBottom-phaseBracketHeight);				
	} else { // Only left bracket
		phaseCoords = rectStart+" "+rectTop+" "+rectEnd+" "+rectTop+" "+rectEnd+" "+(rectBottom- phaseBracketHeight);
		phaseCoords += " "+(rectStart + thick)+" "+(rectBottom-phaseBracketHeight)+" "+rectStart+" "+rectBottom;		
	}
	return phaseCoords;
}
