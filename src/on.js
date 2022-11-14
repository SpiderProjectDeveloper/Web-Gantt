import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { drawTableHeader, drawTableContent, drawTableScroll } from './drawtable.js';
import { drawGantt, drawGanttHScroll, drawVerticalScroll } from './drawgantt.js';
import { drawTimeScale } from './drawtimescale.js';
import { drawAll, initLayoutCoords, moveColumnOfTable, setNewColumnWidth, setVerticalSplitterWidth, 
  setVerticalScrollSVGThick, setTableScrollSVGThick, setGanttHScrollSVGThick, 
  validateGanttLeft, validateTopAndHeight, getGanttMaxLeft,
	expandToLevel, zoomXR, zoomYR, zoomXYR, moveXR, moveYR, 
	calculateHorizontalZoomByVerticalZoom, displayXZoomFactor  // NEW!!
} from './helpers.js';
import { setCookie, filterInput, getElementPosition, getCoordinatesOfClickOnImage } from './utils.js';

// **** ON Section

export function onWindowMouseUp(e) { 
	e.stopPropagation();
	//e.preventDefault();
	if( _globals.ganttCaptured ) { 
		_globals.ganttCaptured = false;
		if( _globals.ganttSVG.style.cursor === _settings.ganttSVGCursor ) { // If the cursor currently defined indicates "magnification"...		
			document.body.classList.add('wait');
			let timeScaleClicked = (e.y < (_globals.containerDivY + _globals.timeSVGHeight)) ? true : false; // at is initially clicked: the time scale or gantt chart itself?
			if( Math.abs(_globals.ganttCapturedAtX - _globals.ganttLastFoundAtX) < 2 && Math.abs(_globals.ganttCapturedAtY - _globals.ganttLastFoundAtY) < 2 ) {
				if( e.which != 3 ) {
					zoomXYR(e, true, timeScaleClicked);			
				} else {
					zoomXYR(e, false, timeScaleClicked);			
				}
			}		 
			document.body.classList.remove('wait');
		} else if( _globals.ganttSVG.style.cursor === _settings.ganttSVGCapturedCursor ) { // If the gantt chart has been moved...
			_globals.ganttSVG.style.cursor = _settings.ganttSVGCursor;
			_globals.timeSVG.style.cursor = _settings.timeSVGCursor;
			drawTableContent(); // ... adjusting table contents accordingly.
		}
	} 
	if( _globals.ganttSVG.style.cursor !== _settings.ganttSVGCursor ) {   // Restoring default cursors if required 
		_globals.ganttSVG.style.cursor = _settings.ganttSVGCursor;		  // (when mouse clicked and released in different areas)
		_globals.timeSVG.style.cursor = _settings.timeSVGCursor;          // May be unnecssary at all... to be checked...
	}
	if( _globals.verticalSplitterCaptured ) { 
		_globals.verticalSplitterCaptured = false; 
		setVerticalSplitterWidth(-1);
		initLayoutCoords();
		drawAll();
	} 
	if( _globals.tableScrollCaptured ) { _globals.tableScrollCaptured = false; }
	if( _globals.ganttHScrollCaptured ) { _globals.ganttHScrollCaptured = false; }

	if( _globals.verticalScrollCaptured ) { _globals.verticalScrollCaptured = false; }
 	
	if( _globals.tableSplitterCaptured >= 0 ) {
		//let el = document.getElementById('tableSplitter'+_globals.tableSplitterCaptured);
		let newWidth = _data.table[_globals.tableSplitterCaptured].width + e.x - _globals.tableSplitterCapturedAtX;
		setNewColumnWidth( _globals.tableSplitterCaptured, newWidth );
		_globals.tableSplitterCaptured = -1;
	}
	if( _globals.tableHeaderColumnSwapperCapturedAtX >= 0 ) { // Table column title has been moved...
		_globals.tableHeaderColumnSwapperCapturedAtX = -1;
		let from = Number(_globals.tableHeaderColumnSwapper.dataset.columnNumber);
		_globals.tableHeaderColumnSwapper.remove();
		_globals.tableHeaderColumnSwapper = null;
		_globals.tableHeaderSVGBkgr.style.cursor = 'default';
		for( let col = 1 ; col < _data.table.length ; col++ ) { // To find the column to swap with...
			let el = document.getElementById( 'tableHeaderColumnNameSVG' + col );
			let x = parseInt( el.getAttributeNS( null, 'x' ) ); 
			let width = parseInt( el.getAttributeNS( null, 'width' ) ); 
			if( e.x > x && e.x < (x + width) ) {
				if( from != col ) {
          moveColumnOfTable( from, col );
					drawTableHeader(true);
					drawTableContent(true);					
					for( let cookie = 0 ; cookie < _data.table.length ; cookie++ ) { // Updating cookies according to new column sort order.
						setCookie( _data.table[cookie].ref + "Position", cookie );
					}
				}
				break;
			}
		}
	}
}


