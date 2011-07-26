//var customDomainsTextbox;
var saveButton;

var bkg = chrome.extension.getBackgroundPage();

// Saves options to localStorage.
function save_options() {
//	bkg.settings.pollInterval = parseInt($('#refresh-interval').val()) * 60000;
//	bkg.settings.timeout = 1000 * 15;

//	bkg.settings.soundAlert = $('#sound-alert').val();

	console.log($('#options_hide_probe_labels').attr('checked'));
	console.log(parseFloat($('#options_global_threshold_ratio').val()));

	refresh_extension();

	$('#save_status').fadeIn('fast');
	$('#save_status').fadeOut(3000);
}

// Refresh the extension by reseting timer.
function refresh_extension() {
	bkg.refresh();
}

function playSound() {
	var urlSound = $('#options_notification_sound').val();

	/*
	 * BUG: http://code.google.com/p/chromium/issues/detail?id=25972
	 */

	if (urlSound) {
		pingSound = document.createElement('audio');
		pingSound.setAttribute('src', urlSound);
		pingSound.setAttribute('id', 'ping');
		pingSound.load();
		pingSound.play();
	}
}

function error(msg) {
	var s = document.querySelector('#status');
	s.innerHTML = typeof msg == 'string' ? msg : "failed";
	s.className = 'fail';

	// console.log(arguments);
}

function searchAddress(adress) {
	showAddress(adress, function() {
		markDirty();
	});
}

function _initOptionsPage() {
	saveButton = document.getElementById("save_button");
	if (bkg.settings.isFirstRun) {
		markDirty();
	} else {
		markClean();
	}

}

function saveOptions() {
	markClean();

	save_options();
	return false;
}

function resetOptions() {
//	$('#refresh-interval').val("30");
	$('#sound-alert').val("");
	$("#options_global_threshold_ratio").val(3);
	$("#options_hide_probe_labels").attr("checked", false);

	saveOptions();
	return false;
}

function markDirty() {
	saveButton.disabled = false;
}

function markClean() {
	saveButton.disabled = true;
}