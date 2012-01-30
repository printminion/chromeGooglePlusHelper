/*
 * collection of active ports
 */
var ports = {};
var notificationsArr = {};
var notificationsCacheArr = {};

var animationFrames = 36;
var animationSpeed = 50; // ms
var canvas;
var canvasContext;
var loggedInImage;
var pollIntervalMin = 1000 * 60; // 1 minute
var pollIntervalMax = 1000 * 60 * 60; // 1 hour
var requestFailureCount = 0; // used for exponential backoff
var requestTimeout = 1000 * 2; // 5 seconds
var rotation = 0;
var bookmarks = undefined;

chrome.extension.onConnect.addListener(function(port) {
	// Only accept connections with a port.name we expect.
	if (port.name != 'chrome-google-plus-helper')
		return;

	ports[port.tab.id] = port;

	port.onMessage.addListener(function(data) {

		console.log("The content script said: " + data.message
				+ " with values: ", data);

		switch (data.message) {
		case 'fetchTabInfo':
			checkTab(data.callback, sender);
			break;
		case 'doTweet':
			_gaq.push([ '_trackPageview', '/tweet' ]);
			break;
		case 'doFacebook':
			_gaq.push([ '_trackPageview', '/facebook' ]);
			break;
		case 'doTranslate':
			_gaq.push([ '_trackPageview', '/translate/' + data.language ]);
			break;
		case 'doBookmark':
			_gaq.push([ '_trackPageview', '/bookmark' ]);
			break;

		case 'doChromeBookmark':
			_gaq.push([ '_trackPageview', '/bookmark-chrome' ]);

			break;

		case 'doDelicious':
			_gaq.push([ '_trackPageview', '/bookmark-delicious' ]);
			
			break;
		case 'onActivatePageAction':
			chrome.pageAction.show(port.tab.id);
			
			break;
		case 'onNewPost':
			_gaq.push([ '_trackPageview', '/notify' ]);
			doNotify(data.activity, true);
			
			break;
		case 'onNewPostViaApi':
			_gaq.push([ '_trackPageview', '/notifyViaApi' ]);

			if (settings.apiKey == undefined || settings.apiKey == '') {
				_gaq.push([ '_trackPageview', '/notifyViaApi/getApiKey' ]);
				//doOpenLink('options' + POSTFIX + '.html#api');
				window.open('options' + POSTFIX + '.html#api', 'options');
				return;
			}
			
			assets.googlePlusAPIKey = settings.apiKey;
			
			var request = 'https://www.googleapis.com/plus/v1/activities/'
							+ data.activity.id
							+ '?alt=json&pp=1&key=' + assets.googlePlusAPIKey;

			var callback = undefined;
			
			if (data.force) {
				callback = 'onNewPostViaApi';
				doApiCall(request, onNewPostViaApi);
			} else {
				callback = 'doNotify';
				doApiCall(request, doNotify);
			}
			
			
//			if (false) {
//
//				var script = document.createElement("script");
//				script.src = request + '&key=' + assets.googlePlusAPIKey + '&callback=' + callback;
//				document.body.appendChild(script);
//			
//			}
			
			break;

		case 'doOpenLink':
			_gaq.push([ '_trackPageview', '/openLink' ]);
			doOpenLink(data);
			
			break;
		case 'registerPort':
			
			break;
		default:
			console.log('unknown message', data.message, data);
		
			break;
		}

	});

});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log('extension.onRequest', request);

	switch (request.action) {
		case 'doActionViaApi':
		
		if (settings.apiKey == undefined || settings.apiKey == '') {
			_gaq.push([ '_trackPageview', '/notifyViaApi/getApiKey' ]);
			//doOpenLink('options' + POSTFIX + '.html#api');
			window.open('options' + POSTFIX + '.html#api', 'options');
			return;
		}
		
		assets.googlePlusAPIKey = settings.apiKey;
		
		var request = 'https://www.googleapis.com/plus/v1/activities/'
						+ request.activityId
						+ '?alt=json&pp=1&key=' + assets.googlePlusAPIKey;

		
		doApiCall(request, function(activity){
			
			sendResponse({
				activity: activity
			});
			
		});
			
		break;

		break;
	case 'doOpenLink':
		_gaq.push([ '_trackPageview', '/openLink' ]);
		doOpenLink(request.values);
		
		break;
	case 'doFacebook':
		_gaq.push([ '_trackPageview', '/facebook' ]);
		
		break;
	case 'doChromeBookmark':
		bookmarks.addBookmark(request.values, sendResponse);
		_gaq.push([ '_trackPageview', '/bookmark-chrome/add' ]);
		
		break;
	case 'doDelicious':
		_gaq.push([ '_trackPageview', '/bookmark-delicious' ]);
		
		break;
	case 'checkChromeBookmarked':
		bookmarks.checkBookmark(request.values, sendResponse);
		
		break;
	case 'removeChromeBookmark':
		_gaq.push([ '_trackPageview', '/bookmark-chrome/remove' ]);
		bookmarks.removeBookmark(request.values, sendResponse);
		
		break;
	case 'fetchTabInfo':
		checkTab(sendResponse, sender);
		
		break;
	case 'getSettings':
		//_gaq.push([ '_trackPageview', '/settings' ]);
		var bkg = chrome.extension.getBackgroundPage();

		console.log('settings', bkg.settings);
		sendResponse({
			settings : bkg.settings
			, chromeBookmarsFolderId: bkg.bookmarks.parentId
			
		});

		break;
	case 'checkNotificationON':
		var bkg = chrome.extension.getBackgroundPage();

		console.log('notificationOn', bkg.settings.notificationOn);

		sendResponse({
			notificationOn : bkg.settings.notificationOn,
			lastPostId : request.lastPostId
		});

		break;

	default:
		break;
	}

});