export function onWindowMouseMove(e) { 		
	if( _globals.verticalSplitterCaptured ) {
		if( ( e.x < 20 ) || ( e.x > (_globals.innerWidth - 20 - _settings.scrollThick) ) ) {
			return;
		}
		let dX = (e.x - _globals.verticalSplitterCapturedAtX);
		if( dX > 0 && (_globals.tableHeaderSVGWidth+_globals.tableViewBoxLeft+dX > _globals.tableHeaderOverallWidth+_settings.verticalSplitterMoveWidth/2) ) {
			return;
		}
		_globals.verticalSplitterPosition = (dX) / _globals.containerDivWidth + _globals.verticalSplitterPosition;
		_globals.verticalSplitterCapturedAtX = e.x;
		initLayoutCoords();
		drawTableScroll();
		drawGanttHScroll();
		setCookie("verticalSplitterPosition",_globals.verticalSplitterPosition);
		return;
	}
	if( _globals.tableSplitterCaptured >= 0 ) { // Table splitter captured - a table column width is being changing...
		let el = document.getElementById('tableSplitter'+_globals.tableSplitterCaptured);

		let newX = e.x + _globals.tableViewBoxLeft;
		if( _globals.tableSplitterCaptured > 0 ) { // To ensure not sliding too far to the left...
			let leftEl = document.getElementById( 'tableSplitter'+(_globals.tableSplitterCaptured-1) );
			let leftX = parseInt( leftEl.getAttributeNS(null,'x') );
			if( newX < leftX + _settings.minTableColumnWidth ) {
				newX = leftX + _settings.minTableColumnWidth;
			} 
		}
		el.setAttributeNS(null,'x',newX);
		return;
	}
	if( _globals.tableScrollCaptured ) {
		let maxVisibleLeft = (_globals.tableHeaderOverallWidth > _globals.tableHeaderSVGWidth) ? (_globals.tableHeaderOverallWidth - _globals.tableHeaderSVGWidth) : 0;
		let newSliderX = _globals.tableScrollXAtCapture + (e.x - _globals.tableScrollCapturedAtX);
		let maxSlider = _globals.tableScrollSVGWidth - _globals.tableScrollSVGSlider.getBBox().width+1;
		if( newSliderX < 0 ) {
			newSliderX = 0;
		} else if( newSliderX > maxSlider ) {
			newSliderX = maxSlider;
		}
		_globals.tableViewBoxLeft = newSliderX * maxVisibleLeft / maxSlider;
		_globals.tableScrollSVGSlider.setAttributeNS( null,'x', newSliderX );
		drawTableHeader(false,true);
		drawTableContent(false,true);
		return;
	}
	if( _globals.ganttHScrollCaptured ) {
		let maxSlider = _globals.ganttHScrollSVGWidth - _globals.ganttHScrollSVGSlider.getBBox().width;
		if( !( maxSlider > 0 ) ) {
			return;
		}
		let newSliderX = _globals.ganttHScrollXAtCapture + (e.x - _globals.ganttHScrollCapturedAtX);
		if( newSliderX < 0 ) {
			newSliderX = 0;
		} else if( newSliderX > maxSlider ) {
			newSliderX = maxSlider;
		}
		let newGanttVisibleLeft = _data.visibleMin + newSliderX * (getGanttMaxLeft() - _data.visibleMin) / maxSlider;
		_globals.ganttVisibleLeft = validateGanttLeft(newGanttVisibleLeft);
		_globals.ganttHScrollSVGSlider.setAttributeNS( null,'x', newSliderX );
		drawGantt();
		drawTimeScale();
		return;
	}
	if( _globals.verticalScrollCaptured ) {
		let maxSlider = _globals.verticalScrollSVGHeight - _globals.verticalScrollSVGSlider.getBBox().height;
		if( !( maxSlider > 0 ) ) {
			return;
		}
		let newSliderY = _globals.verticalScrollYAtCapture + (e.y - _globals.verticalScrollCapturedAtY);
		if( newSliderY < 0 ) {
			newSliderY = 0;
		} else if( newSliderY > maxSlider ) {
			newSliderY = maxSlider;
		}
		_globals.visibleTop = newSliderY * (_globals.notHiddenOperationsLength - _globals.visibleHeight) / maxSlider;
		setCookie("ganttVisibleTop",_globals.visibleTop);		
		_globals.verticalScrollSVGSlider.setAttributeNS( null,'y', newSliderY );
		drawGantt(false,true);
		drawTableContent(false,true);
		return;
	}
	if( _globals.tableHeaderColumnSwapper != null ) {
		let newX = _globals.tableHeaderColumnSwapperOriginalX + e.x - _globals.tableHeaderColumnSwapperCapturedAtX;
		_globals.tableHeaderColumnSwapper.setAttributeNS(null,'x', newX );
		return;
	}
	
	let hh = parseInt( _globals.htmlStyles.getPropertyValue('--header-height') );
 	// Vertical splitter show
	if( _globals.verticalSplitterSVG !== null ) {
		let vspX = parseInt(_globals.verticalSplitterSVG.getAttributeNS(null,'x')) + _settings.containerHPadding;
		if( _globals.setVerticalSplitterWidthOp == -1 ) {
			vspX += Math.floor(_settings.verticalSplitterWidth/2);
		} else if ( _globals.setVerticalSplitterWidthOp == 1 ) {
			vspX += Math.floor(_settings.verticalSplitterMoveWidth/2);
		}  	
		let vspMoveHalfWidth = Math.floor(4*_settings.verticalSplitterMoveWidth/6);
		if( (vspX - vspMoveHalfWidth < e.x && vspX + vspMoveHalfWidth > e.x ) ) {
			setVerticalSplitterWidth(1);
		} else {
			setVerticalSplitterWidth(-1);
		}
	}
 	// Vertical scroll show
	if( _globals.verticalScrollSVG !== null ) {
		let vscX = parseInt(_globals.verticalScrollSVG.getAttributeNS(null,'x'));
		if( e.x > vscX + _settings.containerHPadding - (_settings.verticalScrollSlideThick - _settings.verticalScrollThick) ) {
			setVerticalScrollSVGThick(1);
		} else {
			setVerticalScrollSVGThick(-1);
		}
	}
 	// Table scroll show
	if( _globals.tableScrollSVG ) {
		let tscX = parseInt(_globals.tableScrollSVG.getAttributeNS(null,'x'));
		let tscY = parseInt(_globals.tableScrollSVG.getAttributeNS(null,'y'));
		if( e.y > (hh + tscY) - (_settings.scrollSlideThick - _settings.scrollThick) && 
			e.y < (hh + tscY) + ((_globals.setTableScrollSVGThickOp===-1) ? _settings.scrollThick : _settings.scrollSlideThick) &&
			e.x > tscX && (e.x < tscX + _globals.tableScrollSVGWidth ) ) {
			setTableScrollSVGThick(1);
		} else {
			setTableScrollSVGThick(-1);
		}
	}
	if( _globals.ganttHScrollSVG ) {
	 	// Gantt horizontal scroll show
		let ghscX = parseInt(_globals.ganttHScrollSVG.getAttributeNS(null,'x'));
		let ghscY = parseInt(_globals.ganttHScrollSVG.getAttributeNS(null,'y'));
		if( e.y > (hh + ghscY) - (_settings.scrollSlideThick - _settings.scrollThick) && 
			e.y < (hh + ghscY) + ((_globals.setGanttHScrollSVGThickOp===-1) ? _settings.scrollThick : _settings.scrollSlideThick) &&
			e.x > ghscX && (e.x < ghscX + _globals.ganttHScrollSVGWidth ) ) {
			setGanttHScrollSVGThick(1);
		} else {
			setGanttHScrollSVGThick(-1);
		}
	}
}

