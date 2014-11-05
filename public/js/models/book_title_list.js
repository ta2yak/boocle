define(['parse', 'underscore', 
		"models/session", "models/book_title"],function(Parse, _, SessionManager, BookTitle){

	var BookTitleList = Parse.Collection.extend({
	    model: BookTitle,
	    comparator: function(obj) {
     		return obj.get('updatedAt');
    	},

		fetchBookTitles: function(successCallback, failedCallback){
	      var list = new BookTitleList;
	      list.query = new Parse.Query(BookTitle);
	      list.fetch({
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

	return BookTitleList;
});


