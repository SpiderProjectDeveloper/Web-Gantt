import { _settings } from './settings.js';
import { _globals, _data } from './globals.js';
import { _texts, _icons } from './texts.js';

export function createForeignObjectWithText( text, x, y, width, height, properties ) {
	let foreignObject = createForeignObject( x, y, width, height, properties );
	foreignObject.appendChild( document.createTextNode(text) );
	return foreignObject;
}


export function createForeignObject( x, y, width, height, properties ) {
	let foreignObject = document.createElementNS(_settings.NS, 'foreignObject'); 
	foreignObject.setAttribute("x",x); 
	foreignObject.setAttribute("y",y); 
	foreignObject.setAttribute("width",width); 
	foreignObject.setAttribute("height",height); 
	if( 'id' in properties ) {
		foreignObject.setAttributeNS(null, 'id', properties.id );		
	} 
	if( 'fontSize' in properties ) {
		foreignObject.setAttributeNS(null,'font-size', properties.fontSize );
	}
	if( 'textAlign' in properties ) {
		foreignObject.setAttributeNS(null,'text-align', properties.textAlign );
	}
	if( 'color' in properties ) {
		foreignObject.setAttributeNS(null,'color', properties.color );
	}	
	return foreignObject;
}


export function createRhomb( x, top, height, properties ) {
	return createPolygon( calcRhombCoords(x, top, height), properties );
}

export function calcRhombCoords( x, top, height ) {
	let inc = 2;
	top -= inc;
	height += inc*2;
	let halfWidth = Math.floor(height / 2.0);
	let halfHeight = halfWidth;
	let points = (x - halfWidth) + " " + (top + halfHeight) + " " + x + " " + top;
	points += " " + (x + halfWidth) + " " + (top + halfHeight) + " " + x + " " + (top + height);
	return points;
}


export function createRect( x, y, width, height, properties ) {
	let rect = document.createElementNS(_settings.NS, 'rect');
	if( 'id' in properties ) {
		rect.setAttributeNS(null, 'id', properties.id );		
	} 
	rect.setAttributeNS(null, 'x', x ); 
	rect.setAttributeNS(null, 'width', width ); 
	rect.setAttributeNS(null, 'y', y ); 
	rect.setAttributeNS(null, 'height', height );
	if( 'fill' in properties ) {
		rect.setAttributeNS(null, 'fill', properties.fill );
	} 
	if( 'stroke' in properties ) {
		rect.setAttributeNS(null, 'stroke', properties.stroke );
	}
	if( 'strokeWidth' in properties ) {
		rect.setAttributeNS(null, 'stroke-width', properties.strokeWidth );		 
	}
	if( 'opacity' in properties ) {
		rect.setAttributeNS(null, 'opacity', properties.opacity );
	} 
	return rect;
}

export function setRectCoords( rect, x, y, width, height ) {
	rect.setAttributeNS(null,'x',x);
	rect.setAttributeNS(null,'y',y);
	rect.setAttributeNS(null,'width',width);
	rect.setAttributeNS(null,'height',height);  
}

export function createPolygon( points, properties ) {
	let polygon = document.createElementNS(_settings.NS, 'polygon');
	polygon.setAttributeNS(null, 'points', points );			
	if( 'id' in properties ) {
		polygon.setAttributeNS(null, 'id', properties.id );		 
	} 
	if( 'fill' in properties ) {
		polygon.setAttributeNS(null, 'fill', properties.fill );
	} 
	if( 'stroke' in properties ) {
		polygon.setAttributeNS(null, 'stroke', properties.stroke );
	}
	if( 'strokeWidth' in properties ) {
		polygon.setAttributeNS(null, 'stroke-width', properties.strokeWidth );		  
	}
	if( 'opacity' in properties ) {
		polygon.setAttributeNS(null, 'opacity', properties.opacity );
	} 
	return polygon;
}


