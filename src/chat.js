import { _globals, _data } from './globals.js'
import { _texts } from './texts.js';
import { dateIntoSpiderDateString } from './utils.js';
import { chatImageAttachListener, clearImageAttachedToMessageEdited, isImageAttachedToMessageEdited, 
	onChatMessageInputChange, setChatMessage , getChatMessage, getChatItemUnderUpdate, setChatItemUnderUpdate } from './chatutils.js';

function assignActivityCredentials(obj) {
	obj.sessId = _globals.chatActivityCredentials.sessId;
	obj.user = decodeURIComponent(_globals.chatActivityCredentials.user);
	obj.projectId = decodeURIComponent(_globals.chatActivityCredentials.projectId);
	obj.activity = _globals.chatActivityCredentials.activity;
	obj.level = _globals.chatActivityCredentials.level;
	obj.parent = _globals.chatActivityCredentials.parent;
	obj.wbsCode = _data.project.wbsCode;
}

export function loadAndDisplayChat( activityLevel, activityCode, activityParent, activityName ) 
{
	_globals.chatIsFullyLoaded = false;

	initChat();
	showChatWindow( activityCode, activityName );

	_globals.chatActivityCredentials = { sessId: _globals.sessId, user: _globals.user, 
		projectId: _globals.projectId, activity: activityCode, level: activityLevel, parent: activityParent };

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
				displayChat( dataObj.buffer );
			} else {
				displaySysMessage( _texts[_globals.lang].chatErrorLoadingMessages );
			}
		}
	}
	displaySysMessage( _texts[_globals.lang].chatIsBeingLoadedMessage );
	let jsonObject = { limit:_globals.chatMessagesLimit };
	assignActivityCredentials( jsonObject );
	let jsonString = JSON.stringify( jsonObject );
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonString );
}

function loadMoreMessages() {
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
				displayMoreMessages( dataObj.buffer );
			} else {
				;
			}
		}
	}
	let jsonObject = { limit: _globals.chatMessagesLimit, offset:_globals.chatMessagesNumber + _globals.chatMessagesLimit };
	assignActivityCredentials( jsonObject );
	let jsonString = JSON.stringify( jsonObject );
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonString );
}

function showChatWindow( activityCode, activityName ) {
	_globals.chatContainerElem.style.display = 'block';
	_globals.chatActivityTitleElem.innerHTML = `<span class='chat-activity-code'>${activityCode}</span>` +
			`&nbsp;//&nbsp;<span class='chat-activity-name'>${activityName}</span>`;
}

function hideChatWindow() {
	_globals.chatContainerElem.style.display = 'none';
}


