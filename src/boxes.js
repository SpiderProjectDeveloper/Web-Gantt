import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts } from './texts.js';
import { formatTitleTextContent, getFormatForTableCellAndValue } from './helpers.js';
import { dateIntoSpiderDateString, parseDate  } from './utils.js';
import { calendar, calendarIsActive, calendarGetFormat, calendarSetFormat, calendarCancel } from './calendar.js';
import { ifSynchronized } from './synchro.js';

var	_blackOutBoxDiv=null;
var	_messageBoxDiv=null;
var	_messageBoxTextDiv=null;

var	_confirmationBoxDiv=null;
var	_confirmationBoxTextDiv=null;
var _confirmationBoxOk=null;
var _confirmationBoxCancel=null;

var	_editBoxDiv=null;
var	_editBoxDetailsElem=null;
var _editBoxDateFieldCurrentlyBeingEdited=null;


export function displayConfirmationBox( message, okFunction=null ) 
{
	_blackOutBoxDiv = document.getElementById("blackOutBox");
	_confirmationBoxDiv = document.getElementById("confirmationBox");
	_confirmationBoxTextDiv = document.getElementById("confirmationBoxText");
	_confirmationBoxOk = document.getElementById("confirmationBoxOk");
	_confirmationBoxCancel = document.getElementById("confirmationBoxCancel");

	_blackOutBoxDiv.style.display='block';	
	_blackOutBoxDiv.onclick = hideConfirmationBox;
	_confirmationBoxDiv.style.display = 'table';
	_confirmationBoxTextDiv.innerHTML = message;
	if( okFunction === null ) {
		_confirmationBoxCancel.style.visibility = 'hidden';
		_confirmationBoxOk.onclick = hideConfirmationBox;
	} else {
		_confirmationBoxCancel.style.visibility = 'visible';
		_confirmationBoxCancel.onclick = hideConfirmationBox;
		_confirmationBoxOk.onclick = function() { hideConfirmationBox(); okFunction(); };
	}
}

export function hideConfirmationBox() 
{
	_blackOutBoxDiv.style.display='none';	
	_blackOutBoxDiv.onclick = null;
	_confirmationBoxDiv.style.display = 'none';
}

export function displayMessageBox( message ) 
{
	_blackOutBoxDiv = document.getElementById("blackOutBox");
	_messageBoxDiv = document.getElementById("messageBox");
	_messageBoxTextDiv = document.getElementById("messageBoxText");

	_blackOutBoxDiv.style.display='block';	
	_messageBoxDiv.style.display = 'table';
	_messageBoxTextDiv.innerHTML = message;
}

export function hideMessageBox() 
{
	_blackOutBoxDiv.style.display='none';	
	_messageBoxDiv.style.display = 'none';
}


function displayEditBox(focusElem=null) 
{
	_blackOutBoxDiv.style.display='block';	
	_editBoxDiv.style.display = 'table';
	if( focusElem ) { 
		setTimeout(function() { focusElem.focus(); }, 0);
	}
}

function hideEditBox() 
{
	_blackOutBoxDiv.style.display='none';	
	_editBoxDiv.style.display = 'none';
	document.getElementById('editBoxMessage').innerText = '';			
	calendarCancel();
}


