var optionsValues = {
			 options: {
			  option_add_twitter: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_facebook: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_translate: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_bookmark: { type: "attr", 'default': false, value: true, attr: "checked" }
			, option_add_bookmark_delicious: { type: "attr", 'default': false, value: false, attr: "checked" }
			, option_add_plusone_button: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_plusone_button_count: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_chrome_bookmark: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_chrome_bookmark_toolbar: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_add_translate_to: { type: "val", 'default': "en", value: "en"}
			, option_notificationOn: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_notification_sound: { type: "val", 'default': "sound/01.mp3", value: "sound/01.mp3"}
			, option_notification_time: {type: "val", 'default': 5000, value: 5000}
			, option_ttsOn: { type: "attr", 'default': true, value: true, attr: "checked" }
			, option_tts_language: { type: "val", 'default': "native", value: "native"}
			, option_tts_gender: { type: "val", 'default': "female", value: "female"}
			, option_tts_lang: { type: "val", 'default': "en-US", value: "en-US"}
			, option_tts_rate: { type: "val", 'default': "1.0", value: "1.0"}
			, option_tts_pitch: { type: "val", 'default': "1.0", value: "1.0"}
			, option_tts_volume: { type: "val", 'default': "1.0", value: "1.0"}
			, option_debug: { type: "attr", 'default': true, value: true, attr: "checked" }
			}
			};

	
	function selectTab(tab) {
		if (tab == undefined || tab == '') {
			tab = "options";
		}
		tab = tab.replace('#', '');
		
		$('.d-Aa').removeClass('d-Aa-Pa');
		$('#-x-' + tab).addClass('d-Aa-Pa');
		
		$('#options_tab').hide();
		$('#tts_tab').hide();
		$('#api_tab').hide();
		$('#privacy-policy_tab').hide();
		$('#about_tab').hide();
		

		$('#' + tab + '_tab').show();
		
	}
	
	var lastApiKey = undefined;
	$(document).ready(function() {
		
		$('button#save_button').click(function(){
			saveOptions();
		});
		
		$('button#reset_button').click(function(){
			resetOptions();
			return false;
		});
		
		
		$('button#button_play').click(function(){
			options.playSound();
		});
		
		
		$('button#speak').click(function(){
			options.doSpeakOption();
		});
		
		
		$('button#stop').click(function(){
			options.doStopSpeakOption();
		});
	
		$('input.-x-onchange-dirty, select.-x-onchange-dirty').change(function(){
			markDirty();
		});
		
		$('input#option_notification_time').click(function(){
			markDirty();
	 		$('#option_notification_time_value').text(this.value/1000);
		});
		 
		
	   var currentTab = location.hash.replace('#', '');
		
	   selectTab(currentTab);
		
	   
		chrome.tts.getVoices(
			    function(voices) {
			      for (var i = 0; i < voices.length; i++) {

			    	  $('#option_tts_language')
			          .append($("<option></option>")
			          .attr("value", voices[i].voiceName)
			          .text(voices[i].voiceName));
			          
			        console.log('Voice ' + i + ':');
			        console.log('  name: ' + voices[i].voiceName);
			        console.log('  lang: ' + voices[i].lang);
			        console.log('  gender: ' + voices[i].gender);
			        console.log('  extension id: ' + voices[i].extensionId);
			        console.log('  event types: ' + voices[i].eventTypes);
			      };
		});
		
	   $('.d-Aa').click(function() {
			selectTab($(this).attr('href'));
		});
	   
	   $('#option_apiKey').focus(function() {
		   lastApiKey = $('#option_apiKey').val();
	   }).blur(function() {
			 if (lastApiKey != $('#option_apiKey').val()) {
				 $('#btnTestApi').addClass('d-ze-qc');
			 }
	   });
	   
	   $('#btnTestApi').click(function() {

		   if ( $('#option_apiKey').val() == undefined ||  $('#option_apiKey').val() == '') {
				console.log('settings.apiKey', bkg.settings.apiKey);
				alert('Please put your simple api key in to textbox\nand hit the validate button');
				return;
			}
		   
		     var request = 'https://www.googleapis.com/plus/v1/people/104512463398531242371?fields=displayName%2Cid%2Cimage%2Cname&pp=1&key=' + $('#option_apiKey').val();

		     $('#btnTestApi').text('Validating...');
				bkg.doApiCall(request, function(result){
					if (result.error) {
						$('#btnTestApi').text('Validate');
						
						alert('wrong api key');
						bkg.settings.apiKey = '';
						bkg.settings.isApiEnabled = false;
						assets.googlePlusAPIKey = '';
						bkg.onSettingsChanged();
						
						$('#option_apiKey').val('');
						$('#option_apiKey').focus();
					} else {
						$('#btnTestApi').text('Validate');
						bkg.settings.apiKey = $('#option_apiKey').val();
						bkg.settings.isApiEnabled = true;
						assets.googlePlusAPIKey = bkg.settings.apiKey;
						bkg.onSettingsChanged();
						alert('Your Simply access Google+ API has been saved');
						// markDirty();
					}
					
					$('#btnTestApi').removeClass('d-ze-qc');

					
				});
			
	/*
	 * googleAuth.authorize(function() { console.log('OAuth:',
	 * googleAuth.getAccessToken()); });
	 */	   
	   });
	   
	   
	   // d-Aa-qa-cq
/*
 * $('.d-Aa').hover( function () { $('div',
 * this).removeClass('d-Aa-qa').addClass('d-Aa-qa-cq'); }, function () {
 * $('div', this).removeClass('d-Aa-qa-cq').addClass('d-Aa-qa'); } );
 */
		

		if (bkg.settings.addTwitter == "true") {
			$("#option_add_twitter").attr("checked", "true");
		}

		if (bkg.settings.addFacebook == "true") {
			$("#option_add_facebook").attr("checked", "true");
		}
		
		if (bkg.settings.addTranslate == "true") {
			$("#option_add_translate").attr("checked", "true");
		}
		
		/*
		 * if (bkg.settings.addHashtags == "true") {
		 * $("#option_add_hashtags").attr("checked", "true"); }
		 */
		
		
		if (bkg.settings.addBookmarks == "true") {
			$("#option_add_bookmark").attr("checked", "true");
		}
		
		if (bkg.settings.addDelicious == "true") {
			$("#option_add_bookmark_delicious").attr("checked", "true");
		}
		
		
		if (bkg.settings.addPlusOne == "true") {
			$("#option_add_plusone_button").attr("checked", "true");
		}
		
		if (bkg.settings.addPlusOneCounter == "true") {
			$("#option_add_plusone_button_count").attr("checked", "true");
		}
		
		if (bkg.settings.addChromeBookmarks == "true") {
			$("#option_add_chrome_bookmark").attr("checked", "true");
		}
		
		if (bkg.settings.addChromeBookmarksToolbar == "true") {
			$("#option_add_chrome_bookmark_toolbar").attr("checked", "true");
		}
		

		$("#option_add_translate_to").val(bkg.settings.addTranslateTo);

		if (bkg.settings.notificationOn) {
			$("#option_notificationOn").attr("checked", "true");
		}

		$("#option_notification_sound").val(bkg.settings.notificationSound);
		$('#option_notification_time').val(bkg.settings.notificationTime);
		$('#option_notification_time_value').text(bkg.settings.notificationTime/1000);
		/*
		 * TTS
		 */
		if (bkg.settings.ttsOn || bkg.settings.ttsOn == "true") {
			$("#option_ttsOn").attr("checked", "true");
		}
	
		$('#option_tts_lang').val(bkg.settings.ttsLang);
		$('#option_tts_gender').val(bkg.settings.ttsGender);
		$('#option_tts_pitch').val(bkg.settings.ttsPitch);
		$('#option_tts_rate').val(bkg.settings.ttsRate);
		$('#option_tts_volume').val(bkg.settings.ttsVolume);
		
		if (bkg.settings.isDebug == "true") {
			$("#option_debug").attr("checked", "true");
		}
			
		/*
		 * KEY
		 */
		 if (bkg.assets.googlePlusAPIKey != bkg.settings.apiKey) {
				$('#option_apiKey').val(bkg.settings.apiKey);
		 };
		
	});
	
	
	var saveButton;

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
		var option = undefined;
		
		for ( var option_name in optionsValues.options) {
			option = optionsValues.options[option_name];
			
			switch (option.type) {
			case 'attr':
				console.log(option_name, option);
				$("#" + option_name).attr(option.attr, option.default);
				break;
			case 'val':
				console.log(option_name, option);
				$("#" + option_name).val(option.default);
				break;
			default:
				console.log('unknown type');
				break;
			}
		}
		saveOptions();
		return false;
	}
	
	function markDirty() {
		saveButton.disabled = false;
		$('#save_button').addClass('d-ze-qc');

	}

	function markClean() {
		saveButton.disabled = true;
		$('#save_button').removeClass('d-ze-qc');
	}

	// Saves options to localStorage.
	function save_options() {

		bkg.settings.addTwitter = $("#option_add_twitter").attr("checked");
		bkg.settings.addFacebook = $("#option_add_facebook").attr("checked");
		
		bkg.settings.addTranslate = $("#option_add_translate").attr("checked");
	
		// bkg.settings.addHashtags = $("#option_add_hashtags").attr("checked");
		
		bkg.settings.addBookmarks = $("#option_add_bookmark").attr("checked");
		bkg.settings.addDelicious = $("#option_add_bookmark_delicious").attr("checked");
		
		bkg.settings.addPlusOne = $("#option_add_plusone_button").attr("checked");
		bkg.settings.addPlusOneCounter = $("#option_add_plusone_button_count").attr("checked");
		
		bkg.settings.addChromeBookmarks = $("#option_add_chrome_bookmark").attr("checked");
		bkg.settings.addChromeBookmarksToolbar = $("#option_add_chrome_bookmark_toolbar").attr("checked");
		
		bkg.settings.addTranslateTo = $("#option_add_translate_to").val();

		bkg.settings.notificationOn = $("#option_notificationOn").attr("checked");
		bkg.settings.notificationSound = $("#option_notification_sound").val();
		bkg.settings.notificationTime = $('#option_notification_time').val();

		/*
		 * tts
		 */
		bkg.settings.ttsOn = $("#option_ttsOn").attr("checked");
		bkg.settings.ttsLang = $('#option_tts_lang').val();
		bkg.settings.ttsGender = $('#option_tts_gender').val();
		bkg.settings.ttsPitch = $('#option_tts_pitch').val();
		bkg.settings.ttsRate = $('#option_tts_rate').val();
		bkg.settings.ttsVolume = $('#option_tts_volume').val();
	
		bkg.settings.apiKey = $("#option_apiKey").val();
		
		bkg.settings.isDebug = $("#option_debug").attr("checked");
		
		// Refresh the extension by reseting timer.
		bkg.onSettingsChanged();

		$('#save_status').fadeIn('fast');
		$('#save_status').fadeOut(3000);
	};
	
	

	

	
	