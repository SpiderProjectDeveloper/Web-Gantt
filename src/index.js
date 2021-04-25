import './index.css';
import mainHTML from './main.html';
import { drawTableHeader, drawTableContent, drawTableScroll, calcTableHeaderOverallWidth } from './drawtable.js';
import { drawGantt, drawGanttHScroll, drawVerticalScroll } from './drawgantt.js';
import { drawTimeScale } from './drawtimescale.js';
import { displayMessageBox, hideMessageBox, createEditBoxInputs } from './boxes.js';
import { _texts, _icons } from './texts.js';
import { _settings } from './settings.js';
import { readCustomSettings } from './customsettings.js'
import { _globals, _data, setData, initGlobals, initGlobalsWithDataParameters } from './globals.js';
import { onWindowMouseMove, onGanttWheel, onVerticalSplitterSVGMouseDown,  
	onGanttMouseDown, onGanttCapturedMouseMove, onTimeWheel, onWindowMouseUp, onZoomHorizontallyIcon, 
	onVerticalSplitterSVGTouchStart, onVerticalSplitterSVGTouchMove, onVerticalSplitterSVGTouchEnd,
    onExpandMinusIcon, onExpandPlusIcon, onZoomHorizontallyPlusIcon, onZoomVerticallyIcon, 
    onExpandIcon, onExpandBlur, onZoomHorizontallyBlur, onZoomVerticallyBlur } from './on.js'
import { drawAll, calculateHorizontalZoomByVerticalZoom, displayLinksStatus, zoom100, zoomReadable,
    initLayoutCoords, calcNotHiddenOperationsLength, displayXZoomFactor, displayYZoomFactor,  
	expandToLevel, initDataHelpers } from './helpers.js';
import { getCookie, setCookie, deleteCookie, createDefs, csvIntoJSON, dateIntoSpiderDateString, decColorToString, 
	copyArrayOfObjects, trimString, filterInput, digitsOnly } from './utils.js';
import { initMenu } from './menu.js';
import { ifSynchronized } from './synchro.js';

// Attaching to the html container element
let script = document.getElementById('bundle');
let appContainer = null;
let user = null;
if( script ) {	
    let appContainerName = script.getAttribute('data-appcontainer');
	if(appContainerName) { 
		appContainer = document.getElementById(appContainerName);
    }
    user = script.getAttribute('data-user');
}
if( appContainer ) {
	appContainer.innerHTML = mainHTML;
} else { 
	document.body.innerHTML = mainHTML;
}
initGlobals(appContainer, user);

window.addEventListener( "load", onWindowLoad );
window.addEventListener( 'resize', function() { location.reload(); } );

if( !_globals.touchDevice ) {
	window.addEventListener( "contextmenu", onWindowContextMenu );
}

/*
window.addEventListener( "wheel", function(event) {
	if( event.ctrlKey ) {
		event.preventDefault(); //prevent zoom
	}
});
*/

if( !_globals.touchDevice ) {
	window.addEventListener( 'mouseup', function(e){ onWindowMouseUp(e,_globals); }, true );
} else {
	; // window.addEventListener( 'touchcancel', onWindowMouseUp, true );
	; // window.addEventListener( 'touchend', onWindowMouseUp, true );
}

if( !_globals.touchDevice ) {
	window.addEventListener( 'mousemove', onWindowMouseMove );
} else {
	window.addEventListener( 'touchmove', function(e) { e.preventDefault(); } );
}

function loadData() {
	if( document.location.host ) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		    if ( this.readyState == 4 ) { 
		    	if( this.status == 200 ) {
			    	let errorParsingData = false;
			    	try {
				      setData( JSON.parse(this.responseText) ); // TO UNCOMMENT!!!!
			    	} catch(e) {
			    		console.log('Error: ' + e.name + ":" + e.message + "\n" + e.stack + "\n" + e.cause);
			    		errorParsingData = true;
			    	}
			    	if( errorParsingData ) { // To ensure data are parsed ok... // alert(this.responseText);
						displayMessageBox( _texts[_globals.lang].errorParsingData ); 
						return;
			    }
					// if( 'ontouchstart' in document.documentElement ) { // To find out is it a touch device or not...
					//	_globals.touchDevice = true;
					// }
					hideMessageBox();
					initGlobalsWithDataParameters();

					if( !('activities' in _data) || _data.activities.length == 0 ) {
						displayMessageBox( _texts[_globals.lang].errorParsingData ); 
						return;
					}
					if( initData() == 0 ) {
						if( !('editables' in _data) || _data.editables.length == 0 ) {
								_data.noEditables = true;
						} else {
								_data.noEditables = false;
								createEditBoxInputs();
						}		
						displayData();
						ifSynchronized();
					} else {
						displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
					}                        
				} else {
					displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
				}
		  }
    };
		let requestUrl = _settings.urlData + '?' + _globals.projectId;         
		xmlhttp.open("GET", requestUrl, true);
		xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		xmlhttp.send();
		displayMessageBox( _texts[_globals.lang].waitDataText ); 
	} 
}

