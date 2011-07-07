//var probeManager = chrome.extension.getBackgroundPage();

var status = STATUS_READY;
var STATUS_LOADING = 1;
var STATUS_READY = 2;


// In a content script
var port = chrome.extension.connect({
	name : 'chrome-google-plus-helper'
});

port.onMessage.addListener(function(msg) {
	console.log("The extension said: " + msg.message + " with values: "
			+ msg.values);

	console.log('onMessage', msg);

	if (msg.message == 'update') {
		fetchTabInfo('update');
	} else if (msg.message = 'checkForUpdate') {
		fetchTabInfo('checkForUpdate');
		
		if (status == STATUS_LOADING) {
			fetchTabInfo('checkForUpdate2');
			
			return;
		}
		fetchTabInfo('checkForUpdate3');
		
		checkForUpdate();
	} else {
		fetchTabInfo('...nothing to do');		
	}

});

//port.postMessage({
//	message : "Hello!",
//	values : [ 1, 2, 3 ]
//});

chrome.extension.sendRequest({
	'action' : 'fetchTabInfo'
}, fetchTabInfo);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log('extension.onRequest');

	if (request.action == 'updateTabInfo') {
		fetchTabInfo('updateTabInfo');
	}

});

function checkForUpdate() {
	console.log('checkForUpdate...');
	
	status = STATUS_LOADING;
	xmlhttpPost('GET', 'https://plus.google.com/u/0/_/n/guc?_reqid=680986&rt=j');	
}

function xmlhttpPost(type, strURL) {
	console.log('xmlhttpPost', type, strURL);
	
	var xmlHttpReq = false;
	// Mozilla/Safari
	xmlHttpReq = new XMLHttpRequest();

	xmlHttpReq.open(type, strURL, true);
	xmlHttpReq.setRequestHeader('Content-Type',
			'application/x-www-form-urlencoded');
	xmlHttpReq.onreadystatechange = function() {
		if (xmlHttpReq.readyState == 4) {
			status = STATUS_READY;
			updatepage(xmlHttpReq.responseText);
		}
	};

	xmlHttpReq.send(strURL);
}

function updatepage(response) {
	console.log('updatepage', response);
}

function fetchTabInfo(selectedPacketName) {
	console.log('content_scripts.fetchTabInfo:' + selectedPacketName);

	var streamObj = document.querySelector("div.a-b-f-i-oa");

	var attrClass = undefined;
	var postObj = undefined;

	if (!streamObj) {
		return;
	}

	for ( var i = 0; i < streamObj.childElementCount; i++) {
		// console.log('found element...');

		postObj = streamObj.childNodes[i];

		if (postObj) {

			if (!postObj.getAttributeNode('mk-extended')) {
				attrClass = document.createAttribute('mk-extended');
				attrClass.nodeValue = 'true';
				postObj.setAttributeNode(attrClass);
				extendPostArea(postObj);
			};
		};
	};
};

function extendPostArea(o) {
	console.log('extendPostArea...');

	var placeholderObj = o.querySelector("div.a-f-i-bg");

	extentPostActions(placeholderObj, 'Tweet', function() {
		doTweet(parsePostData(this));
	}, 'Click to tweet this post');

	extentPostActions(placeholderObj, 'Translate', function() {
		doTranslate(parsePostData(this));
	}, 'Click to translate this post');

}

/**
 * create element
 * 
 * @param placeholderObj
 */
function extentPostActions(placeholderObj, title, callback, alt) {
	if (!placeholderObj) {
		return;
	}
	var txt = document.createElement("txt");
	txt.innerText = " - ";

	// <span role="button" class="d-h a-b-f-i-Zd-h">Twitt</span>
	var span = document.createElement("span");
	span.innerText = title;

	var attrClass = document.createAttribute("class");
	attrClass.nodeValue = 'd-h';
	span.setAttributeNode(attrClass);

	var attrAlt = document.createAttribute("alt");
	attrAlt.nodeValue = alt;
	span.setAttributeNode(attrAlt);

	span.onclick = callback;

	placeholderObj.appendChild(txt);
	placeholderObj.appendChild(span);
}

function parsePostData(o) {
	console.log('parsePostData', o);

	var updateDiv = undefined;
	var currentElement = o;

	while (currentElement.parentElement) {
		currentElement = currentElement.parentElement;

		if (currentElement.getAttribute('id')) {
			var idBegin = currentElement.getAttribute('id').substring(0, 7);
			if (idBegin == 'update-') {
				updateDiv = currentElement;
				break;
			};

		};

	}

	if (updateDiv) {
		// console.log(updateDiv);
		var postUrlObj = currentElement.querySelector("a.a-Ja-h");
		// console.log(postUrlObj);
		/*
		 * try to get comment
		 */
		var postTextObj = null;

		postTextObj = currentElement.querySelector("div.a-b-f-i-u-ki");

		if (postTextObj && postTextObj.innerText == '') {
			postTextObj = currentElement.querySelector("div.a-b-f-i-p-R");
		}

		if (!postTextObj) {
			postTextObj = currentElement.querySelector("div.a-b-f-i-p-R");
		}
		// a-f-i-u-ki

		return {
			text : postTextObj.innerText,
			url : 'https://plus.google.com/' + postUrlObj.getAttribute('href'),
			author : ''
		};

	};
}

function doTweet(data) {
	try {
		port.postMessage({
			message : "doTweet",
			values : []
		});
		window.open('https://twitter.com/intent/tweet?text='
				+ encodeURIComponent(data.text + ' #googleplus') + '&url='
				+ encodeURIComponent(data.url));
	} catch (e) {
		alert('failed open window');
	};
}

function doTranslate(data) {
	try {
		port.postMessage({
			message : "doTranslate",
			values : []
		});
		window.open('http://translate.google.com/#auto|en|'
				+ encodeURIComponent(data.text + ' #googleplus '));
	} catch (e) {
		alert('failed open window');
	};
};
