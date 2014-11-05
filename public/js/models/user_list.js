define(['parse', 'underscore'],function(Parse, _){

	var UserList = Parse.Collection.extend({
	    model: Parse.User,
	    comparator: function(obj) {
     		return obj.get('username');
    	},

		// INSTANCE METHOD
    	fetchUsers: function(successCallback, failedCallback){

	      var users = new UserList;
	      users.query = new Parse.Query(Parse.User);
	      users.fetch({
	        success: function(data){
	        	successCallback(data);
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });

    	}

	},{
		// CLASS METHOD

	});

	return UserList;
});


