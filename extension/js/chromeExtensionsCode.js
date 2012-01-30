/**
 * you can't use here the background page
 */

var port = undefined;

var assets = new Assets();
var activityParser = new GPlusActivityParser(assets);

// getPort().postMessage({
// message : "registerPort"
// });

getPort();

var STATUS_LOADING = 1;
var STATUS_READY = 2;

var status = STATUS_READY;

var container = undefined;

var actions = new Actions();
var uiExtender = new UIExtender();

var gplushelper = new GPlusHelper();

chrome.extension.sendRequest({
	action : "getSettings"
}, function(response) {
	// console.log('response.getSettings', response);
	gplushelper.settings = response.settings;
	gplushelper.chromeBookmarsFolderId = response.chromeBookmarsFolderId;
	
	gplushelper.init();

});


var lastPostId = undefined;

function getPort() {

	if (!port) {

		console.log('no port:create port');

		port = chrome.extension.connect({
			name : 'chrome-google-plus-helper'
		});
	}
	return port;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log('extension.onRequest', request);

	switch (request.action) {
	case 'initTab':
		getPort();
		break;
	default:

		break;
	}
});

/**
 * @returns {GPlusHelper}
 */
function GPlusHelper() {

	this.settings = undefined;
	this.pageInfo = new PageInfo();
	this.chromeBookmarsFolderId = 2;
	
	this.init = function() {


		/*
		 * add script
		 */
		if (this.settings.addPlusOne == 'true') {
			uiExtender.preExtendPostWithPlusOne();
		}
		
		var url = this.getFullUrlByLocation(window.location);

		var result = url.search(/plus.google.com/);
		if (result == -1) {
			return;
		}

		/*
		 * check if user post
		 */
		this.analyzePage(url);

		getPort().postMessage({
			message : "onActivatePageAction"
		});

		this.initHomePageToolbar();
		this.initHomePage();

	};

	this.analyzePage = function(url) {
		console.log('analyzePage...');

		// https://plus.google.com/
		// https://plus.google.com/104512463398531242371/posts
		// https://plus.google.com/104512463398531242371/posts/jdw7brnkX9H

		this.pageInfo = new PageInfo();

		this.pageInfo.url = url;
		this.pageInfo.type = this.pageInfo.getPageType(url);
		this.pageInfo.notificationOn = this.pageInfo.ifNotificationPage(url);

		console.log('analyzePage... ..done', this.pageInfo);

		return this.pageInfo;

	};

	this.initHomePage = function() {
		console.log('initHomePage...');

		// bNotificationOn

		var container = document.querySelector(assets.gpContentPane);
		if (container == undefined) {
			console.log('[e]Failed to get the contain pane', assets.gpContentPane);
			return;
		}

		if (!container.addEventListener) {
			return;
		}

		(function(component) {
			container.addEventListener('DOMNodeInserted', function(e) {

				var idPrefix = e.target.id ? e.target.id.substring(0, 7) : undefined;

				if (idPrefix != 'update-') {
					return;
				}

				lastPostId = e.target.id;
				console.log('[i]onBeforePostAdded', lastPostId);

				/*
				 * get post url
				 */

				if (e.target.getAttribute('class') != assets.gpPostUrl) {
					console.log('[w]failed to get assets.gpPostUrl');
					return;
				}
				
				/*
				 * take only Actions from the top
				 */
				var currentActionHTMLObj = e.target;
				
				if(currentActionHTMLObj.parentNode.getAttribute('class') == assets.gpContainerStreamClass) {
				
					if (currentActionHTMLObj.parentNode.firstChild.getAttribute('id') != lastPostId){
						console.log('[w]skip Action - got it not from the top', lastPostId);
						return;
					}
				}
					
				
				
				console.log('onActivityAdded', lastPostId, e.target.getAttribute('href'));

				/*
				 * TODO add notification - NOT
				 */

				if (!component.pageInfo.notificationOn) {
					console.log('...no notifications for this page');
					return;
				}
				/*
				 * check notifications settings
				 */
				chrome.extension.sendRequest({
					action : "getSettings"
				}, function(response) {
					console.log('response.getSettings', response.settings);

					if (!response.settings.notificationOn) {
						console.log('...no notification');
						return;
					}

					// var postObj = document.querySelector('#' + lastPostId);
					//
					// if (!postObj) {
					// console.log('failed to get html by ' + '#'
					// + lastPostId);
					// return;
					// }

					/*
					 * send notification
					 */

					if (response.settings.isApiEnabled == true || response.settings.isApiEnabled == 'true') {
						var activityId = activityParser.parseActivityId(e.target);
						console.log('activityId', activityId);

						getPort().postMessage({
							message : "onNewPostViaApi",
							activity : {
								id : activityId
							},
							callback : undefined,
							force : true
						});

					} else {
						var activity = activityParser.parseActivityHTML(e.target);
						console.log('parseActivityHTML', activity);

						getPort().postMessage({
							message : "onNewPost",
							activity : activity,
							callback : undefined
						});
					}

				});

				lastPostId = undefined;
				fetchTabInfo("fetchOnUpdate");

			}, false);

		})(this);

	};

	this.initHomePageToolbar = function() {
		console.log('initHomePageToolbar...');
		if (this.settings.addChromeBookmarks != 'true' && this.settings.addChromeBookmarksToolbar != 'true') {
			return;
		}
		var miniToolbarObj = document.querySelector(assets.gpToolbar);// div.oLO5kc");

		if (!miniToolbarObj) {
			console.log('[w]Failed to get assets.gpToolbar');
			return;
		}

		var buttonObj = document.createElement("a");
		buttonObj.href = '#';

		var attrClass = document.createAttribute("class");

		attrClass.nodeValue = assets.gpToolbarButton;

		var attrClass2 = document.createAttribute("aria-label");
		attrClass2.nodeValue = 'Bookmarks';
		buttonObj.setAttributeNode(attrClass2);

		/*
		 * action on bookmark klick
		 */
		(function(chromeBookmarsFolderId) {
			buttonObj.onclick = function(e) {
				e.stopPropagation();
				chrome.extension.sendRequest({
					action : "doOpenLink",
					values : {
						url : 'chrome://bookmarks/?#' + chromeBookmarsFolderId,
						target : 'bookmarks'
					}
				}, function() {
				});

				return false;
			};
		})(this.chromeBookmarsFolderId);

		buttonObj.setAttributeNode(attrClass);
		buttonObj.innerHTML = '<span class="' + assets.gpToolbarButtonInner + ' mk-toolbar-bookmark" data-tooltip="Bookmarks"></span>';// mZxz3d

		miniToolbarObj.appendChild(buttonObj);


		/*
		 * move search field to the right
		 */

		var o = document.getElementById(assets.gpToolbarSearchFieldId);
		if (o) {
			var attrStyle = document.createAttribute("style");
			attrStyle.nodeValue = 'margin-left: 45px!important;';
			o.setAttributeNode(attrStyle);
		}





	};

	this.addHashTagsUrls = function(element, callback) {

		var replaceWith = '$1<a href="https://plus.google.com/s/%23$2" target="_blank">#$2</a>';
		var hashtagged = element.innerText.replace(/(| |,)#([A-Za-z0-9_-]+)/g, replaceWith);

		if (element.innerHTML != hashtagged) {

			var hashtagged = element.innerHTML.replace(/(| |,)#([A-Za-z0-9_-]+)/g, replaceWith);

			callback(hashtagged);

		}

		callback(undefined);

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
	console.log("The extension said: " + msg.message + " with values: " + msg.values, msg);

	console.log('onMessage', msg.message, msg);

	switch (msg.message) {
	case 'doAction':
		
		msg.callback(msg.action);
		
	break;
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

function fetchTabInfo(selectedPacketName) {
	console.log('content_scripts.fetchTabInfo:' + selectedPacketName);

	/*
	 * get home stream
	 */
	var streamObj = document.querySelector(assets.gpContainerStream);// div.a-b-f-i-oa

	/*
	 * get post stream on profile
	 */
	if (!streamObj) {
		streamObj = document.querySelector(assets.gpContainerStreamProfile);// div.a-Wf-i-M");
	}

	/*
	 * get post
	 */
	if (!streamObj) {
		streamObj = document.querySelector(assets.gpContainerStreamPost);// div.a-Wf-i-M");
	}
	
	if (!streamObj) {
		console.log('failed to get stream for extension');
		return;
	}

//	chrome.extension.sendRequest({
//		action : "getSettings"
//	}, function(response) {
//		console.log('response.getSettings', response);
//
//		var settings = response.settings;

	var attrClass = undefined;
	var postObj = undefined;
	
		for ( var i = 0; i < streamObj.childElementCount; i++) {
			// console.log('found post element...');

			postObj = streamObj.childNodes[i];

			if (postObj) {

				if (!postObj.getAttributeNode('mk-extended')) {
					attrClass = document.createAttribute('mk-extended');
					attrClass.nodeValue = 'true';
					postObj.setAttributeNode(attrClass);
					uiExtender.extendPostArea(postObj,  gplushelper.settings);
				}
				;
			}
			;
		}
		;

//	});

};

function UIExtender() {
	
	this.extendPostArea = function(o, settings) {
		// console.log('extendPostArea...');

//		if (settings.addHashtags == 'true') {
//			this.addHashtags(o);
//		}
//		;

		// if (settings.addHashtagsComments == 'true') {
		// var commentsObj = o.querySelectorAll("span.a-f-i-W-p");
		//
		// }

		var placeholderObj = o.querySelector(assets.gpPostBottomControls);// div.a-f-i-bg

		if (!placeholderObj) {
			console.log('error: failed to get the placeholder for actions. set assets.gpPostBottomControls');
			return;
		}

		if (settings.addTwitter == 'true') {
			this.extendPostWithAction(placeholderObj, 'Tweet', function() {
				//actions.doTweet(getActivityData(this));
				
				getActivityDataWithCallback(this, function(activity) {
					actions.doTweet(activity);
				});
				
			}, 'Click to tweet this post');
		}

		if (settings.addFacebook == 'true') {

			this.extendPostWithAction(placeholderObj, 'Facebook', function() {
				getActivityDataWithCallback(this, function(activity) {
					actions.doFacebook(activity);
				});
				
			}, 'Click to post on Facebook');

		}

		if (settings.addTranslate == 'true') {
			this.extendPostWithAction(placeholderObj, 'Translate', function() {
				getActivityDataWithCallback(this, function(activity) {
					actions.doTranslate(activity);
				});

			}, 'Click to translate this post');

		}

		// if (settings.addTranslate == 'true') {
		// this.extendPostWithAction(placeholderObj, 'Translate', function() {
		// actions.doTranslate(getActivityData(this));
		// }, 'Click to translate this post');
		//
		// console.log('o', o);
		//
		// this.extendPostWithAction(placeholderObj, 'T2', function() {
		// // div. > div.vg
		// // div. > div.vg-translate
		//
		// // new google.translate.SectionalElement({
		// // sectionalNodeClassName: 'goog-trans-section',
		// // controlNodeClassName: 'goog-trans-control',
		// // background: '#f4fa58'
		// // }, 'google_sectional_element');
		//
		// }, 'Click to translate this post');
		//
		// }

		if (settings.addBookmarks == 'true') {

			this.extendPostWithAction(placeholderObj, 'Bookmark', function() {
				getActivityDataWithCallback(this, function(activity) {
					actions.doBookmark(activity);
				});
				
			}, 'Click to bookmark this post');

		}

		if (settings.addDelicious == 'true') {

			this.extendPostWithAction(placeholderObj, 'Delicious', function() {
				getActivityDataWithCallback(this, function(activity) {
					actions.doDelicious(activity);
				});
				
			}, 'Click to bookmark this post on Delicious');

		}

		if (settings.isDebug == 'true') {
			this.extendPostWithAction(placeholderObj, 'N', function() {
		
				var activityId = activityParser.parseActivityId(getActivityHTMLNode(this));
				console.log('activityId', activityId);
		
				//div.innerHTML = '<g:plusone href="' + activity.url + '" size="small" ' + count + ' callback="_onPlusOne" ></g:plusone>';
		
				getPort().postMessage({
					message : "onNewPostViaApi",
					activity : {
						id : activityId
					},
					force : true
				});
		
			}, 'notify by api');
		}
		
		if (settings.isDebug == 'true') {
			
			this.extendPostWithAction(placeholderObj, 'pN', function() {
		
				var activity = getActivityData(this);
				
				console.log('getActivityDataElement', 'chrome-extension://dpcjjcbfdjminkagpdbbmncdggifmbjh/notification_helper.html?id=' + activity.id);
				getPort().postMessage({
					message : "onNewPost",
					activity : activity,
					force : true
				});
		
			}, 'parse and notify');
		}
		
		// .a-b-f-i-p span.a-f-i-yj
		var placeholderIconsObj = o.querySelector(assets.gpPostUpperControls);// .a-b-f-i-p
		// span.a-f-i-yj");

		if (!placeholderIconsObj) {
			console.log('error: failed to get the placeholder for icons');
			return;
		}

		if (settings.addPlusOne == 'true') {

			this.extendPostWithPlusOne(placeholderIconsObj, getActivityData(placeholderObj), settings, '...', function() {
			}, '...');

		}

		if (settings.addChromeBookmarks == 'true') {

			// var postData = getActivityData(placeholderObj);
			var url = getActivityUrl(placeholderObj);

			
			
			
			chrome.extension.sendRequest({
				action : "checkChromeBookmarked",
				values : {
					url : url
				}
			}, function(bookmarked) {

				if (bookmarked) {

					
					uiExtender.extendPostWithIconAction(placeholderIconsObj, 'mk-bookmarked', function(element) {
						actions.doChromeBookmark(element.target, getActivityData(this));
					}, 'Click to remove bookmark this post');

				} else {

					uiExtender.extendPostWithIconAction(placeholderIconsObj, 'mk-bookmark', function(element) {
						actions.doChromeBookmark(element.target, getActivityData(this));
					}, 'Click to bookmark this post');

				}
				;

			});

		}
		;

		// http://www.google.com/webhp?hl=en#sclient=psy&hl=en&site=webhp&source=hp&q=%22test%22+site:plus.google.com&pbx=1&oq=%22test%22+site:plus.google.com&aq=f&aqi=&aql=f&gs_sm=e&gs_upl=968l968l0l1l1l0l0l0l0l157l157l0.1l1&bav=on.2,or.r_gc.r_pw.&fp=ad93d5a0dc8b6623&biw=1280&bih=685

	};
	
	
	


	/**
	 * create element
	 * 
	 * @param placeholderObj
	 */
	this.extendPostWithAction = function(placeholderObj, caption, callback, title) {
		if (!placeholderObj) {
			return;
		}
		var txt = document.createElement("span");
		txt.innerText = "  -  ";
		var attrClass = document.createAttribute("class");
		attrClass.nodeValue = 'mk-show';
		txt.setAttributeNode(attrClass);
		var attrStyle = document.createAttribute("style");
		attrStyle.nodeValue = 'display:none';
		txt.setAttributeNode(attrStyle);

		
		
		
		// <span role="button" class="d-h a-b-f-i-Zd-h">Twitt</span>
		var span = document.createElement("span");
		span.innerText = caption;

		var attrClass = document.createAttribute("class");
		attrClass.nodeValue = assets.gpPostBottomControlsStyle;
		span.setAttributeNode(attrClass);
		
		var attrStyle = document.createAttribute("style");
		attrStyle.nodeValue = 'display:none';
		span.setAttributeNode(attrStyle);

			
		var attrAlt = document.createAttribute("title");
		attrAlt.nodeValue = title;
		span.setAttributeNode(attrAlt);

		span.onclick = callback;

		placeholderObj.appendChild(txt);
		placeholderObj.appendChild(span);
	};
	
	this.extendPostWithIconAction = function(placeholderObj, htmlClass, callback, title) {
		if (!placeholderObj) {
			return;
		}
		// d-h a-f-i-Ia-D-h a-b-f-i-Ia-D-h
		// a-f-i-yj
		// var txt = document.createElement("txt");
		// txt.innerHTML = "&nbsp;&nbsp;-&nbsp;&nbsp;";

		// <button id="star" class="wpb" style="margin-left: 0"></button>

		var span = document.createElement("button");
		// span.innerText = caption;

		var attrClass = document.createAttribute("class");
		attrClass.nodeValue = htmlClass;
		span.setAttributeNode(attrClass);

		var attrStyle = document.createAttribute("style");
		attrStyle.nodeValue = 'display:none';
		span.setAttributeNode(attrStyle);

		var attrAlt = document.createAttribute("title");
		attrAlt.nodeValue = title;
		span.setAttributeNode(attrAlt);

		span.onclick = callback;

		// placeholderObj.appendChild(txt);
		placeholderObj.appendChild(span);
	};
	
	this.preExtendPostWithPlusOne = function(){
		(function() {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();

		(function() {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'translate.google.com/translate_a/element.js?cb=googleSectionalElementInit&ug=section&hl=en';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();

		var po = document.createElement('script');
		po.type = 'text/javascript';
		po.innerText = "function _onPlusOne(data){" + "\n_gaq.push(['_setAccount', '" + assets._setAccount + "']);" + "\n_gaq.push(['_trackPageview', '/plusone/' + data.state]);" + "\n};";

		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);
	};
	
	this.extendPostWithPlusOne = function(placeholderObj, activity, settings, htmlClass, callback, title) {
		if (!placeholderObj) {
			return;
		}

		if (activity.access.items[0].type != 'public') {
			return;
		}

		var count = settings.addPlusOneCounter == 'true' ? 'count="true"' : 'count="false"';
		var htmlClass = settings.addPlusOneCounter == 'true' ? 'mk-plusone-count' : 'mk-plusone';

		var div = document.createElement("div");
		var attrClass = document.createAttribute("id");
		attrClass.nodeValue = 'plusone-' + activity.id;
		div.setAttributeNode(attrClass);

		var attrClass2 = document.createAttribute("class");
		attrClass2.nodeValue = htmlClass;
		div.setAttributeNode(attrClass2);

		var attrStyle = document.createAttribute("style");
		attrStyle.nodeValue = 'display:none';
		div.setAttributeNode(attrStyle);
		
		div.innerHTML = '<g:plusone href="' + activity.url + '" size="small" ' + count + ' callback="_onPlusOne" ></g:plusone>';

		var script = document.createElement("script");
		script.innerText = 'gapi.plusone.go("' + 'plusone-' + activity.id + '");';

		placeholderObj.appendChild(div);
		placeholderObj.appendChild(script);

	};

	


	this.addHashtags = function(postObj) {
		var postBodyObj = postObj.querySelector(assets.gpPostBody);

		if (!postBodyObj) {
			postBodyObj = postObj.querySelector("div.a-b-f-i-p-R");
		}

		if (postBodyObj) {

			gplushelper.addHashTagsUrls(postBodyObj, function(html) {

				if (html) {
					postBodyObj.innerHTML = html;
				}

			});

		}

	};
}


function addJavaScriptCode(code) {
	if (!code) {
		return;
	}

	var script = document.createElement("script");
	script.innerText = code;
	placeholderObj.appendChild(div);
	placeholderObj.appendChild(script);

}

function getActivityHTMLNode(o) {
	// console.log('getActivityHTMLNode', o);

	// var updateDiv = undefined;
	var currentElement = o;

	while (currentElement.parentElement) {
		currentElement = currentElement.parentElement;

		if (currentElement.getAttribute('id')) {
			var idBegin = currentElement.getAttribute('id').substring(0, 7);
			if (idBegin == 'update-') {
				return currentElement;
			}
			;

		}
		;
	}

}

function getActivityDataWithCallback(o, callback) {
	
	
	if (gplushelper.settings.isApiEnabled == true || gplushelper.settings.isApiEnabled == 'true') {
		var activityId = activityParser.parseActivityId(getActivityHTMLNode(o));
		
		chrome.extension.sendRequest({
			action : "doActionViaApi",
			activityId : activityId
		}, function(response) {
			callback(response.activity);
		});
		
		
	} else {
		callback(activityParser.parseActivityHTML(getActivityHTMLNode(o)));
	}

}


/**
 * Traverse parent elements till post div will be found
 * 
 * @param o
 * @returns Activity
 */
function getActivityData(o) {
	// console.log('getActivityData', o);
	
	return activityParser.parseActivityHTML(getActivityHTMLNode(o));

}

function getActivityUrl(o) {
	// console.log('getActivityData', o);

	return activityParser.parseActivityUrl(getActivityHTMLNode(o));

}

function PageInfo() {
	this.url = undefined;
	this.type = undefined;
	this.notificationOn = false;

	this.PageTypeEnum = {
		UNKNOWN : undefined,
		HOME : 'home'
	};

	this.ifNotificationPage = function(url) {

		if (this.getPageType(url) == this.PageTypeEnum.HOME) {
			return true;
		}

	};

	this.getPageType = function(url) {

		/*
		 * trim query
		 */
		url = this.getPathFromUrl(url);

		var qRe = new RegExp("^https://plus.google.com/$");
		var urlTest = qRe.exec(url);

		console.log('getPageType', "^https://plus.google.com/$", urlTest);

		if (urlTest) {
			return this.PageTypeEnum.HOME;
		}

		/*
		 * check home
		 */
		qRe = new RegExp("^https://plus.google.com/stream$");
		urlTest = qRe.exec(url);
		// this.pageInfo.notificationOn = (urlTest &&
		// this.pageInfo.notificationOn) ? true : false;

		if (urlTest) {
			return this.PageTypeEnum.HOME;
		}

		return this.PageTypeEnum.UNKNOWN;

		qRe = new RegExp("^https://plus.google.com/([0-9]+)/posts/([a-zA-Z0-9]+)$");
		urlTest = qRe.exec(url);
		this.pageInfo.notificationOn = (urlTest && this.pageInfo.notificationOn) ? true : false;

		/*
		 * check if user page
		 */
		qRe = new RegExp("^https://plus.google.com/([0-9]+)/posts/$");
		urlTest = qRe.exec(url);
		this.pageInfo.notificationOn = (urlTest && this.pageInfo.notificationOn) ? true : false;
		/*
		 * check home
		 */
		qRe = new RegExp("^https://plus.google.com/u/0/$");
		urlTest = qRe.exec(url);
		this.pageInfo.notificationOn = (urlTest && this.pageInfo.notificationOn) ? true : false;

		// https://plus.google.com/u/0/104512463398531242371/posts

		/*
		 * check home
		 */
		qRe = new RegExp("^https://plus.google.com/$");
		urlTest = qRe.exec(url);
		this.pageInfo.notificationOn = (urlTest && this.pageInfo.notificationOn) ? true : false;

	};

	this.getPathFromUrl = function(url) {
		return url.split("?")[0];
	};

};

function Activity() {

	this.title = undefined;
	this.updated = undefined;// "2011-10-26T22:54:43.058Z"
	this.id = undefined; // "z13xjpmy4pjhvpivt225v3i5yxbsuz102",
	this.url = undefined;// "https://plus.google.com/104482086818095930400/posts/MKMmLWaorZw",

	this.actor = {
		"id" : undefined,
		"displayName" : undefined,
		"url" : undefined,
		"image" : {
			"url" : undefined
		}
	};

	this.verb = "share";

	// objectType = note|activity

	this.object = {
		"objectType" : "note",
		"content" : undefined,
		"originalContent" : "",
		"url" : undefined,
		"attachments" : [ {
			"objectType" : "article",
			"displayName" : undefined,
			"content" : undefined,
			"url" : undefined
		} ]
	};

	this.access = {
		"kind" : "plus#acl",
		"items" : [ {
			"type" : "public"
		} ]
	};

	this.getObjectActivity = function() {

		return {
			"objectType" : "activity",
			"id" : undefined,
			"actor" : {
				"id" : undefined,
				"displayName" : undefined,
				"url" : undefined,
				"image" : {
					"url" : undefined
				}
			},
			"content" : undefined,
			"url" : undefined
		};

	};

}

/**
 * @returns {Actions}
 */
function Actions() {

	this.doPlusOne = function(activity) {
		console.log('doPlusOne', activity);
		// {"href": "http://www.example.com/", "state": "on"}
	};

	this.doTweet = function(activity) {
		try {
			getPort().postMessage({
				message : "doTweet",
				values : []
			});
			window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(actions.stripHTML(activity.object.content) + ' #googleplus') + '&url=' + encodeURIComponent(activity.url));
		} catch (e) {
			alert('failed open window');
		}
		;
	};

	this.doTranslate = function(activity) {
		try {

			chrome.extension.sendRequest({
				action : "getSettings"
			}, function(response) {
				console.log('response.getSettings', response);

				var settings = response.settings;

				getPort().postMessage({
					message : "doTranslate",
					language : settings.addTranslateTo
				});

				window.open('http://translate.google.com/#auto|' + settings.addTranslateTo + '|' + encodeURIComponent(actions.stripHTML(activity.object.content)));

			});

		} catch (e) {
			alert('failed open window');
		}
		;
	};

	this.doBookmark = function(activity) {
		try {
			getPort().postMessage({
				message : "doBookmark",
				values : []
			});

			window.open('https://www.google.com/bookmarks/api/bookmarklet?output=popup' + '&srcUrl=' + encodeURIComponent(activity.url) + '&snippet=' + encodeURIComponent(actions.stripHTML(activity.object.content))
					+ '&title=' + encodeURIComponent('Google+ Bookmark'));

		} catch (e) {
			alert('failed open window');
		}
		;
	};

	this.doDelicious = function(activity) {
		try {
			getPort().postMessage({
				message : "doDelicious",
				values : []
			});

			window.open('http://www.delicious.com/save?' + '&url=' + encodeURIComponent(activity.url) + '&notes=' + encodeURIComponent(activity.actor.displayName + ': ' + actions.stripHTML(activity.object.content))
					+ '&title=' + encodeURIComponent(activity.actor.displayName + ' on Google+') + '&v=6&noui=1&jump=doclose', "doDelicious",
					'location=yes,links=no,scrollbars=no,toolbar=no,width=550,height=550');

		} catch (e) {
			alert('failed open window');
		}
	};

	/**
	 * @param Activity
	 *            activity
	 */
	this.doFacebook = function(activity) {
		try {
			getPort().postMessage({
				message : "doFacebook",
				values : []
			});

			window.open('http://www.facebook.com/sharer.php?src=bm&v=4&i=1311715596' + '&u=' + encodeURIComponent(activity.url) + '&t='
					+ encodeURIComponent(activity.actor.displayName + ' on Google+'), 'sharer', 'toolbar=0,status=0,resizable=1,width=626,height=436');

		} catch (e) {
			alert('failed open window');
		}
	};

	this.doChromeBookmark = function(element, activity) {
		if (element.getAttribute('class') == 'mk-bookmark') {
			this.addChromeBookmark(element, activity);
		} else {
			this.removeChromeBookmark(element, activity);
		}
	};

	this.addChromeBookmark = function(element, activity) {
		console.log('doChromeBookmark', element, activity);
		chrome.extension.sendRequest({
			action : "doChromeBookmark",
			values : {
				url : activity.url,
				text : activity.actor.displayName + ': ' + activity.object.content
			}
		}, function(bookmarked) {
			element.setAttribute('title', 'Click to remove bookmark for this post');
			element.setAttribute('class', 'mk-bookmarked');
		});

	};

	this.removeChromeBookmark = function(element, activity) {
		console.log('removeChromeBookmark', element, activity);
		chrome.extension.sendRequest({
			action : "removeChromeBookmark",
			values : {
				url : activity.url
			}
		}, function(bookmarked) {
			element.setAttribute('title', 'Click to bookmark this post');
			element.setAttribute('class', 'mk-bookmark');
		});

	};
	
	this.stripHTML = function(html){
		   var tmp = document.createElement("DIV");
		   tmp.innerHTML = html;
		   return tmp.textContent||tmp.innerText;
	};
}
