var t = 0;

var bMouseOver = false;
var bMouseOverTimerOff = true;
var bkg = chrome.extension.getBackgroundPage();


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

		if (bkg.settings.ttsOn) {
			this.doSpeak();
		}
		

	};
	
	this.doSpeak = function(){
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

				//console.log('mouseover', bMouseOver);
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
		
		var ttsObj = document.querySelector("button#-mk-tts");
		if (bkg.settings.ttsOn) {
			ttsObj.setAttribute('class', 'on');
		}
		if (ttsObj.addEventListener) {

			(function(component) {
				ttsObj.addEventListener('click', function(e) {
					e.stopPropagation();

					bkg.settings.ttsOn = e.target.getAttribute('class') == 'on' ? false : true;

					var cssClass = bkg.settings.ttsOn ? 'on' : 'off';
					e.target.setAttribute('class', cssClass);

					if (bkg.settings.ttsOn) {
						component.doSpeak();
					} else {
						bkg.doShutUp(component.activity.id);
					}

					return false;

				}, true);
			})(this);

		}

		var apiObj = document.querySelector("button#-mk-api");

		if (bkg.settings.isApiEnabled) {
			apiObj.setAttribute('class', 'on');
		}
		
		if (apiObj.addEventListener) {

			(function(component) {
				apiObj.addEventListener('click', function(e) {
					e.stopPropagation();

					
					
					bkg.doEnableApi(e.target.getAttribute('class') == 'on', function(changed){
						if (!changed) {
							return;
						}
						
						bkg.settings.isApiEnabled = e.target.getAttribute('class') == 'on' ? true : false;
						var cssClass = bkg.settings.isApiEnabled ? 'on' : 'off';
						e.target.setAttribute('class', cssClass);
							
					});
					
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

	this.initTTS = function() {
		(function(component) {
			chrome.extension.sendRequest({
				action : "checkChromeBookmarked"
			}, function(ttsON) {

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


		this.activity = bkg.getCachedNotificationbyId(query.id);

		console.log('activity', this.activity);

	};

	this.bindEvents = function() {

//		var container = document.querySelector(".a-b-f-i-oa");
//		container.innerHTML = html;
		
		var html = this.activity.title;

		html = html != undefined ? html.replace('"//', '"https://') : undefined;

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

		
		activity.updatedTime = activity.updatedHTMLTime ? activity.updatedHTMLTime : this._getTime(activity.updated);

		try {
			if (!activity.object.actor) {
				activity.hideActor = true;
			}
		} catch (e) {
			// TODO: handle exception
		}
		
		//hidePhotoInfo
		try {
			if (activity.object.attachments[0].objectType == 'photo') {
				activity.hidePhotoInfo = true;
			}
		} catch (e) {}
		
		try {
			if (activity.object.attachments[0].objectType == 'video') {
				activity.showVideoInfo = true;
			}
		} catch (e) {}
		
		try {
			if (activity.object.attachments[0].objectType == 'photo-album') {
				activity.showPhotoAlbumInfo = true;
			}
		} catch (e) {}		
		
			
		try {
			activity.object.attachments[0].urlClean = activity.object.attachments[0].url.match(/:\/\/(.[^/]+)/)[1];
		} catch (e) {};

		activity.cssBodyHeight = 150;

		if (activity.object.objectType == "note") {
			try {
				if (activity.object.content.length < 150) {
					activity.cssBodyHeight = 100;
				};
				
			} catch (e) {};
		}		
		activity.cssScrollPaneHeight = activity.cssBodyHeight - 20;
		
		activity.cssVisibility = 'public';
		
		
		
		var container = document.querySelector(".template");
		var html = Mustache.to_html(container.innerText, activity).replace(/^\s*/mg, '');
		
		var container = document.querySelector("#body");
		container.innerHTML = html;
		
		return;
	};
	
	this._getTime = function(date) {
		// 2011-10-29T14:58:55.696Z
		var time = date.split('T');
		time = time[1].split('.'); // 14:58:55.696Z
		time = time[0].split(':'); // 14:58:55

		return time[0] + ':' + time[1];
	};
	
	this.unload = function() {
		var bkg = chrome.extension.getBackgroundPage();
		bkg.doShutUp(undefined);
	};
}

var notify = new Notify();
