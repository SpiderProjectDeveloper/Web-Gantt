import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts } from './texts.js';
import { drawGantt, drawVerticalScroll } from './drawgantt.js';
import { displayEditBoxWithData, displayEditField } from './boxes.js';
import { onTableScrollSVGSliderTouchStart, onTableScrollSVGSliderTouchMove, onTableScrollSVGSliderTouchEnd } from './on.js';
import { isEditable, operToScreen, setVisibleTopAndHeightAfterExpand, setNewColumnWidth,
    displayYZoomFactor, getFormatForTableCellAndValue } from './helpers.js';
import { createRect, createSVG, createForeignObjectWithText, createCircle, createText, decColorToString  } from './utils.js';
import { loadAndDisplayChat } from './chat';

export function drawTableHeader( init=false, shiftOnly=false ) {
	let thViewBox = `${_globals.tableViewBoxLeft} 0 ${_globals.tableHeaderSVGWidth} ${_globals.tableHeaderSVGHeight}`;
	_globals.tableHeaderSVG.setAttributeNS(null,'viewBox',thViewBox);
	if( shiftOnly ) {
			return;
	}   
	calcTableHeaderOverallWidth();
	if( init ) {
		while (_globals.tableHeaderSVG.hasChildNodes()) {
			_globals.tableHeaderSVG.removeChild(_globals.tableHeaderSVG.lastChild);
		}

		_globals.tableHeaderSVGBkgr = createRect( 0, 0, _globals.tableHeaderOverallWidth, _globals.tableHeaderSVGHeight, 
			{ id:'tableHeaderBkgr', fill:_settings.tableHeaderFillColor } ); // backgroud rect
		_globals.tableHeaderSVG.appendChild( _globals.tableHeaderSVGBkgr );			

		let left = _data.table[0].width;
		for( let col = 1 ; col < _data.table.length ; col++ ) {
			let rectWidth = _data.table[col].width - _settings.tableHeaderColumnHMargin * 2; // The width of SVG-container
			let svg = createSVG( left+_settings.tableHeaderColumnHMargin, 0, rectWidth, _globals.tableHeaderSVGHeight, // SVG-container
				{ id:'tableHeaderColumnNameSVG'+col, 'fill':_settings.tableHeaderFillColor } );
			left += _data.table[col].width;
			let props = { id:'tableHeaderColumnNameBkgr'+col, 'fill':_settings.tableHeaderFillColor, 
				'stroke':_settings.tableHeaderBorderColor, 'strokeWidth':1 };
			let rect = createRect(0, 0, rectWidth, _globals.tableHeaderSVGHeight, props ); // Background RECT
			//rect.onmouseover = function(e) { this.setAttributeNS( null, 'stroke', _settings.tableHeaderActiveBorderColor); };
			//rect.onmouseout = function(e) { this.setAttributeNS( null, 'stroke', _settings.tableHeaderBorderColor); };
			let title = _data.table[col].name;
			if( isEditable( _data.table[col].ref ) ) {
				title += "*";
			}
			
			// TEXT
			let text = createForeignObjectWithText( title, 1, 0, rectWidth-2, _globals.tableHeaderSVGHeight, 
				{ id:'tableHeaderColumnNameText'+col, textAlign:'center', fontSize:_settings.tableMaxFontSize, color:_settings.tableHeaderFontColor } );

			svg.appendChild( rect );			
			svg.appendChild( text );
			_globals.tableHeaderSVG.appendChild( svg );
			
			if( !_globals.touchDevice) {
				svg.addEventListener( 'mousedown', onTableHeaderMouseDown );
			} else { 
				; //svg.addEventListener( 'touchstart', onTableHeaderTouchStart ); 
			}
			svg.style.cursor = 'hand';
			svg.dataset.columnNumber = col;
		}

		// SPLITTERS
		left = 0;
		for( let col = 0 ; col < _data.table.length ; col++ ) {
			left += _data.table[col].width;

			let splitter = createRect( left-_settings.tableHeaderColumnHMargin, 0, _settings.tableHeaderColumnHMargin*2, _globals.tableHeaderSVGHeight, 
				{ id:'tableSplitter'+col, fill:_settings.tableHeaderColumnSplitterColor } );
			splitter.dataset.columnNumber = col;
			if( !_globals.touchDevice ) {
				splitter.setAttributeNS(null,'cursor','col-resize');
				splitter.addEventListener( 'mousedown', onTableColumnSplitterMouseDown );
			} else {
				; //splitter.addEventListener( 'touchstart', onTableColumnSplitterMouseDown );
			}
			_globals.tableHeaderSVG.appendChild(splitter);
		}

	} else {
		document.getElementById('tableHeaderBkgr').setAttributeNS(null,'width',_globals.tableHeaderOverallWidth);
		let left = 0;
		for( let col = 0 ; col < _data.table.length ; col++ ) {
			if( col > 0 ) {
				let rectWidth = _data.table[col].width - _settings.tableHeaderColumnHMargin * 2;
				let svg = document.getElementById('tableHeaderColumnNameSVG'+col);
				svg.setAttributeNS(null, 'x', left + _settings.tableHeaderColumnHMargin);
				svg.setAttributeNS(null, 'width', rectWidth);			
				let rect = document.getElementById('tableHeaderColumnNameBkgr'+col);
				rect.setAttributeNS(null, 'width', rectWidth);			
				let text = document.getElementById('tableHeaderColumnNameText'+col);
				text.setAttributeNS(null, 'width', rectWidth-2);							
			}
			left += _data.table[col].width;			
			let splitter = document.getElementById('tableSplitter'+col); 
			splitter.setAttributeNS(null,'x',left-_settings.tableHeaderColumnHMargin);
		}
	}
}


