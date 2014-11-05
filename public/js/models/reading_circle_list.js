define(['parse', 'underscore', 
		"models/session", "models/reading_circle"],function(Parse, _, SessionManager, ReadingCircle){

	var ReadingCircleList = Parse.Collection.extend({
	    model: ReadingCircle,
	    comparator: function(obj) {
     		return obj.get('updatedAt');
    	},

		fetchReadingCircles: function(successCallback, failedCallback){
	      this.query = new Parse.Query(ReadingCircle);
	      this.query.equalTo("finished", false);
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

	return ReadingCircleList;
});


