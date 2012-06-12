function GPlusActivityParser(assets) {
	this.assets = assets;
}

GPlusActivityParser.prototype.parseProfileId = function(url) {

	var result = url.match(/https:\/\/plus\.google\.com\/(u\/[0-9]\/|)([0-9]+)(\/[a-z]+|)/) || [];

	return result[2];
};

/**
 * @param activityHTMLObj
 * @returns {activity}
 */
GPlusActivityParser.prototype.parseActivityHTML = function(activityHTMLObj) {
	if (!activityHTMLObj) {
		return;
	}

	console.log('parseActivityHTML', activityHTMLObj);

	var activity = new Activity();

	activity.verb = "post";
	activity.id = this.parseActivityId(activityHTMLObj);

	/*
	 * parse visibility status
	 */

	var postVisibilityObj = activityHTMLObj.querySelector(this.assets.gpActivityAccessType);

	if (postVisibilityObj != undefined && postVisibilityObj.innerHTML != 'Public') {
		activity.access.items[0].type = 'limited';
	}

	/*
	 * parse activity url
	 */
	activity.url = this.parseActivityUrl(activityHTMLObj);
	activity = this.parseActivityUpdated(activityHTMLObj, activity);

	/*
	 * get parse author
	 */
	activity = this.parseActivityActor(activityHTMLObj, activity);
	

//	/*
//	 * try to get activity text
//	 */
//	var postTextObj = activityHTMLObj.querySelector(this.assets.gpActivity);
//
//	if (!postTextObj) {
//		console.log('err:failed to parse postTextObj');
//	} else {
//		var activityTextObj = postTextObj.querySelector(this.assets.gpActivityNote);
//
//		if (activityTextObj) {
//			activity.content = activityTextObj.innerHTML;
//		} else {
//			activity.verb = "share";
//			console.log('failed to get gpActivityNote:' + this.assets.gpActivityNote);
//		}
//
//		activityTextObj = postTextObj.querySelector(this.assets.gpActivityText);
//
//		if (!activityTextObj) {
//			console.log('failed to get gpActivityText:' + this.assets.gpActivityText);
//		} else {
////			activity.annotation = activityTextObj.innerHTML;
//		}
//
//		if (activity.content) {
//			activity.title = "Reshared post from " + activity.actor.displayName + this._prepareTitle(activity.content);
//		}
//
//		activity.object.url = activity.url;
////		activity.object.annotation = activity.title;
//
//	}

	/*
	 * try to get activity attachment
	 */
	var activityAttachementObj = undefined;
	/*
	 * check if hangout
	 */
	
	activityAttachementObj = activityHTMLObj.querySelector(this.assets.gpArticle);

	if (activityAttachementObj) {
		console.log('[i]parse parseArticle');
		

		activity = this.parseArticle(activityHTMLObj, activity);
		
		console.log('activity', activity);

		return activity;
		
	}
	
	activityAttachementObj = activityHTMLObj.querySelector(this.assets.gpAttachementHangout);

	if (activityAttachementObj) {
		console.log('[i]parseAttachementHangout');
		activity =  this.parseAttachementHangout(activityAttachementObj, activity);
		console.log('activity', activity);

		return activity;
	}
	
	
	
	
	activityAttachementObj = activityHTMLObj.querySelector(this.assets.gpActivityAttachementAuthor);

	if (activityAttachementObj) {
		console.log('[i]parseAttachementPost');
		activity = this.parseAttachementPost(activityAttachementObj, activity);
		console.log('activity', activity);

		return activity;
	}

	activityAttachementObj = activityHTMLObj.querySelector(this.assets.gpActivityAttachementSpark);
	if (activityAttachementObj) {
		console.log('[i]parseAttachementSpark');
		activity =  this.parseAttachementSpark(activityAttachementObj, activity);
		console.log('activity', activity);

		return activity;
	}

	
	
	console.log('[w]failed to parse parseAttachementPost');

	// activity.title = activity.content;
	// activity.object.content = activity.title;
	//
	// delete activity.content;
	// delete activity.object.annotation;

	console.log('activity', activity);

	return activity;
};

GPlusActivityParser.prototype._parseTime = function(string) {
	// Dec 28, 2011 11:51:42 PM
	// 2011-10-29T14:58:55.696Z
	// Yesterday 11:51 PM

	// 04.01.2012 0:02:07

	// var time = date.split('T');
	// time = time[1].split('.'); // 14:58:55.696Z
	// time = time[0].split(':'); // 14:58:55
	//
	// return time[0] + ':' + time[1];
	return '2011-10-29T14:58:55.696Z';
};

GPlusActivityParser.prototype.parseActivityId = function(activityHTMLObj) {
	if (!activityHTMLObj) {
		throw new Exception('no HTML activity node is given');
	}

	var activityId = activityHTMLObj.getAttribute('id');
	activityId = activityId.replace('update-', '');

	return activityId;
};



