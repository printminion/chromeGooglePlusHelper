//var customDomainsTextbox;
var saveButton;

var bkg = chrome.extension.getBackgroundPage();

function Options() {

	// Saves options to localStorage.
	this.save_options = function() {
		// bkg.settings.pollInterval = parseInt($('#refresh-interval').val()) *
		// 60000;
		// bkg.settings.timeout = 1000 * 15;

		// bkg.settings.soundAlert = $('#sound-alert').val();

		console.log($('#options_hide_probe_labels').attr('checked'));
		console.log(parseFloat($('#options_global_threshold_ratio').val()));

		refresh_extension();

		$('#save_status').fadeIn('fast');
		$('#save_status').fadeOut(3000);
	};

	// Refresh the extension by reseting timer.
	this.refresh_extension = function() {
		bkg.refresh();
	};

	this.playSound = function() {
		var urlSound = $('#option_notification_sound').val();

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
	};

	this.doSpeakOption = function() {
		var bkg = chrome.extension.getBackgroundPage();
		
		var options = {
				  lang: $("#option_tts_lang").val()
				, gender: $("#option_tts_gender").val()
				, pitch: parseFloat($("#option_tts_pitch").val())
				, rate: parseFloat($("#option_tts_rate").val())
				, volume: parseFloat($("#option_tts_volume").val())
			};
		bkg.doSpeakWithOptions($("#ttsTextTest").text(), options);
	};

	this.doStopSpeakOption = function() {
		var bkg = chrome.extension.getBackgroundPage();
		bkg.doShutUp('options');
	};

	this.error = function(msg) {
		var s = document.querySelector('#status');
		s.innerHTML = typeof msg == 'string' ? msg : "failed";
		s.className = 'fail';

		// console.log(arguments);
	};

	this.searchAddress = function(adress) {
		showAddress(adress, function() {
			markDirty();
		});
	};

	this._initOptionsPage = function() {
		saveButton = document.getElementById("save_button");
		if (bkg.settings.isFirstRun) {
			markDirty();
		} else {
			markClean();
		}

	};

	this.saveOptions = function() {
		markClean();

		save_options();
		return false;
	};

	this.resetOptions = function() {
		// $('#refresh-interval').val("30");
		$('#sound-alert').val("");
		$("#options_global_threshold_ratio").val(3);
		$("#options_hide_probe_labels").attr("checked", false);

		saveOptions();
		return false;
	};

	this.markDirty = function() {
		saveButton.disabled = false;
	};

	this.markClean = function() {
		saveButton.disabled = true;
	};
}

var options = new Options();