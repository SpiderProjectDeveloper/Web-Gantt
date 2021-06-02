import { _globals } from './globals.js'
import { _texts } from './texts.js';
import { dateIntoSpiderDateString } from './utils.js';

export function loadAndDisplayChat( activityCode, activityName ) 
{
	_globals.chatIsFullyLoaded = false;

	initChat();
	_globals.chatContainerElem.style.display = 'block';
	_globals.chatActivityTitleElem.innerHTML = `<span class='chat-activity-code'>[${activityCode}]</span>` +
			`&nbsp;&nbsp;<span class='chat-activity-name'>${activityName}</span>`;

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					displaySysMessage( _texts[_globals.lang].chatErrorLoadingMessages );
					return;
				}
				displaySysMessage(null);
				_globals.activityCodeChatIsCalledFor = activityCode;
				displayChat( dataObj.buffer );
			} else {
				displaySysMessage( _texts[_globals.lang].chatErrorLoadingMessages );
			}
		}
	}
	displaySysMessage( _texts[_globals.lang].chatIsBeingLoadedMessage );
	let jsonData = JSON.stringify( { sessId: _globals.sessId, user: _globals.user, 
		projectId: _globals.projectId, activity: activityCode, limit:_globals.chatMessagesLimit } );
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonData );
}

function loadMoreMessages( messageListElem ) {
	if( _globals.chatIsFullyLoaded ) {
		return;
	}
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				if( !('buffer' in dataObj) || dataObj.buffer.length < _globals.chatMessagesLimit ) {
					_globals.chatIsFullyLoaded = true;
				}
				displayMoreMessages( messageListElem, dataObj.buffer );
			} else {
				;
			}
		}
	}
	let jsonData = JSON.stringify( { sessId: _globals.sessId, user: _globals.user, 
		projectId: _globals.projectId, activity: _globals.activityCodeChatIsCalledFor,
		limit: _globals.chatMessagesLimit, offset:_globals.chatMessagesNumber + _globals.chatMessagesLimit } );
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonData );
}


function initChat() {
	let containerElem;
	
	if( _globals.chatContainerElem === null ) {
		containerElem = document.createElement('div');
		containerElem.className = 'chat-container';
		document.body.appendChild(containerElem);
		_globals.chatContainerElem = containerElem;
	} else{
		containerElem = _globals.chatContainerElem;
	}

	let hmargin = window.innerWidth / 12;
	let vmargin = window.innerHeight / 12;
	let containerElemWidth = window.innerWidth - hmargin*2;
	let containerElemHeight = window.innerHeight - vmargin*2;
	containerElem.style.left = hmargin + 'px';
	containerElem.style.top = vmargin + 'px';
	containerElem.style.height = containerElemHeight + 'px';
	containerElem.style.width = containerElemWidth + 'px';

	if( _globals.chatActivityTitleElem === null ) { 	// If not initialized yet...
		_globals.chatServer = window.location.protocol + "//" + window.location.host.split(":")[0] + ":" + _globals.chatPort + "/";

		let sysMessageElem = document.createElement('div');
		sysMessageElem.innerHTML = '';
		sysMessageElem.className = 'chat-sys-message';
		containerElem.appendChild(sysMessageElem);
		_globals.chatSysMessageElem = sysMessageElem;

		let activityTitleElem = document.createElement('div');
		activityTitleElem.className = 'chat-activity-title'; 
		containerElem.appendChild(activityTitleElem);
		_globals.chatActivityTitleElem = activityTitleElem;

		let sendMessageElem = document.createElement('div');
		sendMessageElem.className = 'chat-send-message-item';
		containerElem.appendChild(sendMessageElem);
		_globals.chatSendMessageElem = sendMessageElem;

		let inputElem = document.createElement('textarea');
		inputElem.className = 'chat-send-message';
		inputElem.rows = 4;
		sendMessageElem.appendChild(inputElem);

		let buttonElem = document.createElement('div');
		buttonElem.type = 'button';
		buttonElem.innerHTML = 'Send';
		buttonElem.className = 'chat-send-button';
		sendMessageElem.appendChild(buttonElem);

		let closeButtonElem = document.createElement('div');
		closeButtonElem.type = 'button';
		closeButtonElem.innerHTML = 'Close';
		closeButtonElem.className = 'chat-send-button';
		sendMessageElem.appendChild(closeButtonElem);

		let messageListElem = document.createElement('div');
		messageListElem.className = 'chat-messages-list';
		messageListElem.style.height = (containerElemHeight - 156).toString() + 'px';
		containerElem.appendChild(messageListElem);
		_globals.chatMessageListElem = messageListElem;

		messageListElem.addEventListener('scroll', function(e) {
			if( messageListElem.scrollTop >= (messageListElem.scrollHeight - messageListElem.offsetHeight) ) {
				loadMoreMessages( messageListElem );
			}
		});

		buttonElem.onclick = function(e) {
			insert( inputElem, messageListElem );
		};

		closeButtonElem.onclick = function(e) {
			_globals.chatContainerElem.style.display = 'none';
		};

	} else { 	// If already initialized - clearing the chat list
		while( _globals.chatMessageListElem.hasChildNodes() ) {
			_globals.chatMessageListElem.removeChild( _globals.chatMessageListElem.lastChild );
		}
	}
}