export function drawTableContent( init=false, shiftOnly=false ) {

	if( _globals.redrawAllMode ) { 		// If optimization is required to cope with a huge number of operations... 
		init=true;				// ..."init" if always true and...
		shiftOnly=false;		// ...as well no shifting.
	} 

    _globals.tableViewBoxTop = Math.round( operToScreen( _globals.visibleTop ) );
    let tcViewBox = `${_globals.tableViewBoxLeft} ${_globals.tableViewBoxTop} ${_globals.tableContentSVGWidth} ${_globals.tableContentSVGHeight}`;
    _globals.tableContentSVG.setAttributeNS(null,'viewBox',tcViewBox);
    if( shiftOnly ) {
        return;
    }  
	// PREVIOUS CODE SNIPPET: let overallHeight = operToScreen( _data.activities.length );
	let overallHeight = operToScreen( _globals.notHiddenOperationsLength );
	// console.log(`_globals.notHiddenOperationsLength=${_globals.notHiddenOperationsLength}, overallHeight=${overallHeight}`);
	if( init ) {
		while (_globals.tableContentSVG.hasChildNodes()) {
			_globals.tableContentSVG.removeChild(_globals.tableContentSVG.lastChild);
		}

		_globals.tableContentSVGBkgr = createRect( 0, 0, _globals.tableHeaderOverallWidth, overallHeight, 
				{ stroke:'none', strokeWidth:1, fill:_settings.tableContentFillColor } ); // backgroud rect
		_globals.tableContentSVG.appendChild( _globals.tableContentSVGBkgr );		
		
		let left = 0;
		for( let col = 0 ; col < _data.table.length ; col++ ) { // Creating svg-containers for columns
			let rectX = left + _settings.tableColumnHMargin;
			let rectWidth = _data.table[col].width - _settings.tableColumnHMargin * 2;
			let rect = createSVG( rectX, 0, rectWidth, overallHeight, 
				{ id:('tableColumnSVG'+col), fill:_settings.tableContentStrokeColor } );
			_globals.tableContentSVG.appendChild( rect );
			left += _data.table[col].width;
		}
	} else {
		_globals.tableContentSVGBkgr.setAttributeNS(null,'width',_globals.tableHeaderOverallWidth);
		_globals.tableContentSVGBkgr.setAttributeNS(null,'height',overallHeight);
		let left = 0;
		for( let col = 0 ; col < _data.table.length ; col++ ) { // Updating svg-containers for columns as well as splitters 
			let rectX = left + _settings.tableColumnHMargin;
			let rectWidth = _data.table[col].width - _settings.tableColumnHMargin * 2;
			let rect = document.getElementById('tableColumnSVG'+col);
			rect.setAttributeNS(null,'x',rectX);
			rect.setAttributeNS(null,'width',rectWidth);
			left += _data.table[col].width;			
			rect.setAttributeNS(null,'height',overallHeight);			
		}
	}

	// Doing fields inside columns
	let rectCounter = 0;
	let rectHeight = (operToScreen(1) - operToScreen(0));
	let fontSize = (rectHeight < 16) ? parseInt(rectHeight * 0.75) : _settings.tableMaxFontSize;
	_globals.tableContentFontSize = fontSize;
	let circleR;
	for( let i = 0 ; i < _data.activities.length ; i++ ) {

		if( _globals.redrawAllMode ) {
			if( !_data.meta[i].visible ) {
				continue;
			}
			let hiddenTop = (rectCounter+2) < _globals.visibleTop;
			let hiddenBottom = (rectCounter-1) > (_globals.visibleTop + _globals.visibleHeight); 
			if( hiddenTop || hiddenBottom  ) {
				rectCounter += 1;
				continue;
			}
		}

		let lineTop = operToScreen(rectCounter);
		let lineBottom = lineTop + rectHeight;
		let lineHeight = lineBottom - lineTop;
		let lineMiddle = lineBottom - lineHeight/2;

		// Expand functionality [+] / [-]
		let expandText;
		let expandTextId = getExpandIconId(i);

		let chatIcon;
		let chatIconId = getChatIconId(i);

		if( init ) {
			chatIcon = createChatIcon(i, chatIconId, fontSize, lineTop);
			if( chatIcon ) {
				document.getElementById('tableColumnSVG0').appendChild(chatIcon);
			}	

			expandText = createExpandIcon( i, expandTextId, fontSize, lineTop );
			document.getElementById('tableColumnSVG0').appendChild(expandText);

		 	// Fields inside columns
			for( let col = 1 ; col < _data.table.length ; col++ ) {
				let ref = _data.table[col].ref;
				let fmt = getFormatForTableCellAndValue( i, ref );
				let content = fmt.value; // _data.activities[i][ref];
				let fontStyle = fmt.fontStyle; // null;
				let fontWeight = fmt.fontWeight; // null;
				let color = _data.meta[i].colorFont; // _settings.tableContentStrokeColor;

				let columnWidthToUse = _data.table[col].width - _settings.tableColumnHMargin*2;

				let tableColumnSVG = document.getElementById('tableColumnSVG'+col);
				let bkgr = createRect( 0, lineTop, columnWidthToUse, rectHeight,  
					{ id:('tableColumn'+col+'Row'+i+'Bkgr'), fill:_data.meta[i].colorBack } );
				tableColumnSVG.appendChild( bkgr );

				let textX = _settings.tableColumnTextMargin;
				let textProperties = { 
					id:('tableColumn'+col+'Row'+i), fill:color, textAnchor:'start', 
					fontSize:fontSize, fontStyle:fontStyle, fontWeight:fontWeight, alignmentBaseline:'middle' 
				};
				if( _data.table[col].type === 'float' || _data.table[col].type === 'int' ) {
					textX = columnWidthToUse - _settings.tableColumnTextMargin*2;
					textProperties.textAnchor = 'end';
				} else if( _data.table[col].type === 'string' || _data.table[col].type === 'text' ) { // For strings "format" stands for alignment
					if( _data.table[col].format == 1 ) { // Align right
						textX = columnWidthToUse - _settings.tableColumnTextMargin*2;
						textProperties.textAnchor = 'end';							
					} else if ( _data.table[col].format == 2 ) {
						textX = parseInt( (columnWidthToUse - _settings.tableColumnTextMargin) / 2 );
						textProperties.textAnchor = 'middle';														
					}
				} else if( _data.table[col].type === 'signal' ) { // Signals require being 'centered'
					textX = parseInt( (columnWidthToUse - _settings.tableColumnTextMargin) / 2 );
					textProperties.fill = decColorToString( content, _settings.ganttNoSignalColor );
					if( Number(content) === _settings.ganttNoSignalColorNumber ) {
						circleR = 0.5;
						textProperties.stroke = _settings.ganttNoSignalColor;						
					} else {
						circleR = parseInt(3*fontSize/7);
						textProperties.stroke = _settings.tableContentStrokeColor;						
					}
				}
				let text;
				if( _data.table[col].type !== 'signal' ) {
					text = createText( content, textX, lineMiddle, textProperties );
				} else {
					text = createCircle( textX, lineMiddle, circleR, textProperties );					
				}
				tableColumnSVG.appendChild( text );
				if( fontSize >= _settings.tableMinFontSize ) { // If font size is too small to make text visible at screen.
					text.setAttributeNS(null,'display','block');
				} else {
					text.setAttributeNS(null,'display','none');				
				}
				let editableType = isEditable(_data.table[col].ref); // To confirm the field is editable...
				// If it is editable and it is neither team nor assignment...
				if( editableType != null ) {
					bkgr.style.cursor = 'pointer';
					bkgr.setAttributeNS( null, 'data-i', i );
					bkgr.setAttributeNS( null, 'data-col', col );
					bkgr.setAttributeNS( null, 'data-type', editableType );
					bkgr.onmousedown = onTableFieldMouseDown;
					text.style.cursor = 'pointer';
					text.setAttributeNS( null, 'data-i', i );
					text.setAttributeNS( null, 'data-col', col );
					text.setAttributeNS( null, 'data-type', editableType );
					text.onmousedown = onTableFieldMouseDown;
				} 
				/*
				else if( ref === 'Name' && 'chatPort' in _globals && _globals.chatPort !== null ) {
					bkgr.style.cursor = 'pointer';
					let parent=null;
					if( 'parents' in _data.meta[i] && _data.meta[i].parents.length > 0 ) {
						let pindex = _data.meta[i].parents[0];
						parent = _data.activities[pindex]['Code'];
					}
					let args = [ _data.activities[i]['Level'], _data.activities[i]['Code'], parent, _data.activities[i]['Name'] ];
					bkgr.onmousedown = function(e) { loadAndDisplayChat( ...args ); };
					text.style.cursor = 'pointer';
					text.onmousedown = function(e) { loadAndDisplayChat( ...args ); };
				}
				*/
				else {
					text.setAttribute('cursor','default');
				}
			}
		} else {
			if( chatIconId ) {
				chatIcon = document.getElementById(chatIconId);
				if( fontSize >= _settings.tableMinFontSize ) { // If font size is big enough to make text visible at screen.
					chatIcon.setAttributeNS(null,'y', getChatIconY(lineTop));
					chatIcon.style.fontSize = fontSize;
					chatIcon.setAttributeNS(null,'display','block');				
				} else {
					chatIcon.setAttributeNS(null,'display','none');
				}
			}
			expandText = document.getElementById(expandTextId);
			if( fontSize >= _settings.tableMinFontSize ) { // If font size is big enough to make text visible at screen.
				expandText.setAttributeNS( null,'x', getExpandIconX(fontSize) );
				expandText.setAttributeNS( null,'y', getExpandIconY(lineTop) );
				expandText.firstChild.nodeValue = getExpandIconText(i);
				expandText.style.fontSize = fontSize;
				expandText.setAttributeNS(null,'display','block');				
			} else {
				expandText.setAttributeNS(null,'display','none');
			}

			for( let col = 1 ; col < _data.table.length ; col++ ) {
				let columnWidthToUse = _data.table[col].width - _settings.tableColumnHMargin*2;
				let textId = 'tableColumn'+col+'Row'+i;
				let textEl = document.getElementById(textId);
				if( fontSize >= _settings.tableMinFontSize ) { // If font size is big enough to make text visible at screen.
					if( _data.table[col].type !== 'signal' ) {
						textEl.setAttributeNS(null,'y',lineMiddle);
						textEl.style.fontSize = fontSize;
						if( _data.table[col].type == 'float' || _data.table[col].type == 'int' ) {
							textEl.setAttributeNS( null, 'x', columnWidthToUse - _settings.tableColumnTextMargin*2 );
						} else if( _data.table[col].type == 'string' || _data.table[col].type == 'text' ) { // For strings "format" stands for alignment
							if( _data.table[col].format == 1 ) { // Align right
								textEl.setAttributeNS( null, 'x', columnWidthToUse - _settings.tableColumnTextMargin*2 );
							} else if ( _data.table[col].format == 2 ) {
								textEl.setAttributeNS( null, 'x', parseInt( (columnWidthToUse - _settings.tableColumnTextMargin) / 2 ) );
							}
						}
					} else {
						textEl.setAttributeNS( null, 'cx', parseInt( (columnWidthToUse - _settings.tableColumnTextMargin) / 2 ) );
						textEl.setAttributeNS(null,'cy',lineMiddle);
						if( Number(_data.activities[i][_data.table[col].ref] ) === _settings.ganttNoSignalColorNumber ) {
							circleR = 0.5;
						} else {
							circleR = parseInt(3*fontSize/7);
						}
						textEl.setAttributeNS( null, 'r', circleR );						
					}
					textEl.setAttributeNS(null,'display','block');				
				} else {
					textEl.setAttributeNS(null,'display','none');					
				}
				let bkgrEl = document.getElementById(textId+'Bkgr');
				bkgrEl.setAttributeNS(null,'y',lineTop);
				bkgrEl.setAttributeNS(null,'width',columnWidthToUse);
				bkgrEl.setAttributeNS(null,'height',rectHeight);
			}
		}

		if( _data.meta[i].visible && expandText.style.display == 'none' && (fontSize >= _settings.tableMinFontSize) ) {
			for( let col = 0 ; col < _data.table.length ; col++ ) {
				let id = 'tableColumn'+col+'Row'+i;
				let el = document.getElementById(id);
				el.setAttributeNS(null,'display','block');
			}
		} else if( (!_data.meta[i].visible && expandText.style.display != 'none') || (fontSize < _settings.tableMinFontSize) ) {
			for( let col = 0 ; col < _data.table.length ; col++ ) {
				let id = 'tableColumn'+col+'Row'+i;
				let el = document.getElementById(id);
				el.setAttributeNS(null,'display','none');
			}
		}		
		if( _data.meta[i].visible ) {
			rectCounter += 1;
		}				
	}
}


