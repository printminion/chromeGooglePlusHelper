chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	console.log('inputChanged: ' + text);
	suggest([ {
		content : text + "profiles ",
		description : "search for profiles"
	}, {
		content : text + "posts ",
		description : "search for posts (default)"
	}

	]);
});

chrome.omnibox.onInputEntered
		.addListener(function(text) {
			console.log('inputEntered: ' + text);

			var searchType = 'posts';

			if (text.substring(0, 6) == 'posts ') {
				text = 'http://www.google.com/webhp?hl=en&q='
						+ encodeURIComponent(text.substring(6, text.length))
						+ '+site:plus.google.com+inurl%3Aposts%2F*#sclient=psy&hl=en&safe=on&site=webhp&source=hp&q='
						+ (text.substring(6, text.length))
						+ '+site:plus.google.com+inurl%3Aposts%2F*&btnK=Google+Search&pbx=1&oq=&aq=&aqi=&aql=&gs_sm=&gs_upl=&fp=1&biw=1280&bih=685&bav=on.2,or.r_gc.r_pw.&cad=b';

			} else if (text.substring(0, 9) == 'profiles ') {
				searchType = 'posts';

				text = 'http://www.google.com/search?q='
						+ encodeURIComponent(text.substring(9, text.length))
						+ '&tbs=prfl:e';
			} else {
				text = 'http://www.google.com/webhp?hl=en&q='
						+ encodeURIComponent(text)
						+ '+site:plus.google.com+inurl%3Aposts%2F*#sclient=psy&hl=en&safe=on&site=webhp&source=hp&q='
						+ encodeURIComponent(text)
						+ '+site:plus.google.com+inurl%3Aposts%2F*&btnK=Google+Search&pbx=1&oq=&aq=&aqi=&aql=&gs_sm=&gs_upl=&fp=1&biw=1280&bih=685&bav=on.2,or.r_gc.r_pw.&cad=b';

			}

			_gaq.push([ '_trackPageview', '/search/' + searchType ]);

			navigate(text);

		});

function navigate(url) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.update(tab.id, {
			url : url
		});
	});
}

// chrome.omnibox.onInputEntered.addListener(function(text) {
//
// //http://www.google.com/search
//		
//
// });