function doApiCall(url, callback) {
	
console.log('doApiCall', url, 'callback');
//url = url + 'oauth_token=' + googleAuth.getAccessToken();
	
	var xhr = new XMLHttpRequest();
	
	
	
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		  if (xhr.status == 200) {
			  // JSON.parse does not evaluate the attacker's scripts.
			  callback(JSON.parse(xhr.responseText));
		  } else if (xhr.status == 401 || xhr.status == 403 || xhr.status == 0) {

				console.log('error on fetching activity:', xhr.status, JSON.parse(xhr.responseText));
				console.log('try to get oAuth token:', googleAuth.getAccessToken());

//				googleAuth.authorize(function() {
//					console.log('OAuth:', googleAuth.getAccessToken());
//				});
			  
				callback(JSON.parse(xhr.responseText));
				
		  } else {
			    callback(JSON.parse(xhr.responseText));
				console.log('error on fetching activity:', xhr.status, JSON.parse(xhr.responseText));
		  }
	   }
	};

	xhr.open("GET", url, true);
	//xhr.setRequestHeader('Authorization', 'OAuth ' + googleAuth.getAccessToken());
	xhr.send();
	
}


function init() {

	bookmarks = new Bookmarks();
	bookmarks.init();

	canvas = document.getElementById('canvas');
	loggedInImage = document.getElementById('icon');
	canvasContext = canvas.getContext('2d');

	checkConnectionToTabs();

	app.onStart(function() {
		/*
		 * installed part
		 */
		console.log("Extension Installed");

		var bkg = chrome.extension.getBackgroundPage();

		bkg.settings.addTwitter = true;
		bkg.settings.addTranslate = true;
		bkg.settings.addHashtags = true;

		bkg.settings.addBookmarks = false;
		bkg.settings.addChromeBookmarks = true;
		bkg.settings.addDelicious = true;

		bkg.settings.addPlusOne = true;
		bkg.settings.addPlusOneCounter = true;

		bkg.settings.addChromeBookmarksToolbar = true;

		bkg.settings.addTranslateTo = 'en';

		bkg.settings.notificationOn = true;
		bkg.settings.notificationSound = 'sound/01.mp3';
		bkg.settings.notificationTime = 5000;

		bkg.settings.ttsOn = true;
		bkg.settings.isApiEnabled = false;
		
		bkg.settings.apiKey = bkg.assets.googlePlusAPIKey;
		bkg.settings.isApiEnabled = true;
		
		
		
		window.open('options' + POSTFIX + '.html#api', 'options');
	}, function() {
		/*
		 * set default values
		 */
		var bkg = chrome.extension.getBackgroundPage();
		bkg.settings.addChromeBookmarks = true;
		bkg.settings.addDelicious = true;
		bkg.settings.addChromeBookmarksToolbar = true;

		if (bkg.settings.apiKey == undefined || bkg.settings.apiKey == '' || bkg.settings.apiKey == null) {
			bkg.settings.apiKey = bkg.assets.googlePlusAPIKey;
			bkg.settings.isApiEnabled = true;
		}
		
		
		
		console.log("Extension Updated", bkg.settings);
		window.open('options' + POSTFIX + '.html', 'options');

	});

}

