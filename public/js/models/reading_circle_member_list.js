define(['parse', 'underscore', 
		"models/session", "models/reading_circle_member"],function(Parse, _, SessionManager, ReadingCircleMember){

	var ReadingCircleMemberList = Parse.Collection.extend({
	    model: ReadingCircleMember,
	    comparator: function(obj) {
     		return obj.get('readingNo');
    	},

		fetchReadingCircleMembers: function(circle, successCallback, failedCallback){
	      this.query = new Parse.Query(ReadingCircleMember);
	      this.query.equalTo("circle", circle);
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


