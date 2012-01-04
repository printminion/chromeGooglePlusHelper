function GPlusActivityParser(assets) {
	this.assets = assets;
}

GPlusActivityParser.prototype.parseProfileId = function(url) {

	var result = url
			.match(/https:\/\/plus\.google\.com\/(u\/[0-9]\/|)([0-9]+)(\/[a-z]+|)/)
			|| [];

	return result[2];
};

/**
 * @param activityHTMLObj
 * @returns {activity}
 */
GPlusActivityParser.prototype.parsePostDataElement = function(activityHTMLObj) {
	if (!activityHTMLObj) {
		return;
	}

	console.log('parsePostDataElement', activityHTMLObj);

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
	var postUrlObj = activityHTMLObj.querySelector(this.assets.gpPostUrlSelector);
	if (!postUrlObj) {
		console.log('err:failed to parse post url');
		return;
	}

	activity.url = 'https://plus.google.com/' + postUrlObj.getAttribute('href');
	activity.updated = this._parseTime(postUrlObj.getAttribute('title'));// "2011-10-26T22:54:43.058Z"


	/*
	 * get parse author
	 */
	var autorObj = activityHTMLObj.querySelector(this.assets.gpPostAuthor);
	if (!autorObj) {
		console.log('err:failed to parse autorObj');
	} else {
		activity.actor.displayName = autorObj != undefined ? autorObj.innerHTML
				: '';

		var obj = activityHTMLObj.querySelector('.Nm');

		activity.actor.id = obj != undefined ? obj.getAttribute('oid')
				: undefined;
		activity.actor.url = "https://plus.google.com/" + activity.actor.id;

		obj = activityHTMLObj.querySelector('.Nm img');
		activity.actor.image.url = obj != undefined ? obj.getAttribute('src')
				: undefined;

		activity.actor.image.url = activity.actor.image.url != undefined ? activity.actor.image.url
				: '';

		if (activity.actor.image.url.substring(0, 2) == '//') {
			activity.actor.image.url = 'https:' + activity.actor.image.url;
		}
	}
	
	/*
	 * try to get activity text
	 */
	var postTextObj = activityHTMLObj.querySelector(this.assets.gpActivity);

	if (!postTextObj) {
		console.log('err:failed to parse postTextObj');
	} else {
		var activityTextObj = postTextObj.querySelector(this.assets.gpActivityNote);

		if (activityTextObj) {
			activity.content = activityTextObj.innerText;
		} else {
			activity.verb = "share";
			console.log('failed to get gpActivityNote:' + this.assets.gpActivityNote);
		}

		activityTextObj = postTextObj.querySelector(this.assets.gpActivityText);

		if (!activityTextObj) {
			console.log('failed to get gpActivityText:' + this.assets.gpActivityText);
		} else {
			activity.annotation = activityTextObj.innerText;
		}

		activity.title = "Reshared post from " + activity.actor.displayName + activity.content.split(0, 63) + '...';
		activity.object.url = "https://plus.google.com/" + postUrlObj.getAttribute('a');
		activity.object.annotation = activity.title;

	}

	/*
	 * try to get activity attachement
	 */
	var activityAttachementObj = activityHTMLObj
			.querySelector(this.assets.gpActivityAttachementAuthor);

	if (!activityAttachementObj) {
		console.log('err:failed to parse activityAttachementObj');
		
		activity.title = activity.content;
		activity.object.content = activity.title;
		
		delete activity.content;
		delete activity.object.annotation;
		
	} else {

		activity.object = activity.getObjectActivity();

		var obj = activityAttachementObj
				.querySelector(this.assets.gpActivityAttachementAuthorImage);
		activity.object.actor.image.url = obj != undefined ? obj
				.getAttribute('src') : undefined;

		var obj = activityAttachementObj
				.querySelector(this.assets.gpActivityAttachementAuthorName);
		activity.object.actor.id = obj != undefined ? obj.getAttribute('oid')
				: undefined;
		activity.object.actor.displayName = obj != undefined ? obj.innerText
				: undefined;
		activity.object.actor.url = obj != undefined ? "https://plus.google.com/"
				+ obj.getAttribute('oid')
				: undefined;

		// activity.object.id = undefined;

		// activity.object.url = "https://plus.google.com/" +
		// postUrlObj.getAttribute('a');
		// activity.object.content = activity.title;
		// activity.object.annotation = activity.title;
	}

	console.log('activity', activity);

	return activity;
};

GPlusActivityParser.prototype._parseTime = function(string) {
	// Dec 28, 2011 11:51:42 PM
	// 2011-10-29T14:58:55.696Z
	// Yesterday 11:51 PM
	
	//04.01.2012 0:02:07
	

	// var time = date.split('T');
	// time = time[1].split('.'); // 14:58:55.696Z
	// time = time[0].split(':'); // 14:58:55
	//
	// return time[0] + ':' + time[1];
	return '2011-10-29T14:58:55.696Z';
};

GPlusActivityParser.prototype.parseActivityId = function(activityHTMLObj){
	if (!activityHTMLObj) {
		throw new Exception('no HTML activity node is given');
	}
	
	var activityId = activityHTMLObj.getAttribute('id');
	activityId = activityId.replace('update-', '');
	
	
	
	return activityId;
};

GPlusActivityParser.prototype.parseAttachements = function(node, activity) {

	return {
		"attachments" : [
				{
					"objectType" : "article",
					"displayName" : "LG Releases Gorgeous New Pics of the World&#39;s Largest OLED Screen",
					"content" : "LG rolled out two more dramatic pictures that show off its new 55-inch OLED HDTV, the world&#39;s largest.",
					"url" : "http://on.mash.to/ruej1P"
				},
				{
					"objectType" : "photo",
					"image" : {
						"url" : "http://images0-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&resize_h=100&url=http%3A%2F%2F5.mshcdn.com%2Fwp-content%2Fuploads%2F2012%2F01%2FLG-55-Inch-360.jpg",
						"type" : "image/jpeg"
					},
					"fullImage" : {
						"url" : "http://5.mshcdn.com/wp-content/uploads/2012/01/LG-55-Inch-360.jpg",
						"type" : "image/jpeg",
						"height" : 225,
						"width" : 360
					}
				} ]
	};

};