GPlusActivityParser.prototype.parseActivityActor = function(activityHTMLObj, activity) {
	if (!activityHTMLObj) {
		throw new Exception('no HTML activity node is given');
	}

	var autorObj = activityHTMLObj.querySelector(this.assets.gpPostAuthor);
	if (!autorObj) {
		console.log('err:failed to parse autorObj');
		return activity;
	} else {

		
		activity.actor.displayName = autorObj != undefined ? autorObj.innerHTML : '';

		var obj = activityHTMLObj.querySelector(this.assets.gpPostAuthorOID);

		activity.actor.id = obj != undefined ? obj.getAttribute('oid') : undefined;
		activity.actor.url = "https://plus.google.com/" + activity.actor.id;

		obj = activityHTMLObj.querySelector('.Nm img');
		activity.actor.image.url = obj != undefined ? obj.getAttribute('src') : undefined;

		activity.actor.image.url = activity.actor.image.url != undefined ? activity.actor.image.url : '';

		activity.actor.image.url = this._prepareUrl(activity.actor.image.url);

	}

	
	
	return activity;
};


GPlusActivityParser.prototype.parseActivityUpdated = function(activityHTMLObj, activity) {
	if (!activityHTMLObj) {
		throw new Exception('no HTML activity node is given');
	}

	var postUrlObj = activityHTMLObj.querySelector(this.assets.gpPostUrlSelector);
	if (!postUrlObj) {
		console.log('err:failed to parse post url. set proper assets.gpPostUrlSelector');
		return activity;
	}

	activity.updated = this._parseTime(postUrlObj.getAttribute('title'));// "2011-10-26T22:54:43.058Z"
	activity.updatedHTMLFull = postUrlObj.getAttribute('title');
	activity.updatedHTMLTime = postUrlObj.innerText;

	return activity;
};

GPlusActivityParser.prototype.parseActivityUrl = function(activityHTMLObj) {
	if (!activityHTMLObj) {
		throw new Exception('no HTML activity node is given');
	}

	var postUrlObj = activityHTMLObj.querySelector(this.assets.gpPostUrlSelector);
	if (!postUrlObj) {
		console.log('err:failed to parse post url');
		return;
	}

	return 'https://plus.google.com/' + postUrlObj.getAttribute('href');
};


GPlusActivityParser.prototype.parseAttachementHangout = function(activityAttachementObj, activity) {
	console.log('parseAttachementHangout...');

	/*
	 * hangout name
	 */
	var obj = activityAttachementObj.querySelector('div.fe');

	activity.verb = "post";
	activity.object.objectType = "note";

	/*
	 * article title
	 */

	activity.title = activity.actor.displayName + " is hanging out right now in a live Hangout On Air!";
	activity.object.content = obj.innerText;
	activity.object.url = activity.url;
	
	activity.provider = { title: "Hangout" };
	
	delete activity.object.attachments;

	return activity;
};

GPlusActivityParser.prototype.parseArticle = function(activityHTMLObj, activity) {
	console.log('parseArticle');

	activityAttachementObj = activityHTMLObj.querySelector('div.Bx div.vg');

	//var obj = activityAttachementObj;

	activity.verb = "share";
	activity.object.objectType = "activity";

	/*
	 * article title
	 */

	activity.object.content = activityAttachementObj != undefined ? activityAttachementObj.innerHTML : undefined;
	activity.title = activity.object.content;
	
//	activity.object.attachments[0] = {
//		objectType : "article",
//		displayName : obj != undefined ? obj.innerText : undefined,
//		content : undefined,
//		url : obj != undefined ? obj.getAttribute('src') : undefined
//	};

	/*
	 * get content
	 */
	var obj = activityHTMLObj.querySelector('div.B-u-Y a');
	activity.object.attachments[0].objectType = "article";
	activity.object.attachments[0].displayName = obj != undefined ? obj.innerHTML : undefined;
	activity.object.attachments[0].url = obj != undefined ? obj.getAttribute('href') : undefined;

	var obj = activityHTMLObj.querySelector('div.B-u-nd-nb');

	activity.object.attachments[0].content = obj != undefined ? obj.innerHTML : undefined;

	
	
//	activity.object.attachments[0].content ='';
	

	/*
	 * get image
	 */

	var obj = activityHTMLObj.querySelector('div.B-u-nd-ja');

	if (obj) {

		activity.object.attachments[1] = {
			objectType : "photo",
			image : {
				url : obj != undefined,
				type : obj != undefined ? obj.getAttribute('data-content-type') : undefined,
				height : 100,
				width : 100
			},
			fullImage : {
				url : obj != undefined,
				type : obj != undefined ? obj.getAttribute('data-content-type') : undefined
			}
		};

		obj = obj.querySelector('img');

		activity.object.attachments[1].image.url = obj != undefined ? obj.getAttribute('src') : undefined;

		activity.object.attachments[1].image.url = this._prepareUrl(activity.object.attachments[1].image.url);

		activity.object.attachments[1].fullImage.url = activity.object.attachments[1].image.url;

		//activity.title = "Reshared post from\n" + this._prepareTitle(activity.object.content);

	}

	return activity;
};