function initChat() {	
	if( _globals.chatContainerElem !== null ) {					// If already initialized...
		while( _globals.chatMessageListElem.hasChildNodes() ) {
			_globals.chatMessageListElem.removeChild( _globals.chatMessageListElem.lastChild );
		}
		clearImageAttachedToMessageEdited();
		setChatMessage('');
		onChatMessageInputChange(null);
		setChatItemUnderUpdate(null);
		return;
	}

	let containerElem = document.createElement('div');
	containerElem.className = 'chat-container';
	document.body.appendChild(containerElem);
	_globals.chatContainerElem = containerElem;

	let hmargin = window.innerWidth / 12;
	let vmargin = window.innerHeight / 12;
	let containerElemWidth = window.innerWidth - hmargin*2;
	let containerElemHeight = window.innerHeight - vmargin*2;
	containerElem.style.left = hmargin + 'px';
	containerElem.style.top = vmargin + 'px';
	containerElem.style.height = containerElemHeight + 'px';
	containerElem.style.width = containerElemWidth + 'px';

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
	sendMessageElem.className = 'chat-send-message-container';
	containerElem.appendChild(sendMessageElem);
	_globals.chatSendMessageElem = sendMessageElem;

	let messageInputElem = document.createElement('textarea');
	messageInputElem.className = 'chat-send-message';
	messageInputElem.rows = 4;
	sendMessageElem.appendChild(messageInputElem);
	_globals.chatMessageInputElem = messageInputElem;

	let sendButtonElem = document.createElement('input');
	sendButtonElem.type = 'button';
	sendButtonElem.value = _texts[_globals.lang].chatSendButton;
	sendButtonElem.className = 'chat-send-button';
	sendMessageElem.appendChild(sendButtonElem);
	_globals.chatSendButtonElem = sendButtonElem;

	messageInputElem.oninput = function(e) { onChatMessageInputChange(e); };
	setChatMessage('');

	let imageAttachedPreviewElem = document.createElement('img');
	imageAttachedPreviewElem.className = 'chat-attached-image';
	sendMessageElem.appendChild(imageAttachedPreviewElem);
	_globals.chatImageAttachedPreviewElem = imageAttachedPreviewElem;

	let cancelAttachedButtonElem = document.createElement('div');
	cancelAttachedButtonElem.innerHTML = '&#128473;';
	cancelAttachedButtonElem.className = 'chat-cancel-attached';
	cancelAttachedButtonElem.onclick = function(e) {
		clearImageAttachedToMessageEdited();		
	};
	sendMessageElem.appendChild(cancelAttachedButtonElem);
	_globals.chatCancelAttachedButtonElem = cancelAttachedButtonElem;

	let attachFileInputElem = document.createElement('input');
	attachFileInputElem.type = 'file';
	attachFileInputElem.addEventListener('change', (e) => {
		chatImageAttachListener(e);
	});
	attachFileInputElem.className = 'chat-file-attach-input';
	sendMessageElem.appendChild(attachFileInputElem);
	_globals.chatAttachFileInputElem = attachFileInputElem;

	let closeButtonElem = document.createElement('input');
	closeButtonElem.type = 'button';
	closeButtonElem.value = _texts[_globals.lang].chatCloseButton;
	closeButtonElem.className = 'chat-close-button';
	sendMessageElem.appendChild(closeButtonElem);
	_globals.chatCloseButtonElem = closeButtonElem;

	let messageListElem = document.createElement('div');
	messageListElem.className = 'chat-messages-list';
	messageListElem.style.height = (containerElemHeight - 156).toString() + 'px';
	containerElem.appendChild(messageListElem);
	_globals.chatMessageListElem = messageListElem;

	messageListElem.addEventListener('scroll', function(e) {
		if( messageListElem.scrollTop >= (messageListElem.scrollHeight - messageListElem.offsetHeight) ) {
			loadMoreMessages();
		}
	});

	sendButtonElem.onclick = function(e) {
		insertOrUpdate();
	};

	closeButtonElem.onclick = function(e) {
		clearImageAttachedToMessageEdited();
		if( getChatItemUnderUpdate() ) {	// It is a message being updated - cancelling... 
			setUpdatingStyles( getChatItemUnderUpdate(), false );
			setChatMessage('');
			setChatItemUnderUpdate(null);
			return;
		} else { 				// Cancelling the chat window
			hideChatWindow();
		}
	};
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
		let dataItem = { rowid: rowid, user: fields.user, message: fields.message, 
			datetime: dateIntoSpiderDateString( fields.datetime ), 
			icon: ((fields.icon) ? fields.icon : null), imageId: ((fields.imageId) ? fields.imageId : null) };
		addChatItem( dataItem )
	}

	setTimeout( function() { checkForNewMessages(); }, _globals.chatCheckForNewMessagesTimeout );
}

function displayMoreMessages( dataResponse ) {
	for( let i = 0 ; i < dataResponse.length ; i++ ) {
		let fields = dataResponse[i]; 	// 0 - user, 1 - message, 2 - datetime
		if( fields.length < 4 ) {
			continue;
		}
		let dataItem = { rowid: fields.rowid, user: fields.user, message: fields.message, 
			datetime: dateIntoSpiderDateString( fields.datetime ),
			icon: ((fields.icon) ? fields.icon : null), imageId: ((fields.imageId) ? fields.imageId : null) };
		addChatItem( dataItem );
	}
}