export function onVerticalSplitterSVGMouseDown(e) { 
 	e.preventDefault();
	e.stopPropagation();
	_globals.verticalSplitterCaptured=true; 
	_globals.verticalSplitterCapturedAtX=e.x; 
}


export function onVerticalSplitterSVGTouchStart(e) { 
 	e.preventDefault();
	e.stopPropagation();
	if( e.touches.length < 1 ) {
		return;
	}
	_globals.verticalSplitterCaptured = true; 
	_globals.verticalSplitterCapturedAtX = parseInt(_globals.verticalSplitterSVG.getAttributeNS(null, 'x')) - e.touches[0].clientX;
	_globals.verticalSplitterSVGBkgr.setAttributeNS( null, 'fill', _settings.scrollRectColor );
}


export function onVerticalSplitterSVGTouchMove(e) { 
 	e.preventDefault();
	e.stopPropagation();
	if( !_globals.verticalSplitterCaptured ) {
		return;
	}
	if( e.touches.length < 1 ) {
		return;
	}
	let touchX = e.touches[0].clientX + _globals.verticalSplitterCapturedAtX;
	if( ( touchX < 20 ) || ( touchX > (_globals.innerWidth - 20 - _settings.scrollThick) ) ) {
		return;
	}
	_globals.verticalSplitterPosition = touchX / _globals.containerDivWidth; 
	initLayoutCoords();
	drawTableScroll();
	drawGanttHScroll();
	setCookie("verticalSplitterPosition",_globals.verticalSplitterPosition);
}