function displayData() {	
	displayHeaderAndFooterInfo();	
	drawAll();
}


function initData() {
	_data.project.curTimeInSeconds = _data.project.CurTime;
	_data.project.CurTime = dateIntoSpiderDateString( _data.project.CurTime );
	if( _data.activities.length == 0 ) {
		displayMessageBox( _texts[_globals.lang].errorParsingData );						
		return(-1);				
	}
	if( !('Code' in _data.activities[0]) || !('Level' in _data.activities[0]) ) { 	// 'Code' and 'Level' is a must!!!!
		displayMessageBox( _texts[_globals.lang].errorParsingData );						// Exiting otherwise...
		return(-1);		
    }
    
	if( _data.activities.length > 400 ) {
		_globals.redrawAllMode = true;
	}

	// Retrieving dates of operations, calculating min. and max. dates.
	_data.startMinInSeconds = -1;
	_data.finMaxInSeconds = -1;
	_data.startFinSeconds = -1;
	_data.meta = new Array(_data.activities.length);
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		_data.meta[i] = {};
		let d = _data.activities[i];
		if( typeof(d.AsapStart) !== 'undefined' && d.AsapStart !== null ) {
			d.AsapStartInSeconds = d.AsapStart;
			//d.AsapStart = dateIntoSpiderDateString( d.AsapStartInSeconds );
			_data.startMinInSeconds = reassignBoundaryValue( _data.startMinInSeconds, d.AsapStartInSeconds, false );
		} else {
			d.AsapStartInSeconds = -1;
		}
		if( typeof(d.AsapFin) !== 'undefined' && d.AsapFin !== null) {
			d.AsapFinInSeconds = d.AsapFin;
			//d.AsapFin = dateIntoSpiderDateString( d.AsapFinInSeconds );
			_data.finMaxInSeconds = reassignBoundaryValue( _data.finMaxInSeconds, d.AsapFinInSeconds, true );
		} else {
			d.AsapFinInSeconds = -1;
		}
		if( typeof(d.FactStart) !== 'undefined' && d.FactStart !== null ) {
			d.FactStartInSeconds = d.FactStart;
			//d.FactStart = dateIntoSpiderDateString( d.FactStartInSeconds );
			_data.startMinInSeconds = reassignBoundaryValue( _data.startMinInSeconds, d.FactStartInSeconds, false );
		} else {
			d.FactStartInSeconds = -1;
		}
		if( typeof(d.FactFin) !== 'undefined' && d.FactFin !== null ) {
			d.FactFinInSeconds = d.FactFin;
			//d.FactFin = dateIntoSpiderDateString( d.FactFinInSeconds );
			_data.finMaxInSeconds = reassignBoundaryValue( _data.finMaxInSeconds, d.FactFinInSeconds, true );
		} else {
			d.FactFinInSeconds = -1;
		}
		if( typeof(d.Start_COMP) !== 'undefined' && d.Start_COMP !== null ) {
			d.Start_COMPInSeconds = d.Start_COMP;
			//d.Start_COMP = dateIntoSpiderDateString( d.Start_COMPInSeconds );
			_data.startMinInSeconds = reassignBoundaryValue( _data.startMinInSeconds, d.Start_COMPInSeconds, false );			
		} else {
			d.Start_COMPInSeconds = -1;
		}
		if( typeof(d.Fin_COMP) !== 'undefined' && d.Fin_COMP !== null ) {
			d.Fin_COMPInSeconds = d.Fin_COMP;
			//d.Fin_COMP = dateIntoSpiderDateString( d.Fin_COMPInSeconds );
			_data.finMaxInSeconds = reassignBoundaryValue( _data.finMaxInSeconds, d.Fin_COMPInSeconds, true );			
		} else {
			d.Fin_COMPInSeconds = -1;
		}

		if( typeof(d.AlapStart) !== 'undefined' && d.AlapStart !== null ) {
			d.AlapStartInSeconds = d.AlapStart;
			//d.AlapStart = dateIntoSpiderDateString( d.AlapStartInSeconds );
			_data.startMinInSeconds = reassignBoundaryValue( _data.startMinInSeconds, d.AlapStartInSeconds, false );			
		} else {
			d.AlapStartInSeconds = -1;
		}
		if( typeof(d.AlapFin) !== 'undefined' && d.AlapFin !== null ) {
			d.AlapFinInSeconds = d.AlapFin;
			//d.AlapFin = dateIntoSpiderDateString( d.AlapFinInSeconds );
			_data.finMaxInSeconds = reassignBoundaryValue( _data.finMaxInSeconds, d.AlapFinInSeconds, true );			
		} else {
			d.AlapFinInSeconds = -1;
		}
		if( typeof(d.f_LastFin) !== 'undefined' && d.f_LastFin !== null ) {
			d.lastFinInSeconds = d.f_LastFin;
		} else {			
			d.lastFinInSeconds = d.AsapStartInSeconds; // To prevent error if for some reason unfinished operation has no valid f_LastFin. 
		}

		// Start and finish
		if( d.FactFin ) {
			d.status = 100; // finished
			d.displayStartInSeconds = d.FactStartInSeconds; 
			d.displayFinInSeconds = d.FactFinInSeconds;
			d.displayRestartInSeconds = null; 
		} else {
			if( !d.FactStart ) { // Has not been started yet
				d.status = 0; // not started 
				d.displayStartInSeconds = d.AsapStartInSeconds; 
				d.displayFinInSeconds = d.AsapFinInSeconds;
				d.displayRestartInSeconds = null;
			} else { // started but not finished
				let divisor = (d.AsapFinInSeconds - d.AsapStartInSeconds) + (d.lastFinInSeconds - d.FactStartInSeconds); 
				if( divisor > 0 ) {
					d.status = parseInt( (d.lastFinInSeconds - d.FactStartInSeconds) * 100.0 / divisor - 1.0); 
				} else {
					d.status = 50;
				}
				d.displayStartInSeconds = d.FactStartInSeconds; 
				d.displayFinInSeconds = d.AsapFinInSeconds;
				d.displayRestartInSeconds = d.AsapStartInSeconds;
			}
		}
		_data.meta[i].color = decColorToString( d.f_ColorCom, _settings.ganttOperation0Color );
		//d.color = decColorToString( d.f_ColorCom, _settings.ganttOperation0Color );
		_data.meta[i].colorBack = decColorToString( d.f_ColorBack, "#ffffff" );
		//d.colorBack = decColorToString( d.f_ColorBack, "#ffffff" );
		_data.meta[i].colorFont = decColorToString( d.f_FontColor, _settings.tableContentStrokeColor );
		//d.colorFont = decColorToString( d.f_FontColor, _settings.tableContentStrokeColor );
		if( !('Level' in d) ) {
				d.Level = null;
		} else if( typeof( d.Level ) === 'string' ) {
			if( digitsOnly(d.Level) ) {
				d.Level = parseInt(d.Level);
			}
		}
	}
	if( _data.startMinInSeconds == -1 || _data.finMaxInSeconds == -1 ) {	// If time limits are not defined... 
		displayMessageBox( _texts[_globals.lang].errorParsingData );				// ...exiting...
		return(-1);
	}

	_data.startFinSeconds = _data.finMaxInSeconds - _data.startMinInSeconds;
	_data.visibleMin = _data.startMinInSeconds; // - (_data.finMaxInSeconds-_data.startMinInSeconds)/20.0;
	_data.visibleMax = _data.finMaxInSeconds; // + (_data.finMaxInSeconds-_data.startMinInSeconds)/20.0;
	_data.visibleMaxWidth = _data.visibleMax - _data.visibleMin;

	// Initializing the parent-children structure and the link structure
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		_data.activities[i].id = 'ganttRect' + i; // Id
		initParents(i);
		_data.meta[i].isPhase = (typeof(_data.activities[i].Level) === 'number') ? true : false;
		_data.meta[i].hasLinks = false;
	}

	// Marking 'expandables'
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		let hasChild = false;
		for( let j = i+1 ; j < _data.activities.length ; j++ ) {
			for( let k = 0 ; k < _data.meta[j].parents.length ; k++ ) {
				if( _data.meta[j].parents[k] == i ) { // If i is a parent of j
					hasChild = true;
					break;
				}
			}
			if( hasChild ) {
				break;
			}
		}
		if( hasChild ) {
			_data.meta[i].expanded = true;
			_data.meta[i].expandable = true;
		} else {
			_data.meta[i].expanded = true;			
			_data.meta[i].expandable = false;
		}
		_data.meta[i].visible = true;
	}

	// Searching for the deepest level... 
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		if( _data.meta[i].parents.length >= _globals.maxExpandableLevel ) {
			_globals.maxExpandableLevel =  _data.meta[i].parents.length + 1;
		}
	}
	_globals.expandInput.value = _globals.maxExpandableLevel; 	// To init the input, that allows futher changing expand level

	let expandTo = (_globals.expandToLevelAtStart !== -1) ? _globals.expandToLevelAtStart : 3;
	if( expandTo > _globals.maxExpandableLevel ) // If an invalid _expandToLevelAtStart was specified
		expandTo = _globals.maxExpandableLevel;
	_globals.expandInput.value = expandTo;  	// Initializing the input
	expandToLevel( expandTo, false ); 	// Expanding...

	// Searching for the linked operations, assigning links with operation indexes and marking the operations to know they are linked...
	for( let l = 0 ; ('links' in _data) && (l < _data.links.length) ; l++ ) {
		let predOp = -1;
		let succOp = -1;
		for( let op = 0 ; op < _data.activities.length ; op++ ) {
			if( predOp == -1 ) { 
				if( _data.activities[op].Code == _data.links[l].PredCode ) { predOp = op; }
			}
			if( succOp == -1 ) {
				if( _data.activities[op].Code == _data.links[l].SuccCode ) { succOp = op; }
			}
			if( predOp != -1 && succOp != -1 ) {
				break;
			}
		}
		if( predOp != -1 && succOp != -1 ) {
			_data.links[l].predOp = predOp;
			_data.links[l].succOp = succOp;
			_data.meta[predOp].hasLinks = true;
			_data.meta[succOp].hasLinks = true;			
		} else {
			_data.links[l].predOp = null;
			_data.links[l].succOp = null;
		}
	}

  initDataHelpers();

	readCustomSettings();

	calcNotHiddenOperationsLength();

	// Initializing zoom
	let newZoom = calculateHorizontalZoomByVerticalZoom( 0, _settings.readableNumberOfOperations );
	_globals.visibleTop = newZoom[0];
	_globals.visibleHeight = newZoom[1];
	_globals.ganttVisibleLeft = newZoom[2];
	_globals.ganttVisibleWidth = newZoom[3];    

	displayYZoomFactor();
	displayXZoomFactor();

	calcTableHeaderOverallWidth();

	return(0);
}

