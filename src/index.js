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
window.addEventListener( "resize", onWindowResize );

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
                // A debug code!
                /*
                let t = "{ \"project\": { \"Code\":\"sp\", \"Name\":\"Приобретение программы\",\"Version\":\"1\",\"CurTime\":1169010000,\"Notes\":\"Тестовый проект\" },\"parameters\": { \"language\":\"ru\", \"dateFormat\":\"\", \"dateDelim\":\".\", \"timeDelim\":\":\", \"secondsInPixel\":30000, \"expandToLevelAtStart\":3, \"uploadTime\":1603123121 },\"activities\": [{\"Level\":1,\"Code\":\"main\",\"N\":\"65408\",\"Name\":\"Приобретение программы\",\"Person\":null,\"Notes\":null,\"Start\":1168318800,\"AsapStart\":1169010000,\"AsapFin\":1176103800,\"FactStart\":1168318800,\"FactFin\":null,\"f_FontColor\":null,\"f_LastFin\":1168952400,\"f_ColorCom\":\"11534336\",\"f_ColorBack\":\"13233656\"},{\"Level\":2,\"Code\":\"Груша\",\"N\":\"65408\",\"Name\":\"Требования и рынок\",\"Person\":\"ivanov, petrov\",\"Notes\":null,\"Start\":1168318800,\"AsapStart\":1169010000,\"AsapFin\":1173801600,\"FactStart\":1168318800,\"FactFin\":null,\"f_FontColor\":\"255\",\"f_LastFin\":1168952400,\"f_ColorCom\":\"53760\",\"f_ColorBack\":\"13434828\"}],\"table\": [{\"name\":\"Уровень\",\"ref\":\"Level\",\"visible\":true,\"width\":2,\"type\":\"int\", \"format\":0},{\"name\":\"Код\",\"ref\":\"Code\",\"visible\":true,\"width\":17,\"type\":\"string\", \"format\":2},{\"name\":\"Пользовательское поле N\",\"ref\":\"N\",\"visible\":true,\"width\":17,\"type\":\"signal\", \"format\":1},{\"name\":\"Название\",\"ref\":\"Name\",\"visible\":true,\"width\":40,\"type\":\"string\", \"format\":0}, {\"name\":\"Менеджер\",\"ref\":\"Person\",\"visible\":true,\"width\":17,\"type\":\"string\", \"format\":0},{\"name\":\"Комментарии\",\"ref\":\"Notes\",\"visible\":true,\"width\":17,\"type\":\"text\", \"format\":0, \"editable\":true},{\"name\":\"Начало\",\"ref\":\"Start\",\"visible\":true,\"width\":17,\"type\":\"datetime\", \"format\":1}],\"links\": [ {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spamrd04\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd02\",\"SuccCode\":\"spamrd04\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd04\",\"SuccCode\":\"spammr03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa03\",\"SuccCode\":\"spscsa04\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa04\",\"SuccCode\":\"spscic01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa04\",\"SuccCode\":\"spscic02\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscnc01\",\"SuccCode\":\"spscnc02\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscnc02\",\"SuccCode\":\"spscnc03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spammr03\",\"SuccCode\":\"spscsa01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa01\",\"SuccCode\":\"spscsa02\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa01\",\"SuccCode\":\"spscsa03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscic02\",\"SuccCode\":\"spscnc01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscic01\",\"SuccCode\":\"spscnc01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd03\",\"SuccCode\":\"spamrd04\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spamrd03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd02\",\"SuccCode\":\"spamrd03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spammr01\",\"SuccCode\":\"spammr02\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spammr02\",\"SuccCode\":\"spammr03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa02\",\"SuccCode\":\"spscsa05\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscsa05\",\"SuccCode\":\"spscsa04\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"ww\",\"TypeSF2\":\"SS\"}, {\"PredCode\":\"spammr03\",\"SuccCode\":\"ww\",\"TypeSF2\":\"FF\"}, {\"PredCode\":\"spscsa01\",\"SuccCode\":\"spsc01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spscnc03\",\"SuccCode\":\"spsc01\",\"TypeSF2\":\"FF\"}, {\"PredCode\":\"spamrd02\",\"SuccCode\":\"ww\",\"TypeSF2\":\"SS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spscnc03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd02\",\"SuccCode\":\"spscnc03\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spammr01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spammr01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spammr01\",\"TypeSF2\":\"FF\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"spammr01\",\"TypeSF2\":\"FS\"}, {\"PredCode\":\"spamrd01\",\"SuccCode\":\"03\",\"TypeSF2\":\"SS\"}, {\"PredCode\":\"spammr03\",\"SuccCode\":\"03\",\"TypeSF2\":\"FF\"}, {\"PredCode\":\"spamrd02\",\"SuccCode\":\"03\",\"TypeSF2\":\"SS\"}],\"lang\":\"ru\"}";
                setData( JSON.parse(t) );
                hideMessageBox();
                initGlobalsWithDataParameters();
                if( initData() == 0 ) {
                    if( !('editables' in _data) || _data.editables.length == 0 ) {
                        _data.noEditables = true;
                    } else {
                        _data.noEditables = false;
                        createEditBoxInputs();
                    }		
                    displayData();
                }
                */
		    	if( this.status == 200 ) {
			    	let errorParsingData = false;
			    	try{
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
                    } else {
                        displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
                    }                        
				} else {
					displayMessageBox( _texts[_globals.lang].errorLoadingData ); 
				}
		    }
        };
		let requestUrl = _settings.urlData + window.location.search;         
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

    initDataHelpers();

	// Retrieving dates of operations, calculating min. and max. dates.
	_data.startMinInSeconds = -1;
	_data.finMaxInSeconds = -1;
	_data.startFinSeconds = -1

	for( let i = 0 ; i < _data.activities.length ; i++ ) {
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
		d.color = decColorToString( d.f_ColorCom, _settings.ganttOperation0Color );
		d.colorBack = decColorToString( d.f_ColorBack, "#ffffff" );
		d.colorFont = decColorToString( d.f_FontColor, _settings.tableContentStrokeColor );
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
		_data.activities[i]._isPhase = (typeof(_data.activities[i].Level) === 'number') ? true : false;
		_data.activities[i].hasLinks = false;
	}

	// Marking 'expandables'
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		let hasChild = false;
		for( let j = i+1 ; j < _data.activities.length ; j++ ) {
			for( let k = 0 ; k < _data.activities[j].parents.length ; k++ ) {
				if( _data.activities[j].parents[k] == i ) { // If i is a parent of j
					hasChild = true;
					break;
				}
			}
			if( hasChild ) {
				break;
			}
		}
		if( hasChild ) {
			_data.activities[i].expanded = true;
			_data.activities[i].expandable = true;
		} else {
			_data.activities[i].expanded = true;			
			_data.activities[i].expandable = false;
		}
		_data.activities[i].visible = true;
	}

	// Searching for the deepest level... 
	for( let i = 0 ; i < _data.activities.length ; i++ ) {
		if( _data.activities[i].parents.length >= _globals.maxExpandableLevel ) {
			_globals.maxExpandableLevel =  _data.activities[i].parents.length + 1;
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
			_data.activities[predOp].hasLinks = true;
			_data.activities[succOp].hasLinks = true;			
		} else {
			_data.links[l].predOp = null;
			_data.links[l].succOp = null;
		}

	}

	// Handling table columns widths
	for( let col = 0 ; col < _data.table.length ; col++ ) { // Recalculating widths in symbols into widths in points 
        let add = _settings.tableColumnHMargin*2 + _settings.tableColumnTextMargin*2;
        let isWid = ('widthsym' in _data.table[col] && _data.table[col].widthsym !== null );
		_data.table[col].width = (isWid) ? (_data.table[col].widthsym * _settings.tableMaxFontSize*0.5 + add) : 5;
	}
	_data.initialTable = []; // Saving table settings loaded from a local version of Spider Project
	copyArrayOfObjects( _data.table, _data.initialTable );

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


