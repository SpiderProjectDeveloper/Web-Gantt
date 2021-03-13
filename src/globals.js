import { getCookie } from './utils.js';
import { _settings } from './settings.js';

export var _data = null;

export var _globals = { 
	lang: 'en',
	htmlStyles: null, innerWidth: window.innerWidth, innerHeight: window.innerHeight,

	redrawAllMode: false, touchDevice: false, dateDMY: true, dateDelim: '.', timeDelim: ':', 
	expandToLevelAtStart: 3, secondsInPixel: 60*60*24, ganttMTime: -1, displayLinksOn: null, 
	displayLinksDisabled: null, titlesPositioning: 'r', maxExpandableLevel: 1,

	zoomHorizontallyInput: null, zoomHorizontallyIcon: null, zoomHorizontallyMinusIcon: null, zoomHorizontallyPlusIcon: null,
	zoomVerticallyInput: null, zoomVerticallyIcon: null, zoomVerticallyMinusIcon: null, zoomVerticallyPlusIcon: null,
	displayLinksDiv: null, displayLinksIcon: null, 
	titlesPositioningDiv: null, titlesPositioningIcon: null, expandInput: null, expandAllIcon: null, 
	expandIcon: null, expandPlusIcon: null, expandMinusIcon: null, containerDiv: null,
	containerSVG: null, timeSVG: null, ganttSVG: null, tableContentSVG: null,
	tableContentSVGContainer: null, tableHeaderSVG: null, verticalSplitterSVG: null, tableScrollSVG: null,
	ganttHScrollSVG: null, verticalScrollSVG: null,
    containerDivX: null, containerDivY: null, containerDivHeight: null, containerDivWidth: null,
	visibleTop: null, visibleHeight: null, notHiddenOperationsLength: 0,
	ganttSVGWidth: null, ganttSVGHeight: null, ganttVisibleLeft: null, ganttVisibleWidth: null, ganttSVGBkgr: null,
	ganttViewBoxLeft: 0, ganttViewBoxTop: 0,
	timeSVGWidth: null, timeSVGHeight: null, timeSVGBkgr: null,
	tableContentSVGWidth: null, tableContentSVGHeight: null, tableContentSVGBkgr: null,
	tableHeaderSVGWidth: null, tableHeaderSVGHeight: null, tableHeaderSVGBkgr: null,
	tableHeaderOverallWidth: 0, tableViewBoxLeft: 0, tableViewBoxTop: 0,

	ganttCaptured: false, ganttCapturedAtX: 0, ganttLastFoundAtX: 0, ganttCapturedAtY: 0,
	ganttLastFoundAtY: 0, ganttCapturedLeft: 0, ganttCapturedTop: 0,

	verticalSplitterSVGWidth: 0, verticalSplitterSVGHeight: 0, verticalSplitterSVGBkgr: null,
	verticalSplitterCaptured: false, verticalSplitterCapturedAtX: null, verticalSplitterPosition: null,
	tableSplitterCaptured: -1, tableSplitterCapturedAtX: -1,

	timeScaleToGrid: [], 
	tableScrollSVGWidth:0, tableScrollSVGHeight:0, tableScrollCaptured: false,
	tableScrollCapturedAtX: -1, tableScrollXAtCapture: -1, tableScrollSVGSlider: null, tableScrollSVGBkgr: null,
	tableContentFontSize: 12,

	ganttHScrollSVGWidth:0, ganttHScrollSVGHeight: 0, ganttHScrollCaptured: false, ganttHScrollCapturedAtX: -1,
	ganttHScrollXAtCapture: -1, ganttHScrollSVGSlider: null, ganttHScrollSVGBkgr: null,

	verticalScrollSVGWidth:0, verticalScrollSVGHeight:0, 
	verticalScrollCaptured: false, verticalScrollCapturedAtY: -1, verticalScrollYAtCapture: -1,
	verticalScrollSVGSlider: null, verticalScrollSVGBkgr: null,
	verticalScrollSVGWidth: null, verticalScrollSVGHeight: null,
		
    tableHeaderColumnSwapper: null, tableHeaderColumnSwapperCapturedAtX: -1, tableHeaderColumnSwapperOriginalX: -1,

    setVerticalSplitterWidthOp: -1, setVerticalScrollSVGThickOp: -1, 
    setGanttHScrollSVGThickOp: -1, setTableScrollSVGThickOp: -1
};