function onTableFieldMouseDown(e) {

	let col = this.getAttributeNS(null,'data-col');
	if( e.which == 3 || _globals.touchDevice ) { // The right button has been clicked or a touch device is used...
		displayEditBoxWithData( this );
	} else { // The left one...
		displayEditField( this );		
	}
}


export function drawTableScroll( init=false ) {
	let maxViewBoxLeft = (_globals.tableHeaderOverallWidth > _globals.tableScrollSVGWidth) ? (_globals.tableHeaderOverallWidth - _globals.tableScrollSVGWidth) : 0;
	let sliderSize = (maxViewBoxLeft > 0) ? (_globals.tableScrollSVGWidth*_globals.tableScrollSVGWidth/_globals.tableHeaderOverallWidth) : _globals.tableScrollSVGWidth;
	if( sliderSize < _settings.scrollSliderSize ) {
		sliderSize = _settings.scrollSliderSize;
	}

	let sliderX;
	if( maxViewBoxLeft > 0 ) {
		let maxSlider = _globals.tableScrollSVGWidth - sliderSize;
		sliderX = _globals.tableViewBoxLeft * maxSlider / maxViewBoxLeft;
		if( sliderX < 0 ) {
			sliderX = 0;
		} else if( sliderX > maxSlider ) {
			sliderX = maxSlider;
		}
	} else {
		sliderX = 0;
	}

	if( init ) {
		_globals.tableScrollSVGBkgr = createRect( 0, 0, _globals.tableScrollSVGWidth, _globals.tableScrollSVGHeight, 
			{ id:('tableScrollSVGBkgr'), fill:_settings.scrollBkgrColor } );
		_globals.tableScrollSVGBkgr.setAttributeNS(null,'cursor','pointer');
		_globals.tableScrollSVGBkgr.onmousedown = onTableScrollSVGBkgr;
		_globals.tableScrollSVGSlider = createRect( sliderX, 0, sliderSize, _globals.tableScrollSVGHeight, 
			{ id:('tableScrollSVGSlider'), fill:_settings.scrollSliderColor } );
		_globals.tableScrollSVGSlider.setAttributeNS(null,'cursor','pointer');
		_globals.tableScrollSVG.appendChild( _globals.tableScrollSVGBkgr );
		_globals.tableScrollSVG.appendChild( _globals.tableScrollSVGSlider );
		if( !_globals.touchDevice ) {
			_globals.tableScrollSVGSlider.addEventListener( 'mouseover', 
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor); } );
			_globals.tableScrollSVGSlider.addEventListener( 'mouseout', 
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderColor); } );
			_globals.tableScrollSVGSlider.addEventListener( 'mousedown', onTableScrollSVGSliderMouseDown );
			//_globals.tableScrollSVG.addEventListener( 'mouseover', function(e) { setTableScrollSVGThick(1); } );
			//_globals.tableScrollSVG.addEventListener( 'mouseout', function(e) { setTableScrollSVGThick(-1); } );
		} else {
			_globals.tableScrollSVGSlider.addEventListener( 'touchstart', onTableScrollSVGSliderTouchStart );
			_globals.tableScrollSVGSlider.addEventListener( 'touchmove', onTableScrollSVGSliderTouchMove );
			_globals.tableScrollSVGSlider.addEventListener( 'touchend', onTableScrollSVGSliderTouchEnd );
			_globals.tableScrollSVGSlider.addEventListener( 'touchcancel', onTableScrollSVGSliderTouchEnd );
		}
	} else {
		_globals.tableScrollSVGBkgr.setAttributeNS(null,'width',_globals.tableScrollSVGWidth);
		_globals.tableScrollSVGSlider.setAttributeNS(null,'width',sliderSize);
		_globals.tableScrollSVGSlider.setAttributeNS( null,'x', sliderX );
	}
}