// activities\[([0-9a-zA-Z]+)\]\.parents   meta[$1].parents
function initParents( iOperation ) {
	_data.meta[iOperation].parents = []; // Initializing "parents"
	for( let i = iOperation-1 ; i >= 0 ; i-- ) {
		let l = _data.meta[iOperation].parents.length;
		let currentLevel;
		if( l == 0 ) {
			currentLevel = _data.activities[iOperation].Level;
		} else {
			let lastPushedIndex = _data.meta[iOperation].parents[l-1];
			currentLevel = _data.activities[lastPushedIndex].Level;
		}
		if( currentLevel === null || currentLevel === 'P' ) { // Current level is an operation
			if( typeof(_data.activities[i].Level) === 'number' ) {
				_data.meta[iOperation].parents.push(i);
			}
		} else if( typeof(currentLevel) === 'number' ) { // Current level is a phase
			if( typeof(_data.activities[i].Level) === 'number' ) {
				if( _data.activities[i].Level < currentLevel ) { // _data.activities[iOperation].Level ) {
					_data.meta[iOperation].parents.push(i);
				}
			}
		} else if( typeof(currentLevel) === 'string' ) { // Current level is a team or resourse or a project
			if( _data.activities[i].Level === null ) { // The upper level element is an operation
				_data.meta[iOperation].parents.push(i);
			} else if( currentLevel == 'A' ) {
				if( _data.activities[i].Level === 'T' ) { // The upper level element is a team
					_data.meta[iOperation].parents.push(i);
				}
			}
		}
	}	
}


