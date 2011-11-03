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

				text = 'https://plus.google.com/s/' + encodeURIComponent(text.substring(6, text.length)) + '/posts';
					
			} else if (text.substring(0, 9) == 'profiles ') {
				searchType = 'posts';

				text = 'https://plus.google.com/s/' + encodeURIComponent(text.substring(9, text.length)) + '/people';
				
			} else {
				text = 'https://plus.google.com/s/' + encodeURIComponent(text);
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