function displayNewMessages( dataResponse ) {
	for( let i = dataResponse.length -1 ; i >=0 ; i-- ) {
		let fields = dataResponse[i]; 	// 0 - user, 1 - message, 2 - datetime
		if( fields.length < 4 ) {
			continue;
		}
		let dataItem = { rowid: fields.rowid, user: fields.user, message: fields.message, 
			datetime: dateIntoSpiderDateString( fields.datetime ),
			icon: ((fields.icon) ? fields.icon : null), imageId: ((fields.imageId) ? fields.imageId : null) };
		addChatItem( dataItem, true );
	}
}


function checkForNewMessages() {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				if( 'buffer' in dataObj && dataObj.buffer.length > 0 ) {					
					displayNewMessages( dataObj.buffer );
				}
			} else {
				;
			}
			setTimeout( function() { checkForNewMessages(); }, _globals.chatCheckForNewMessagesTimeout );
		}
	}
	let jsonObject = { limit: _globals.chatMessagesLimit, offset:0, rowid: _globals.chatMaxRowId };
	assignActivityCredentials( jsonObject );
	let jsonString = JSON.stringify( jsonObject );
	xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonString );	
}


function addChatItem( dataItem, addFirst = false ) {
	dataItem.meta = {};
	let itemElem = document.createElement('div');
	itemElem.className = (_globals.user !== dataItem.user) ? 'chat-item' : 'chat-item-user';

	if( !addFirst || _globals.chatMessageListElem.children.length === 0 ) {
		_globals.chatMessageListElem.appendChild(itemElem);
	} else {
		_globals.chatMessageListElem.insertBefore( itemElem, _globals.chatMessageListElem.children[0] );
	}
	dataItem.meta.itemElem = itemElem;

	let userElem = document.createElement('div');
	userElem.className = 'chat-user';
	userElem.innerHTML = dataItem.user + ':';
	itemElem.appendChild(userElem);
	dataItem.meta.userElem = userElem;

	let messageElem = document.createElement('div');
	messageElem.className = 'chat-message';
	messageElem.innerHTML = dataItem.message;
	itemElem.appendChild(messageElem);
	dataItem.meta.messageElem = messageElem;

	let dateElem = document.createElement('div');
	dateElem.className = 'chat-date';
	let date = dataItem.datetime;
	dateElem.innerHTML = date;
	dataItem.meta.dateElem = dateElem;

	if( 'icon' in dataItem && dataItem.icon && 'imageId' in dataItem && dataItem.imageId > 0 ) {
		let imgElem = document.createElement('img');
		imgElem.src = dataItem.icon;
		itemElem.appendChild(imgElem);
		dataItem.meta.imageElem = imgElem;
		imgElem.className = 'chat-item-image';
		if( !('image' in dataItem) ) { 						// if adding a message just typed in by the user
			imgElem.onclick = function() {
				let xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (xhttp.readyState == 4 ) {
						if( xhttp.status == 200 ) {
							let dataObj = parseJsonString(xhttp.responseText);
							if( dataObj === null || dataObj.errcode !== 0 ) {
								return;
							}
							if( 'image' in dataObj && dataObj.image.length > 0 ) {		
								imgElem.src = dataObj.image;			
							}
							imgElem.onclick = null;
						} 
					}
				}
				let jsonObject = { imageId:dataItem.imageId };
				assignActivityCredentials( jsonObject );
				let jsonString = JSON.stringify( jsonObject );
				xhttp.open("POST", _globals.chatServer + _globals.chatReadUrl, true);
				xhttp.setRequestHeader("Cache-Control", "no-cache");
				xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
				xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhttp.send( jsonString );				
			}
		} else {						// If adding a message read from the SP db - should has an image
			imgElem.onclick = function() {
				imgElem.src = dataItem.image;			
			}
		}
	} 

	if( _globals.user === dataItem.user ) {
		let removeElem = document.createElement('span');
		removeElem.className = 'chat-remove';
		dateElem.appendChild(removeElem);
		removeElem.innerHTML = _globals.chatRemoveHTML;
		removeElem.onclick = function(e) { remove( dataItem, this ) };
		dataItem.meta.removeElem = removeElem;

		let updateElem = document.createElement('span');
		updateElem.className = 'chat-update';
		dateElem.appendChild(updateElem);
		updateElem.innerHTML = _globals.chatUpdateHTML;
		updateElem.onclick = function(e) { update( dataItem ) };
		dataItem.meta.updateElem = updateElem;
	}

	itemElem.appendChild(dateElem);
	_globals.chatMessagesNumber++;
	if( dataItem.rowid > _globals.chatMaxRowId ) {
		_globals.chatMaxRowId = dataItem.rowid;
	}
}

