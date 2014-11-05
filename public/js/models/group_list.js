define(['parse', 'underscore', 
		"models/session", "models/group",
		"models/group_member_list"],function(Parse, _, SessionManager, Group, GroupMemberList){

	var GroupList = Parse.Collection.extend({
	    model: Group,
	    comparator: function(obj) {
     		return obj.get('updatedAt');
    	},

		fetchGroups: function(successCallback, failedCallback){
	      this.query = new Parse.Query(Group);
	      this.fetch({
	        success: function(data){
	        	successCallback(data);
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });
		},

		fetchJoinedGroups: function(successCallback, failedCallback){

			GroupMemberList.fetchJoinedGroups(function(groupMembers){
												var ids = [];
									        	groupMembers.each(function(groupMember){
									        		ids.push(groupMember.attributes.group.id);
									        	});
										        this.query = new Parse.Query(Group);
										      	this.query.containedIn("objectId", ids);
										      	this.fetch({
										      		success: function(groups){
												      	successCallback(groups);
										      		},
										      		error: function(error){
														failedCallback(error);
										      		}
										      	});

											}.bind(this),
											function(error){
												failedCallback(error);
											}.bind(this));
		}

	},{


	});

	return GroupList;
});


