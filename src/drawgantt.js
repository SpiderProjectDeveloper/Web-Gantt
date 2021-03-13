// drawgantt.js
import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts } from './texts.js';
import { displayEditBoxWithData  } from './boxes.js';
import { onGanttHScrollSVGSliderTouchStart, onGanttHScrollSVGSliderTouchMove, 
    onGanttHScrollSVGSliderTouchEnd, onVerticalScrollSVGSliderTouchStart, 
    onVerticalScrollSVGSliderTouchMove, onVerticalScrollSVGSliderTouchEnd } from './on.js';
import { timeToScreen, operToScreen, formatTitleTextContent, 
    getGanttMaxLeft, moveXR, moveYR, displayTitlesPositioning } from './helpers.js';
import { createRect, createPolygon, createLine, createRhomb, 
    createText, setRectCoords, calcRhombCoords } from './utils.js';

export function drawGantt( init=false, shiftOnly=false ) {
	if( _globals.redrawAllMode ) { 		// If optimization is required to cope with a huge number of operations... 
		init=true; 				// ..."init" if always true and...
		shiftOnly=false;		// ...as well no shifting.
	}  
    
    _globals.ganttViewBoxLeft = timeToScreen( _globals.ganttVisibleLeft ) - _settings.ganttChartLeftMargin;
    _globals.ganttViewBoxTop = operToScreen( _globals.visibleTop );
    let ganttViewBox = `${_globals.ganttViewBoxLeft} ${_globals.ganttViewBoxTop} ${_globals.ganttSVGWidth} ${_globals.ganttSVGHeight}`;
    _globals.ganttSVG.setAttributeNS(null,'viewBox',ganttViewBox);
    if( shiftOnly ) {
    	return;
    }

	if( init ) {
		let nodes = _globals.ganttSVG.childNodes;
		for( let n = nodes.length-1 ; n >= 0  ; n-- ) {
			//if( nodes[n].id.indexOf('ganttBkgrGrid') == 0 ) { //
			// Optimizing nodes[n].id.indexOf('ganttBkgrGrid') == 0 
			if( nodes[n].id[5] == 'B' && nodes[n].id[8] == 'r' ) { 
				continue;
			}
			_globals.ganttSVG.removeChild( nodes[n] );
		}
	}

	// Drawing gantt bkgr
	let ganttWidth = timeToScreen(_data.visibleMax) * (1.0 + _settings.ganttVisibleWidthExtra) / _settings.minXZoomFactor;
	let ganttHeight = operToScreen(_data.activities.length);
	if( !_globals.ganttSVGBkgr ) {
		_globals.ganttSVGBkgr = createRect( 0, 0, ganttWidth, ganttHeight, { id:'ganttBkgr', fill:_settings.ganttBkgrColor } );
		_globals.ganttSVG.appendChild(_globals.ganttSVGBkgr);				
	} else {
		_globals.ganttSVGBkgr.setAttributeNS( null, 'width', ganttWidth );
		_globals.ganttSVGBkgr.setAttributeNS( null, 'height', ganttHeight );
	}
	
	let titleRight = (_globals.titlesPositioning === 'r'); 

	// Calculating the coordinates...
	let fontSize;
	if( !titleRight ) {
		fontSize = (operToScreen(_settings.ganttRectTopMargin) - operToScreen(0)) * 0.75;			
	} else {
		fontSize = (operToScreen(1.0 - _settings.ganttRectBottomMarginTitleFree) - operToScreen(0)) * 0.75;					
	}
	if( fontSize > _settings.ganttMaxFontSize ) {
		fontSize = _settings.ganttMaxFontSize;
	}

	let noTitle = (fontSize < _settings.ganttMinFontSize);

	displayTitlesPositioning(null, noTitle);
	
	let rectBottomMargin, rectTopMargin, compareBottomMargin, compareTopMargin;
	if( !titleRight ) {
		rectBottomMargin = _settings.ganttRectBottomMargin;
		rectTopMargin = _settings.ganttRectTopMargin;
		compareBottomMargin = _settings.ganttCompareBottomMargin;
		compareTopMargin = _settings.ganttCompareTopMargin;
	} else {
		rectBottomMargin = _settings.ganttRectBottomMarginTitleFree;
		rectTopMargin = _settings.ganttRectTopMarginTitleFree;
		compareBottomMargin = _settings.ganttCompareBottomMarginTitleFree;
		compareTopMargin = _settings.ganttCompareTopMarginTitleFree;		
	}

	let rectCounter = 0;
	let operationHeight = operToScreen(1) - operToScreen(0);
	let rectHeight = operToScreen(1.0 - rectBottomMargin) - operToScreen(rectTopMargin);
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		if( !_data.activities[i].visible ) {
			_data.activities[i].onScreen = false;
			continue;
		}
		let hiddenLeft = false; //_data.activities[i].displayFinInSeconds < _ganttVisibleLeft;
		let hiddenRight = false; //_data.activities[i].displayStartInSeconds > _ganttVisibleLeft + _ganttVisibleWidth;
		let hiddenTop = (rectCounter+2) < _globals.visibleTop;
		let hiddenBottom = (rectCounter-1) > (_globals.visibleTop + _globals.visibleHeight); 
		if( (hiddenLeft || hiddenRight) || (hiddenTop || hiddenBottom)  ) {
			_data.activities[i].onScreen = false;
			//if( _globals.redrawAllMode ) {
				//rectCounter++;
				//continue;
			//}
		} else {
			_data.activities[i].onScreen = true;
		}

		_data.activities[i].left = timeToScreen( _data.activities[i].displayStartInSeconds );
		_data.activities[i].right = timeToScreen( _data.activities[i].displayFinInSeconds );
		_data.activities[i].top = operToScreen(rectCounter);
		_data.activities[i].bottom = _data.activities[i].top + operationHeight; // operToScreen(rectCounter + 1);
		_data.activities[i].rectTop = operToScreen(rectCounter + rectTopMargin);
		_data.activities[i].rectBottom = _data.activities[i].rectTop + rectHeight; // operToScreen(rectCounter + 1.0 - rectBottomMargin);
		let rectWidth = _data.activities[i].right - _data.activities[i].left;
		if( rectWidth < 3 && _data.activities[i].displayFinInSeconds > _data.activities[i].displayStartInSeconds ) {
			_data.activities[i].left -= 1;
			_data.activities[i].right += 1;
			_data.activities[i].width = 3;
		} else {
			_data.activities[i].width = rectWidth;
		}
		rectCounter++;
	}

	// Drawing gantt links...
	let lineProperties = { stroke:_settings.ganttLinkStrokeColor, strokeWidth:_settings.ganttLinkStrokeWidth, opacity:_settings.ganttLinkOpacity };
	let arrowLineProperties = { stroke:_settings.ganttLinkStrokeColor, strokeWidth:1, opacity:_settings.ganttLinkArrowOpacity, endingArrow:true };
	for( let i = 0 ; ('links' in _data) && (i < _data.links.length) ; i++ ) {
		let predOp = _data.links[i].predOp;
		let succOp = _data.links[i].succOp;
		if( predOp === null || succOp === null ) {
			continue;
		}
		//console.log(`i = ${i}, predOp=${predOp}, succOp=${succOp}`);
		let atLeastOneOpOnScreen = (_data.activities[predOp].onScreen || _data.activities[succOp].onScreen)&&(_data.activities[predOp].visible && _data.activities[succOp].visible); 
		// let bothOpsAreVisible = _data.activities[predOp].visible && _data.activities[succOp].visible; // MAY BE DELETED!
		if( !atLeastOneOpOnScreen ) {
			continue;
		}
		let line, arrowLine, lineX1, lineY1, lineX2, lineY2, arrowY, lineArrowY;
		if( _data.links[i].sfType == 'SS' || _data.links[i].sfType == 'SF' ) {
			lineX1 = _data.activities[predOp].left;
		} else {
			lineX1 = _data.activities[predOp].right;				
		}
		if( _data.activities[predOp].top < _data.activities[succOp].top ) {
			lineY1 = _data.activities[predOp].rectBottom;
			lineY2 = _data.activities[succOp].rectTop - _settings.ganttLinkArrowHeight*2;
			arrowY = _data.activities[succOp].rectTop - _settings.ganttLinkArrowHeight;
		} else {
			lineY1 = _data.activities[predOp].rectTop;
			lineY2 = _data.activities[succOp].rectBottom + _settings.ganttLinkArrowHeight*2;
			arrowY = _data.activities[succOp].rectBottom + _settings.ganttLinkArrowHeight;
		}
		if( _data.links[i].sfType == 'SF' || _data.links[i].sfType == 'FF' ) {
			lineX2 = _data.activities[succOp].right;
		} else {
			lineX2 = _data.activities[succOp].left;				
		}

		if( init ) {
			lineProperties.id = 'ganttLine'+i;
			//console.log(`creating a line in a drawGantt: predOp=${predOp}, visible=${_data.activities[predOp].visible}, succOp=${succOp}, visible=${_data.activities[succOp].visible}`);
			//console.log(`creating a line in a drawGantt: predOp=${predOp}, onscr=${_data.activities[predOp].onScreen}, succOp=${succOp}, onscr=${_data.activities[succOp].onScreen}`);
			//console.log(`lineX1=${lineX1}, lineY1=${lineY1}, lineX2=${lineX2}, lineY2=${lineY2}`);
			line = createLine( lineX1, lineY1, lineX2, lineY2, lineProperties );
			arrowLineProperties.id = 'ganttLineArrow'+i;
			arrowLine = createLine( lineX2, lineY2, lineX2, arrowY, arrowLineProperties );
			_globals.ganttSVG.appendChild(line);				
			_globals.ganttSVG.appendChild(arrowLine);		
		} else {
			line = document.getElementById( 'ganttLine'+i );
			line.setAttributeNS(null,'x1',lineX1);
			line.setAttributeNS(null,'x2',lineX2);
			line.setAttributeNS(null,'y1',lineY1);
			line.setAttributeNS(null,'y2',lineY2);
			arrowLine = document.getElementById( 'ganttLineArrow'+i );
			arrowLine.setAttributeNS(null,'x1',lineX2);
			arrowLine.setAttributeNS(null,'x2',lineX2);
			arrowLine.setAttributeNS(null,'y1',lineY2);
			arrowLine.setAttributeNS(null,'y2',arrowY);
		}
		if( !_data.activities[predOp].visible || !_data.activities[succOp].visible || !_globals.displayLinksOn ) {
			line.setAttributeNS(null,'display','none');
			arrowLine.setAttributeNS(null,'display','none');
		} else {				
			line.setAttributeNS(null,'display','block');				
			arrowLine.setAttributeNS(null,'display','block');				
		}
	}	

	// Drawing main gantt visual elements...
	let op0Properties = { fill:_settings.ganttOperation0Color, opacity:_settings.ganttOperation0Opacity };
	let op100Properties = { fill:_settings.ganttOperation100Color, opacity:_settings.ganttOperation100Opacity };
	let opCompareProperties = { fill:_settings.ganttCompareColor, opacity:_settings.ganttCompareOpacity };
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		if( !_data.activities[i].onScreen && !_data.activities[i].visible ) {
			continue;
		}		
		let rectStart = _data.activities[i].left;
		let rectEnd = _data.activities[i].right;
		let rectTop = _data.activities[i].rectTop;
		let rectBottom = _data.activities[i].rectBottom;
		let rectWidth = _data.activities[i].width;
		let displayCompare, displayCompareAsARhomb, rectCompareStart, rectCompareEnd, rectCompareTop, rectCompareBottom;
		if( _data.activities[i].Start_COMPInSeconds != -1 && _data.activities[i].Fin_COMPInSeconds != -1 ) {
			rectCompareStart = timeToScreen( _data.activities[i].Start_COMPInSeconds );
			rectCompareEnd = timeToScreen( _data.activities[i].Fin_COMPInSeconds );
			rectCompareTop = _data.activities[i].top + operationHeight * compareTopMargin;
			rectCompareBottom = _data.activities[i].bottom - operationHeight * compareBottomMargin;
			displayCompare = true;
			if( _data.activities[i].Fin_COMPInSeconds > _data.activities[i].Start_COMPInSeconds ) {
				displayCompareAsARhomb = false;
			} else {
				displayCompareAsARhomb = true;				
			}
		} else {
			displayCompare = false;
		}

		let text, textX, textY;
		if( !titleRight ) {
			textX = rectStart;
			textY = rectTop - 4;
		} else {
			let rhomb = false;
			if( _data.activities[i].status == 0 || _data.activities[i].status == 100 ) { // Not started or finished...
				; // rhomb = !(rectWidth > 0);				
			} else { // Started but not finished
				rhomb = (_data.activities[i].displayFinInSeconds == _data.activities[i].displayRestartInSeconds);
			}
			if( !rhomb ) { // It is not a rhomb
				textX = rectEnd + rectHeight/2 + 4;
			} else {
				textX = rectEnd + rectHeight/2 + 4;
			}
			textY = rectTop + fontSize;			
		}

		if( init ) { // Initializing...
			let group = document.createElementNS( _settings.NS, 'g' ); // Container
			group.setAttributeNS(null,'id','ganttGroup'+i);
			if( displayCompare ) { // To compare with...
				opCompareProperties.id = 'ganttOpCompare' + i;
				let rectCompare;
				if( !displayCompareAsARhomb ) { 	// Displaying compare rectangle
					rectCompare = createRect( rectCompareStart, rectCompareTop, rectCompareEnd - rectCompareStart, 
						rectCompareBottom - rectCompareTop, opCompareProperties ); // Compare rectangle
				} else {		// Diplaying compare as a rhomb
					rectCompare = createRhomb( rectCompareStart, rectCompareTop, rectHeight, opCompareProperties );
				}
				group.appendChild(rectCompare);
			}			

			if( _data.activities[i].status == 0 ) { // Not started
				let op0;
				op0Properties.id = 'ganttOpNotStarted'+i;
				// op0Properties.fill = (_data.activities[i].f_Critical=="1") ? _settings.ganttCriticalColor : _settings.ganttOperation0Color;
				op0Properties.fill = _data.activities[i].color;
				if( !(rectWidth > 0) ) {
					op0 = createRhomb( rectStart, rectTop, rectHeight, op0Properties );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase ?
					op0 = createRect( rectStart, rectTop, rectWidth, rectHeight, op0Properties ); // Rectangle
				} else {
					op0 = createPolygon( calcPhaseCoords( rectStart, rectTop, rectWidth, rectHeight), op0Properties );
				}
				group.appendChild(op0);
			} else if( _data.activities[i].status == 100 ) { // Finished
				let op100;
				op100Properties.id = 'ganttOpFinished'+i;
				if( !(rectWidth > 0) ) {
					op100 = createRhomb( rectStart, rectTop, rectHeight, op100Properties );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					op100 = createRect( rectStart, rectTop, rectWidth, rectHeight, op100Properties ); // Rectangle
				} else {
					op100 = createPolygon( calcPhaseCoords( rectStart, rectTop, rectWidth, rectHeight ), op100Properties );
				}
				group.appendChild(op100);
			} else { // Started but not finished
				let xLastFin = timeToScreen( _data.activities[i].lastFinInSeconds );
				let xRestart = timeToScreen( _data.activities[i].displayRestartInSeconds );
				op100Properties.id = 'ganttOpFinished'+i;
				let op100;
				let width100 = xLastFin - rectStart;
				if( !(width100 > 0) ) {
					op100 = createRhomb( rectStart, rectTop, rectHeight, op100Properties );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					op100 = createRect( rectStart, rectTop, width100, rectHeight, op100Properties  ); // Rectangle
				} else {
					op100 = createPolygon( calcPhaseCoords(rectStart, rectTop, width100, rectHeight,-1), op100Properties );
				}
				group.appendChild(op100);

				if( _data.activities[i].lastFinInSeconds < _data.activities[i].displayRestartInSeconds ) { // A gap between 
					op100Properties.id = 'ganttOpBetweenFinishedAndNotStarted'+i;
					let opBetween = createRect( xLastFin, rectTop+rectHeight*0.33, xRestart - xLastFin, 1 /*rectHeight*0.2*/, op100Properties  ); // Rectangle
					group.appendChild(opBetween);				
				} 
				
				op0Properties.id = 'ganttOpNotStarted'+i;
				op0Properties.fill = _data.activities[i].color;
				let op0;
				let width0 = rectEnd - xRestart;
				if( !(width0 > 0) ) {
					op0 = createRhomb( rectEnd, rectTop, rectHeight, op0Properties );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					op0 = createRect( xRestart, rectTop, width0, rectHeight, op0Properties  ); // Rectangle
				} else {
					op0 = createPolygon( calcPhaseCoords(xRestart, rectTop, width0, rectHeight, 1), op0Properties );
				}
				group.appendChild(op0);
			}
			// group.onmouseover = function(e) { document.getElementById('tableColumn0Row'+i).setAttributeNS(null,'fill','#2f2f2f') };
			// let bkgr = createRect( 0, lineTop, _data.table[col].width, rectHeight, { id:('tableColumn'+col+'Row'+i+'Bkgr'), fill:_data.activities[i].colorBack } );

			let title = document.createElementNS( _settings.NS,'title' ); // Title
			title.setAttributeNS(null, 'id', 'ganttGroupTitle'+i);
			title.textContent = formatTitleTextContent(i);
			group.appendChild(title);

			group.setAttributeNS( null, 'data-i', i );
			if( !_data.noEditables ) {
	 			group.onmousedown = function(e) { e.stopPropagation(); displayEditBoxWithData(this); };
				group.style.cursor = 'pointer';
	 			//group.ontouchstart = function(e) { e.stopPropagation(); displayEditBoxWithData(this); };
			}

			text = createText( _data.activities[i].Name, textX, textY, // - fontSize * 0.25, 
				{ fontSize:fontSize, fill:_settings.ganttFontColor, id:'ganttText'+i, textAnchor:'left', alignmentBaseline:'baseline' } );
			if( !_data.noEditables ) {
				text.style.cursor = 'pointer';
			}
			group.appendChild(text);
			_globals.ganttSVG.appendChild(group);			
		} else { // Not initializing but only updating coordinates...
			text = document.getElementById( 'ganttText'+i );
			text.setAttributeNS(null,'x',textX);
			text.setAttributeNS(null,'y',textY);
			text.style.fontSize = fontSize;
			if( displayCompare ) { 
				let el = document.getElementById('ganttOpCompare' + i);
				if( !displayCompareAsARhomb ) { 	// Not a rhomb
					setRectCoords( el, rectCompareStart, rectCompareTop, 
						rectCompareEnd - rectCompareStart, rectCompareBottom - rectCompareTop );
				} else {		// A rhomb
					el.setAttributeNS( null,'points', calcRhombCoords( rectCompareStart, rectCompareTop, rectHeight ) );
				}
			}
			if( _data.activities[i].status == 0 ) { // Not started
				let el = document.getElementById('ganttOpNotStarted'+i);
				if( !(rectWidth > 0) ) {
					el.setAttributeNS( null,'points', calcRhombCoords( rectStart, rectTop, rectHeight ) );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					setRectCoords( el, rectStart, rectTop, rectWidth, rectHeight );
				} else {
					el.setAttributeNS( null,'points', calcPhaseCoords(rectStart, rectTop, rectWidth, rectHeight) );
				} 
			} else if( _data.activities[i].status == 100 ) {
				let el = document.getElementById('ganttOpFinished'+i);
				if( !(rectWidth > 0) ) {
					el.setAttributeNS( null,'points', calcRhombCoords( rectStart, rectTop, rectHeight ) );
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					setRectCoords( el, rectStart, rectTop, rectWidth, rectHeight );
				} else {
					el.setAttributeNS( null,'points', calcPhaseCoords(rectStart, rectTop, rectWidth, rectHeight) );
				} 
			} else {
				let xLastFin = timeToScreen( _data.activities[i].lastFinInSeconds );				
				let xRestart = timeToScreen( _data.activities[i].displayRestartInSeconds );
				let width100 = xLastFin - rectStart;
				let width0 = rectEnd - xRestart;
				let el100 = document.getElementById('ganttOpFinished'+i);
				let el0 = document.getElementById('ganttOpNotStarted'+i);
				if( !(width100 > 0) ) { // Zero width
					el100.setAttributeNS( null,'points', calcRhombCoords( rectStart, rectTop, rectHeight ) );					
				} else if( !_data.activities[i]._isPhase ) { // Not a phase
					setRectCoords( el100, rectStart, rectTop, width100, rectHeight );
				} else {
					el100.setAttributeNS( null,'points', calcPhaseCoords(rectStart, rectTop, width100, rectHeight,-1) );
				} 
				if( _data.activities[i].lastFinInSeconds < _data.activities[i].displayRestartInSeconds ) {
					let elBetween = document.getElementById( 'ganttOpBetweenFinishedAndNotStarted'+i );
					setRectCoords( elBetween, xLastFin, rectTop + rectHeight*0.33, xRestart - xLastFin, 1 /*rectHeight*0.2*/ );
				}
				if( !(width0 > 0) ) { // Zero width
					el0.setAttributeNS( null,'points', calcRhombCoords( rectEnd, rectTop, rectHeight ) );					
				}
				if( !_data.activities[i]._isPhase ) { // Not a phase
					setRectCoords( el0, xRestart, rectTop, width0, rectHeight );
				} else {
					el0.setAttributeNS( null,'points', calcPhaseCoords(xRestart, rectTop, width0, rectHeight,1) );
				} 
			}
		}

		if( noTitle ) { // If font size is too small to make text visible at screen.
			text.setAttributeNS(null,'display','none');
		} else {
			text.setAttributeNS(null,'display','block');				
		}

		let group = document.getElementById('ganttGroup'+i); // Hiding or showing the group.
		if( !_data.activities[i].visible ) {
			group.setAttributeNS(null,'display','none');
		} else {
			_data.activities[i].left = rectStart;
			_data.activities[i].right = rectEnd;
			_data.activities[i].top = rectTop;
			_data.activities[i].bottom = rectBottom;			
			group.setAttributeNS(null,'display','block');
		}
	}
}

