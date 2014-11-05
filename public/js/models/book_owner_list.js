define(['parse', 'underscore', 
		"models/session", "models/book_owner"],function(Parse, _, SessionManager, BookOwner){

	var BookOwnerList = Parse.Collection.extend({
	    model: BookOwner,
	    comparator: function(obj) {
     		return obj.get('updatedAt');
    	},

		fetchStartableBooks: function(successCallback, failedCallback){
	      this.query = new Parse.Query(BookOwner);
	      this.query.equalTo("used", false);
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

		hasBook: function(book_title, successCallback, failedCallback){
	      var list = new BookOwnerList;
	      list.query = new Parse.Query(BookOwner);
	      list.query.equalTo("book", book_title);
	      list.query.equalTo("owner", Parse.User.current());
	      list.fetch({
	        success: function(data){
	        	if (data) {
		        	successCallback(data.first());
	        	}else{
		        	successCallback(null);
	        	};
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });

		}

	});

	return BookOwnerList;
});


