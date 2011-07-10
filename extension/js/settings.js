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
	 
	get addBookmarks() {
        if(localStorage['addBookmarks'] == 'NaN') return false;
		return localStorage['addBookmarks'] || false;
	}, 
	set addBookmarks(val) {
		localStorage['addBookmarks'] = val;
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
	
	get notificationSound() {
        if(localStorage['notificationSound'] == 'NaN') return 'sound/01.mp3';
		return localStorage['notificationSound'] || 'sound/01.mp3';
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
	}
	
};

//function pluginInit() {
//	  
//    if(show_options_page && (localStorage["version"] == null || localStorage["version"] != version)) {
//    	if (localStorage["version"] == null){
//    		populateExampleData();// on first run
//    	}
//    	
//    	localStorage["version"] = version;
//        chrome.tabs.create({url : "options.html"});        
//    } else if(show_options_page == false && (localStorage["version"] == null || localStorage["version"] != version)) {
//		localStorage["version"] = version;
//	}
//}

//function populateExampleData(){
//	/*
//	 * set example values probes
//	 */
//	localStorage["probes"] = '{"DD24EC051A604188B611C8E92CE9B679":{"id":"DD24EC051A604188B611C8E92CE9B679","query":"earthquake","threshold":0,"shortTermTweetsPerMin":5.6000000000000005,"longTermTweetsPerMin":4.362914182350616,"serviceId":"twitter","searchQuery":"http://search.twitter.com/search.json?&q=","state":1},"CFBA803F393348F183575CFE2E1A7F2A":{"id":"CFBA803F393348F183575CFE2E1A7F2A","query":"gtugbattle","threshold":0,"shortTermTweetsPerMin":0.015043235198161718,"longTermTweetsPerMin":0.0021098137151584176,"serviceId":"twitter","searchQuery":"http://search.twitter.com/search.json?&q=","state":1,"latitude":"51.16569","longitude":"10.45153","radius":"200","locationAddress":"Germany"},"5700AD36547C44FB8E29BFC5E08DCEDB":{"id":"5700AD36547C44FB8E29BFC5E08DCEDB","query":"nexusone","threshold":0,"shortTermTweetsPerMin":0.002115316431176494,"longTermTweetsPerMin":0.003802670455748913,"serviceId":"twitter","searchQuery":"http://search.twitter.com/search.json?&q=","state":1,"latitude":"37.38605","longitude":"-122.08385","radius":"80","locationAddress":"Mountain View"}}';
//}


//function goOptions() {
//	chrome.tabs.create({url : "options.html"}); 
//}