export function createEditBoxInputs() 
{
	_blackOutBoxDiv = document.getElementById("blackOutBox");
	_editBoxDiv = document.getElementById('editBox');			
	_editBoxDetailsElem = document.getElementById('editBoxDetails');			

	let container = document.getElementById('editBoxInputs');
	if( !container ) {
		return;
	}
	container.style.height = '100%';
	for( let iE = 0 ; iE < _data.editables.length ; iE++ ) {
		let ref = _data.editables[iE].ref;
		let promptDiv = document.createElement('div');
		promptDiv.id = 'editBoxInputPrompt' + ref;
        promptDiv.innerText = _data.editables[iE].name; // _texts[_lang][ref];
		promptDiv.className = 'edit-box-prompt';

		let input;
		if( _data.editables[iE].type == 'text' ) {
			input = document.createElement('textarea');
			input.rows = 8;
		} else {
			input = document.createElement('input');			
			input.setAttribute('type', 'text');
		}
		input.className = 'edit-box-input';
		input.id = 'editBoxInput' + ref;
		input.onblur = function(e) { // To make sure data entered are valid...
			let v = validateEditField( input, _data.editables[iE].type );
			if( !v.ok ) {
				document.getElementById('editBoxMessage').innerText = v.message;
				setTimeout(function() { input.focus(); }, 0); 
			}
		};

		if( _data.editables[iE].type == 'datetime' ) {
			let calendarContainer = document.createElement('div');
			calendarContainer.style.marginBottom = '4px';
			let callCalendar = document.createElement('div');
			callCalendar.style.float = 'left';
			callCalendar.style.cursor = 'pointer';
			callCalendar.appendChild( document.createTextNode(String.fromCharCode(9783)) );
			callCalendar.onclick = function(e) { callCalendarForEditBox(input, calendarContainer, iE); }
			container.appendChild(callCalendar);
			container.appendChild(promptDiv);
			container.appendChild(input);		
			container.appendChild(calendarContainer);
		} else {
			container.appendChild(promptDiv);
			container.appendChild(input);		
		}
	}

	_editBoxDiv.addEventListener( "keyup", onEditBoxKey );
	window.addEventListener( "keyup", onEditBoxKey );
	document.getElementById( 'editBoxOk').onclick = function(e) { saveUserDataFromEditBox(); };
	document.getElementById( 'editBoxCancel').onclick = function(e) { hideEditBox(); };
}

function onEditBoxKey(event) {
	if( _editBoxDiv.style.display !== 'none' ) {
		event.preventDefault();
		if( event.keyCode == 27 ) {
			hideEditBox();
		}			
	}
}


function callCalendarForEditBox( input, container, indexInEditables ) {
	let d = parseDate( input.value );
	if( d !== null ) {
		_editBoxDateFieldCurrentlyBeingEdited = input;
		setCalendarFormat( _data.editables[indexInEditables].format );	// '1' - date and time, '0' - date only
		calendar( container, updateEditBoxWithCalendarChoice, 20, 20, d.date, _texts[_globals.lang].monthNames );
	}
}

function updateEditBoxWithCalendarChoice(d) {
	if( d !== null ) {
		let flag;
		if( getCalendarFormat() == 0 ) { // Date only
			flag = true;
		} else {
			flag = false;
		}
		_editBoxDateFieldCurrentlyBeingEdited.value = dateIntoSpiderDateString( d, flag );
	}
}


var _editBoxOperationIndex = -1;

// Displaying data related to an operation in the edit box 
export function displayEditBoxWithData( id ) {
	let i = id.getAttributeNS(null, 'data-i');
	_editBoxDetailsElem.innerHTML = formatTitleTextContent(i,true);
	_editBoxOperationIndex = i;
	let focusElem = null;
	for( let iE = 0 ; iE < _data.editables.length ; iE++ ) { // For every editable field...
		let ref = _data.editables[iE].ref;
		let elem = document.getElementById( "editBoxInput" + ref ); // An element to input new value into
		if( elem ) {
			let valueToSet = _data.activities[i][ ref ];
			if( typeof(valueToSet) === 'undefined' || valueToSet === null ) {
				valueToSet = '';
			}			
			elem.value = (_data.editables[iE].type !== 'datetime') ? valueToSet : dateIntoSpiderDateString(valueToSet);
			if( !focusElem ) {
				focusElem = elem;
			}
		}
	}
	displayEditBox( focusElem );
}