export function createText( textString, x, y, properties ) {
	let text = document.createElementNS(_settings.NS, 'text');
	text.setAttributeNS(null,'x', x );
	text.setAttributeNS(null,'y', y );
	if( 'id' in properties ) {
		let temp = document.getElementById(properties.id);
		text.setAttributeNS(null, 'id', properties.id );		

	} 
	if( 'fontSize' in properties ) {
		//text.setAttributeNS(null,'font-size', properties.fontSize );
		text.style.fontSize = properties.fontSize;
	}
	if( 'fontWeight' in properties ) {
		//text.setAttributeNS(null,'font-weight', properties.fontWeight );
		text.style.fontWeight = properties.fontWeight;
	}
	if( 'fontStyle' in properties ) {
		//text.setAttributeNS(null,'font-style', properties.fontStyle );		
		text.style.fontStyle = properties.fontStyle;
	}
	if( 'textAnchor' in properties ) {
		text.setAttributeNS(null,'text-anchor', properties.textAnchor );
	}
	if( 'textLength' in properties ) {
		if( properties.textLength ) {
			text.setAttributeNS(null,'textLength', properties.textLength );		 
		}
	}
	if( 'lengthAdjust' in properties ) {
		text.setAttributeNS(null,'lengthAdjust', properties.lengthAdjust );
	}
	if( 'alignmentBaseline' in properties ) {
		text.setAttributeNS(null,'alignment-baseline', properties.alignmentBaseline );
	}
	if( 'preserveAspectRatio' in properties ){
		text.setAttributeNS(null,'preserveAspectRatio', properties.preserveAspectRatio );
	}
	if( 'stroke' in properties) {
		text.setAttributeNS(null,'stroke', properties.stroke );
	}
	if( 'strokeWidth' in properties ) {
		text.setAttributeNS(null,'stroke-width', properties.strokeWidth );
	} else {
		text.setAttributeNS(null,'stroke-width', 0 );
	}
	if( 'fill' in properties ) {
		text.setAttributeNS(null,'fill', properties.fill );
	}
	if( 'clipPath' in properties ) {
		text.setAttributeNS(null,'clip-path', properties.clipPath );
	}
	text.appendChild( document.createTextNode( textString ) );
	return text;
}

export function createLine( x1, y1, x2, y2, properties ) {
	let line = document.createElementNS(_settings.NS, 'line');
	if( 'id' in properties ) {
		line.setAttributeNS(null, 'id', properties.id );		
	} 
	if( 'endingArrow' in properties ) {
		if( properties.endingArrow ) {
			line.setAttributeNS(null,'marker-end', 'url(#arrow)');
		}
	}
	line.setAttributeNS(null, 'x1', x1 ); 
	line.setAttributeNS(null, 'y1', y1 ); 
	line.setAttributeNS(null, 'x2', x2 ); 
	line.setAttributeNS(null, 'y2', y2 );
	if( 'fill' in properties ) {
		line.setAttributeNS(null, 'fill', properties.fill );
	} 
	if( 'stroke' in properties ) {
		line.setAttributeNS(null, 'stroke', properties.stroke );
	}
	if( 'strokeWidth' in properties ) {
		line.setAttributeNS(null, 'stroke-width', properties.strokeWidth );		 
	}
	if( 'strokeDasharray' in properties ) {
		line.setAttributeNS(null, 'stroke-dasharray', properties.strokeDasharray );				 
	}
	if( 'opacity' in properties ) {
		line.setAttributeNS(null, 'opacity', properties.opacity );
	} 
	return line;
}


export function createCircle( x, y, radius, properties ) {
	let circle = document.createElementNS(_settings.NS, 'circle');
	if( 'id' in properties ) {
		circle.setAttributeNS(null, 'id', properties.id );		
	} 
	circle.setAttributeNS(null, 'cx', x ); 
	circle.setAttributeNS(null, 'cy', y ); 
	circle.setAttributeNS(null, 'r', radius ); 
	if( 'fill' in properties ) {
		circle.setAttributeNS(null, 'fill', properties.fill );
	} 
	if( 'stroke' in properties ) {
		circle.setAttributeNS(null, 'stroke', properties.stroke );
	}
	if( 'strokeWidth' in properties ) {
		circle.setAttributeNS(null, 'stroke-width', properties.strokeWidth );		 
	}
	if( 'opacity' in properties ) {
		circle.setAttributeNS(null, 'opacity', properties.opacity );
	} 
	return circle;
}


