import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { initLayoutCoords, drawVerticalSplitter } from './helpers.js';
import { drawTableHeader, drawTableContent, drawTableScroll, calcTableHeaderOverallWidth } from './drawtable.js';
import { drawGantt, drawGanttHScroll, drawVerticalScroll } from './drawgantt.js';
import { drawTimeScale } from './drawtimescale.js';

export function printSVG() {
	let header = document.getElementById('header');
	let headerDisplayStyle = header.style.display;
	header.style.display = 'none';

	let toolbox = document.getElementById('toolbox');
	let toolboxDisplayStyle = toolbox.style.display;
	toolbox.style.display = 'none';

	let headerHeight = _globals.htmlStyles.getPropertyValue('--header-height');
	//let toolboxTableHeight = _globals.htmlStyles.getPropertyValue('--toolbox-table-height');

	document.documentElement.style.setProperty('--header-height', '2px');
	//document.documentElement.style.setProperty('--toolbox-table-height', '2px');

	let scrollThick = _settings.scrollThick;
	let verticalScrollThick = _settings.verticalScrollThick;
	let verticalSplitterWidth = _settings.verticalSplitterWidth;
	_settings.scrollThick = 0;
	_settings.verticalSplitterWidth = 0;
	_globals.tableScrollSVG.setAttributeNS( null, 'height', 0 );
	_globals.ganttHScrollSVG.setAttributeNS( null, 'height', 0 );
	_globals.verticalScrollSVG.setAttributeNS( null, 'width', 0 );
	_globals.verticalSplitterSVG.setAttributeNS( null, 'width', 0 );

	initLayoutCoords();
    drawTableHeader();
    drawTableContent();
    drawGantt();
    drawTimeScale();
	drawVerticalSplitter(true);

	window.print(); 

	_settings.scrollThick = scrollThick;
	_settings.verticalScrollThick = verticalScrollThick;
	_settings.verticalSplitterWidth = verticalSplitterWidth;
	_globals.tableScrollSVG.setAttributeNS( null, 'height', scrollThick );
	_globals.ganttHScrollSVG.setAttributeNS( null, 'height', scrollThick );
	_globals.verticalScrollSVG.setAttributeNS( null, 'width', verticalScrollThick );
	_globals.verticalSplitterSVG.setAttributeNS( null, 'width', verticalSplitterWidth );
	document.documentElement.style.setProperty( '--header-height', headerHeight );
	//document.documentElement.style.setProperty( '--toolbox-table-height', toolboxTableHeight );

	initLayoutCoords();
    drawTableHeader();
    drawTableContent();
    drawGantt();
    drawTimeScale();
	drawVerticalSplitter(true);

	header.style.display = headerDisplayStyle;
	toolbox.style.display = toolboxDisplayStyle;
}
