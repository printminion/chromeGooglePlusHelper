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
 * @param currentElement
 * @returns {activity}
 */
GPlusActivityParser.prototype.parsePostDataElement = function(currentElement) {
	if (!currentElement) {
		return;
	}

	console.log('parsePostDataElement', currentElement);

	var activity = new Activity();

	activity.verb = "share";

	activity.id = currentElement.getAttribute('id');
	activity.id = activity.id.replace('update-', '');

	/*
	 * parse visibility status
	 */

	var postVisibilityObj = currentElement
			.querySelector(this.assets.gpActivityAccessType);

	if (postVisibilityObj != undefined
			&& postVisibilityObj.innerHTML != 'Public') {
		activity.visibility = 'limited';
	}

	// console.log(updateDiv);
	var postUrlObj = currentElement.querySelector(this.assets.gpPostUrlSelector);
	if (!postUrlObj) {
		console.log('err:failed to parse post url');
		return;
	}

	activity.url = 'https://plus.google.com/' + postUrlObj.getAttribute('href');
	activity.updated = this._parseTime(postUrlObj.getAttribute('title'));// "2011-10-26T22:54:43.058Z"

	
	// console.log(postUrlObj);
	/*
	 * try to get activity text
	 */
	var postTextObj = currentElement.querySelector(this.assets.gpActivity);

	if (!postTextObj) {
		console.log('err:failed to parse postTextObj');
	} else {
		var activityTextObj = postTextObj.querySelector(this.assets.gpActivityNote);

		if (activityTextObj) {
			activity.title = activityTextObj.innerText;
		} else {

			console.log('failed to get gpActivityNote:'
					+ this.assets.gpActivityNote);

			activityTextObj = postTextObj.querySelector(this.assets.gpActivityText);

			if (!activityTextObj) {
				console.log('failed to get gpActivityText:'
						+ this.assets.gpActivityText);
			} else {
				activity.title = activityTextObj.innerText;
			}

		}
		
		
		activity.object.url = "https://plus.google.com/" + postUrlObj.getAttribute('a');
		activity.object.content = activity.title;
		activity.object.annotation = activity.title;
		

	}

	/*
	 * get author
	 */
	var autorObj = currentElement.querySelector(this.assets.gpPostAuthor);
	if (!autorObj) {
		console.log('err:failed to parse autorObj');
	} else {
		activity.actor.displayName = autorObj != undefined ? autorObj.innerHTML
				: '';

		var obj = currentElement.querySelector('.Nm');

		activity.actor.id = obj != undefined ? obj.getAttribute('oid')
				: undefined;
		activity.actor.url = "https://plus.google.com/" + activity.actor.id;

		obj = currentElement.querySelector('.Nm img');
		activity.actor.image.url = obj != undefined ? obj.getAttribute('src')
				: undefined;
		
		activity.actor.image.url = activity.actor.image.url != undefined ? activity.actor.image.url.replace('//', 'https://') : '';
	}

	/*
	 * try to get activity attachement
	 */
	var activityAttachementObj = currentElement
			.querySelector(this.assets.gpActivityAttachementAuthor);

	if (!activityAttachementObj) {
		console.log('err:failed to parse activityAttachementObj');
	} else {

		activity.object = activity.getObjectActivity();

		var obj = activityAttachementObj
				.querySelector(this.assets.gpActivityAttachementAuthorImage);
		activity.object.actor.image.url = obj != undefined ? obj
				.getAttribute('src') : undefined;

		var obj = activityAttachementObj.querySelector(this.assets.gpActivityAttachementAuthorName);
		activity.object.actor.id = obj != undefined ? obj.getAttribute('oid')
				: undefined;
		activity.object.actor.displayName = obj != undefined ? obj.innerText
				: undefined;
		activity.object.actor.url = obj != undefined ? "https://plus.google.com/"
				+ obj.getAttribute('oid')
				: undefined;

		//activity.object.id = undefined;
		
//		activity.object.url = "https://plus.google.com/" + postUrlObj.getAttribute('a');
//		activity.object.content = activity.title;
//		activity.object.annotation = activity.title;
	}

	console.log('activity', activity);

	return activity;
};

GPlusActivityParser.prototype._parseTime = function(string) {
	//Dec 28, 2011 11:51:42 PM
	//2011-10-29T14:58:55.696Z
	//Yesterday 11:51 PM
	
//	var time = date.split('T');
//	time = time[1].split('.'); // 14:58:55.696Z
//	time = time[0].split(':'); // 14:58:55
//
//	return time[0] + ':' + time[1];
	return '2011-10-29T14:58:55.696Z';
};


// function parsePostDataElementOld(currentElement) {
// if (!currentElement) {
// return;
// }
// console.log('parsePostDataElementOld', currentElement);
// var data = {
// id: '',
// text : '',
// url : '',
// author : '',
// visibility: 'public'
// };
//	
//	
// data.id = currentElement.getAttribute('id');
// data.id = data.id.replace('update-', '');
//	
// /*
// * parse visibility status
// */
//	
// var postVisibilityObj =
// currentElement.querySelector("span.d-k.Ar.zr.Gp");//span.d-h a-b-f-i-aGdrWb
// a-b-f-i-lj62Ve a-f-i-Mb");
//	
// if (postVisibilityObj != undefined && postVisibilityObj.innerHTML !=
// 'Public') {
// data.visibility = 'limited';
// }
//	
//	
//	
// // console.log(updateDiv);
// var postUrlObj = currentElement.querySelector(this.assets.gpPostUrlSelector);
//	
//	
// if(!postUrlObj) {
// console.log('err:failed to parse post url');
// }
//	
// // console.log(postUrlObj);
// /*
// * try to get activity text
// */
// var postTextObj = currentElement.querySelector(this.assets.gpActivity);
//
// if (postTextObj) {
//		
// var activityTextObj = postTextObj.querySelector(this.assets.gpActivityNote);
//		
// if (activityTextObj) {
// data.text = activityTextObj.innerText;
// } else {
//
// console.log('failed to get gpActivityNote:' + this.assets.gpActivityNote);
//
// activityTextObj = postTextObj.querySelector(this.assets.gpActivityText);
//			
// if (!activityTextObj) {
// console.log('failed to get gpActivityText:' + this.assets.gpActivityText);
// } else {
// data.text = activityTextObj.innerText;
// }
//			
//			
// }
//		
//		
// }
//
//	
// // a-f-i-u-ki
// /*
// * get author
// */
// // cs2K7c a-f-i-Zb a-f-i-Zb-U
// var autorObj = currentElement.querySelector(this.assets.gpPostAuthor);
// var author = autorObj != undefined ? autorObj.innerHTML : '';
//
// data.url = 'https://plus.google.com/' + postUrlObj.getAttribute('href');
// data.author = author;
//	
// var autorPictureObj = currentElement.querySelector('.Nm');
// data.authorOID = autorPictureObj != undefined ?
// autorPictureObj.getAttribute('oid') : undefined;
//	
// autorPictureObj = currentElement.querySelector('.Nm img');
// data.authorImage = autorPictureObj != undefined ?
// autorPictureObj.getAttribute('src') : undefined;
//	
//
// console.log('data', data);
//
// return data;
// }