function initLayout() {
	
	initLayoutCoords();

	_globals.containerDiv.addEventListener( 'selectstart', function(e) { e.preventDefault(); return false; } );
	_globals.containerDiv.addEventListener( 'selectend', function(e) { e.preventDefault(); return false; } );
	
	// To scroll the table vertically - using the same handler as for the gantt chart... 
	addOnMouseWheel( _globals.tableContentSVG, onGanttWheel );

	if( !_globals.touchDevice ) {
		_globals.verticalSplitterSVG.addEventListener( 'mousedown', onVerticalSplitterSVGMouseDown );
		//_globals.verticalSplitterSVG.addEventListener( 'mouseover', function(e) { if(!_globals.verticalSplitterCaptured) setVerticalSplitterWidth(1); } );
		//_globals.verticalSplitterSVG.addEventListener( 'mouseout', function(e) { setVerticalSplitterWidth(-1); } );
	} else {
		_globals.verticalSplitterSVG.addEventListener( 'touchstart', onVerticalSplitterSVGTouchStart, true );
		_globals.verticalSplitterSVG.addEventListener( 'touchmove', onVerticalSplitterSVGTouchMove, true );
		_globals.verticalSplitterSVG.addEventListener( 'touchend', onVerticalSplitterSVGTouchEnd, true );
		_globals.verticalSplitterSVG.addEventListener( 'touchcancel', onVerticalSplitterSVGTouchEnd, true );
	}

	// Gantt chart
	if( !_globals.touchDevice ) {
		_globals.ganttSVG.addEventListener( "mousedown", onGanttMouseDown );
		_globals.ganttSVG.addEventListener( "mousemove", onGanttCapturedMouseMove );
		addOnMouseWheel( _globals.ganttSVG, onGanttWheel );
		_globals.ganttSVG.style.cursor = _settings.ganttSVGCursor;
		//_globals.ganttSVG.addEventListener( "mouseup", onGanttCapturedMouseUp );
		//_globals.ganttSVG.addEventListener( "dblclick", onGanttDblClick );
	} else {
		;//_globals.ganttSVG.addEventListener( "touchstart", onGanttMouseDown );
		;//_globals.ganttSVG.addEventListener( "touchmove", onGanttCapturedMouseMove );
	}

	// Time scale
	if( !_globals.touchDevice ) {
		_globals.timeSVG.addEventListener('mousedown', onGanttMouseDown);
		_globals.timeSVG.addEventListener('mousemove', onGanttCapturedMouseMove);
		addOnMouseWheel( _globals.timeSVG, onTimeWheel );	
		_globals.timeSVG.style.cursor = _settings.timeSVGCursor;
		//_globals.timeSVG.addEventListener( "dblclick", onGanttDblClick );
	} else {
		;//_globals.timeSVG.addEventListener('touchstart', onGanttMouseDown);
		;//_globals.timeSVG.addEventListener('touchmove', onGanttCapturedMouseMove);
	}

	// controls
	if( !_globals.touchDevice ) {
		_globals.zoomHorizontallyInput.addEventListener('input', function() { filterInput(this); } );
		_globals.zoomHorizontallyInput.addEventListener('blur', function(e) { onZoomHorizontallyBlur(this); } );
		_globals.zoomHorizontallyIcon.addEventListener('mousedown', 
			function(e) { onZoomHorizontallyIcon(this, e, _globals.zoomHorizontallyInput); } );
		_globals.zoomHorizontallyMinusIcon.setAttribute( 'style', 'display:none' );
		_globals.zoomHorizontallyPlusIcon.setAttribute( 'style', 'display:none' );
		_globals.zoomVerticallyInput.addEventListener('input', function() { filterInput(this); } );
		_globals.zoomVerticallyInput.addEventListener('blur', function(e) { onZoomVerticallyBlur(this); } );
		_globals.zoomVerticallyIcon.addEventListener('mousedown', 
			function(e) { onZoomVerticallyIcon(this, e, _globals.zoomVerticallyInput); } );
		_globals.zoomVerticallyMinusIcon.setAttribute( 'style', 'display:none' );
		_globals.zoomVerticallyPlusIcon.setAttribute( 'style', 'display:none' );

		_globals.expandIcon.addEventListener('mousedown', function(e) { onExpandIcon(this, e); } );
		_globals.expandMinusIcon.setAttribute( 'style', 'display:none' );
		_globals.expandPlusIcon.setAttribute( 'style', 'display:none' );
		_globals.expandInput.addEventListener('input', function(e) { filterInput(this,'([^0-9]+)',1,100,1); } );
		_globals.expandInput.addEventListener('blur', function(e) { onExpandBlur(); } );
	} else {
		_globals.zoomHorizontallyInput.setAttribute( 'style', 'display:none' );
		_globals.zoomVerticallyInput.setAttribute( 'style', 'display:none' );
		_globals.zoomHorizontallyIcon.setAttribute( 'style', 'display:none' );
		_globals.zoomVerticallyIcon.setAttribute( 'style', 'display:none' );
		_globals.zoomHorizontallyMinusIcon.addEventListener('mousedown', 
			function(e) { onZoomHorizontallyMinusIcon(this, e, _globals.zoomHorizontallyInput); } );
		_globals.zoomHorizontallyPlusIcon.addEventListener('mousedown', 
			function(e) { onZoomHorizontallyPlusIcon(this, e, _globals.zoomHorizontallyInput); } );
		_globals.zoomVerticallyMinusIcon.addEventListener('mousedown', 
			function(e) { onZoomVerticallyMinusIcon(this, e, _globals.zoomVerticallyInput); } );
		_globals.zoomVerticallyPlusIcon.addEventListener('mousedown', 
			function(e) { onZoomVerticallyPlusIcon(this, e, _globals.zoomVerticallyInput); } );

		_globals.expandIcon.setAttribute( 'style', 'display:none' );
		_globals.expandMinusIcon.addEventListener('mousedown', 
			function(e) { onExpandMinusIcon(this, e); } );
		_globals.expandPlusIcon.addEventListener('mousedown', 
			function(e) { onExpandPlusIcon(this, e); } );
	}

	_globals.expandAllIcon.addEventListener('mousedown', function(e) { _globals.expandInput.value=_globals.maxExpandableLevel; onExpandBlur(this); } );

	createDefs( _globals.containerSVG );

	return true;
}