function onUserDataSave( xmlhttp, userData, savedFromEditBox = true ) 
{
	if (xmlhttp.readyState == 4 ) {
		if( xmlhttp.status == 200 ) {
			let ok = false;
			let responseObj = null;
			try {
					//console.log(xmlhttp.responseText);
					responseObj = JSON.parse(xmlhttp.responseText);
					if( responseObj !== null ) {
							if( 'errcode' in responseObj ) {
									if( responseObj.errcode === 0 ) {
											ok = true;
									}
							}
					}
			} catch (e) {;}
			if( ok ) {
				let i = (savedFromEditBox) ? _editBoxOperationIndex : _editFieldOperationIndex;
				for( let iE = 0 ; iE < _data.editables.length ; iE++ ) { // For all editable fields in the table...
					let ref = _data.editables[iE].ref;
					if( ref in userData ) {
							_data.activities[i][ ref ] = userData[ref];
							writeValueIntoTable( i, _data.refSettings[ref].column, ref );
					}
				}
				if( 'project' in responseObj && 'dataChanged' in responseObj.project ) {
					ifSynchronized( false, responseObj.project.dataChanged );
				}
				if( savedFromEditBox ) { 
						hideEditBox();
				} else {
						hideEditField();
				}
				document.getElementById('ganttGroupTitle'+i).textContent = formatTitleTextContent(i); 
			} else {
				if( savedFromEditBox ) {
						document.getElementById('editBoxMessage').innerText = _texts[_globals.lang].errorSavingData;
				} else {
						alert( _texts[_globals.lang].errorSavingData ); // this.responseText contains the error message. 
				}
			}
		}
	}
}


function saveUserDataFromEditBox() 
{
	// Validating all the data are entered correctly...
	for( let iE = 0 ; iE < _data.editables.length ; iE++ ) {
		let ref = _data.editables[iE].ref;
		let input = document.getElementById('editBoxInput' + ref);
		let v = validateEditField( input, _data.editables[iE].type );
		if( !v.ok ) {
			document.getElementById('editBoxMessage').innerText = v.message;
			setTimeout( function() { input.focus(); }, 0 ); 
			return; // If invalid data found - nothing happens...
		}
	}

	let bEdited = false; // The following is to confirm something has been edited...
	for( let iE = 0 ; iE < _data.editables.length ; iE++ ) {
		let ref = _data.editables[iE].ref;
		let elem = document.getElementById( 'editBoxInput' + ref );
		if( elem ) {
			let valueToCompare = _data.activities[_editBoxOperationIndex][ref];
			if( elem.value == valueToCompare || (elem.value === '' && valueToCompare === null) ) {
				continue;
			}
			bEdited = true;
			break;
		}
	}		
	if( !bEdited ) {
		hideEditBox();
		return;
	} 
	let data = createUserDataObjectToSendAfterEditing(_editBoxOperationIndex);
	if( !data ) {
    return;
  }

	document.getElementById('editBoxMessage').innerText = _texts[_globals.lang].waitSaveUserDataText; // Displaying the "wait" message. 

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onerror = function(e) { 
		document.getElementById('editBoxMessage').innerText = _texts[_globals.lang].errorSavingData;
	}

	xmlhttp.onreadystatechange = function(v) { 
		if( xmlhttp.readyState == 4 ) {
			if( xmlhttp.status == 200 ) { 
				onUserDataSave( xmlhttp, data.data, true ); 
				return;
			}
			document.getElementById('editBoxMessage').innerText = _texts[_globals.lang].errorSavingData;	
		}
	};

	xmlhttp.open("POST", _settings.urlSaveData, true);
	xmlhttp.setRequestHeader("Cache-Control", "no-cache");
	xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); // xmlhttp.setRequestHeader('Content-type', 'application/json');		
	//console.log( data.json_data );
	xmlhttp.send( data.json_data );
}


