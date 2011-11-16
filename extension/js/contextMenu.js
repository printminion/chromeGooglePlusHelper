var menuId = null;
var pageInfo = null;
var tabs = new Object();

if (chrome.contextMenus) {
	showContextMenu();
}

function showContextMenu() {
	removeContextMenu();

	menuId = chrome.contextMenus.create({
		'title' : chrome.i18n.getMessage('mnu_search_on_googleplus'),
		'documentUrlPatterns' : [ 'http://*/*', 'https://*/*' ],
		'onclick' : onClickHandler,
		'contexts' : [ 'selection' ]
	});
}

function removeContextMenu() {
	if (menuId != null) {
		chrome.contextMenus.remove(menuId);
		menuId = null;
	}
}

function onClickHandler(info, tab) {

//	console.log('onClickHandler', info);
	
	chrome.tabs.create({
		url : 'https://plus.google.com/s/' + encodeURIComponent(info.selectionText)
	});
	

}