export function createSVG( x, y, width, height, properties ) {
	let svg = document.createElementNS(_settings.NS,'svg');
	svg.setAttributeNS(null,'x',x);
	svg.setAttributeNS(null,'y',y);
	svg.setAttributeNS(null,'width', width );
	svg.setAttributeNS(null,'height', height );
	if( 'fill' in properties ) {
		svg.setAttributeNS(null, 'fill', properties.fill);	  
	}
	if( 'id' in properties ) {
		svg.setAttributeNS(null, 'id', properties.id);	  
	}
	return svg; 
}


export function createDefs( appendToSVG ) {
	let defs = document.createElementNS(_settings.NS, 'defs');

	let marker = document.createElementNS(_settings.NS, 'marker');
	marker.setAttribute('id', 'arrow');
	marker.setAttribute('viewBox', '0 0 10 10');
	marker.setAttribute('refX', '5');
	marker.setAttribute('refY', '5');
	marker.setAttribute('markerUnits', 'strokeWidth');
	marker.setAttribute('markerWidth', _settings.ganttLinkArrowWidth ); //ganttSVGWidth*2 / ganttVisibleWidth );
	marker.setAttribute('markerHeight', _settings.ganttLinkArrowHeight ); //ganttSVGWidth*2 / ganttVisibleWidth );
	marker.setAttribute('orient', 'auto');
	let path = document.createElementNS(_settings.NS, 'path');
	path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
	path.setAttribute('fill', '#2f2f2f'/*'url(#blackToGrayGradient)'*/);
	marker.appendChild(path);
	defs.appendChild(marker);   

	let gradient1 = initLinearGradient( [{"color":"#cfcfdf","offset":"0%"},{"color":"#ffffff","offset":"100%"}], 'timeScaleGradient' );
	defs.appendChild(gradient1);

	let gradient2 = initLinearGradient( [{"color":"#f7f7f7","offset":"0%"},{"color":"#ffffff","offset":"100%"}], 'ganttGradient' );
	defs.appendChild(gradient2);

	let gradient3 = initLinearGradient( [{"color":"#2f2f2f","offset":"0%"},{"color":"#afafaf","offset":"100%"}], 'blackToGrayGradient' );
	defs.appendChild(gradient3);

	appendToSVG.appendChild(defs);
}


export function initLinearGradient( stops, name ) {
	let gradient = document.createElementNS(_settings.NS, 'linearGradient');
	for( let i = 0 ; i < stops.length; i++ ) {
		let stop = document.createElementNS(_settings.NS, 'stop');
		stop.setAttribute('offset', stops[i].offset);
		stop.setAttribute('stop-color', stops[i].color);
		gradient.appendChild(stop);
	}
	gradient.id = name;
	gradient.setAttribute('x1', '0');
	gradient.setAttribute('x2', '1');
	gradient.setAttribute('y1', '0');
	gradient.setAttribute('y2', '0');
	return gradient;
}


// Returns the number of week of the year
export function getWeekNumber(d) {
	d = new Date( Date.UTC( d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() ) );
	d.setUTCDate( d.getUTCDate() + 4 - (d.getUTCDay() || 7) );
	var startOfYear = new Date( Date.UTC( d.getUTCFullYear(), 0,1 ) );
	var weekNumber = Math.ceil( ( ( (d - startOfYear) / 86400000 ) + 1 ) / 7 );
	return weekNumber;
}


export function parseDate( dateString ) {
	if( typeof(dateString) === 'undefined' ) {
		return null;
	}
	if( dateString == null ) {
		return null;
	}
	let date = null;
	let y=null, m=null, d=null, hr=null, mn=null;
	let parsedFull = dateString.match( /([0-9]+)[\.\/\-\:]([0-9]+)[\.\/\-\:]([0-9]+)[ T]+([0-9]+)[\:\.\-\/]([0-9]+)/ );
	if( parsedFull !== null ) {
		if( parsedFull.length == 6 ) {
			y = parsedFull[3];
			if( y.length == 2 )		// If a 2-digit year format
				y = "20" + y;
			if( _globals.dateDMY ) {
				m = parsedFull[2];
				d = parsedFull[1];				
			} else {
				d = parsedFull[2];
				m = parsedFull[1];								
			}
			hr = parsedFull[4];
			mn = parsedFull[5];
			date = new Date(y, m-1, d, hr, mn, 0, 0);
		}
	} else {
		let parsedShort = dateString.match( /([0-9]+)[\.\/\-\:]([0-9]+)[\.\/\-\:]([0-9]+)/ );
		if( parsedShort !== null ) {
			if( parsedShort.length == 4 ) {
				y = parsedShort[3];
				if( y.length == 2 )		// If a 2-digit year format
					y = "20" + y;
				if( _globals.dateDMY ) {
					m = parsedShort[2];
					d = parsedShort[1];					
				} else {
					d = parsedShort[2];
					m = parsedShort[1];										
				}
				hr = 0;
				mn = 0;
				date = new Date(y, m-1, d, hr, mn, 0, 0, 0, 0);
			}
		}
	}
	if( date === null ) {
		return null;
	}
	let timeInSeconds = date.getTime();
	return( { 'date':date, 'timeInSeconds':timeInSeconds/1000 } ); 
}