function validateEditField( input, type, allowedEmpty=true ) 
{
	let r = { ok:false, message:'ERROR!' };

	let value = input.value;

	if( allowedEmpty ) {
		let pattern = new RegExp("[^ ]");
		if( !pattern.test(value) ) {
			r.ok = true;
			r.message = 'EMPTY';
			return r;
		}
	}

	if( type === 'datetime' ) {
		let pattern = new RegExp("[^ \\:\\.\\-0-9\\\\]");
    	let illegalCharacters = pattern.test(value);
    	if( illegalCharacters ) { 
    		r.message = _texts[_globals.lang].datetimeError;
    		return r;
    	}		
		let d = parseDate(value);
		if( d == null ) {
    		r.message = _texts[_globals.lang].datetimeError;
			return r;
		}
	} else if( type === 'number' ) {
		let pattern = new RegExp("[^ \\.0-9]");
    	let illegalCharacters = pattern.test(value);
    	if( illegalCharacters ) { 
    		r.message = _texts[_globals.lang].floatError;    		
    		return r;
    	}		
    	if( isNaN( parseFloat(value) ) ) {
    		r.message = _texts[_globals.lang].floatError;    		
    		return r;
    	}
	}
	r.ok = true;
	r.message = 'Ok';
	return r;
}

var _editField = null;
var _editFieldInput = null;
var _editFieldOldValue = null;
var _editFieldOperationIndex = -1;
var _editFieldRef = null;
var _editFieldCol = null;
var _editFieldType = null;
var _editFieldCallCalendar = null;
var _editFieldCancel = null;
var _editFieldMessage = '';

export function displayEditField( id ) 
{
	_blackOutBoxDiv.style.display='block';	

	let i = id.getAttributeNS(null, 'data-i'); //var elements = document.querySelectorAll("[data-i='1'][data-col='1']");
	let col = id.getAttributeNS(null,'data-col');
	let ref = _data.table[col].ref;
	_editFieldType = id.getAttributeNS(null,'data-type');
	let value = _data.activities[i][ ref ];
	if( typeof(value) === 'undefined' || value === null ) {
		value = '';
	}
	id = document.getElementById('tableColumn'+col+'Row'+i+'Bkgr');
	let box = id.getBoundingClientRect();
	
	_editField = document.getElementById('editField');
	_editFieldCallCalendar = document.getElementById('editFieldCallCalendar');
    _editFieldCancel = document.getElementById('editFieldCancel');
	_editFieldMessage = document.getElementById('editFieldMessage');
	if( _editFieldType === 'text' || true ) {
		_editFieldInput = document.getElementById('editFieldTextarea');
	} else {
		_editFieldInput = document.getElementById('editFieldInput');
		if( _editFieldType === 'number' ) {
			_editFieldInput.setAttribute('type', 'number');
		} else {
			_editFieldInput.setAttribute('type', 'text');			
		}
	}
	_editFieldInput.style.display = 'block';

	_editField.style.left = parseInt(box.x) + "px";
	_editField.style.top = parseInt(box.y) + "px";
	_editField.style.width = parseInt(box.width) + "px";
	_editField.style.height = parseInt(box.height) + "px";
	_editField.style.display = 'block';

	if( _editFieldType === 'datetime' ) {
		_editFieldInput.value = dateIntoSpiderDateString(value);
	} else {
		_editFieldInput.value = value;
	}
	_editFieldInput.style.width = '100%';
	_editFieldInput.style.fontSize = _globals.tableContentFontSize + 'px';

	_editFieldOldValue = value; // Saving an old value to confirm it has been changed or to restore if required.
	_editFieldOperationIndex = i;
	_editFieldRef = ref;
	_editFieldCol = col;
	setTimeout(function() { _editFieldInput.focus(); }, 0);

	_editFieldInput.addEventListener( "keydown", onEditTableFieldKey );
	window.addEventListener( "keydown", onEditTableFieldKey );

	_blackOutBoxDiv.addEventListener('click', onEditFieldInputOk); // On click saving changes.. 

	//document.getElementById('editFieldOk').onclick = onEditFieldInputOk; // Cancel button hides  edit field 
	_editFieldCancel.onclick = hideEditField; // Cancel button hides  edit field 
	if( _editFieldType === 'datetime')  {
		_editFieldCallCalendar.style.display = 'block';
		_editFieldCallCalendar.onclick = function(e) { callCalendarForEditField(_editFieldInput); }
		setCalendarFormat(_data.table[col].format);
	} else {
		_editFieldCallCalendar.style.display = 'none';		
	}
}