function onTableHeaderMouseDown(e) {
 	e.preventDefault();
	e.stopPropagation();
	_globals.tableHeaderColumnSwapper = this.cloneNode(true);
	if( !_globals.touchDevice ) {
		_globals.tableHeaderSVG.appendChild(_globals.tableHeaderColumnSwapper);
		_globals.tableHeaderColumnSwapperCapturedAtX = e.x;
		_globals.tableHeaderColumnSwapperOriginalX = parseInt( _globals.tableHeaderColumnSwapper.getAttributeNS(null,'x') );	
		_globals.tableHeaderColumnSwapper.setAttributeNS(null,'opacity',0.5);
		_globals.tableHeaderColumnSwapper.style.cursor = 'col-resize';
		_globals.tableHeaderSVGBkgr.style.cursor = 'col-resize';
	}
}

function onTableColumnSplitterMouseDown(e) {
 	e.preventDefault();
	e.stopPropagation();
	let columnNumber = Number(this.dataset.columnNumber);
	if( !_globals.touchDevice ) {
		_globals.tableSplitterCaptured = columnNumber; 
		_globals.tableSplitterCapturedAtX = e.x;
	} else {
		let el = document.getElementById('tableSplitter'+columnNumber);
		let expand = (e.y < _globals.containerDivY + _globals.tableHeaderSVGHeight/2);
		let newWidth = (expand) ? _data.table[columnNumber].width + 5 : _data.table[columnNumber].width - 5;
		setNewColumnWidth( columnNumber, newWidth );
	}	
}