export function onVerticalSplitterSVGTouchEnd(e) { 
	e.preventDefault();
	e.stopPropagation();
	_globals.verticalSplitterCaptured = false;
	initLayoutCoords();
	drawAll();
}


export function onGanttMouseDown(e) {
	e.stopPropagation();
	e.preventDefault();
	_globals.ganttCaptured = true; 
	_globals.ganttCapturedAtX = e.clientX;			
	_globals.ganttLastFoundAtX = e.clientX;			
	_globals.ganttCapturedAtY = e.clientY;			
	_globals.ganttLastFoundAtY = e.clientY;			
	setTimeout( function() {
		if( _globals.ganttCaptured ) {
			if( _globals.ganttSVG.style.cursor !== _settings.ganttSVGCapturedCursor ) {
				_globals.ganttSVG.style.cursor = _settings.ganttSVGCapturedCursor;
				_globals.timeSVG.style.cursor = _settings.ganttSVGCapturedCursor;				
			}
		}
	}, 500 );
}


export function onGanttCapturedMouseMove(e) {
	if( !_globals.ganttCaptured ) {
		return;
	}
	e.stopPropagation();
	e.preventDefault();
	if( _globals.ganttSVG.style.cursor !== _settings.ganttSVGCapturedCursor ) { // If the cursor is still defined as a "maginfying" one...
		if( Math.abs(_globals.ganttCapturedAtX - _globals.ganttLastFoundAtX) > 1 ||
			Math.abs(_globals.ganttCapturedAtY != _globals.ganttLastFoundAtY) > 1 ) { // ...if moved at least 2 pixels...
			_globals.ganttSVG.style.cursor = _settings.ganttSVGCapturedCursor; // ...chaning the cursor to a "capturing" one...
			_globals.timeSVG.style.cursor = _settings.ganttSVGCapturedCursor;
		}		
	}

	let deltaX = _globals.ganttVisibleWidth * (e.clientX - _globals.ganttLastFoundAtX) / _globals.ganttSVGWidth;
	let moveX = ( deltaX != 0 ) ? true : false; 
	if( moveX ) {
		_globals.ganttVisibleLeft = validateGanttLeft( _globals.ganttVisibleLeft - deltaX );
		_globals.ganttLastFoundAtX = e.clientX;				
	}

	let moveY = false;
	let timeScaleClicked = (e.y < (_globals.containerDivY + _globals.timeSVGHeight)) ? true : false; // What is clicked: the time scale or gantt chart itself?
	if( !timeScaleClicked ) {
		let deltaY = _globals.visibleHeight * (e.clientY - _globals.ganttLastFoundAtY) / _globals.ganttSVGHeight;
		if( deltaY != 0 ) {
			// let newVisibleTop = _globals.visibleTop - deltaY;
			let newTopAndHeight = validateTopAndHeight( _globals.visibleTop - deltaY, _globals.visibleHeight );
			if( newTopAndHeight[0] != _globals.visibleTop ) {
				_globals.visibleTop = newTopAndHeight[0];
				moveY = true;
			}
			/*
			if( !(newVisibleTop < 0) && !(newVisibleTop + _globals.visibleHeight > _globals.notHiddenOperationsLength) ) {
				_globals.visibleTop = newVisibleTop;
				moveY = true;
			}
			*/
			_globals.ganttLastFoundAtY = e.clientY;
		}
	} 

	if( moveX || moveY ) {
		if( moveX ) {
			drawGanttHScroll();					
			drawTimeScale();
		}
		if( moveY ) {
			//drawTableContent();
			drawVerticalScroll();
		}
		drawGantt();
	}
}

