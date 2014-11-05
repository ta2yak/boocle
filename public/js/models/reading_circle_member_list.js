define(['parse', 'underscore', 
		"models/session", "models/reading_circle_member"],function(Parse, _, SessionManager, ReadingCircleMember){

	var ReadingCircleMemberList = Parse.Collection.extend({
	    model: ReadingCircleMember,
	    comparator: function(obj) {
     		return obj.get('readingNo');
    	},

		fetchReadingCircleMembers: function(circleId, successCallback, failedCallback){
	      this.query = new Parse.Query(ReadingCircle);
	      this.query.equalTo("circle", circleId);
	      this.fetch({
	        success: function(data){
	        	successCallback(data);
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });

		}

	},{

	});

	return ReadingCircleMemberList;
});


