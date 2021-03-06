var rootFolderId = '2';
var parentId = undefined;

var folderName = 'Google+do_not_delete_it';

function Bookmarks() {

	this.rootFolderId = '2';
	this.parentId = undefined;
	this.folderName = 'Google+do_not_delete_it';

};

Bookmarks.prototype.init = function() {
	console.log('bookmarks.init');

	(function(component) {
		getBookmarksNode(rootFolderId, function(foundParentId) {

			console.log('foundParentId', foundParentId);
			component.parentId = foundParentId;

		});
	})(this);
};

Bookmarks.prototype.addBookmark = function(data, callback) {
	console.log('bookmarks.addBookmark');//, callback);
	var url = data.url;
	var title = data.text;

	(function(component) {
		searchBookmark(component.parentId, url, function(found) {

			console.log('add.onFound', found);

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
					return;
				});

			}

		});
	})(this);
};

Bookmarks.prototype.checkBookmark = function(data, callback) {
	console.log('bookmarks.checkBookmarked');//, callback);
	var url = data.url;

	(function(component) {
		searchBookmark(component.parentId, url, function(found) {

			console.log('found', found);

			if (found) {
				callback(true);
				return;
			} else {
				callback(false);
				return;
			}

		});
	})(this);
};

Bookmarks.prototype.removeBookmark = function(data, callback) {
	console.log('bookmarks.removeBookmark');//, callback);
	var url = data.url;

	(function(component) {

		chrome.bookmarks.search(url, function(results) {

			console.log('chrome.bookmarks.search', results);

			var deleted = 0;
			for ( var i = 0; i < results.length; i++) {

				if (results[i].parentId != component.parentId) {
					continue;
				}

				console.log("test", results[i]);

				chrome.bookmarks.remove(results[i].id, function() {
					deleted++;
				});

				if (deleted > 0) {
					callback(true);
					return;
				}

			}
			callback(false);
			return;

		});		
		
	})(this);
};

function init() {

	getBookmarksNode(rootFolderId, function(foundParentId) {

		console.log('foundParentId', foundParentId);
		parentId = foundParentId;

	});

	console.log('rootFolderId2', rootFolderId);
	console.log('parentId', parentId);

	return;
}

function getBookmarksNode(id, callback) {

	chrome.bookmarks.getTree(function(nodes) {
		console.log('getTree', nodes);
	});

	console.log('getChildren', id);

	chrome.bookmarks.getChildren(id, function(nodes) {
		console.log('getChildren', nodes);

		for ( var node in nodes) {

			if (nodes[node].title != folderName) {
				continue;
			}
			
			console.log('gotParent', nodes[node].id);
			callback(nodes[node].id);
			
			return;
		}

		console.log('create new folder');

		chrome.bookmarks.create({
			parentId : id,
			title : folderName
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

function searchBookmark(parentId, url, callback) {
	console.log('searchBookmark', parentId, url);//, callback);

	if (parentId == undefined) {
		console.log('searchBookmark:Failure due no parentId is given');
		callback(false);		
	}
	
	if (url == undefined) {
		console.log('searchBookmark:Failure due no url is given');
		callback(false);		
	}
	
	
	
	chrome.bookmarks.search(url, function(nodes) {

		console.log('chrome.bookmarks.search', nodes);

		console.log('found overall bookmarks:', nodes.length);

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

function starMe() {
	var o = document.getElementById('star');

	o.setAttribute('class', 'wsa');
}

function unstarMe() {
	var o = document.getElementById('star');

	o.setAttribute('class', 'wpb');
}