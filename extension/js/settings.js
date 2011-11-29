var show_options_page = true;
var maxProbesLimit = 7;
var alreadyAlerted = false;

var settings = {

	get addTwitter() {
        if(localStorage['addTwitter'] == 'NaN') return true;
		return localStorage['addTwitter'] || true;
	}, 
	set addTwitter(val) {
		localStorage['addTwitter'] = val;
	},	
	
	get addTranslate() {
        if(localStorage['addTranslate'] == 'NaN') return true;
		return localStorage['addTranslate'] || true;
	},
	set addTranslate(val) {
		localStorage['addTranslate'] = val;
	},
	
	get addHashtags() {
        //if(localStorage['addHashtags'] == 'NaN') return true;
		//return localStorage['addHashtags'] || true;
		return false;
	},
	set addHashtags(val) {
		localStorage['addHashtags'] = val;
	},
	 
	get addBookmarks() {
        if(localStorage['addBookmarks'] == 'NaN') return false;
		return localStorage['addBookmarks'] || false;
	}, 
	set addBookmarks(val) {
		localStorage['addBookmarks'] = val;
	},	
	
	
	get addDelicious() {
        if(localStorage['addDelicious'] == 'NaN') return false;
		return localStorage['addDelicious'] || false;
	}, 
	set addDelicious(val) {
		localStorage['addDelicious'] = val;
	},
	
	
	get addPlusOne() {
        if(localStorage['addPlusOne'] == 'NaN') return true;
		return localStorage['addPlusOne'] || false;
	}, 
	set addPlusOne(val) {
		localStorage['addPlusOne'] = val;
	},
	
	get addPlusOneCounter() {
        if(localStorage['addPlusOneCounter'] == 'NaN') return true;
		return localStorage['addPlusOneCounter'] || false;
	}, 
	set addPlusOneCounter(val) {
		localStorage['addPlusOneCounter'] = val;
	},
	
	
	get addFacebook() {
        if(localStorage['addFacebook'] == 'NaN') return false;
		return localStorage['addFacebook'] || false;
	}, 
	set addFacebook(val) {
		localStorage['addFacebook'] = val;
	},
	
	get addChromeBookmarks() {
        if(localStorage['addChromeBookmarks'] == 'NaN') return true;
		return localStorage['addChromeBookmarks'] || false;
	}, 
	set addChromeBookmarks(val) {
		localStorage['addChromeBookmarks'] = val;
	},	
	
	get addChromeBookmarksToolbar() {
        if(localStorage['addChromeBookmarksToolbar'] == 'NaN') return true;
		return localStorage['addChromeBookmarksToolbar'] || false;
	}, 
	set addChromeBookmarksToolbar(val) {
		localStorage['addChromeBookmarksToolbar'] = val;
	},	
	
	
	get addTranslateTo() {
        if(localStorage['addTranslateTo'] == 'NaN') return 'en';
		return localStorage['addTranslateTo'] || 'en';
	}, 
	set addTranslateTo(val) {
		localStorage['addTranslateTo'] = val;
	},
	
	get notificationOn() {
        if(localStorage['notificationOn'] == 'NaN' || localStorage['notificationOn'] == undefined) return false;
		return localStorage['notificationOn'] == 'true' ? true : false;
	},
	set notificationOn(val) {
		localStorage['notificationOn'] = val;
	},
	
	get ttsOn() {
        if(localStorage['ttsOn'] == 'NaN' || localStorage['ttsOn'] == undefined) return false;
		return localStorage['ttsOn'] == 'true' ? true : false;
	},
	set ttsOn(val) {
		localStorage['ttsOn'] = val;
	},
	
	get notificationSound() {
        if(localStorage['notificationSound'] == 'NaN') return 'sound/01.mp3';
		return localStorage['notificationSound'];
	}, 
	set notificationSound(val) {
		localStorage['notificationSound'] = val;
	},	

	get notificationTime() {
        if(localStorage['notificationTime'] == 'NaN') return 5000;
		return localStorage['notificationTime'] || 5000;
	}, 
	set notificationTime(val) {
		localStorage['notificationTime'] = val;
	},	
	
	get isFirstRun(){
		if(localStorage["version"] == null){
			return true;
		}
		return false;
	},
	
	get isApiEnabled() {
        if(localStorage['isApiEnabled'] == 'NaN') return false;
		return localStorage['isApiEnabled'] || false;
	}, 
	set isApiEnabled(val) {
		localStorage['isApiEnabled'] = val;
	}
	
};