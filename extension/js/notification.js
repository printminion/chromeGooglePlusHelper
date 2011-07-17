var t = 0;

var CONF_TIMEOUT = chrome.extension.getBackgroundPage().settings.notificationTime;
var CONF_TIMEOUT_AFTER_MOUSEOUT = chrome.extension.getBackgroundPage().settings.notificationTime;

var bMouseOver = false;
var bMouseOverTimerOff = true;

function Notify() {

	this.data = undefined;

	this.init = function() {

		this.initData();
		this.initBookmarker();
		this.alertSound();
		this.bindWindowEvents();
		this.bindEvents();
		this.startTimer();

	};

	this.alertSound = function() {
		var bkg = chrome.extension.getBackgroundPage();

		console.log('notificationSound', bkg.settings.notificationSound);
		console.log('notificationOn', bkg.settings.notificationOn);
		console.log('fullpath', chrome.extension.getURL('sound/01.mp3'));

		if (bkg.settings.notificationSound && bkg.settings.notificationOn) {

			console.log('rrrriiiiinnnnggg:', bkg.settings.notificationSound);

			pingSound = document.createElement('audio');
			pingSound.setAttribute('src', chrome.extension
					.getURL(bkg.settings.notificationSound));
			pingSound.setAttribute('id', 'ping');
			pingSound.load();
			pingSound.play();

		}
		;
	};
	this.startTimer = function() {
		t = setTimeout("notify.beforeClose()", CONF_TIMEOUT);
	};

	this.startTimerAfterMouseOut = function() {
		bMouseOverTimerOff = false;
		t = setTimeout("notify.afterMouseOut()", CONF_TIMEOUT_AFTER_MOUSEOUT);
	};

	this.afterMouseOut = function() {

		if (!bMouseOver) {
			bMouseOverTimerOff = true;
		}
	};

	this.beforeClose = function() {
		if (!bMouseOver && bMouseOverTimerOff) {
			window.close();
		} else {
			t = setTimeout("notify.beforeClose()", CONF_TIMEOUT_AFTER_MOUSEOUT);
		}
	};

	this.bindWindowEvents = function() {

		var bodyObj = document.querySelector("body");

		if (bodyObj.addEventListener) {
			bodyObj.addEventListener('mouseover', function(e) {
				bMouseOver = true;
				bodyObj.setAttribute('class', 'selected');

				console.log('mouseover', bMouseOver);
			}, false);

			(function(component) {
				bodyObj.addEventListener('mouseout', function(e) {
					bMouseOver = false;
					bodyObj.setAttribute('class', '');
					console.log('mouseout', bMouseOver);
					component.startTimerAfterMouseOut();

				}, false);
			})(this);

			(function(component) {
				bodyObj.addEventListener('click', function(e) {
					e.stopPropagation();
					bMouseOver = true;
					bodyObj.setAttribute('class', 'clicked');
					console.log('click', bMouseOver);

					chrome.extension.getBackgroundPage().doOpenLink({
						url : component.data.url
					});

					window.close();

					return false;

				}, false);
			})(this);

		}

		var bookmarkObj = document.querySelector("button#-mk-bookmark");

		if (bookmarkObj.addEventListener) {

			(function(component) {
				bookmarkObj.addEventListener('click', function(e) {
					e.stopPropagation();

					if (e.target.getAttribute('class') == 'mk-bookmark') {
						component.addChromeBookmark(e.target, component.data);
					} else {
						component.removeChromeBookmark(e.target, component.data);
					}

					return false;

				}, true);
			})(this);

		}

	};

	this.initBookmarker = function() {
		(function(component) {
			chrome.extension.sendRequest({
				action : "checkChromeBookmarked",
				values : {
					url : component.data.url
				}
			}, function(bookmarked) {

				var bookmarkObj = document.querySelector("#-mk-bookmark");
				if (bookmarked) {
					bookmarkObj.setAttribute('class', 'mk-bookmarked');
					bookmarkObj.setAttribute('title',
							'Click to remove bookmark this post');
				} else {
					bookmarkObj.setAttribute('class', 'mk-bookmark');
					bookmarkObj.setAttribute('title',
							'Click to bookmark this post');
				}
				;

			});

		})(this);

	};

	this.addChromeBookmark = function(element, data) {
		console.log('doChromeBookmark', element, data);
		chrome.extension.sendRequest({
			action : "doChromeBookmark",
			values : {
				url : data.url,
				text : data.author + ': ' + data.text
			}
		}, function(bookmarked) {
			element.setAttribute('title',
					'Click to remove bookmark for this post');
			element.setAttribute('class', 'mk-bookmarked');
		});

	};

	this.removeChromeBookmark = function(element, data) {
		console.log('removeChromeBookmark', element, data);
		chrome.extension.sendRequest({
			action : "removeChromeBookmark",
			values : {
				url : data.url
			}
		}, function(bookmarked) {
			element.setAttribute('title', 'Click to bookmark this post');
			element.setAttribute('class', 'mk-bookmark');
		});

	};

	this.initData = function() {
		var query = {};
		var search = window.location.search;

		search = search.substring(1, search.length);
		search = search.split('&');

		for (part in search) {
			part = search[part].split('=');
			query[part[0]] = decodeURIComponent(part[1]);
		}

		this.data = query;

		console.log(this.data);

	};

	this.bindEvents = function() {

		var container = document.querySelector(".a-b-f-i-oa");

		var html = this.data.html;

		html = html.replace('"//', '"https://');

		container.innerHTML = html;

		var containers = document.querySelectorAll("a");

		for (i in containers) {

			/*
			 * if (containers[i].addEventListener) {
			 * containers[i].addEventListener('click', function(e) {
			 * e.stopPropagation(); console.log(e);
			 * chrome.extension.getBackgroundPage().doOpenLink({ url : this.href
			 * });
			 * 
			 * return false; }, false); }
			 */

		}
	};
}

var notify = new Notify();
