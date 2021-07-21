import { _globals } from "./globals";
import { _texts } from "./texts";
import Compressor from 'compressorjs'

export function setChatItemUnderUpdate(item) {
	if( item ) {
		_globals.chatDataItemUnderUpdate = item;
		_globals.chatCloseButtonElem.value = _texts[_globals.lang].chatCancelButton;
	} else {
		delete _globals.chatDataItemUnderUpdate;
		_globals.chatCloseButtonElem.value = _texts[_globals.lang].chatCloseButton;	
	}
}

export function getChatItemUnderUpdate(item) {
	return _globals.chatDataItemUnderUpdate;
}

export function onChatMessageInputChange(e) {
	if( _globals.chatMessageInputElem.value && _globals.chatMessageInputElem.value !== '' ) {
		_globals.chatSendButtonElem.disabled = false;
	} else {
		_globals.chatSendButtonElem.disabled = true;
	}
}

export function setChatMessage( msg, isHtml = false ) {
	_globals.chatMessageInputElem.value = (!isHtml) ? msg : 
		msg.replace(/<br>/g, '\n').replace(/&lt;/,'<').replace(/&gt;/,'>').replace(/&quot;/g, '"');
	onChatMessageInputChange(null);
}

export function getChatMessage( isHtml=false ) {
	if( isHtml ) {
		return _globals.chatMessageInputElem.value.replace(/\</,'&lt;').replace(/\>/,'&gt;').replace(/\n/g, '<br/>').replace(/"/g, '&quot;');
	}
	return _globals.chatMessageInputElem.value;
}


export function isImageAttachedToMessageEdited() {
	return (_globals.chatImageAttachedPreviewElem.style.display !== 'none');
}

export function clearImageAttachedToMessageEdited() {
	_globals.chatIconAttached = null;
	_globals.chatImageAttached = null;
	_globals.chatImageAttachedPreviewElem.style.display = 'none';
	_globals.chatImageAttachedPreviewElem.removeAttribute('src');
	_globals.chatAttachFileInputElem.value = '';
	_globals.chatCancelAttachedButtonElem.style.display = 'none';
}


export function chatImageAttachListener(e) {
	const file = e.target.files[0];
	if( !file ) {
		clearImageAttachedToMessageEdited();
		return;
	}
	let originalImg = new Image();	// To make an image from the file chosen
	originalImg.src = URL.createObjectURL(file);
	originalImg.onload = function () {
		_globals.chatImageAttachedPreviewElem.src = originalImg.src; 	// Diplaying an icon for the user
		_globals.chatImageAttachedPreviewElem.style.display = 'inline-block';
		_globals.chatCancelAttachedButtonElem.style.display = 'inline-block';

		let originalImageWidth = this.width;
		let originalImageHeight = this.height;
		let widthHeightRatio = originalImageWidth / originalImageHeight;
		let iconHeight = Math.floor( Math.sqrt( 50 * 50 * originalImageHeight / originalImageWidth ) );	// 50x50
		let iconWidth = Math.floor( iconHeight * widthHeightRatio );
		let imageHeight, imageWidth;
		if( originalImageHeight * originalImageWidth < 1200 * 900 ) {
			imageHeight = originalImageHeight;
			imageWidth = originalImageWidth;
		} else {
			imageHeight = Math.sqrt( 1200 * 900 * originalImageHeight / originalImageWidth );	// 12000x900
			imageWidth = imageHeight * widthHeightRatio;
		}

		new Compressor( file, {
			quality: 0.6, height: iconHeight, width: iconWidth,		
			success(blob) {
				let iconImg = new Image();
				iconImg.src = URL.createObjectURL(blob);
				iconImg.onload = function() {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					canvas.width = iconWidth;
					canvas.height = iconHeight;
					ctx.drawImage(iconImg, 0, 0);
					let base64encoded = canvas.toDataURL('image/jpeg');
					_globals.chatIconAttached = { width: iconWidth, height: iconHeight, /*blob: blob,*/ base64encoded: base64encoded };
					// console.log("icon=", _globals.chatIconAttached);
				}
			},
			error(err) { ; }
		});
		new Compressor( file, {
			quality: 0.6, height: imageHeight, width: imageWidth,		
			success(blob) {
				let fullImg = new Image();
				fullImg.src = URL.createObjectURL(blob);
				fullImg.onload = function() {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					canvas.width = imageWidth;
					canvas.height = imageHeight;
					ctx.drawImage(fullImg, 0, 0);
					let base64encoded = canvas.toDataURL('image/jpeg');
					_globals.chatImageAttached = { width: imageWidth, height: imageHeight, /*blob: blob,*/ base64encoded: base64encoded };
					// console.log("image=", _globals.chatImageAttached);
				}
			},
			error(err) { ; }
		});
	};
}