export function onTableScrollSVGSliderTouchStart(e) {
 	e.preventDefault();
	e.stopPropagation();
	_globals.tableScrollCaptured = true;
	_globals.tableScrollCapturedAtX = e.touches[0].clientX;
	let sliderX = parseInt(_globals.tableScrollSVGSlider.getAttributeNS(null, 'x'))
	_globals.tableScrollXAtCapture = e.touches[0].clientX - sliderX - parseInt(_globals.tableScrollSVG.getAttributeNS(null, 'x'));
	_globals.tableScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor);
}


export function onTableScrollSVGSliderTouchMove(e) {
 	e.preventDefault();
	e.stopPropagation();
	let maxVisibleLeft = (_globals.tableHeaderOverallWidth > _globals.tableHeaderSVGWidth) ? (_globals.tableHeaderOverallWidth - _globals.tableHeaderSVGWidth) : 0;
	let newSliderX = e.touches[0].clientX - _globals.tableScrollXAtCapture - parseInt(_globals.tableScrollSVG.getAttributeNS(null, 'x'));
	let maxSlider = _globals.tableScrollSVGWidth - _globals.tableScrollSVGSlider.getBBox().width;
	if( newSliderX < 0 ) {
		newSliderX = 0;
	} else if( newSliderX > maxSlider ) {
		newSliderX = maxSlider;
	}
	_globals.tableViewBoxLeft = newSliderX * maxVisibleLeft / maxSlider;
	_globals.tableScrollSVGSlider.setAttributeNS( null,'x', newSliderX );
	drawTableHeader(false,true);
	drawTableContent(false,true);
}