function displayHeaderAndFooterInfo() {
	if( typeof(_data) === 'undefined' || !('project' in _data) )
		return;
	document.title = _data.project.Name;
	let projectName = document.getElementById('projectName');
	projectName.innerText = _data.project.Name + " (" + _data.project.Code + ")";
	let elProjectAndTimeVersion = document.getElementById('projectTimeAndVersion');
	
	let uploadTime = '';
	if( 'UploadTime' in _data.project ) {
		let uploadTime = dateIntoSpiderDateString( _data.parameters.uploadTime );
		uploadTime = " / " + _texts[_globals.lang].uploadTime + ": " + uploadTime;
	}
	if( !_globals.touchDevice ) {
		let timeAndVersion = _data.project.CurTime + uploadTime + " | " + _texts[_globals.lang].version + ": " + _data.project.Version;
		elProjectAndTimeVersion.innerText = timeAndVersion;
	} else {
		projectName.setAttribute('style','font-size:18px;');
		elProjectAndTimeVersion.setAttribute('style','display:none');
	}
    initMenu();

	_globals.resetTableDimensionsDiv.title = _texts[_globals.lang].resetTableDimensionsTitle;
	_globals.resetTableDimensionsDiv.onclick = restoreExportedSettings;
	_globals.resetTableDimensionsIcon.setAttribute('src',_icons.exportSettings);
	_globals.zoom100Div.title = _texts[_globals.lang].zoom100Title;
	_globals.zoom100Div.onclick = function(e) { zoom100(e); };
	_globals.zoom100Icon.setAttribute('src',_icons.zoom100);
	_globals.zoomReadableDiv.title = _texts[_globals.lang].zoomReadableTitle;
	_globals.zoomReadableDiv.onclick = function(e) { zoomReadable(e); };
	_globals.zoomReadableIcon.setAttribute('src',_icons.zoomReadable);

	_globals.zoomVerticallyDiv.title = _texts[_globals.lang].zoomVerticallyTitle;
	_globals.zoomVerticallyIcon.setAttribute('src',_icons.zoomVertically);
	_globals.zoomVerticallyPlusIcon.setAttribute('src',_icons.zoomVerticallyPlus);
	_globals.zoomVerticallyMinusIcon.setAttribute('src',_icons.zoomVerticallyMinus);

	_globals.zoomHorizontallyDiv.title = _texts[_globals.lang].zoomHorizontallyTitle;
	_globals.zoomHorizontallyIcon.setAttribute('src',_icons.zoomHorizontally);
	_globals.zoomHorizontallyPlusIcon.setAttribute('src',_icons.zoomHorizontallyPlus);
	_globals.zoomHorizontallyMinusIcon.setAttribute('src',_icons.zoomHorizontallyMinus);

	_globals.expandAllIcon.title = _texts[_globals.lang].expandAllIconTitle;
	_globals.expandAllIcon.setAttribute('src',_icons.expandAll);
	_globals.expandDiv.title = _texts[_globals.lang].expandTitle;
	_globals.expandIcon.setAttribute('src',_icons.expand);
	_globals.expandPlusIcon.setAttribute('src',_icons.expandPlus);
	_globals.expandMinusIcon.setAttribute('src',_icons.expandMinus);

	_globals.newProjectDiv.title = _texts[_globals.lang].titleNewProject;	
	_globals.newProjectDiv.onclick = newProject;	
	_globals.newProjectIcon.setAttribute('src',_icons.newProject);

	// Displaying links status (ON or OFF)
	let displayLinks;
	let displayLinksCookie = getCookie( 'displayLinks', 'int' );
	if( displayLinksCookie === null ) {
		displayLinks = true;
	} else if( displayLinksCookie == 1 ) {
		displayLinks = true;
	} else {
		displayLinks = false;		
	}
	displayLinksStatus(displayLinks); 			// Initializing display/hide links tool
}