function setCalendarFormat( format ) 
{
	if( !( format > 0) ) { // For dates the "format" specifies if time required (1) or not (0) 
		calendarSetFormat( {'dateOnly':true} );
	} else {
		calendarSetFormat( {'dateOnly':false} );				
	}			
}

function getCalendarFormat() 
{
	let format = calendarGetFormat(); 
	if( 'dateOnly' in format ) { 	// Should not happen, but...
		return 1;
	}
	return (!format.dateOnly) ? 1 : 0; 	// 1 - date and time, 0 - date only
}


function callCalendarForEditField( input ) 
{
	if( calendarIsActive() ) {
		return;
	}
	let d = parseDate( input.value );
	if( d !== null ) {
		calendar( _editField, updateEditFieldWithCalendarChoice, 20, 20, d.date, _texts[_globals.lang].monthNames );
	}
}


function updateEditFieldWithCalendarChoice( d ) 
{
	if( d !== null ) {
		let flag = ( !(_data.table[_editFieldCol].format > 0) ) ? true : false;
		_editFieldInput.value = dateIntoSpiderDateString( d, flag );
		onEditFieldInputOk();
	} else {
		hideEditField();
	}
}


function onEditTableFieldKey(event) 
{
	if( event.keyCode == 13 && !event.shiftKey ) { // && _editFieldType != 'text' ) {
		event.preventDefault();
		onEditFieldInputOk();
		return false;
	}
	if( event.keyCode == 27 ) {
		event.preventDefault();
		hideEditField();
	}	
}


function onEditFieldInputOk() 
{
	if( !_editFieldInput.value && !_editFieldOldValue ) { // Nothing has been changed...
		hideEditField();
		return;
	}
	let comparedOk = false;
	if( _editFieldType === 'datetime' ) {
    let d = parseDate( _editFieldInput.value );
		comparedOk = (d===null) ? ((_editFieldOldValue.length===0)?true:false) : ((d.timeInSeconds === _editFieldOldValue)?true:false);
	} else {
		if( _editFieldInput.value == _editFieldOldValue ) { // Nothing has been changed...
			comparedOk = true;
		}
	}
	if( comparedOk ) {
		hideEditField();
		return;
	}

	calendarCancel(); // If the "onEditFieldInputOk()" function is called not through a calendar event (e.g. on clicking blackOutDiv). 

	let valid = validateEditField( _editFieldInput, _editFieldType );
	if( !valid.ok ) {
		_editFieldMessage.innerText = valid.message;
		_editFieldMessage.style.display = 'block';
		return;
	}	

	let data = createUserDataObjectToSendAfterEditing( _editFieldOperationIndex, _editFieldRef );
	if( !data ) {
    return;
  }

	_editFieldMessage.style.display = 'block';
	_editFieldMessage.innerText = _texts[_globals.lang].waitSaveUserDataText;

	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onerror = function(e) { 
		_editFieldMessage.innerText = _texts[_globals.lang].errorSavingData;
		_editFieldMessage.style.display = 'block';
	}

	xmlhttp.onreadystatechange = function(v) { 
		if( xmlhttp.readyState == 4 ) {
			if( xmlhttp.status == 200 ) { 
				onUserDataSave( xmlhttp, data.data, false ); 
				return;
			}
			_editFieldMessage.innerText = _texts[_globals.lang].errorSavingData;
			_editFieldMessage.style.display = 'block';            
		}
	};

	xmlhttp.open("POST", _settings.urlSaveData, true);
	xmlhttp.setRequestHeader("Cache-Control", "no-cache");
	xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); //"application/x-www-form-urlencoded");
	//console.log( data.json_data );
	xmlhttp.send( data.json_data );		    
}