function remove( dataItem, removeElem ) {
	if( removeElem.disabled ) {
		return;
	}
	removeElem.disabled = true;

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			removeElem.disabled = false;
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					return;
				}
				_globals.chatMessageListElem.removeChild( dataItem.meta.itemElem );
				//dataItem.itemElem.remove();			
				_globals.chatMessagesNumber--;
			}
		}
	}
	let jsonObject = { rowid: dataItem.rowid };
	assignActivityCredentials( jsonObject )
	let jsonString = JSON.stringify( jsonObject );
	xhttp.open("POST", _globals.chatServer + _globals.chatRemoveUrl, true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonString );
}


function insertOrUpdate() {
	if( _globals.chatSendButtonElem.disabled ) {
		return;
	}
	_globals.chatSendButtonElem.disabled = true; // Disabling the "send" button to prevent clicking it twice

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			_globals.chatSendButtonElem.disabled = false;	// Enabling the "send" button 
			if( xhttp.status == 200 ) {
				let dataObj = parseJsonString(xhttp.responseText);
				if( dataObj === null || dataObj.errcode !== 0 ) {
					displaySysMessage( _texts[_globals.lang].chatSendMessageError )
					return;
				}
				let dataItem = getChatItemUnderUpdate();
				if( dataItem ) {	// An existing message was updated
					dataItem.meta.messageElem.innerHTML = getChatMessage(true);

					if( _globals.chatIconAttached && _globals.chatImageAttached ) { 	// If there is an image attached...
						let imageElem;
						if( 'imageElem' in dataItem.meta ) {		// If there is an img element already appended to this chat item
							imageElem = dataItem.meta.imageElem;
						} else {					// If not - creating one
							imageElem = document.createElement('img');
							dataItem.meta.itemElem.appendChild(imageElem);
							imageElem.className = 'chat-item-image';
						} 	
						let icon = _globals.chatIconAttached.base64encoded.slice();
						let image = _globals.chatImageAttached.base64encoded.slice();
						dataItem.icon = icon;
						dataItem.image = image;
						imageElem.src = icon;
						imageElem.onclick = function() {
							imageElem.src = image;
							imageElem.onclick = null;			
						};
						dataItem.meta.imageElem = imageElem;
						dataItem.icon = _globals.chatIconAttached.base64encoded;
					} else if( 'icon' in dataItem ) { 		// If there is an image elem - the message has (had) image...  
						if( !isImageAttachedToMessageEdited() ) {		// If the message no longer has one...
							if( dataItem.meta.imageElem ) { 
								dataItem.meta.itemElem.removeChild( dataItem.meta.imageElem );
								delete dataItem.meta.imageElem;
							}
							delete dataItem.icon;
						}
					}						
					setUpdatingStyles(dataItem, false);
					setChatItemUnderUpdate(null); 		// delete _globals.chatDataItemUnderUpdate;
				}
				else {
					let dataItem = { rowid: dataObj.rowid, user: _globals.user, 
						message: getChatMessage(), 
						datetime: dateIntoSpiderDateString( dataObj.datetime ) };
					if(	_globals.chatIconAttached && _globals.chatImageAttached) {
						dataItem.icon = _globals.chatIconAttached.base64encoded;
						dataItem.image = _globals.chatImageAttached.base64encoded;
					}			
					addChatItem( dataItem, true );
				}
				setChatMessage('');
				clearImageAttachedToMessageEdited();
				displaySysMessage(null);
			} else{
				displaySysMessage( _texts[_globals.lang].chatSendMessageError )
			}
		}
	}
	
	//let jsonObject = { message: _globals.chatMessageInputElem.value };
	let jsonObject = { message: getChatMessage() };
	assignActivityCredentials( jsonObject );
	let dataItem = getChatItemUnderUpdate();
	if( dataItem ) { 	// It is updating, not a new message
		if( isImageAttachedToMessageEdited() ) {	// If preview image is not empty - leaving it unchanged
			jsonObject.imageOp	= "unchanged";
		} else {				// If empty - remove
			jsonObject.imageOp	= "remove";
		}
		jsonObject.rowid = dataItem.rowid;
	}
	if( _globals.chatIconAttached && _globals.chatImageAttached ) {
		jsonObject.icon = _globals.chatIconAttached.base64encoded;
		jsonObject.image = _globals.chatImageAttached.base64encoded;
		jsonObject.width = _globals.chatImageAttached.width;
		jsonObject.height = _globals.chatImageAttached.height;
		if( dataItem ) {	// If updating, not inserting
			jsonObject.imageOp = "update";
		}
	}

	let jsonString = JSON.stringify( jsonObject );
	xhttp.open("POST", _globals.chatServer + ((!dataItem) ? _globals.chatInsertUrl : _globals.chatUpdateUrl), true);
	xhttp.setRequestHeader("Cache-Control", "no-cache");
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');		
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send( jsonString );
}