export function onTableScrollSVGSliderTouchEnd(e) {
 	e.preventDefault();
	e.stopPropagation();
	_globals.tableScrollCaptured = false;
	_globals.tableScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderColor);
}


export function onGanttHScrollSVGSliderTouchStart(e) {
	e.stopPropagation();
	if( e.touches.length < 1 ) {
		return;
	}	
	_globals.ganttHScrollCaptured = true;
	_globals.ganttHScrollCapturedAtX = e.touches[0].clientX;
	let sliderX = parseInt(_globals.ganttHScrollSVGSlider.getAttributeNS(null, 'x'));
	_globals.ganttHScrollXAtCapture = e.touches[0].clientX - sliderX - parseInt(_globals.ganttHScrollSVG.getAttributeNS(null, 'x'));
	_globals.ganttHScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor);
}


export function onGanttHScrollSVGSliderTouchMove(e) {
		if( e.touches.length < 1 ) {
			return;
		}
		let maxSlider = _globals.ganttHScrollSVGWidth - _globals.ganttHScrollSVGSlider.getBBox().width;
		if( !( maxSlider > 0 ) ) {
			return;
		}
		let newSliderX = e.touches[0].clientX - _globals.ganttHScrollXAtCapture - parseInt(_globals.ganttHScrollSVG.getAttributeNS(null, 'x')); // (e.x - _globals.ganttHScrollCapturedAtX);
		if( newSliderX < 0 ) {
			newSliderX = 0;
		} else if( newSliderX > maxSlider ) {
			newSliderX = maxSlider;
		}
		let newGanttVisibleLeft = _data.visibleMin + newSliderX * (getGanttMaxLeft() - _data.visibleMin) / maxSlider;
		_globals.ganttVisibleLeft = validateGanttLeft(newGanttVisibleLeft);
		_globals.ganttHScrollSVGSlider.setAttributeNS( null,'x', newSliderX );
		drawGantt();
		drawTimeScale();
}

export function onGanttHScrollSVGSliderTouchEnd(e) {
	e.stopPropagation();
	_globals.ganttHScrollCaptured = false;
	_globals.ganttHScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderColor);
}


export function onVerticalScrollSVGSliderTouchStart(e) {
	if( e.touches.length < 1 ) {
		return;
	}
 	e.preventDefault();
	e.stopPropagation();
	_globals.verticalScrollCaptured = true;
	_globals.verticalScrollCapturedAtY = e.touches[0].clientY;
	sliderY = parseInt( _globals.verticalScrollSVGSlider.getAttributeNS( null, 'y' ) );
	_globals.verticalScrollYAtCapture = e.touches[0].clientY - sliderY - parseInt( _globals.verticalScrollSVG.getAttributeNS( null, 'y' ) );
	_globals.verticalScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor);
}


export function onVerticalScrollSVGSliderTouchMove(e) {
 	e.preventDefault();
	e.stopPropagation();
	if( e.touches.length < 1 ) {
		return;
	}
	let maxSlider = _globals.verticalScrollSVGHeight - _globals.verticalScrollSVGSlider.getBBox().height;
	if( !( maxSlider > 0 ) ) {
		return;
	}
	let newSliderY = e.touches[0].clientY - _globals.verticalScrollYAtCapture - parseInt(_globals.verticalScrollSVG.getAttributeNS(null, 'y'));
	if( newSliderY < 0 ) {
		newSliderY = 0;
	} else if( newSliderY > maxSlider ) {
		newSliderY = maxSlider;
	}
	_globals.visibleTop = newSliderY * (_globals.notHiddenOperationsLength - _globals.visibleHeight) / maxSlider;
	setCookie("ganttVisibleTop",_globals.visibleTop);		
	_globals.verticalScrollSVGSlider.setAttributeNS( null,'y', newSliderY );
	drawGantt(false,true);
	drawTableContent(false,true);
}