export function initGlobals( appContainer, user ) {
	_globals.pageGantt = document.getElementById('pageGantt');
	_globals.pageHelp = document.getElementById('pageHelp');

	if( 'ontouchstart' in document.documentElement ) { // To know if it is a touch device or not...
		_globals.touchDevice = true;
		_settings.verticalSplitterWidth = 20; // A "TRY" CODE!!!!
		_settings.scrollThick = 20;
		_settings.verticalScrollThick = 30;
		document.getElementById('menuPrint').setAttribute('style','display:none');
	}

	if( _globals.touchDevice ) {	
		document.documentElement.style.setProperty('--toolbox-table-height', '40px');
	}
	_globals.zoomHorizontallyInput = document.getElementById('toolboxZoomHorizontallyInput');
	_globals.zoomHorizontallyIcon = document.getElementById('toolboxZoomHorizontallyIcon');
	_globals.zoomHorizontallyMinusIcon = document.getElementById('toolboxZoomHorizontallyMinusIcon');
	_globals.zoomHorizontallyPlusIcon = document.getElementById('toolboxZoomHorizontallyPlusIcon');
	_globals.zoomVerticallyInput = document.getElementById('toolboxZoomVerticallyInput'); 
	_globals.zoomVerticallyIcon = document.getElementById('toolboxZoomVerticallyIcon'); 
	_globals.zoomVerticallyPlusIcon = document.getElementById('toolboxZoomVerticallyPlusIcon'); 
	_globals.zoomVerticallyMinusIcon = document.getElementById('toolboxZoomVerticallyMinusIcon'); 
	_globals.displayLinksDiv = document.getElementById('toolboxDisplayLinksDiv'); 
	_globals.displayLinksIcon = document.getElementById('toolboxDisplayLinksIcon'); 
	_globals.titlesPositioningDiv = document.getElementById('toolboxTitlesPositioningDiv'); 
	_globals.titlesPositioningIcon = document.getElementById('toolboxTitlesPositioningIcon'); 
	_globals.expandInput = document.getElementById('toolboxExpandInput');
	_globals.expandAllIcon = document.getElementById('toolboxExpandAllIcon');
	_globals.expandIcon = document.getElementById('toolboxExpandIcon');
	_globals.expandPlusIcon = document.getElementById('toolboxExpandPlusIcon'); 
	_globals.expandMinusIcon = document.getElementById('toolboxExpandMinusIcon'); 

	_globals.containerDiv = document.getElementById("containerDiv");
	_globals.containerSVG = document.getElementById("containerSVG");
	_globals.tableHeaderSVG = document.getElementById('tableHeaderSVG');
	_globals.tableContentSVG = document.getElementById('tableContentSVG');
	_globals.ganttSVG = document.getElementById("ganttSVG");
	_globals.timeSVG = document.getElementById("timeSVG");
	_globals.verticalSplitterSVG = document.getElementById("verticalSplitterSVG");
	_globals.tableScrollSVG = document.getElementById("tableScrollSVG");
	_globals.ganttHScrollSVG = document.getElementById("ganttScrollSVG");
	_globals.verticalScrollSVG = document.getElementById("verticalScrollSVG");

	let value = getCookie( "verticalSplitterPosition", 'float' );
	if( value ) {
		if( value > 0.0 && value < 1.0 ) {
			_settings.verticalSplitterInitialPosition = value;
		}
	}	
	_globals.verticalSplitterPosition = _settings.verticalSplitterInitialPosition;

	_globals.htmlStyles = window.getComputedStyle(document.querySelector("html"));
	
	if( appContainer ) {
		let bbox = appContainer.getBoundingClientRect();
        _globals.innerWidth = Math.floor(bbox.width); // - bbox.x;
		_globals.innerHeight = Math.floor(bbox.height); // - bbox.y;
	} else {
		_globals.innerWidth = window.innerWidth;
		_globals.innerHeight = window.innerHeight;
	}

	// Setting toolbox width and height
	let toolboxContent = document.getElementById('toolboxContent');
	toolboxContent.style.width = Math.floor(4*_globals.innerWidth/5) + 'px';

    if( user === null ) {
		let cookieUser = getCookie( 'user' );
		if( cookieUser !== null ) {
			user = cookieUser;
		}
	}
	if( !user ) { user = 'NoName'; }
	_globals.user = user;
}


export function initGlobalsWithDataParameters() {
    if( 'parameters' in _data ) { 
        if( typeof(_data.parameters.dateDelim) === 'string' ) 
            _globals.dateDelim = _data.parameters.dateDelim;
        if( typeof(_data.parameters.timeDelim) === 'string' )
            _globals.timeDelim = _data.parameters.timeDelim;
        if( typeof(_data.parameters.language) === 'string' )
            _globals.lang = _data.parameters.language;
        if( typeof(_data.parameters.secondsInPixel) === 'string' ) 
            _globals.secondsInPixel = _data.parameters.secondsInPixel;
        if( typeof(_data.parameters.expandToLevelAtStart) === 'string' ) 
            _globals.expandToLevelAtStart = _data.parameters.expandToLevelAtStart;
        if( typeof(_data.parameters.user) === 'string' ) 
            _globals.user = _data.parameters.user;

        let patternMDY = new RegExp( '([mM]+)([dD]+)([yY]+)' ); // Determining date format: DMY or MDY
        if( patternMDY.test(_data.parameters.dateFormat) ) {               
            _globals.dateDMY = false;
        } else {
            _globals.dateDMY = true;
        }
    } 
}


export function setGlobal( key, value ) {
	_globals[key] = value;
}

export function setData( data ) {
	_data = data;
}

