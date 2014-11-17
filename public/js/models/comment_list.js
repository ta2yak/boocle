define(['parse', 'underscore', 
		"models/session", "models/comment"],function(Parse, _, SessionManager, Comment){

	var CommentList = Parse.Collection.extend({
	    model: Comment,
	    comparator: function(obj) {
     		return obj.get('createdAt');
    	},

		fetchComments: function(obj, successCallback, failedCallback){
	      this.query = new Parse.Query(Comment);
	      this.query.equalTo("parent", obj);
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

	return CommentList;
});