export function drawGanttHScroll( init=false ) {
	let extra = _globals.ganttVisibleWidth * _settings.ganttVisibleWidthExtra;
	let overallWidth = getGanttMaxLeft() + _globals.ganttVisibleWidth - _data.visibleMin; // _data.visibleMaxWidth + extra;
	let visibleMaxLeft;
	if(overallWidth > _globals.ganttVisibleWidth) {
		visibleMaxLeft = getGanttMaxLeft(); // (_data.visibleMin + overallWidth - _ganttVisibleWidth);
	} else {
		 visibleMaxLeft = _data.visibleMin;
	}

	let sliderSize = (visibleMaxLeft > _data.visibleMin) ? (_globals.ganttHScrollSVGWidth*_globals.ganttVisibleWidth/overallWidth) : _globals.ganttHScrollSVGWidth;
	if( sliderSize < _settings.scrollSliderSize ) {
		sliderSize = _settings.scrollSliderSize;
	}

	let sliderPosition;
	if( visibleMaxLeft > _data.visibleMin ) {
		sliderPosition = (_globals.ganttVisibleLeft-_data.visibleMin) * (_globals.ganttHScrollSVGWidth-sliderSize) / (visibleMaxLeft-_data.visibleMin);
	} else {
		sliderPosition = 0;
	}


	if( init ) {
		let bbox = _globals.ganttHScrollSVG.getBBox();
		_globals.ganttHScrollSVGBkgr = createRect( 0, 0, _globals.ganttHScrollSVGWidth, _globals.ganttHScrollSVGHeight, 
			{ id:('ganttHScrollSVGBkgr'), fill:_settings.scrollBkgrColor, stroke:_settings.scrollRectColor, strokeWidth:1 } );
		_globals.ganttHScrollSVGBkgr.setAttributeNS(null,'cursor','pointer');
		_globals.ganttHScrollSVGBkgr.addEventListener( 'mousedown', onGanttHScrollSVGBkgr );
		//_globals.ganttHScrollSVGBkgr.addEventListener( 'touchstart', onGanttHScrollSVGBkgr );		
		_globals.ganttHScrollSVGSlider = createRect( sliderPosition, 0, sliderSize, _globals.ganttHScrollSVGHeight, 
			{ id:('ganttHScrollSVGSlider'), fill:_settings.scrollSliderColor } );
		_globals.ganttHScrollSVGSlider.setAttributeNS(null,'cursor','pointer');
		_globals.ganttHScrollSVG.appendChild( _globals.ganttHScrollSVGBkgr );
		_globals.ganttHScrollSVG.appendChild( _globals.ganttHScrollSVGSlider );
		if( !_globals.touchDevice ) {
			_globals.ganttHScrollSVGSlider.addEventListener('mouseover', 
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor); } );
			_globals.ganttHScrollSVGSlider.addEventListener('mouseout',
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderColor); } );
			_globals.ganttHScrollSVGSlider.addEventListener('mousedown', onGanttHScrollSVGSlider );
			//_globals.ganttHScrollSVG.addEventListener( 'mouseover', function(e) { setGanttHScrollSVGThick(1); } );
			//_globals.ganttHScrollSVG.addEventListener( 'mouseout', function(e) { setGanttHScrollSVGThick(-1); } );
		} else {
			_globals.ganttHScrollSVGSlider.addEventListener('touchstart', onGanttHScrollSVGSliderTouchStart );
			_globals.ganttHScrollSVGSlider.addEventListener('touchmove', onGanttHScrollSVGSliderTouchMove );
			_globals.ganttHScrollSVGSlider.addEventListener('touchend', onGanttHScrollSVGSliderTouchEnd );
			_globals.ganttHScrollSVGSlider.addEventListener('touchcancel', onGanttHScrollSVGSliderTouchEnd );
		}
	} else {
		_globals.ganttHScrollSVGBkgr.setAttributeNS(null,'width',_globals.ganttHScrollSVGWidth);
		_globals.ganttHScrollSVGSlider.setAttributeNS(null,'width',sliderSize);
		_globals.ganttHScrollSVGSlider.setAttributeNS(null,'x',sliderPosition);
	}
}

