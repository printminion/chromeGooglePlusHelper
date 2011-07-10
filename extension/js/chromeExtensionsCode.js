/**
 * you can't use here the background page
 */

// In a content script
var port = undefined;
// chrome.extension.connect({
// name : 'chrome-google-plus-helper'
// });

getPort().postMessage({
	message : "registerPort"
});

var STATUS_LOADING = 1;
var STATUS_READY = 2;

var status = STATUS_READY;

var container = undefined;

var actions = new Actions();

var gplushelper = new GPlusHelper();
gplushelper.init();

var lastPostId = undefined;

function getPort() {

	if (!port) {

		console.log('create port');

		port = chrome.extension.connect({
			name : 'chrome-google-plus-helper'
		});
	}
	return port;
}

function GPlusHelper() {

	this.init = function() {

		/*
		 * this.addNotifier();
		 * 
		 * this.extendUI();
		 */

		var url = this.getFullUrlByLocation(window.location);

		var result = url.search(/plus.google.com/);
		if (result == -1) {
			return;
		}

		/*
		 * check if user post
		 */
		data = this.analyzePage(url);

		getPort().postMessage({
			message : "onActivatePageAction"
		});

		this.initHomePage(data.notificationOn);

		/*
		 * var placeholderObj = document.querySelector('header');
		 * 
		 * if (placeholderObj) {
		 * 
		 * var script = document.createElement("script"); var attrClass =
		 * document.createAttribute("src");
		 * 
		 * attrClass.nodeValue =
		 * '//translate.google.com/translate_a/element.js?cb=googleSectionalElementInit&ug=section&hl=auto';
		 * script.setAttributeNode(attrClass);
		 * 
		 * placeholderObj.appendChild(script); }
		 */

	};

	this.analyzePage = function(url) {
		// https://plus.google.com/
		// https://plus.google.com/104512463398531242371/posts
		// https://plus.google.com/104512463398531242371/posts/jdw7brnkX9H

		var pageInfo = {
			url : url,
			type : undefined,
			notificationOn : false
		};

		var qRe = new RegExp(
				"^https://plus.google.com/([0-9]+)/posts/([a-zA-Z0-9]+)$");
		var test = qRe.exec(url);

		/*
		 * check if user page
		 */
		qRe = new RegExp("^https://plus.google.com/([0-9]+)/posts/$");
		test = qRe.exec(url);

		/*
		 * check home
		 */
		qRe = new RegExp("^https://plus.google.com/u/0/$");
		test = qRe.exec(url);
		pageInfo.notificationOn = (test || pageInfo.notificationOn) ? true
				: false;

		// https://plus.google.com/u/0/104512463398531242371/posts

		/*
		 * check home
		 */
		qRe = new RegExp("^https://plus.google.com/$");
		test = qRe.exec(url);
		pageInfo.notificationOn = (test || pageInfo.notificationOn) ? true
				: false;

		return pageInfo;

	};

	this.initHomePage = function(bNotificationOn) {

		var container = document.querySelector("div.a-b-f-i-oa");
		if (container == undefined) {
			return;
		}

		if (!container.addEventListener) {
			return;
		}

		(function(component) {
			container.addEventListener('DOMNodeInserted', function(e) {

				// console.log('DOMNodeInserted', e.target.id, e.target);

				// a-b-f-i-p-R

				var idBegin = e.target.id.substring(0, 7);
				if (idBegin == 'update-') {
					lastPostId = e.target.id;
					console.log('onBeforePostAdded', lastPostId);
					return;
				}

				var classAttribute = e.target.getAttribute('class');

				if (classAttribute == 'a-Ja-h a-b-h-Jb a-f-i-Ad') {
					console.log('onPostAdded', lastPostId, e.target
							.getAttribute('href'));

					/*
					 * check notifications settings
					 */
					chrome.extension.sendRequest({
						action : "checkNotificationON",
						lastPostId : lastPostId
					}, function(response) {
						console.log('response.notificationOn',
								response.notificationOn);

						if (!response.notificationOn) {
							console.log('...no notification');
							return;
						}
						var postObj = document.querySelector('#' + response.lastPostId);

						if (!postObj) {
							console.log('failed to get html by ' + '#' + response.lastPostId);
							return;
						}

						/*
						 * send notification
						 */
						getPort().postMessage(
								{
									message : "onNewPost",
									id : postObj.id,
									url : 'https://plus.google.com/'
											+ e.target.getAttribute('href'),
									html : postObj.innerHTML
								});

					});

					lastPostId = undefined;
					fetchTabInfo("fetchOnUpdate");

				}

			}, false);

		})(this);

	};

	this.getFullUrlByLocation = function(location) {

		var url = location.href;

		return url;

	};
}

/*
 * container.addEventListener('DOMNodeInserted', function(e){
 * 
 * console.log('DOMNodeInserted', e.target.id);
 * 
 * var idBegin = e.target.id.substring(0, 7); if (idBegin == 'update-') {
 * console.log(e.target.innerHTML); return; } }, false);
 * 
 * 
 * function DOMNodeInserted(e) { console.log('DOMNodeInserted', e); }
 */