function initParents( iOperation ) {
	_data.activities[iOperation].parents = []; // Initializing "parents"
	for( let i = iOperation-1 ; i >= 0 ; i-- ) {
		let l = _data.activities[iOperation].parents.length;
		let currentLevel;
		if( l == 0 ) {
			currentLevel = _data.activities[iOperation].Level;
		} else {
			let lastPushedIndex = _data.activities[iOperation].parents[l-1];
			currentLevel = _data.activities[lastPushedIndex].Level;
		}
		if( currentLevel === null || currentLevel === 'P' ) { // Current level is an operation
			if( typeof(_data.activities[i].Level) === 'number' ) {
				_data.activities[iOperation].parents.push(i);
			}
		} else if( typeof(currentLevel) === 'number' ) { // Current level is a phase
			if( typeof(_data.activities[i].Level) === 'number' ) {
				if( _data.activities[i].Level < currentLevel ) { // _data.activities[iOperation].Level ) {
					_data.activities[iOperation].parents.push(i);
				}
			}
		} else if( typeof(currentLevel) === 'string' ) { // Current level is a team or resourse or a project
			if( _data.activities[i].Level === null ) { // The upper level element is an operation
				_data.activities[iOperation].parents.push(i);
			} else if( currentLevel == 'A' ) {
				if( _data.activities[i].Level === 'T' ) { // The upper level element is a team
					_data.activities[iOperation].parents.push(i);
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

	document.getElementById('toolboxResetTableDimensionsDiv').title = _texts[_globals.lang].resetTableDimensionsTitle;
	document.getElementById('toolboxResetTableDimensionsDiv').onlick = restoreExportedSettings;
	document.getElementById('toolboxResetTableDimensionsIcon').setAttribute('src',_icons.exportSettings);
	document.getElementById('toolboxZoom100Div').title = _texts[_globals.lang].zoom100Title;
	document.getElementById('toolboxZoom100Div').onclick = function(e) { zoom100(e); };
	document.getElementById('toolboxZoom100Icon').setAttribute('src',_icons.zoom100);
	document.getElementById('toolboxZoomReadableDiv').title = _texts[_globals.lang].zoomReadableTitle;
	document.getElementById('toolboxZoomReadableDiv').onclick = function(e) { zoomReadable(e); };
	document.getElementById('toolboxZoomReadableIcon').setAttribute('src',_icons.zoomReadable);

	document.getElementById('toolboxZoomVerticallyDiv').title = _texts[_globals.lang].zoomVerticallyTitle;
	document.getElementById('toolboxZoomVerticallyIcon').setAttribute('src',_icons.zoomVertically);
	document.getElementById('toolboxZoomVerticallyPlusIcon').setAttribute('src',_icons.zoomVerticallyPlus);
	document.getElementById('toolboxZoomVerticallyMinusIcon').setAttribute('src',_icons.zoomVerticallyMinus);

	document.getElementById('toolboxZoomHorizontallyDiv').title = _texts[_globals.lang].zoomHorizontallyTitle;
	document.getElementById('toolboxZoomHorizontallyIcon').setAttribute('src',_icons.zoomHorizontally);
	document.getElementById('toolboxZoomHorizontallyPlusIcon').setAttribute('src',_icons.zoomHorizontallyPlus);
	document.getElementById('toolboxZoomHorizontallyMinusIcon').setAttribute('src',_icons.zoomHorizontallyMinus);

	document.getElementById('toolboxExpandAllIcon').title = _texts[_globals.lang].expandAllIconTitle;
	document.getElementById('toolboxExpandAllIcon').setAttribute('src',_icons.expandAll);
	document.getElementById('toolboxExpandDiv').title = _texts[_globals.lang].expandTitle;
	document.getElementById('toolboxExpandIcon').setAttribute('src',_icons.expand);
	document.getElementById('toolboxExpandPlusIcon').setAttribute('src',_icons.expandPlus);
	document.getElementById('toolboxExpandMinusIcon').setAttribute('src',_icons.expandMinus);

	document.getElementById('toolboxNewProjectDiv').title = _texts[_globals.lang].titleNewProject;	
	document.getElementById('toolboxNewProjectDiv').onclick = newProject;	
	document.getElementById('toolboxNewProjectIcon').setAttribute('src',_icons.newProject);

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
		    		if( cname.indexOf('verticalSplitterPosition') == 0 ) { // Skipping vertical splitter position for it iss a browser setting only
		    			continue;
		    		}
			    	deleteCookie( cname );	    			
	    		}
	    	}
    	}
    }
	location.reload();
}