export function parseJSDate( dateString ) {
	if( typeof(dateString) === 'undefined' ) {
		return null;
	}
	if( dateString == null ) {
		return null;
	}
	let date = null;
	let parsedFull = dateString.match( /([0-9]+)[\.\-\/\:]([0-9]+)[\.\-\/\:]([0-9]+)[ T]+([0-9]+)[\:\.\-\/]([0-9]+)/ );
	if( parsedFull !== null ) {
		if( parsedFull.length == 6 ) {
			date = new Date(parsedFull[1], parsedFull[2]-1, parsedFull[3], parsedFull[4], parsedFull[5], 0, 0);
		}
	} else {
		let parsedShort = dateString.match( /([0-9]+)[\.\-\/\:]([0-9]+)[\.\-\/\:]([0-9]+)/ );
		if( parsedShort !== null ) {
			if( parsedShort.length == 4 ) {
				date = new Date(parsedShort[1], parsedShort[2]-1, parsedShort[3], 0, 0, 0, 0);
			}
		}
	}
	if( date === null ) {
		return null;
	}
	let timeInSeconds = date.getTime();
	return( { 'date':date, 'timeInSeconds':timeInSeconds/1000 } ); 
}


export function dateIntoJSDateString( date ) {
	let year = date.getUTCFullYear(); 
	let month = (date.getUTCMonth()+1);
	if( month < 10 ) {
		month = "0" + month;
	}
	let day = date.getUTCDate();
	if( day < 10 ) {
		day = "0" + day;
	}
	let hours = date.getUTCHours();
	if( hours < 10 ) {
		hours = "0" + hours;
	}
	let minutes = date.getUTCMinutes();
	if( minutes < 10 ) {
		minutes = "0" + minutes;
	}
	return( year + "-" + month + "-" + day + "T" + hours + ":" +  minutes + ":00" ); 
}


export function dateIntoSpiderDateString( date, dateOnly=false ) {
	let spiderDateString = null;

	if( typeof(date) === 'undefined' || date === null || date === '' ) {
		return '';
	}

	if( typeof(date) !== 'object' ) { 	// Not 'object' implies seconds
		date = new Date( parseInt(date) * 1000 );
	}
	let year = date.getUTCFullYear(); 
	let month = (date.getUTCMonth()+1);
	if( month < 10 ) {
		month = "0" + month;
	}
	let day = date.getUTCDate();
	if( day < 10 ) {
		day = "0" + day;
	}
	if( _globals.dateDMY ) {
		spiderDateString = day + _globals.dateDelim + month + _globals.dateDelim + year; 
	} else {
		spiderDateString = month + _globals.dateDelim + day + _globals.dateDelim + year;		 
	}
	if( !dateOnly ) {
		let hours = date.getUTCHours();
		if( hours < 10 ) {
			hours = "0" + hours;
		}
		let minutes = date.getUTCMinutes();
		if( minutes < 10 ) {
			minutes = "0" + minutes;
		}
		spiderDateString += "  " + hours + _globals.timeDelim +  minutes;
	}
	return( spiderDateString ); 
}


export function digitsOnly( str ) {
    let l = str.length;
    if( l == 0 ) {
        return false;
    }
    for( let i = 0 ; i < l ; i++ ) {
        if( str[i] === ' ' ) {
            continue;
        }
        if( (str[i] < '0' || str[i] > '9') ) {
            return false;
        }
    }
    return true;
}


