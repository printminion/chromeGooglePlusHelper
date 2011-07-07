//console.log('background.html');

// Global accessor that the popup uses.
var selectedTabId = null;
var selectedWindowId = null;
var tabsArr = {};

var localPort = null;

chrome.extension.onConnect.addListener(function(port) {
	console.assert(port.name == "chrome-google-plus-helper");
	localPort = port;
	port.onMessage.addListener(function(msg) {
		console.log('BackgroundPage, onMessage:' + msg);

		/*
		 * if (msg.probeTagChanged) { var probeTag = msg.probeTagChanged;
		 * loadTweets(probeTag); } if (msg.requestGeolocation) {
		 * requestGeoLocation(); }
		 */
	});
});

chrome.extension.onRequest.addListener(function(request, sender, callback) {
	console.log('extension.onRequest');

	if (request.action == 'fetchTabInfo') {
		checkTab(callback, sender);
	}

});

function checkTab(callback, sender) {

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

function beforeUpdateTab(tabId) {
	/*
	 * get tab info
	 */
	console.log('chrome.tabs.getCurrentTab:');

	chrome.tabs.get(tabId, function(tab) {
		console.log('currentTab', tab);

		/*
		 * check if we are in the market
		 */
		var result = tab.url.search(/plus.google.com/);
		if (result != -1) {
			console.log('TODO: update stuff');
			// callback(updateQRCode(tab.id, tab.url));
			chrome.pageAction.show(tab.id);
			localPort.postMessage({
				update : true
			});

		}

	});

}

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
	console.log('chrome.tabs.onSelectionChanged');

	beforeUpdateTab(tabId);

});

chrome.pageAction.onClicked.addListener(function(tab) {

	console.log('onClicked');

	localPort.postMessage({
		update : true
	});

});