function checkConnectionToTabs() {

	chrome.windows.getAll({
		populate : true
	}, function(windows) {

		var countPlusTabs = 0;
		for ( var i in windows) {
			// console.log('window', windows[i]);
			for ( var j in windows[i].tabs) {
				// console.log('tab', windows[i].tabs[j]);
				// windows[i].tabs[j].url
				// windows[i].tabs[j].id
				var url = windows[i].tabs[j].url;
				var qRe = new RegExp("^https://plus.google.com/");
				var test = qRe.exec(url);
				
				if (test) {
					countPlusTabs++;
					var tab = windows[i].tabs[j];
//					console.log('test tab', tab);
					chrome.tabs.update(tab.id, {url: tab.url}, function(tab){
//						console.log('tab updated', tab);

						chrome.tabs.sendRequest(tab.id, {action: 'initTab'}, function(tab){
							console.log('tab updated', tab);
						});

					});
					
					
					
				}
			}
		}

	});

}

function checkTab(callback, sender) {
	console.log('checkTab');

	chrome.tabs.get(sender.tab.id, function(tab) {
		console.log('chrome.tabs.getCurrent:');
		console.log(tab);

		/*
		 * check if we are in the market
		 */
		var result = tab.url.search(/plus.google.com/);
		if (result != -1) {
			// callback(updateQRCode(tab.id, tab.url));

			chrome.pageAction.show(tab.id);
			callback();

		}

	});

}

function doSpeak(text) {
	console.log('doSpeak', text);

	text = text.replace(/#/g, ' hash ');

	text = text.replace('http://', '');
	text = text.replace('https://', '');

	
//	var options = {
//		lang : "en-US",
//		gender: "male",
//		pitch : 1,
//		rate : 0.5,
//		volume : 1
//	};
	
	
	var options = {
			  lang: settings.ttsLang
			, gender: settings.ttsGender
			, pitch: settings.ttsPitch
			, rate: settings.ttsRate
			, volume: settings.ttsVolume
		};
	
	
	doSpeakWithOptions(text, options);

}

function doSpeakWithOptions(text, options) {
	
	var utteranceIndex = 1;

	console.log(utteranceIndex + ': ' + JSON.stringify(options));
	options.onEvent = function(event) {
		console.log(utteranceIndex + ': ' + JSON.stringify(event));
		// if (highlightText) {
		// text.setSelectionRange(0, event.charIndex);
		// }
		if (event.type == 'end' || event.type == 'interrupted'
				|| event.type == 'cancelled' || event.type == 'error') {
			chrome.tts.isSpeaking(function(isSpeaking) {
				if (!isSpeaking) {
					console.log('TTS isSpeaking: Idle');
					// ttsStatus.innerHTML = 'Idle';
					// ttsStatusBox.style.background = '#fff';
				}
			});
		}
	};

	chrome.tts.speak(text, options, function() {
		if (chrome.extension.lastError) {
			console.log('TTS Error: ' + chrome.extension.lastError.message);
		}
	});
	
}

function doShutUp(id) {
	chrome.tts.isSpeaking(function(speaking){
		if (speaking) {
			chrome.tts.stop();
		}
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	if (change.status == "complete") {

//		console.log('backgrounds.tabs.onUpdated');

		beforeUpdateTab(tabId);

	}
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

	delete ports[tabId];

});

function beforeUpdateTab(tabId) {
	/*
	 * get tab info
	 */
//	console.log('beforeUpdateTab:');

	chrome.tabs.get(tabId, function(tab) {
//		console.log('currentTab', tab);

		if (tab == undefined) {
			return;
		}

		/*
		 * check if we are on google plus
		 */
		var result = tab.url.search(/plus.google.com/);
		if (result != -1) {
			console.log('updating active tab');

			if (ports.hasOwnProperty(tab.id)) {

				chrome.pageAction.show(tab.id);
				ports[tab.id].postMessage({
					message : 'update',
					update : true
				});

			} else {

				chrome.pageAction.setIcon({
					tabId : tab.id,
					path : 'images/icon16gray.png'
				});
				chrome.pageAction.show(tab.id);
				console.log('no port to tab');
			}
		}

	});

}

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
//	console.log('chrome.tabs.onSelectionChanged');

	beforeUpdateTab(tabId);

});