export function drawVerticalScroll( init ) {
	if( !init ) {
		init = false;
	}
	let overallHeight =  _globals.notHiddenOperationsLength;
	let visibleMaxTop = (overallHeight > _globals.visibleHeight) ? (overallHeight - _globals.visibleHeight) : 0;
	let sliderSize = (visibleMaxTop > 0) ? (_globals.verticalScrollSVGHeight*_globals.visibleHeight/overallHeight) : _globals.verticalScrollSVGHeight;
	if( sliderSize < _settings.scrollSliderSize ) {
		sliderSize = _settings.scrollSliderSize;
	}
	let sliderPosition;
	if( visibleMaxTop > 0 ) {
		sliderPosition = _globals.visibleTop * (_globals.verticalScrollSVGHeight-sliderSize) / visibleMaxTop;
	} else {
		sliderPosition = 0;
	}
	if( init ) {
		let bbox = _globals.verticalScrollSVG.getBBox();
		_globals.verticalScrollSVGBkgr = createRect( 0, 0, _globals.verticalScrollSVGWidth, _globals.verticalScrollSVGHeight, 
			{ id:('verticalScrollSVGBkgr'), fill:_settings.scrollBkgrColor, stroke:_settings.scrollRectColor, strokeWidth:1 } );
		_globals.verticalScrollSVGBkgr.setAttributeNS(null,'cursor','pointer');
		_globals.verticalScrollSVGBkgr.addEventListener('mousedown', onVerticalScrollSVGBkgr);
		//_globals.verticalScrollSVGBkgr.addEventListener('touchstart', onVerticalScrollSVGBkgr);
		_globals.verticalScrollSVGSlider = createRect( 0, sliderPosition, _globals.verticalScrollSVGWidth, sliderSize, 
			{ id:('verticalScrollSVGSlider'), fill:_settings.scrollSliderColor } );
		_globals.verticalScrollSVGSlider.setAttributeNS(null,'cursor','pointer');
		_globals.verticalScrollSVG.appendChild( _globals.verticalScrollSVGBkgr );
		_globals.verticalScrollSVG.appendChild( _globals.verticalScrollSVGSlider );
		if( !_globals.touchDevice ) {
			_globals.verticalScrollSVGSlider.addEventListener( 'mouseover', 
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderActiveColor); } );
			_globals.verticalScrollSVGSlider.addEventListener( 'mouseout',
				function(e) { this.setAttributeNS(null,'fill',_settings.scrollSliderColor); } );
			_globals.verticalScrollSVGSlider.addEventListener('mousedown', onVerticalScrollSVGSliderMouseDown, true );
			//_globals.verticalScrollSVG.addEventListener( 'mouseover', function(e) { setVerticalScrollSVGThick(1); } );
			//_globals.verticalScrollSVG.addEventListener( 'mouseout', function(e) { setVerticalScrollSVGThick(-1); } );
		} else {
			_globals.verticalScrollSVGSlider.addEventListener('touchstart', onVerticalScrollSVGSliderTouchStart );
			_globals.verticalScrollSVGSlider.addEventListener('touchmove', onVerticalScrollSVGSliderTouchMove );
			_globals.verticalScrollSVGSlider.addEventListener('touchend', onVerticalScrollSVGSliderTouchEnd );
			_globals.verticalScrollSVGSlider.addEventListener('touchcancel', onVerticalScrollSVGSliderTouchEnd );
		}
	} else {
		_globals.verticalScrollSVGSlider.setAttributeNS(null,'height',sliderSize);
		_globals.verticalScrollSVGSlider.setAttributeNS(null,'y',sliderPosition);
	}
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