function reassignBoundaryValue( knownBoundary, newBoundary, upperBoundary ) {
	if( knownBoundary == -1 ) {
		return newBoundary;
	} 
	if( newBoundary == -1 ) {
		return knownBoundary;
	}
	if( !upperBoundary ) { // Min.
		if( newBoundary < knownBoundary ) {
			return newBoundary;			
		} 
	} else { // Max.
		if( newBoundary > knownBoundary ) {
			return newBoundary;			
		} 		
	}
	return knownBoundary;
}


function addOnMouseWheel(elem, handler) {
	if (elem.addEventListener) {
		if ('onwheel' in document) {           // IE9+, FF17+
			elem.addEventListener("wheel", handler);
		} else if ('onmousewheel' in document) {           //
			elem.addEventListener("mousewheel", handler);
		} else {          // 3.5 <= Firefox < 17
			elem.addEventListener("MozMousePixelScroll", handler);
		}
	} else { // IE8-
		elem.attachEvent("onmousewheel", handler);
	}
}

function newProject() {
	let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
    	let namevalue = cookies[i].split('=');
    	if( namevalue ) {
	    	if( namevalue.length == 2 ) {
	    		let cname = trimString(namevalue[0]);
		    	if( cname.length > 0 ) {
		    		//if( cname.indexOf('verticalSplitterPosition') == 0 ) { // Skipping vertical splitter position for it is a browser setting only
		    		//	continue;
		    		//}
			    	deleteCookie( cname );	    			
	    		}
	    	}
    	}
    }
	location.reload();
}


function restoreExportedSettings() {
	_globals.visibleTop = 0;
	_globals.visibleHeight = _settings.readableNumberOfOperations;
	setCookie('ganttVisibleTop', 0);
	setCookie('ganttVisibleHeight', _settings.readableNumberOfOperations);

	for( let cookie = 0 ; cookie < _data.table.length ; cookie++ ) {
		let cname = _data.table[cookie].ref+"Position";
		if( getCookie(cname) != null ) {
			deleteCookie( cname );
		}
		cname = _data.table[cookie].ref+"Width";
		deleteCookie( cname );
	}
	window.location.reload();
}


function onWindowLoad() {
	initLayout();
	loadData();
}


function onWindowContextMenu(e) { 
	e.preventDefault(); 
	return(false); 
}