function displayChat( dataResponse ) {
	for( let i = 0 ; i < dataResponse.length ; i++ ) {
		let fields = dataResponse[i]; 	// 0 - user, 1 - message, 2 - datetime
		if( fields.length < 4 ) {
			continue;
		}
		let rowid;
		try {
			rowid = parseInt(fields.rowid);
		} catch(e) {
			continue;
		}
		let dataItem = { rowid: rowid, user: fields.usr, message: fields.msg, datetime: dateIntoSpiderDateString( fields.dt ) };
		addChatItem( _globals.chatMessageListElem, dataItem )
	}

	setTimeout( function() { checkForNewMessages( _globals.chatMessageListElem ); }, _globals.chatCheckForNewMessagesTimeout );
}

function displayMoreMessages( messageListElem, dataResponse ) {
	for( let i = 0 ; i < dataResponse.length ; i++ ) {
		let fields = dataResponse[i]; 	// 0 - user, 1 - message, 2 - datetime
		if( fields.length < 4 ) {
			continue;
		}
		let dataItem = { rowid: fields.rowid, user: fields.usr, message: fields.msg, datetime: dateIntoSpiderDateString( fields.dt ) };
		addChatItem( messageListElem, dataItem );
	}
}

function displayNewMessages( messageListElem, dataResponse ) {
	for( let i = dataResponse.length -1 ; i >=0 ; i-- ) {
		let fields = dataResponse[i]; 	// 0 - user, 1 - message, 2 - datetime
		if( fields.length < 4 ) {
			continue;
		}
		let dataItem = { rowid: fields.rowid, user: fields.usr, message: fields.msg, datetime: dateIntoSpiderDateString( fields.dt ) };
		addChatItem( messageListElem, dataItem, true );
	}
}


function checkForNewMessages( messageListElem ) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				if( 'buffer' in dataObj && dataObj.buffer.length == 0 ) {					
					displayNewMessages( messageListElem, dataObj.buffer );
				}
			} else {
				;
			}
			setTimeout( function() { checkForNewMessages( messageListElem ); }, _globals.chatCheckForNewMessagesTimeout );
		}
	}
	let jsonData = JSON.stringify({ 
		sessId: _globals.sessId, user: _globals.user, 
		projectId: _globals.projectId, activity: _globals.activityCodeChatIsCalledFor,
		limit: _globals.chatMessagesLimit, offset:0, rowid: _globals.chatMaxRowId 
	});
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonData );	
}