export function setCookie( cname, cvalue, exdays=3650 ) {
	if( exdays == null ) {
		document.cookie = cname + "=" + cvalue + "; path=/";
	}
	else {
		let d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		let expires = "expires="+ d.toUTCString();		
		document.cookie = cname + "=" + cvalue + ";" + expires + "; path=" + window.location.pathname;
		//document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/";
		//document.cookie = cname + "=" + cvalue + ";" + expires;
	}
}


export function deleteCookie( cname ) {
	document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + window.location.pathname;
	//document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	//document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}


export function getCookie( cname, type='string' ) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for( let i = 0 ; i < ca.length ; i++ ) {
		let c = ca[i];
		while( c.charAt(0) == ' ' ) {
			c = c.substring(1);
		}
		if( c.indexOf(name) == 0 ) {
			let value = c.substring(name.length, c.length);
			if( type == 'string' ) {
				return value;
			}
			if( type == 'int' ) {
				let intValue = parseInt(value);
				if( !isNaN(intValue) ) {
					return intValue;
				}
			}
			if( type == 'float' ) {
				let floatValue = parseFloat(value);
				if( !isNaN(floatValue) ) {
					return floatValue;
				}
			}
			return null;
		}
	}
	return null;
}


export function moveElementInsideArrayOfObjects( arr, from, to ) {	
	var elToMove = {};
	for( let key in arr[from] ) {
		elToMove[key] = arr[from][key];
	}
	if( from < to ) {
		for( let i = from+1 ; i <= to ; i++ ) {
			for( let key in arr[i] ) {
				arr[i-1][key] = arr[i][key];
			}
		}
	} else if( to < from ) {
		for( let i = from-1 ; i >= to ; i-- ) {
			for( let key in arr[i] ) {
				arr[i+1][key] = arr[i][key];
			}
		}
	}
	for( let key in elToMove ) {
		arr[to][key] = elToMove[key];
	}
}


export function copyArrayOfObjects( arrFrom, arrTo ) {	
	if( arrTo.length == 0 ) {
		for( let i = 0 ; i < arrFrom.length ; i++ ) {
			arrTo.push({});
		}
	}

	for( let i = 0 ; i < arrFrom.length ; i++ ) {
		for( let key in arrFrom[i] ) {
			arrTo[i][key] = arrFrom[i][key];
		}
	}
}


export function swapValuesInObject( o, key1, key2, swapKey ) {
    let temp = o[key1][swapKey];
    o[key1][swapKey] = o[key2][swapKey];
    o[key2][swapKey] = temp;
}


export function decColorToString( decColor, defaultColor=null ) {
	if( typeof(decColor) !== 'undefined' ) {		
		if( decColor ) {
			if( digitsOnly(decColor) ) {
				decColor = Number(decColor);
				if( decColor > 0xFFFFFF ) {
					return defaultColor;
				}
				let c1 = (decColor & 0xFF0000) >> 16;
				let c1text = c1.toString(16);
				if( c1text.length == 1 ) {
					c1text = "0" + c1text;
				}
				let c2 = (decColor & 0x00FF00) >> 8;
				let c2text = c2.toString(16);
				if( c2text.length == 1 ) {
					c2text = "0" + c2text;
				}
				let c3 = (decColor & 0x0000FF);	  
				let c3text = c3.toString(16);
				if( c3text.length == 1 ) {
					c3text = "0" + c3text;
				}
				return '#' + c3text + c2text + c1text;
			}
		}
	}
	return defaultColor;
}


export function padWithNChars( n, char ) {
	let s = '';
	for( let i = 0 ; i < n ; i++ ) {
		s += char;
	}
	return s;
}

export function spacesToPadNameAccordingToHierarchy( hierarchy ) {
	let s = '';
	for( let i = 0 ; i < hierarchy ; i++ ) {
		s += '   '; // figure space: ' ', '·‧', '•', '⁌','|'
	}
	return s;
}


export function removeClassFromElement( element, className ) {
	let replace = '\\b' + className + '\\b';
	let re = new RegExp(replace,'g');
	element.className = element.className.replace(re, '');
}

export function addClassToElement( element, className ) {
	let classArray;
	classArray = element.className.split(' ');
	if( classArray.indexOf( className ) == -1 ) {
		element.className += " " + className;
	}
}


