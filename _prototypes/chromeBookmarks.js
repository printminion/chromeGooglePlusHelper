var rootFolderId = '2';
var parentId = undefined;

var folderName = 'Google+do_not_delete_it';

var bookmarks = Bookmarks();

function Bookmarks() {
	
	this.rootFolderId = '2';
	this.parentId = undefined;
	this.folderName = 'Google+do_not_delete_it';
	
};

Bookmarks.prototype.init = function() {
	
	getBookmarksNode(rootFolderId, function(foundParentId) {

		console.log('foundParentId', foundParentId);
		this.parentId = foundParentId;

	});

};


function init() {

	getBookmarksNode(rootFolderId, function(foundParentId) {

		console.log('foundParentId', foundParentId);
		parentId = foundParentId;

	});

	console.log('rootFolderId2', rootFolderId);
	console.log('parentId', parentId);

	return;
	var elements = document.querySelectorAll('#star');

	for ( var element in elements) {

		console.log('chrome.bookmarks.search', elements[element].value);

		/*
		 * chrome.bookmarks.search(elements[element].value, function(results) {
		 * 
		 * 
		 * if (results.length > 0) { starMe(); } else { unstarMe(); }
		 * 
		 * });
		 */
	}

}

function getBookmarksNode(id, callback) {

	chrome.bookmarks.getTree(function(nodes) {
		console.log('getTree', nodes);
	});

	console.log('getChildren', id);

	chrome.bookmarks.getChildren(id, function(nodes) {
		console.log('getChildren', nodes);

		for ( var node in nodes) {

			if (nodes[node].title == folderName) {
				console.log('gotParent', nodes[node].id);
				callback(nodes[node].id);
				return;
			}
		}

		console.log('create new folder');

		chrome.bookmarks.create({
			parentId : id,
			title : folderName,
		}, function(node) {
			callback(node.id);
			return;
		});

	});

}

function search(url) {
	console.log('searchBookmarks...');
	var o = document.getElementById('txtSearch');

	searchBookmark(parentId, o.value, function(bFound) {

		console.log('chrome.bookmarks.search', bFound);

		if (bFound) {
			starMe();
		} else {
			unstarMe();
		}

	});
}

// http://techcrunch.com/2011/07/11/the-techcrunch-redesign-a-copy-and-paste-hatemail-template/
function searchBookmark(parentId, url, callback) {
	console.log('searchBookmark', parentId, url, callback);

	chrome.bookmarks.search(url, function(nodes) {

		console.log('chrome.bookmarks.search', nodes);

		console.log(nodes.length);

		for ( var node in nodes) {
			console.log('node', nodes[node].parentId, parentId);
			if (nodes[node].parentId == parentId) {
				console.log('searchBookmark:found');
		
				callback(true);
				return;
			}
		}

		callback(false);

	});
}

function remove() {
	console.log('removeBookmark...');
	var o = document.getElementById('txtDelete');

	chrome.bookmarks.search(o.value, function(results) {

		console.log('chrome.bookmarks.search', results);

		var deleted = 0;
		for ( var i = 0; i < results.length; i++) {

			if (results[i].parentId != parentId) {
				continue;
			}

			console.log("test", results[i]);

			chrome.bookmarks.remove(results[i].id, function() {
				deleted++;
			});

			if (deleted > 0) {
				unstarMe();
			}

		}

	});
}

function add() {

	console.log('addBookmarks...');
	var o = document.getElementById('txtAdd');

	var url = o.value;

	searchBookmark(parentId, url, function(found) {

		console.log('add.found', found);

		if (found) {
			console.log('add.found skip add - already exits');
		} else {

			console.log('add.found', found);
			chrome.bookmarks.create({
				parentId : parentId,
				title : 'test',
				url : url
			}, function() {

			});

		}

	});
}


function addBookmark(data, callback) {
	console.log('addBookmark', callback);
	var url = data.url;
	var title = data.text;
	
	searchBookmark(parentId, url, function(found) {

		console.log('add.found', found);

		if (found) {
			console.log('add.found skip add - already exits');
		} else {

			console.log('add.found', found);
			chrome.bookmarks.create({
				parentId : bookmarks.parentId,
				title : title,
				url : url
			}, function() {
				callback();
			});

		}

	});
}

function starMe() {
	var o = document.getElementById('star');

	o.setAttribute('class', 'wsa');
}

function unstarMe() {
	var o = document.getElementById('star');

	o.setAttribute('class', 'wpb');
}