export function calcTableHeaderOverallWidth() {
	let w = 0; 
	for( let col = 0 ; col < _data.table.length ; col++ ) {
		w += _data.table[col].width;
	}	
	_globals.tableHeaderOverallWidth = w;
}


export function onTableScrollSVGBkgr(e) {
 	e.preventDefault();
	e.stopPropagation();
	let bbox = _globals.tableScrollSVGSlider.getBBox();
	let mouseXRelative = e.x - _globals.containerDivX;
	let moveTo = 0;
	if( mouseXRelative < bbox.x ) {
		moveTo = -1;
	} else if( mouseXRelative > bbox.x + bbox.width ) {
		moveTo = 1;
	}
	if( moveTo == 0 ) {
		return;
	}
	let step = _globals.tableContentSVGWidth * _settings.tableScrollStep;
	let maxVisibleLeft = (_globals.tableHeaderOverallWidth > _globals.tableHeaderSVGWidth) ? (_globals.tableHeaderOverallWidth - _globals.tableHeaderSVGWidth) : 0;
	if( !(maxVisibleLeft > 0.0) ) {
		return;
	}
	_globals.tableViewBoxLeft = parseInt(_globals.tableViewBoxLeft + step * moveTo);
	if( _globals.tableViewBoxLeft > maxVisibleLeft ) {
		_globals.tableViewBoxLeft = maxVisibleLeft;
	} else if( _globals.tableViewBoxLeft < 0 ) {
		_globals.tableViewBoxLeft = 0;
	}
	let newSliderX = _globals.tableViewBoxLeft * (_globals.tableScrollSVGWidth - _globals.tableScrollSVGSlider.getBBox().width) / maxVisibleLeft;
	_globals.tableScrollSVGSlider.setAttributeNS( null,'x', newSliderX );
	drawTableHeader(false,true);
	drawTableContent(false,true);
}


