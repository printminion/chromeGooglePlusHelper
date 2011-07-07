/*
 * collection of active ports
 */
var ports = {};

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

chrome.extension.onConnect.addListener(function(port) {
	// Only accept connections with a port.name we expect.
	if (port.name != 'chrome-google-plus-helper')
		return;

	ports[port.tab.id] = port;

	port.onMessage.addListener(function(data) {
		
		console.log("The content script said: " + data.message
				+ " with values: " + data.values);
		
		if (data.message == 'doTweet') {
			_gaq.push(['_trackPageview','/tweet']);
		}
		
		if (data.message == 'doTranslate') {
			_gaq.push(['_trackPageview','/translate']);
		}
		
		
	});

	/*
	port.postMessage({
		message : "Greetings, tab " + port.tab.id,
		values : [ true, false, null ]
	});
	*/

});

chrome.extension.onRequest.addListener(function(request, sender, callback) {
	console.log('extension.onRequest');

	if (request.action == 'fetchTabInfo') {
		checkTab(callback, sender);
	}

});

function init() {
	canvas = document.getElementById('canvas');
	loggedInImage = document.getElementById('icon');
	canvasContext = canvas.getContext('2d');
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

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	if (change.status == "complete") {

		console.log('backgrounds.tabs.onUpdated');

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
	console.log('beforeUpdateTab:');

	chrome.tabs.get(tabId, function(tab) {
		console.log('currentTab', tab);

		if (tab == undefined) {
			return;
		}

		/*
		 * check if we are in the market
		 */
		var result = tab.url.search(/plus.google.com/);
		if (result != -1) {
			console.log('updating active tab');

			if (ports.hasOwnProperty(tab.id)) {
				chrome.pageAction.show(tab.id);

				ports[tab.id].postMessage({
					update : true
				});

			} else {
				console.log('no port to tab');
			}
		}

	});

}

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
	console.log('chrome.tabs.onSelectionChanged');

	beforeUpdateTab(tabId);

});

chrome.pageAction.onClicked.addListener(function(tab) {

	console.log('onClicked');

	if (ports.hasOwnProperty(tab.id)) {
		chrome.pageAction.show(tab.id);
		animateFlip(tab.id);
		ports[tab.id].postMessage({
			update : true
		});

	} else {
		chrome.pageAction.hide(tab.id);

		console.log('no port to tab');
	}

});

function ifFirstInstall() {

	return true;
}

function onInitialisation() {
	if (ifFirstInstall()) {
		/*
		 * reload all tabs
		 */
	}
}

var REFRESH_RATE = 5000;

var t = 0;// setTimeout("checkUpdate()", REFRESH_RATE);

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
			values : [ true, false, null ]
		});

		t = setTimeout("checkUpdate()", REFRESH_RATE);

		break;
	}
}

function deleteme() {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(data) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req.responseText);
			} else {
				callback(null);
			}
		}
	};
	var url = 'http://foo/bar.php';
	req.open('GET', url, true);
	req.send();
};

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

function drawIconAtRotation(tabId ) {
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