function hideEditField() 
{
	calendarCancel();

	_editFieldInput.removeEventListener( "keydown", onEditTableFieldKey );
	window.removeEventListener( "keydown", onEditTableFieldKey );

	_blackOutBoxDiv.style.display='none';	
	_blackOutBoxDiv.onclick = null;
	_editField.style.display='none';
	_editFieldInput.style.display='none';
	_editFieldMessage.style.display = 'none';
	document.getElementById('editFieldInput').style.display = 'none';
	document.getElementById('editFieldMessage').style.display = 'none';
} 


function createUserDataObjectToSendAfterEditing( i, editedFieldRef=null ) 
{
	let data = {};

    //userData[ 'Level' ] = _data.activities[i]['Level'];			
	for( let iE = 0 ; iE < _data.editables.length ; iE++ ) {
		let ref = _data.editables[iE].ref;
		let value = null; 
		if( editedFieldRef === null ) { 	// Edited in box
			let elem = document.getElementById( 'editBoxInput' + ref );
			value = elem.value;
		} 
		else { 		// Edited in field
			if( ref == editedFieldRef ) { // The value just edited
				value = _editFieldInput.value; 
			} else { // A value of the same editedOperationIndex, yet not from edit field - thus not edited...
				value = _data.activities[i][ ref ]; // ...simply copying that passed from 'SpiderProject'.							
			}
		}
		if( _data.refSettings[ref].type === 'datetime' && (editedFieldRef === null || (editedFieldRef !== null && ref == editedFieldRef) ) ) {
			let parsed = parseDate( value );
			value = ( parsed === null ) ? '' : parsed.timeInSeconds;
		}
		data[ ref ] = value;
	}

    // Searching for parent operation code, if assignment or team
    /*
	let parentOperation='';
	if( _data.activities[i].Level == 'A' ) { 	// It is an assignment - searching for parent
		if( _data.meta[i].parents.length > 0 ) {
			let parentIndex = _data.meta[i].parents[0];
			if( _data.activities[parentIndex].Level === null ) { 	// It is an operation
				parentOperation = _data.activities[parentIndex].Code;
			} else if( _data.activities[parentIndex].Level == 'T' ) { 	// It is a team
				if( _data.meta[i].parents.length > 1 ) {
					let parentOfParentIndex = _data.meta[i].parents[1];
					if( _dataOperations[parentOfParentIndex].Level === null ) { // It is an operation
						parentOperation = _data.activities[parentOrParentIndex].Code;
					}
				}	
			}				
		}
	} else if( _data.activities[i].Level == 'T' ) { 	// It is a team - searching for parent
		if( _data.meta[i].parents.length > 0 ) {
			let parentIndex = _data.meta[i].parents[0];
			if( _data.activities[parentIndex].Level === null ) { 	// It is an operation
				parentOperation = _data.activities[parentIndex].Code;
			}
		}
	}
  */
	return { 
		json_data: JSON.stringify({
				Code: _data.activities[i].Code,
				Level: (typeof(_data.activities[i].Level) !== 'undefined' && _data.activities[i].Level !== null) ?
					String(_data.activities[i].Level) : '',
				f_UniId: (typeof(_data.activities[i].f_UniId) !== 'undefined') ?
					_data.activities[i].f_UniId : null,
				fileName: decodeURIComponent( _globals.projectId ),
				data: data
		}),
		data: data
	};
}


function writeValueIntoTable( i, col, ref, destElem=null ) 
{
  let fmt = getFormatForTableCellAndValue( i, ref );
	if( !destElem ) {
        destElem = document.getElementById( 'tableColumn'+col+'Row'+i );
    }    
    destElem.style.fontStyle = fmt.fontStyle;
    destElem.style.fontWeight = fmt.fontWeight;
    destElem.childNodes[0].nodeValue = fmt.value;
}
