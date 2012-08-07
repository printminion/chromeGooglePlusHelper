
	var bkg = chrome.extension.getBackgroundPage();

	$(document).ready(function() {

		if (bkg.settings.ttsOn) {
			$('#oTTS').html('On');
			$('#-mk-tts').attr('class', 'on');
		} else {
			$('#oTTS').html('Off');
			$('#-mk-tts').attr('class', 'off');
		}

		if (bkg.settings.notificationOn) {
			$('#oNotification').html('On');
			$('#-mk-notifications').attr('class', 'on');
		} else {
			$('#oNotification').html('Off');
			$('#-mk-notifications').attr('class', 'off');
		}

		if (bkg.settings.isApiEnabled) {
			$('#oAPI').html('enabled');
			$('#-mk-api').attr('class', 'on');
		} else {
			$('#oAPI').html('disabled');
			$('#-mk-api').attr('class', 'off');
		}
		
		$('#oNotification').click(function() {
			if ($(this).html() == 'On') {
				$(this).html('Off');
				bkg.settings.notificationOn = false;
				bkg.onSettingsChanged();
				$('#-mk-notifications').attr('class', 'off');
			} else {
				$(this).html('On');
				bkg.settings.notificationOn = true;
				bkg.onSettingsChanged();
				$('#-mk-notifications').attr('class', 'on');
			}
		});

		$('#oTTS').click(function() {
			if ($(this).html() == 'On') {
				$(this).html('Off');
				bkg.settings.ttsOn = false;
				bkg.onSettingsChanged();
				$('#-mk-tts').attr('class', 'off');
			} else {
				$(this).html('On');
				bkg.settings.ttsOn = true;
				bkg.onSettingsChanged();
				$('#-mk-tts').attr('class', 'on');
			}
		});

		$('#options').click(function() {
			window.open('options' + POSTFIX + '.html', 'options');
			window.close();
		});
	});