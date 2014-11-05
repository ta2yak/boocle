define(['parse', 'underscore', 
		"models/session", "models/group_member"],function(Parse, _, SessionManager, GroupMember){

	var GroupMemberList = Parse.Collection.extend({
	    model: GroupMember,
	    comparator: function(obj) {
     		return obj.get('readingNo');
    	},

		fetchGroupMembers: function(group, successCallback, failedCallback){
	      this.query = new Parse.Query(GroupMember);
	      this.query.equalTo("group", group);
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

		fetchJoinedGroups: function(successCallback, failedCallback){

			var groupMembers = new GroupMemberList();
		    groupMembers.query = new Parse.Query(GroupMember);
	      	groupMembers.query.equalTo("user", Parse.User.current());
	      	groupMembers.fetch({
	      		success: function(results){
	      			successCallback(results);
	      		},
	      		error: function(error){
	      			failedCallback(error);
	      		}
	      	});

		}

	});

	return GroupMemberList;
});