function onGanttHScrollSVGBkgr(e) {
	let x = parseInt( _globals.ganttHScrollSVGSlider.getAttributeNS(null,'x') ) + parseInt( _globals.ganttHScrollSVG.getAttributeNS(null,'x') ) + _globals.containerDivX;
	let step = _globals.ganttVisibleWidth * _settings.timeScaleScrollStep;
	if( e.x < x ) {
		moveXR( -step );		
	} else if( e.x > x + parseInt( _globals.ganttHScrollSVGSlider.getAttributeNS(null,'width') ) ) {
		moveXR( step );		
	}
}


function onGanttHScrollSVGSlider(e) {
	e.stopPropagation();
	_globals.ganttHScrollCaptured = true;
	_globals.ganttHScrollCapturedAtX = e.x;
	_globals.ganttHScrollXAtCapture = this.getBBox().x;
}


function onVerticalScrollSVGBkgr(e) {
	let bbox = _globals.verticalScrollSVGSlider.getBBox();
	let mouseYRelative = e.y - _globals.containerDivY - _globals.tableHeaderSVGHeight;
	//console.log(`mouseYRelative=${mouseYRelative}, bbox.y=${bbox.y}, bbox.y+bbox.height=${bbox.y + bbox.height}`);	
	if( mouseYRelative < bbox.y ) {
		moveYR( -1 );				
	} else if( mouseYRelative > bbox.y + bbox.height ) {
		moveYR( 1 );				
	}
}


function onVerticalScrollSVGSliderMouseDown(e) {
 	e.preventDefault();
	e.stopPropagation();
	_globals.verticalScrollCaptured = true;
	_globals.verticalScrollCapturedAtY = e.y;
	_globals.verticalScrollYAtCapture = this.getBBox().y;
}