function setUpdatingStyles( dataItem, isUpdating=true ) {
	if( isUpdating ) {
		dataItem.meta.itemElem.className = 'chat-item-user-updating';
		dataItem.meta.updateElem.className = 'chat-update-updating';
		dataItem.meta.removeElem.className = 'chat-remove-updating';
		dataItem.meta.userElem.className = 'chat-user-updating';
		dataItem.meta.messageElem.className = 'chat-message-updating';
		_globals.chatCloseButtonElem.innerHTML = _texts[_globals.lang].chatCancelButton;
	} else {
		dataItem.meta.itemElem.className = 'chat-item-user';
		dataItem.meta.updateElem.className = 'chat-update';
		dataItem.meta.removeElem.className = 'chat-remove';
		dataItem.meta.userElem.className = 'chat-user';
		dataItem.meta.messageElem.className = 'chat-message';
		_globals.chatCloseButtonElem.innerHTML = _texts[_globals.lang].chatCloseButton;
	}
}

function update( dataItem ) {
	if( getChatItemUnderUpdate() ) {
		return;
	}
	clearImageAttachedToMessageEdited();
	setUpdatingStyles(dataItem, true);
	//_globals.chatMessageInputElem.value = dataItem.meta.messageElem.innerHTML.replace(/<br>/g, '\n').replace(/&lt;/,'<').replace(/&gt;/,'>').replace(/&quot;/g, '"');
	setChatMessage(dataItem.meta.messageElem.innerHTML, true);
	_globals.chatMessageInputElem.focus();
	if( 'icon' in dataItem ) {
		_globals.chatImageAttachedPreviewElem.src = dataItem.icon;
		_globals.chatImageAttachedPreviewElem.style.display = 'inline-block';
		_globals.chatCancelAttachedButtonElem.style.display = 'inline-block';
	}
	setChatItemUnderUpdate( dataItem ); 
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