getPort().onMessage.addListener(function(msg) {
	console.log("The extension said: " + msg.message + " with values: "
			+ msg.values, msg);

	console.log('onMessage', msg);

	switch (msg.message) {
	case 'update':
		fetchTabInfo('update');
		break;
	case 'checkForUpdate':
		/*
		 * fetchTabInfo('checkForUpdate');
		 * 
		 * if (status == STATUS_LOADING) { fetchTabInfo('checkForUpdate2');
		 * 
		 * return; } fetchTabInfo('checkForUpdate3');
		 * 
		 * checkForUpdate();
		 */
	case 'updateTabInfo':
		fetchTabInfo('updateTabInfo');
		break;
	default:
		// fetchTabInfo('...nothing to do');
		console.log('unknow messade:', msg);
		break;
	}

});

/*
 * chrome.extension.sendRequest({ 'action' : 'fetchTabInfo' }, fetchTabInfo);
 * 
 * chrome.extension.onRequest.addListener(function(request, sender,
 * sendResponse) { console.log('extension.onRequest');
 * 
 * if (request.action == 'updateTabInfo') { fetchTabInfo('updateTabInfo'); }
 * 
 * });
 */

/*
 * 
 * function checkForUpdate() { console.log('checkForUpdate...');
 * 
 * status = STATUS_LOADING; xmlhttpPost('GET',
 * 'https://plus.google.com/u/0/_/n/guc?_reqid=680986&rt=j'); }
 * 
 * function xmlhttpPost(type, strURL) { console.log('xmlhttpPost', type,
 * strURL);
 * 
 * var xmlHttpReq = false; // Mozilla/Safari xmlHttpReq = new XMLHttpRequest();
 * 
 * xmlHttpReq.open(type, strURL, true);
 * xmlHttpReq.setRequestHeader('Content-Type',
 * 'application/x-www-form-urlencoded'); xmlHttpReq.onreadystatechange =
 * function() { if (xmlHttpReq.readyState == 4) { status = STATUS_READY;
 * updatepage(xmlHttpReq.responseText); } };
 * 
 * xmlHttpReq.send(strURL); }
 * 
 * 
 * function updatepage(response) { console.log('updatepage', response); }
 */

function UIExtender() {

}

var uiExtender = UIExtender();

function fetchTabInfo(selectedPacketName) {
	console.log('content_scripts.fetchTabInfo:' + selectedPacketName);
	var attrClass = undefined;
	var postObj = undefined;

	/*
	 * get home stream
	 */
	var streamObj = document.querySelector("div.a-b-f-i-oa");

	/*
	 * get post stream
	 */
	if (!streamObj) {
		streamObj = document.querySelector("div.a-Wf-i-M");
	}

	if (!streamObj) {
		console.log('failed to get stram for extension');
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
			}
			;
		}
		;
	}
	;
};

function extendPostArea(o) {
	console.log('extendPostArea...');

	var placeholderObj = o.querySelector("div.a-f-i-bg");

	extentPostActions(placeholderObj, 'Tweet', function() {
		actions.doTweet(parsePostData(this));
	}, 'Click to tweet this post');

	extentPostActions(placeholderObj, 'Translate', function() {
		actions.doTranslate(parsePostData(this));
	}, 'Click to translate this post');

	extentPostActions(placeholderObj, 'Bookmark', function() {
		actions.doBookmark(parsePostData(this));
	}, 'Click to bookmark this post');

	// http://www.google.com/webhp?hl=en#sclient=psy&hl=en&site=webhp&source=hp&q=%22test%22+site:plus.google.com&pbx=1&oq=%22test%22+site:plus.google.com&aq=f&aqi=&aql=f&gs_sm=e&gs_upl=968l968l0l1l1l0l0l0l0l157l157l0.1l1&bav=on.2,or.r_gc.r_pw.&fp=ad93d5a0dc8b6623&biw=1280&bih=685

	/*
	 * .wsa { background-position: -102px -117px; }
	 * 
	 * .wsa { cursor: default; display: inline; height: 14px; margin-left: 5px;
	 * vertical-align: 0; width: 14px; }
	 * 
	 * .wsa, .wxs, .wpb { background: url(/images/experiments/nav_logo78.png)
	 * no-repeat; border: 0; cursor: pointer; display: none; margin-right: 3px;
	 * height: 0px; vertical-align: bottom; width: 0px; }
	 * 
	 * <button class="wsa wss" style="margin-left:0"></button>
	 */

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
	txt.innerHTML = "&nbsp;&nbsp;-&nbsp;&nbsp;";

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
			}
			;

		}
		;

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

	}
	;
}

function Actions() {

	this.doTweet = function(data) {
		try {
			getPort().postMessage({
				message : "doTweet",
				values : []
			});
			window.open('https://twitter.com/intent/tweet?text='
					+ encodeURIComponent(data.text + ' #googleplus') + '&url='
					+ encodeURIComponent(data.url));
		} catch (e) {
			alert('failed open window');
		}
		;
	};

	this.doTranslate = function(data) {
		try {
			getPort().postMessage({
				message : "doTranslate",
				values : []
			});
			window.open('http://translate.google.com/#auto|en|'
					+ encodeURIComponent(data.text + ' #googleplus '));
		} catch (e) {
			alert('failed open window');
		}
		;
	};

	this.doBookmark = function(data) {
		try {
			getPort().postMessage({
				message : "doBookmark",
				values : []
			});

			window
					.open('https://www.google.com/bookmarks/api/bookmarklet?output=popup'
							+ '&srcUrl='
							+ encodeURIComponent(data.url)
							+ '&snippet='
							+ encodeURIComponent(data.text)
							+ '&title='
							+ encodeURIComponent('Google+ Bookmark'));

		} catch (e) {
			alert('failed open window');
		}
		;
	};

}