export function onTableScrollSVGSliderMouseDown(e) {
 	e.preventDefault();
	e.stopPropagation();
	_globals.tableScrollCaptured = true;
	_globals.tableScrollCapturedAtX = e.x;
	_globals.tableScrollXAtCapture = this.getBBox().x;
}


function getChatIconId(i) {
	return (_globals.chatPort ) ? ('tableColumn0RowChat' + i) : null;
}


function getChatIconX() {
	return 1;
}

function getChatIconY(lineTop) {
	return lineTop + 2;
}

function getChatIconColor(i) {
	if( !_data.activities[i][_settings.numberOfMessagesInChatKey] ) {
		return _settings.emptyChatColor;				 
	} else {
		if( !_data.activities[i][_settings.hasNewMessagesInChatKey] ) {
			return _settings.notEmptyChatColor;				 
		} else {
			return _settings.newMessagesInChatColor;				 
		}
	} 
}

function createChatIcon( i, chatIconId, fontSize, lineTop ) {
	if( !_globals.chatPort ) {
		return null;
	}
	let chatMark = '✉'; // '☶'; // '☷'; // '🖃'; // '💬'; // '☰';
	let chatMarkColor = getChatIconColor(i);
	// let chatMarkTitle = '';
	let chatIcon = createText( chatMark, getChatIconX(), getChatIconY(lineTop), 
		{ id:chatIconId, fill:chatMarkColor, fontSize:fontSize, textAnchor:'start', alignmentBaseline:'hanging' } );

	chatIcon.dataset.operationNumber=i;
	chatIcon.style.cursor = 'pointer';
	chatIcon.onmousedown = function(e) {
		let parent=null;
		if( 'parents' in _data.meta[i] && _data.meta[i].parents.length > 0 ) {
			let pindex = _data.meta[i].parents[0];
			parent = _data.activities[pindex]['Code'];
		}
		let opNum = Number(this.dataset.operationNumber); 
		loadAndDisplayChat( _data.activities[opNum]['Level'], _data.activities[opNum]['Code'], parent, _data.activities[opNum]['Name'] );
	}

	if( fontSize >= _settings.tableMinFontSize ) { // If font size is too small to make text visible at screen.
		chatIcon.setAttributeNS(null,'display','block');
	} else {
		chatIcon.setAttributeNS(null,'display','none');				
	}

	return chatIcon;
}