export function onVerticalScrollSVGSliderTouchEnd(e) 
{
	_globals.verticalScrollCaptured = false;
	_globals.verticalScrollSVGSlider.setAttributeNS(null,'fill',_settings.scrollSliderColor);
}


export function onGanttWheel(e) 
{
	let delta = e.deltaY || e.detail || e.wheelDelta;
	if( e.shiftKey ) {
		let zoomFactorChange;
		if( delta < 0 ) {
			zoomFactorChange = '+'; //_settings.zoomFactor;
		} else {
			zoomFactorChange = '-'; //-_settings.zoomFactor;
		}		
		let y = e.clientY - getElementPosition(_globals.containerDiv).y - _globals.ganttSVG.getAttributeNS(null,'y');
		zoomYR( zoomFactorChange, y / _globals.ganttSVGHeight );
	} else {
		let positionChange;
		if( delta > 0 ) {
			positionChange = 1;
		} else {
			positionChange = -1;
		}		
		moveYR( positionChange );
	}
}

export function onTimeWheel(e) {
	let delta = e.deltaY || e.detail || e.wheelDelta;
	let zoomFactorChange;
	if( e.shiftKey ) {
		if( delta > 0 ) {
			zoomFactorChange = '+'; //_settings.zoomFactor;
		} else {
			zoomFactorChange = '-'; //-_settings.zoomFactor;
		}
		zoomXR( zoomFactorChange, (e.clientX - _globals.ganttSVG.getAttributeNS(null,'x')) / _globals.ganttSVGWidth );
	} else {
		let change = _globals.ganttVisibleWidth * _settings.timeScaleScrollStep;
		if( delta < 0 ) {
			change = -change;
		}
		moveXR( change );		
	}
}


export function onZoomHorizontallyInput(id, e) 
{
	let value = filterInput(id);
	zoomXR( (parseInt(value) - Math.floor(_data.visibleMaxWidth * 100.0 / _globals.ganttVisibleWidth + 0.5)) / 100.0 );
}


export function onZoomHorizontallyBlur(id) 
{
	let value = parseInt(id.value);
	if( isNaN(value) ) {
		value = 100;
	} else {
		if( value < _settings.minXZoomFactor*100 ) {
			value = Math.floor(_settings.minXZoomFactor*100);
		}
	}
	id.value = value;
	let nowValue = parseInt(_data.visibleMaxWidth * 100.0 / _globals.ganttVisibleWidth + 0.5);
	if( value != nowValue ) {
		zoomXR( (value - nowValue) / 100.0 );
	}
}


export function onZoomHorizontallyIcon(id, e, inputId) 
{
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( c[2] == 0 && !isNaN(value) ) { // Upper half
		value = parseInt((value - 25.0) / 25.0 + 0.5) * 25;
	} else {
		value = parseInt((value + 25.0) / 25.0 + 0.5) * 25;
	}
	inputId.value = value;
	onZoomHorizontallyBlur(inputId);
}


export function onZoomHorizontallyMinusIcon(id, e, inputId) 
{
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( !isNaN(value) ) { 
		inputId.value = parseInt((value - 25.0) / 25.0 + 0.5) * 25;
	} 
	onZoomHorizontallyBlur(inputId);
}


export function onZoomHorizontallyPlusIcon(id, e, inputId) 
{
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( !isNaN(value) ) { 
		inputId.value = parseInt((value + 25.0) / 25.0 + 0.5) * 25;
	}
	onZoomHorizontallyBlur(inputId);
}


export function onZoomVerticallyBlur(id) 
{
	let value = parseInt(id.value);
	if( isNaN(value) ) {
		value = 100;
	} else {
		if( value < 100 ) {
			value = 100;
		}
	}
	id.value = value;
	zoomYR( (parseInt(value) - parseInt(_globals.notHiddenOperationsLength * 100.0 / _globals.visibleHeight + 0.5)) / 100.0 ); 
}