export function findPositionOfElementAtPage( el ) {
	if( typeof( el.offsetParent ) !== 'undefined' ) {
		let posX, posY;
		for( posX = 0, posY = 0; el ; el = el.offsetParent ) {
			posX += el.offsetLeft;
			posY += el.offsetTop;
		}
		return [ posX, posY ];
	} else {
		return [ el.x, el.y ];
	}
}


export function getCoordinatesOfClickOnImage( imgId, event ) {
	let posX = 0, posY = 0;
	let imgPos = findPositionOfElementAtPage( imgId );
	let e = ( event ) ? event : window.event;

	if( e.pageX || e.pageY ) {
		posX = e.pageX;
		posY = e.pageY;
	} else if( e.clientX || e.clientY ) {
		posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	posX = posX - imgPos[0];
	posY = posY - imgPos[1];

	let right = ( posX > parseInt( imgId.clientWidth/2 ) ) ? 1 : 0;
	let lower = ( posY > parseInt( imgId.clientHeight/2 ) ) ? 1 : 0;

	return [ posX, posY, right, lower ];
}


export function filterInput( id, patternStr='([^0-9]+)', minValue=100, maxValue=10000, defaultValue=100 ) {
	let start = id.selectionStart;
	let end = id.selectionEnd;
	
	const currentValue = id.value;
	const pattern = new RegExp(patternStr, 'g');
	let correctedValue = currentValue.replace(pattern, '');
	id.value = correctedValue;
	if( correctedValue.length < currentValue.length) {
		end--;
	}
	id.setSelectionRange(start, end);   

    return correctedValue;
}


export function trimString( str ) {
  return str.replace(/^\s+|\s+$/gm,'');
}


export function formatNumberStringForTable( str, type='int', radix=2 ) {
	let ret = '';
	let intValue;   	
	let isNegative = false;

	if( type === 'float' ) {
		let floatValue = parseFloat( str );
		if( isNaN(floatValue) ) {
			return str;
		}
		if( !(floatValue < 0) ) {
			intValue = Math.floor( floatValue );
		} else {	
			intValue = Math.floor( Math.abs(floatValue) );
			isNegative = true;
		}
		let power = Math.pow(10,radix);
		let afterDecimal = parseInt(Math.abs(floatValue)*power - intValue*power + 0.5)/power;
		// let afterDecimal = (Math.abs(floatValue) - intValue).toFixed(radix);
		if( !(afterDecimal < 1.0) ) {
			afterDecimal = 0.0;
			intValue += 1;
		}
		if( radix > 0 ) {
			for( let i = 0 ; i < radix ; i++ ) {
				let digit = Math.floor(afterDecimal*10);
				afterDecimal = afterDecimal*10 - digit;
				ret += digit;
			}
			ret = '.' + ret;
		}
	} else {
	    intValue = parseInt( str );
		if( isNaN(intValue) ) {
			return str;
		}
		if( intValue < 0 ) {
			isNegative = true;
			intValue = -intValue;
		}
	}
	if( intValue == 0 ) {
		ret = '0' + ret;
	} else {
		for( let i = 1 ; ; i++ ) {
			ret = Math.floor(intValue % 10).toString() + ret;
			intValue = Math.floor(intValue/10);
			if( !(intValue > 0) ) {
				break;
			}
			if( i % 3 == 0 ) {
				ret = ' ' + ret;
			}
		}
	}
	if( isNegative ) {
		ret = '-' + ret;
	}
	return ret;
}


export function csvIntoJSON(s) {
	
	let lines = s.split('\n');
	if( lines.length < 2 ) {
		return [];
	}
	let titles = lines[0].split('\t');
	if( titles < 3 ) {
		return [];
	}		
	titles[titles.length-1] = trimString( titles[titles.length-1] );

	let json = [];
	for( let i = 1 ; i < lines.length ; i++ ) {
		let jsonLine = {};
		let line = lines[i].replace( String.fromCharCode(1), '\n' );
		let values = line.split('\t');
		if( values.length != titles.length ) {
			break;
		}
		for( let t = 0 ; t < titles.length ; t++ ) {
			jsonLine[ titles[t] ] = values[t]; 
		}
		json.push(jsonLine);
	}
	return json;
}

export function getElementPosition(el) {
	let lx=0, ly=0
    for( ; el != null ; ) {
		lx += el.offsetLeft;
		ly += el.offsetTop;
		el = el.offsetParent;    	
    }
    return {x:lx, y:ly};
}

