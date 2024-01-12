import { _globals } from './globals.js'
import { _settings } from './settings.js'
import { _texts } from './texts.js'
import { printSVG } from './print.js'

let _dbox = null;
let _tbox = null;

export function initMenu() {
	let el;
	el = document.getElementById('dropdownButton');
	el.onclick = function(e) { onDropdownButtonClick(); }
	el = document.getElementById('toolboxButton');
	el.onclick = function(e) { onToolboxButtonClick(); }

	el = document.getElementById('menuGantt');
	el.onclick = function(e) { menuOptionChosen("g"); };
	el = document.getElementById('menuHelp');
	el.onclick = function(e) { menuOptionChosen("h"); };
	el = document.getElementById('menuPrint');
	el.onclick = function(e) { menuOptionChosen('p'); };
	el = document.getElementById('menuCloseProject');
	el.onclick = function(e) { menuOptionChosen('с'); };
	//el = document.getElementById('menuUser');
	//el.onclick = function(e) { logout(); };

	el = document.getElementById('dropdownContent');
	/*
	el.addEventListener('mouseover', 
		function(e) { 
				if( !_dbox ) { 
						_dbox = this.getBoundingClientRect();
				}
		}, true);
	el.addEventListener('mouseout', 
		function(e) { 
				if( _dbox ) {
						if( e.x < _dbox.x || e.x >= _dbox.x+_dbox.width-1 || e.y < _dbox.y || e.y >= _dbox.y+_dbox.height-1 ) {
								hideContent('dropdownContent'); 
								_dbox = null; 
						}
				} 
		}, false );
	*/
	
	el = document.getElementById('toolboxButton');
	/*
	el = document.getElementById('toolboxContent');
	el.addEventListener('mouseover', 
		function(e) { 
				if( !_tbox ) { 
						_tbox = this.getBoundingClientRect();
				}
		}, true);
	el.addEventListener('mouseout', 
		function(e) { 
				if( _tbox ) {
						if( e.x < _tbox.x || e.x >= _tbox.x+_tbox.width-1 || e.y < _tbox.y || e.y >= _tbox.y+_tbox.height-1 ) {
								hideContent('toolboxContent'); 
								_tbox = null; 
						}
				} 
		}, false );
	*/
	el = document.getElementById('menuUserName');
  el.innerHTML = _globals.user;
  //el.innerHTML = `${_texts[_globals.lang].menuLogout} (${_globals.user})`;
	//el = document.getElementById('menuUserLogout');
  //el.innerHTML = '[&rarr;]'; // ➜ ➡ ➝ ➲ ➠ ➞ ➩ ➯ →
	//el.onclick = logout;
    
  document.getElementById('helpTitle').innerText = _texts[_globals.lang].helpTitle; // Initializing help text	
	document.getElementById('helpText').innerHTML = _texts[_globals.lang].helpText; // Initializing help text	
	
	document.getElementById('menuGanttTitle').innerText = _texts[_globals.lang].menuGanttTitle;
	document.getElementById('menuHelpTitle').innerText = _texts[_globals.lang].menuHelpTitle;
	document.getElementById('menuPrintTitle').innerText = _texts[_globals.lang].menuPrintTitle;
	document.getElementById('menuExitTitle').innerText = _texts[_globals.lang].menuExitTitle;
}

function onDropdownButtonClick() {
	hideContent('toolboxContent');

	let el=document.getElementById('dropdownContent'); 
	el.style.display=(el.style.display==='block')?'none':'block';
}

function onToolboxButtonClick() 
{
	hideContent('dropdownContent');
	let el=document.getElementById('toolboxContent'); 
	el.style.display=(el.style.display==='block')?'none':'block';       

	let pageGantt = document.getElementById('pageGantt');
	if( pageGantt.style.display === 'none' ) {
		pageGantt.style.display = 'block';
		let pageHelp = document.getElementById('pageHelp');
		pageHelp.style.display = 'none';    
	}
}

function menuOptionChosen( option ) {    
	document.getElementById('dropdownContent').style.display='none';
	let pageGantt = document.getElementById('pageGantt');
	let pageHelp = document.getElementById('pageHelp');
	if( option === 'g' ) {
		pageGantt.style.display = 'block';
		pageHelp.style.display = 'none';
	} else if( option === 'h' ) {
		pageGantt.style.display = 'none';
		pageHelp.style.display = 'block';
	} else if( option === 'p' ) {
		printSVG();        
	} else {
		closeProject();
	}
}

function showContent( id ) {
	let el = document.getElementById(id);
	if( !el ) {
			return;
	} 
	if( el.style.display !== 'none' ) {
			el.style.display = 'none';
	} else {
		el.style.display = 'block';
	}
}


function hideContent( id ) {
	let el = document.getElementById(id);
	if( !el ) {
			return;
	} 
	if( el.style.display !== 'none' ) {
			el.style.display = 'none';
	}
}


function closeProject() 
{
	if( document.location.host ) 
	{
		let xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() 
		{
			if (this.readyState == 4 ) {
				window.close();
			}
		};
		xmlhttp.open("GET", _settings.urlCloseProject + "?" + _globals.projectId, true);
		xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		xmlhttp.send();
	} 
}


function logout() 
{
	if( document.location.host ) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		    if (this.readyState == 4 ) {
		    	if( this.status == 401 ) {
		    		window.location.replace('http://www.spiderproject.com/');
				}
		    }
		};
		xmlhttp.open("GET", _settings.urlLogout, true);
		xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		xmlhttp.send();
	} 
}