function getExpandIconId(i) {
	return 'tableColumn0Row' + i;
}

function getExpandIconX( fontSize ) {
	if( _globals.chatPort ) {
		return fontSize + 1;
	}	else {
		return 1;
	}
}

function getExpandIconY( lineTop ) {
	return lineTop + 1;
}

function getExpandIconText(i) {
	if( _data.meta[i].expandable ) {
		if( _data.meta[i].expanded ) {
			return '▼'; // ▼
		 } else {
			return '►'; // ▶				
		}
	}
}

function createExpandIcon( i, expandIconId, fontSize, lineTop ) {
	let expandText = getExpandIconText(i);

	let expandIcon = createText( expandText, getExpandIconX(fontSize), getExpandIconY(lineTop), 
		{ id:expandIconId, fontSize:fontSize, textAnchor:'start', alignmentBaseline:'hanging' } );
	expandIcon.dataset.operationNumber=i;
	if( _data.meta[i].expandable ) {
		expandIcon.style.cursor = 'pointer';
		expandIcon.onmousedown = function(e) {
			let operationNumber = Number(this.dataset.operationNumber); 
			if( _data.meta[operationNumber].expanded == true ) {
				for( let iO = 0 ; iO < _data.activities.length ; iO++ ) {
					for( let iP = 0 ; iP < _data.meta[iO].parents.length ; iP++ ) {
							if( _data.meta[iO].parents[iP] == operationNumber ) {
							_data.meta[iO].visible = false;
							break;
						}
					}
				}
				_data.meta[operationNumber].expanded = false;
			} else {
				for( let iO = operationNumber+1 ; iO < _data.activities.length ; iO++ ) {
					for( let iP = 0 ; iP < _data.meta[iO].parents.length ; iP++ ) {
						let iParent = _data.meta[iO].parents[iP];
							if( iParent == operationNumber ) {
							_data.meta[iO].visible = true;
							break;
						}
						if( _data.meta[iParent].expandable && _data.meta[iParent].expanded == false ) {
							break;
						}

					}
				}
				_data.meta[operationNumber].expanded = true;
			}
			setVisibleTopAndHeightAfterExpand();
			drawTableContent();
			drawGantt(true);
			displayYZoomFactor();
			drawVerticalScroll();
		};
	}
	if( fontSize >= _settings.tableMinFontSize ) { // If font size is too small to make text visible at screen.
		expandIcon.setAttributeNS(null,'display','block');
	} else {
		expandIcon.setAttributeNS(null,'display','none');				
	}

	return expandIcon;
}