GPlusActivityParser.prototype.parseAttachementSpark = function(activityAttachementObj, activity) {
	console.log('parseAttachementSpark');

	var obj = activityAttachementObj.querySelector('div.B-u-Y a');

	activity.verb = "share";
	activity.object.objectType = "activity";

	/*
	 * article title
	 */

	activity.object.content = obj != undefined ? obj.innerText : undefined;
	activity.title = "post \n" + this._prepareTitle(activity.title);

	activity.object.attachments[0] = {
		objectType : "article",
		displayName : obj != undefined ? obj.innerText : undefined,
		content : undefined,
		url : obj != undefined ? obj.getAttribute('src') : undefined
	};

	/*
	 * get content
	 */
	var obj = activityAttachementObj.querySelector('div.B-u-nd-nb');
	activity.object.attachments[0].content = undefined ? obj.innerHTML : undefined;

	/*
	 * get image
	 */

	var obj = activityAttachementObj.querySelector('div.B-u-ac.B-u-nd-ja.B-u');

	if (obj) {

		activity.object.attachments[1] = {
			objectType : "photo",
			image : {
				url : obj != undefined,
				type : obj != undefined ? obj.getAttribute('data-content-type') : undefined,
				height : 100,
				width : 100
			},
			fullImage : {
				url : obj != undefined,
				type : obj != undefined ? obj.getAttribute('data-content-type') : undefined
			}
		};

		obj = obj.querySelector('img');

		activity.object.attachments[1].image.url = obj != undefined ? obj.getAttribute('src') : undefined;

		activity.object.attachments[1].image.url = this._prepareUrl(activity.object.attachments[1].image.url);

		activity.object.attachments[1].fullImage.url = activity.object.attachments[1].image.url;

	}

	return activity;
};

GPlusActivityParser.prototype._prepareUrl = function(url) {
	if (url) {
		if (url.substring(0, 2) == '//') {
			url = 'https:' + url;
		}
	}
	return url;
};

GPlusActivityParser.prototype._prepareTitle = function(title) {
	if (title) {
		return title.substring(0, 64) + '...';
	}
	return title;
};


GPlusActivityParser.prototype.parseAttachementPost = function(activityAttachementObj, activity) {
	console.log('parseAttachementPost');
	activity.object = activity.getObjectActivity();

	var obj = activityAttachementObj.querySelector(this.assets.gpActivityAttachementAuthorImage);
	activity.object.actor.image.url = obj != undefined ? obj.getAttribute('src') : undefined;

	var obj = activityAttachementObj.querySelector(this.assets.gpActivityAttachementAuthorName);
	activity.object.actor.id = obj != undefined ? obj.getAttribute('oid') : undefined;
	activity.object.actor.displayName = obj != undefined ? obj.innerText : undefined;
	activity.object.actor.url = obj != undefined ? "https://plus.google.com/" + obj.getAttribute('oid') : undefined;

	// activity.object.id = undefined;

	// activity.object.url = "https://plus.google.com/" +
	// postUrlObj.getAttribute('a');
	// activity.object.content = activity.title;
	// activity.object.annotation = activity.title;
	return activity;
};

//GPlusActivityParser.prototype.parseAttachements = function(node, activity) {
//
//	return {
//		"attachments" : [
//				{
//					"objectType" : "article",
//					"displayName" : "LG Releases Gorgeous New Pics of the World&#39;s Largest OLED Screen",
//					"content" : "LG rolled out two more dramatic pictures that show off its new 55-inch OLED HDTV, the world&#39;s largest.",
//					"url" : "http://on.mash.to/ruej1P"
//				},
//				{
//					"objectType" : "photo",
//					"image" : {
//						"url" : "http://images0-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&resize_h=100&url=http%3A%2F%2F5.mshcdn.com%2Fwp-content%2Fuploads%2F2012%2F01%2FLG-55-Inch-360.jpg",
//						"type" : "image/jpeg"
//					},
//					"fullImage" : {
//						"url" : "http://5.mshcdn.com/wp-content/uploads/2012/01/LG-55-Inch-360.jpg",
//						"type" : "image/jpeg",
//						"height" : 225,
//						"width" : 360
//					}
//				} ]
//	};
//
//};