chrome.pageAction.onClicked.addListener(function(tab) {

	console.log('onClicked');

	if (ports.hasOwnProperty(tab.id)) {
		chrome.pageAction.show(tab.id);
		animateFlip(tab.id);
		ports[tab.id].postMessage({
			message : 'update',
			update : true
		});

	} else {
		chrome.pageAction.hide(tab.id);

		console.log('no port to tab');
	}

});

function doOpenLink(data) {
	console.log('doOpenLink', data);
	chrome.tabs.create({
		url : data.url
	});

}

function getCachedNotificationbyId(id) {
	if (notificationsCacheArr.hasOwnProperty(id)) {
		var notification = notificationsCacheArr[id];
		console.log('got notification', notification);
		
		//delete notificationsCacheArr[id];

		return notification;
	}
}

function doEnableApi(value, callback){
	callback(!value);
};

function onNewPostViaApi(activity) {
	doNotify(activity, true);
}

function doNotify(activity, force) {

	//console.log('doNotify', activity);

	if (activity == undefined) {
		return;
	}

	if (activity.error) {
		console.log('doNotify:error', activity.error);
		return;
	}

	if (activity.title == '') {
		return;
	}

	notificationsCacheArr[activity.id] = activity;

	if (!force) {
		if (notificationsArr.hasOwnProperty(activity.id)) {
			console.log('skip notification [' + activity.id + ']');
			return;
		}
	}

	/*
	 * create an HTML notification:
	 */
	var notification = webkitNotifications
			.createHTMLNotification('notification_helper' + POSTFIX + '.html'
					+ "?" + "id=" + activity.id);

	console.log('notification_helper' + POSTFIX + '.html' + "?" + "id="
			+ activity.id);
	/*
	 * add notification to the stack
	 */
	notificationsArr[activity.id] = true;

	/*
	 * Then show the notification.
	 */
	notification.show();
}

var REFRESH_RATE = 5000;

var t = 0;// setTimeout("checkUpdate()", REFRESH_RATE);

/**
 * run check for update on all connected pages
 * 
 * @returns {Boolean}
 */
function checkUpdate() {

	console.log('checkUpdate');

	if (Object.keys(ports).length == 0) {
		t = setTimeout("checkUpdate()", REFRESH_RATE);
		return false;
	}

	/*
	 * get first port
	 */
	for (port in ports) {

		console.log('checkUpdate');

		ports[port].postMessage({
			message : 'checkForUpdate',
			values : []
		});

		t = setTimeout("checkUpdate()", REFRESH_RATE);

		break;
	}
}

function refreshConfiguration() {
	console.log('refreshConfiguration');
}

/*
 * animation stuff
 */
function animateFlip(tabId) {
	rotation += 1 / animationFrames;
	drawIconAtRotation(tabId);

	if (rotation <= 1) {
		setTimeout("animateFlip(" + tabId + ")", animationSpeed);
	} else {
		rotation = 0;
		drawIconAtRotation(tabId);
	}
};

function drawIconAtRotation(tabId) {
	canvasContext.save();
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.translate(Math.ceil(canvas.width / 2), Math
			.ceil(canvas.height / 2));
	canvasContext.rotate(2 * Math.PI * ease(rotation));
	canvasContext.drawImage(loggedInImage, -Math.ceil(canvas.width / 2), -Math
			.ceil(canvas.height / 2));
	canvasContext.restore();

	chrome.pageAction.setIcon({
		tabId : tabId,
		imageData : canvasContext.getImageData(0, 0, canvas.width,
				canvas.height)
	});
};

function ease(x) {
	return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}
