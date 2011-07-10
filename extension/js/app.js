function Application() {

}

var app = new Application();

Application.prototype.onInstall = function() {
	console.log("Extension Installed");
	window.open('welcome.html');
};

Application.prototype.onUpdate = function() {
	console.log("Extension Updated");
	window.open('update.html');
};

Application.prototype.getVersion = function() {
	var details = chrome.app.getDetails();
	return details.version;
};

Application.prototype.onStart = function(callbackOnInstall, callbackOnUpdate) {

	// Check if the version has changed.
	var currVersion = app.getVersion();
	var prevVersion = localStorage['version'];
	if (currVersion != prevVersion) {
		// Check if we just installed this extension.
		if (typeof prevVersion == 'undefined') {

			if (callbackOnInstall) {
				callbackOnInstall();
			} else {
				app.onInstall();
			}

		} else {
			if (callbackOnUpdate) {
				callbackOnUpdate();
			} else {
				app.onInstall();
			}
		}
		localStorage['version'] = currVersion;
	}
};