// NEW!!
export function onClipLeftBlur(id) 
{
	let value = parseInt(id.value);
	if( isNaN(value) ) {
		value = 0;
	} else {
		if( value < 0 ) {
			value = 0;
		} else if( value > 99 ) {
			value = 99;
		}
	}
	id.value = value;
	let newMin = _data.startMinInSeconds + (_data.finMaxInSeconds - _data.startMinInSeconds) * value / 100;
	_data.startFinSeconds = _data.finMaxInSeconds - newMin;
	_data.visibleMin = newMin; // - (_data.finMaxInSeconds-_data.startMinInSeconds)/20.0;
	_data.visibleMaxWidth = _data.visibleMax - _data.visibleMin;

	let newZoom = calculateHorizontalZoomByVerticalZoom( 0, _settings.readableNumberOfOperations );
	_globals.visibleTop = newZoom[0];
	_globals.visibleHeight = newZoom[1];
	_globals.ganttVisibleLeft = newZoom[2];
	_globals.ganttVisibleWidth = newZoom[3];  

	displayXZoomFactor();

	drawAll();
}

// NEW!!
export function onClipLeftIcon(id, e, inputId) 
{
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( c[2] == 0 && !isNaN(value) ) { // Upper half
		value -= 10; 
	} else {
		value += 10;
	}
	if( value < 0 ) value = 0;
	if( value > 99) value = 99;
	inputId.value = value;
	onClipLeftBlur(inputId);
}

export function onZoomVerticallyIcon(id, e, inputId) 
{
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( c[3] == 0 && !isNaN(value)) { // Upper half
		value = parseInt((value + 25.0) / 25.0 + 0.5) * 25;
	} else {
		value = parseInt((value - 25.0) / 25.0 + 0.5) * 25;
	}
	inputId.value = value;
	onZoomVerticallyBlur(inputId);
}

export function onZoomVerticallyPlusIcon(id, e, inputId) {
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( !isNaN(value)) { 
		inputId.value = parseInt((value + 25.0) / 25.0 + 0.5) * 25;
	} 
	onZoomVerticallyBlur(inputId);
}

export function onZoomVerticallyMinusIcon(id, e, inputId) {
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(inputId.value);
	if( !isNaN(value)) { 
		inputId.value = parseInt((value - 25.0) / 25.0 + 0.5) * 25;
	}
	onZoomVerticallyBlur(inputId);
}


// Expand/collapse levels tools ***************************************************************************************************

export function onExpandIcon(id, e) {
	let c = getCoordinatesOfClickOnImage( id, e );
	let value = parseInt(_globals.expandInput.value);
	if( c[3] == 0 && !isNaN(value)) { // Upper half
		value = parseInt(value) + 1;
	} else {
		value = parseInt(value) - 1;
	}
	_globals.expandInput.value = value;
	onExpandBlur();

}


export function onExpandBlur() {
	let value = _globals.expandInput.value;
	if( isNaN(value) ) {
		value = _globals.maxExpandableLevel;
	} else {
		if( value > _globals.maxExpandableLevel ) {
			value = _globals.maxExpandableLevel;
		} else if( value < 1 ) {
			value = 1;
		}
	}
	_globals.expandInput.value = value;
	expandToLevel(value, true);
}


export function onExpandMinusIcon(id, e) {
	let value = parseInt(_globals.expandInput.value);
	if( !isNaN(value)) { 
		_globals.expandInput.value = parseInt(value) - 1;
	} 
	onExpandBlur();
}


export function onExpandPlusIcon(id, e) {
	let value = parseInt(_globals.expandInput.value);
	if( !isNaN(value)) { 
		_globals.expandInput.value = parseInt(value) + 1;
	} 
	onExpandBlur();
}