function resetCookies() {

	deleteCookie('ganttVisibleTop');
	deleteCookie('ganttVisibleHeight');

	for( let cookie = 0 ; cookie < 100000 ; cookie++ ) {
		let cname = _data.table[cookie].ref+"Position";
		if( getCookie(cname) != null ) {
			deleteCookie( cname );
		} else {
			break;
		}
	}
	deleteCookie('ganttVisibleWidth'); 	// Saving new values in cookies...
	deleteCookie('ganttVisibleLeft'); 		// 
}


function restoreExportedSettings(redraw=true) {
	_globals.visibleTop = 0;
	_globals.visibleHeight = _settings.readableNumberOfOperations;
	setCookie('ganttVisibleTop', 0);
	setCookie('ganttVisibleHeight', _settings.readableNumberOfOperations);

	copyArrayOfObjects( _data.initialTable, _data.table );
	for( let cookie = 0 ; cookie < _data.table.length ; cookie++ ) {
		let cname = _data.table[cookie].ref+"Position";
		if( getCookie(cname) != null ) {
			deleteCookie( cname );
		}
		cname = _data.table[cookie].ref+"Width";
		setCookie( cname, _data.table[cookie].width );
	}
	if( redraw ) {
		drawTableHeader(true);
		drawTableContent(true);
		drawTableScroll();
		drawVerticalScroll();		
	}
	let gvw = _globals.secondsInPixel * _globals.ganttSVGWidth; 		// Calculating gantt width out of scale
	if( gvw > 60*60 && !(gvw > _data.visibleMaxWidth) ) {
		_globals.ganttVisibleWidth = gvw;
	} else {
		_globals.ganttVisibleWidth = _data.visibleMaxWidth;
	}
	_globals.ganttVisibleLeft = _data.visibleMin;
	setCookie('ganttVisibleWidth', _globals.ganttVisibleWidth); 	// Saving new values in cookies...
	setCookie('ganttVisibleLeft', _globals.ganttVisibleLeft); 		// 
	if( redraw ) {
		drawGantt();
		drawTimeScale();
		drawGanttHScroll();			
	}
}


function onWindowLoad() {
	initLayout();
	loadData();
}

function onWindowResize(e) { 
	initLayoutCoords(); 
	displayData(); 
}


function onWindowContextMenu(e) { 
	e.preventDefault(); 
	return(false); 
}