function addChatItem( messageListElem, dataItem, addFirst = false ) {
	let itemElem = document.createElement('div');
		itemElem.className = 'chat-item';
		if( _globals.user === dataItem.user ) {
			itemElem.className += ' ' + 'chat-item-user';
		}
		if( !addFirst || messageListElem.children.length === 0 ) {
			messageListElem.appendChild(itemElem);
		} else {
			messageListElem.insertBefore( itemElem, messageListElem.children[0] );
		}

		let userElem = document.createElement('div');
		userElem.className = 'chat-user';
		userElem.innerHTML = dataItem.user + ':';
		itemElem.appendChild(userElem);

		let messageElem = document.createElement('div');
		messageElem.className = 'chat-message';
		messageElem.innerHTML = dataItem.message;
		itemElem.appendChild(messageElem);

		dateElem = document.createElement('div');
		dateElem.className = 'chat-date';
		let date = dataItem.datetime;
		dateElem.innerHTML = date;

		if( _globals.user === dataItem.user ) {
			let editElem = document.createElement('textarea');
			editElem.className = 'chat-message-update';
			editElem.rows = 4;
			itemElem.appendChild(editElem);

			let removeElem = document.createElement('span');
			removeElem.className = 'chat-remove';
			dateElem.appendChild(removeElem);
			removeElem.innerHTML = _globals.chatRemoveHTML;
			removeElem.onclick = function(e) { remove( removeElem, updateElem, dataItem, itemElem, messageElem, editElem, dateElem ) };

			let updateElem = document.createElement('span');
			updateElem.className = 'chat-update';
			dateElem.appendChild(updateElem);
			updateElem.innerHTML = _globals.chatUpdateHTML;
			updateElem.onclick = function(e) { update( updateElem, removeElem, dataItem, itemElem, messageElem, editElem, dateElem ) };
		}

		itemElem.appendChild(dateElem);
		_globals.chatMessagesNumber++;
		if( dataItem.rowid > _globals.chatMaxRowId ) {
			_globals.chatMaxRowId = dataItem.rowid;
		}
}

function remove( removeElem, updateElem, dataItem, itemElem, messageElem, editElem, dateElem ) {
	if( messageElem.style.display === 'none' ) { 	// Cancel editing, not removing the element
		messageElem.style.display = 'block';
		editElem.style.display = 'none';
		updateElem.innerHTML = _globals.chatUpdateHTML;
		return;
	}

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				itemElem.remove();			
				_globals.chatMessagesNumber--;
			}
		}
	}
	let jsonData = JSON.stringify( { sessId: _globals.sessId, user: _globals.user, projectId: _globals.projectId, rowid: dataItem.rowid } );
	xhttp.open("POST", _globals.chatServer + _globals.chatRemoveUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send( jsonData );
}


function insert( inputElem, messageListElem ) {
	if( inputElem.value.length === 0 ) {
		return;
	}
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				let dataItem = { rowid: dataObj.rowid, user: _globals.user, 
					message: inputElem.value.replace(/\</,'&lt;').replace(/\>/,'&gt;').replace(/\n/g, '<br/>').replace(/"/g, '&quot;'), 
					datetime: dateIntoSpiderDateString( dataObj.datetime ) };
				addChatItem( messageListElem, dataItem, true );
				inputElem.value = '';
			}
		}
	}
	let jsonData = JSON.stringify( { sessId: _globals.sessId, user: _globals.user, projectId: _globals.projectId, 
		activity: _globals.activityCodeChatIsCalledFor, message: inputElem.value } );
	xhttp.open("POST", _globals.chatServer + _globals.chatInsertUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonData );
}

function update( updateElem, removeElem, dataItem, itemElem, messageElem, editElem, dateElem ) {
	if( messageElem.style.display !== 'none' ) {
		messageElem.style.display = 'none';
		editElem.style.display = 'block';
		editElem.value = messageElem.innerHTML.replace(/<br>/g, '\n').replace(/&lt;/,'<').replace(/&gt;/,'>').replace(/&quot;/g, '"');
		editElem.focus();
		updateElem.innerHTML = _globals.chatSendUpdateHTML;
		return;
	}

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200  ) {
				messageElem.style.display = 'block';
				editElem.style.display = 'none';

				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				messageElem.innerHTML = editElem.value.replace(/\</,'&lt;').replace(/\>/,'&gt;').replace(/\n/g, '<br/>').replace(/"/g, '&quot;');
				updateElem.innerHTML = _globals.chatUpdateHTML;
			}
		}
	}
	let jsonData = JSON.stringify( { sessId: _globals.sessId, user: _globals.user, projectId: _globals.projectId, 
		rowid: dataItem.rowid, message: editElem.value } );
	xhttp.open("POST", _globals.chatServer + _globals.chatUpdateUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhttp.send( jsonData );
}

function displaySysMessage( msg ) {
	if( msg === null ) {
		_globals.chatSysMessageElem.style.display = 'none';
	} else {
		_globals.chatSysMessageElem.innerHTML = msg;
		_globals.chatSysMessageElem.style.display = 'block';

	}
}


function parseJsonString( s ) {
		let errorParsingData = false;
	let parsed;				
		try{
				parsed = JSON.parse(s); 
		} catch(e) {
			//console.log('Error: ' + e.name + ":" + e.message + "\n" + e.stack + "\n" + e.cause);
		return null;
		}
	return parsed;
}

