var t = 0;

var bMouseOver = false;
var bMouseOverTimerOff = true;

/**
 * @returns {Notify}
 */
function Notify() {

	var CONF_TIMEOUT = 3000;
	var CONF_TIMEOUT_AFTER_MOUSEOUT = 3000;

	this.activity = undefined;

	this.init = function() {

		try {
			this.CONF_TIMEOUT = chrome.extension.getBackgroundPage().settings.notificationTime;
			this.CONF_TIMEOUT_AFTER_MOUSEOUT = chrome.extension
					.getBackgroundPage().settings.notificationTime;
		} catch (e) {
			// TODO: handle exception
		}

		this.initData();
		this.populateHtml(this.activity);
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

		if (this.activity.annotation) {
			bkg.doSpeak(this.activity.actor.displayName + ' '
					+ this.activity.verb + ' ' + this.activity.annotation);
		} else {
			bkg.doSpeak(this.activity.actor.displayName + ' '
					+ this.activity.verb + ' ' + this.activity.title);
		}

	};
	this.startTimer = function() {
		t = setTimeout("notify.beforeClose()", this.CONF_TIMEOUT);
	};

	this.startTimerAfterMouseOut = function() {
		bMouseOverTimerOff = false;
		t = setTimeout("notify.afterMouseOut()",
				this.CONF_TIMEOUT_AFTER_MOUSEOUT);
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
			t = setTimeout("notify.beforeClose()",
					this.CONF_TIMEOUT_AFTER_MOUSEOUT);
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
						url : component.activity.url
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
						component.addChromeBookmark(e.target,
								component.activity);
					} else {
						component.removeChromeBookmark(e.target,
								component.activity);
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
					url : component.activity.url
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

	this.addChromeBookmark = function(element, activity) {
		console.log('doChromeBookmark', element, activity);
		chrome.extension.sendRequest({
			action : "doChromeBookmark",
			values : {
				url : activity.url,
				text : activity.actor.displayName + ': ' + activity.title
			}
		}, function(bookmarked) {
			element.setAttribute('title',
					'Click to remove bookmark for this post');
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

	this.initData = function() {
		var query = {};
		var search = window.location.search;

		search = search.substring(1, search.length);
		search = search.split('&');

		for (part in search) {
			part = search[part].split('=');
			query[part[0]] = decodeURIComponent(part[1]);
		}

		var bkg = chrome.extension.getBackgroundPage();

		this.activity = bkg.getCachedNotificationbyId(query.id);

		console.log('activity', this.activity);

	};

	this.bindEvents = function() {

//		var container = document.querySelector(".a-b-f-i-oa");
//		container.innerHTML = html;
		
		var html = this.activity.title;

		html = html.replace('"//', '"https://');

		var containers = document.querySelectorAll("a");

		for (i in containers) {

			if (containers[i].addEventListener) {
				containers[i].addEventListener('click', function(e) {
					e.stopPropagation();
					console.log(e);
					chrome.extension.getBackgroundPage().doOpenLink({
						url : this.href
					});

					return false;
				}, false);
			}

		}
	};

	this.populateHtml = function(activity) {

		if (!activity) {
			console.log('[e]nothing to populateHtml');
			return;
		}
		/*
		 * add text
		 */

		var container = document.querySelector("div.vg");

		// if (this.activity.annotation) {
		// container.innerHTML = activity.annotation;
		// } else {

		if (activity.object.content) {

			container.innerHTML = activity.object.content;
			// activity.object.url

		} else {
			container.innerHTML = activity.title;
		}

		// }

		/*
		 * add name
		 */

		container = document.querySelector("a.yn.Hf.cg");

		if (container) {

			container.setAttribute('href', activity.actor.url);
			container.setAttribute('oid', activity.actor.id);
			container.innerText = activity.actor.displayName;
		}

		/*
		 * add picture
		 */
		container = document.querySelector("a.Nm");
		if (container) {

			container.setAttribute('href', activity.actor.url);
			container.setAttribute('title', activity.actor.displayName);

			container = container.querySelector("img");

			if (container) {
				container.setAttribute('src', activity.actor.image.url
						+ '?sz=48');
				container.setAttribute('title', activity.actor.displayName);
			}

		}

		/*
		 * add name2
		 */
		container = document.querySelector("a.sharedNm");

		if (container && activity.object.actor) {
			container.style.display = 'block';

			var actor = activity.object.actor;

			container.setAttribute('href', actor.url);
			container.setAttribute('title', actor.displayName);

			container = container.querySelector("img");

			if (container) {
				container.setAttribute('src', actor.image.url + '?sz=48');
				container.setAttribute('title', actor.displayName);
			}

		}

		/*
		 * set date
		 */

		container = document.querySelector("a.c-G-j.c-i-j-ua.hl");

		if (container) {

			// 2011-10-29T14:58:55.696Z
			var time = activity.updated.split('T');
			time = time[1].split('.'); // 14:58:55.696Z
			time = time[0].split(':'); // 14:58:55

			container.setAttribute('href', activity.url);
			container.setAttribute('title', activity.updated);
			container.innerText = time[0] + ':' + time[1];
		}

		/*
		 * attachements
		 */

		// "attachments": [
		// {
		// "objectType": "article",
		// "displayName": "Android Developers Blog: Android 4.0 Graphics and
		// Animations",
		// "url":
		// "http://android-developers.blogspot.com/2011/11/android-40-graphics-and-animations.html"
		// }
		// ]
	};
}

var notify = new Notify();
